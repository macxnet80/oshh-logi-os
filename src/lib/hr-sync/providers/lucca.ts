import type {
  HrAbsence,
  HrEmployee,
  HrProviderClient,
  HrSyncWindow,
} from "@/lib/hr-sync/types";
import { toIsoDate } from "@/lib/hr-sync/utils";

type LuccaTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

type LuccaEmployeesResponse = {
  items?: Array<{
    id: string;
    mail?: string | null;
    displayName?: string | null;
  }>;
  links?: { next?: { href?: string | null } | null } | null;
};

type LuccaLeavesResponse = {
  items?: Array<{
    id: string;
    ownerId: string;
    date: string;
    endDate?: string | null;
    status?: string | null;
    leaveAccountId?: string | null;
    comment?: string | null;
    modifiedOn?: string | null;
  }>;
  links?: { next?: { href?: string | null } | null } | null;
};

const LUCCA_AUTH_URL =
  process.env.LUCCA_AUTH_URL ??
  "https://accounts.world.luccasoftware.com/connect/token";

let tokenCache: { accessToken: string; expiresAt: number } | null = null;

function requireLuccaConfig() {
  const baseUrl = process.env.LUCCA_BASE_URL ?? process.env.LUCA_BASE_URL;
  const clientId = process.env.LUCCA_CLIENT_ID ?? process.env.LUCA_CLIENT_ID;
  const clientSecret =
    process.env.LUCCA_CLIENT_SECRET ?? process.env.LUCA_CLIENT_SECRET;
  const staticToken = process.env.LUCCA_API_TOKEN ?? process.env.LUCA_API_TOKEN;

  if (!baseUrl || ((!clientId || !clientSecret) && !staticToken)) {
    throw new Error(
      "Lucca ist nicht vollständig konfiguriert (LUCCA_BASE_URL/LUCA_BASE_URL und entweder Client-ID/Secret oder API-Token)."
    );
  }
  return { baseUrl, clientId, clientSecret, staticToken };
}

async function getAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 30_000) {
    return tokenCache.accessToken;
  }
  const { clientId, clientSecret, staticToken } = requireLuccaConfig();
  if (staticToken) {
    return staticToken;
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });

  const response = await fetch(LUCCA_AUTH_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Lucca-Auth fehlgeschlagen (${response.status}).`);
  }
  const data = (await response.json()) as LuccaTokenResponse;
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + Math.max(60, data.expires_in - 60) * 1000,
  };
  return data.access_token;
}

async function luccaGet<T>(pathOrUrl: string): Promise<T> {
  const token = await getAccessToken();
  const { baseUrl } = requireLuccaConfig();
  const url = pathOrUrl.startsWith("http") ? pathOrUrl : `${baseUrl}${pathOrUrl}`;

  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/json",
    },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Lucca API Fehler (${response.status}) bei ${url}`);
  }
  return (await response.json()) as T;
}

async function collectPaginated<T extends { links?: { next?: { href?: string | null } | null } | null }>(
  path: string
): Promise<T[]> {
  const pages: T[] = [];
  let nextUrl: string | null = path;

  while (nextUrl) {
    const page = await luccaGet<T>(nextUrl);
    pages.push(page);
    nextUrl = page.links?.next?.href ?? null;
  }
  return pages;
}

export function createLuccaClient(): HrProviderClient {
  return {
    provider: "lucca",
    async healthCheck() {
      await getAccessToken();
    },
    async listEmployees(): Promise<HrEmployee[]> {
      const pages = await collectPaginated<LuccaEmployeesResponse>(
        "/lucca-api/employees?include=links&limit=100"
      );

      return pages
        .flatMap((p) => p.items ?? [])
        .filter((item) => typeof item.mail === "string" && item.mail.trim().length > 0)
        .map((item) => ({
          externalPersonId: String(item.id),
          email: String(item.mail),
          fullName: item.displayName ?? null,
        }));
    },
    async listAbsences(window: HrSyncWindow): Promise<HrAbsence[]> {
      const params = new URLSearchParams({
        include: "links",
        limit: "100",
      });
      if (window.updatedSince) {
        params.set("modifiedOn", `since,${window.updatedSince}`);
      }
      const pages = await collectPaginated<LuccaLeavesResponse>(
        `/api/v3/leaves?${params.toString()}`
      );

      return pages.flatMap((p) => p.items ?? []).map((item) => ({
        externalAbsenceId: String(item.id),
        externalPersonId: String(item.ownerId),
        status:
          String(item.status ?? "").toLowerCase() === "approved"
            ? "approved"
            : "unknown",
        type: item.leaveAccountId ?? "unknown",
        startDate: toIsoDate(item.date),
        endDate: toIsoDate(item.endDate ?? item.date),
        note: item.comment ?? null,
        updatedAt: item.modifiedOn ?? null,
      }));
    },
  };
}
