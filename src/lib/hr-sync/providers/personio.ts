import type {
  HrAbsence,
  HrEmployee,
  HrProviderClient,
  HrSyncWindow,
} from "@/lib/hr-sync/types";
import { toIsoDate } from "@/lib/hr-sync/utils";

const PERSONIO_AUTH_URL =
  process.env.PERSONIO_AUTH_URL ?? "https://api.personio.de/v2/auth/token";

function getPersonioBaseUrl(): string {
  const configured =
    process.env.PERSONIO_API_BASE_URL ??
    process.env.PERSONIO_BASE_URL ??
    "https://api.personio.de/v2";
  const normalized = configured.replace(/\/+$/, "");
  if (normalized.endsWith("/v1")) {
    return `${normalized.slice(0, -3)}/v2`;
  }
  return normalized;
}

type PersonioTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

type PersonioCollection<T> = {
  _data: T[];
  _meta?: {
    links?: {
      next?: { href: string };
    };
  };
};

type PersonioPerson = {
  id: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
};

type PersonioAbsence = {
  id: string;
  person: { id: string };
  starts_from: { date_time: string };
  ends_at: { date_time: string } | null;
  absence_type?: { id?: string | null };
  comment?: string | null;
  approval?: { status?: string | null };
  updated_at?: string | null;
};

let tokenCache: { accessToken: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 30_000) {
    return tokenCache.accessToken;
  }

  const clientId = process.env.PERSONIO_CLIENT_ID;
  const clientSecret = process.env.PERSONIO_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "Personio ist nicht konfiguriert. PERSONIO_CLIENT_ID und PERSONIO_CLIENT_SECRET fehlen."
    );
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });

  const response = await fetch(PERSONIO_AUTH_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Personio-Auth fehlgeschlagen (${response.status}).`);
  }

  const data = (await response.json()) as PersonioTokenResponse;
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + Math.max(60, data.expires_in - 60) * 1000,
  };
  return data.access_token;
}

async function personioGet<T>(pathOrUrl: string): Promise<T> {
  const token = await getAccessToken();
  const url = pathOrUrl.startsWith("http")
    ? pathOrUrl
    : `${getPersonioBaseUrl()}${pathOrUrl}`;

  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Personio API Fehler (${response.status}) bei ${url}`);
  }
  return (await response.json()) as T;
}

async function collectPaginated<T>(path: string): Promise<T[]> {
  const all: T[] = [];
  let nextUrl: string | null = path;

  while (nextUrl) {
    const page = await personioGet<PersonioCollection<T>>(nextUrl);
    all.push(...(page._data ?? []));
    nextUrl = page._meta?.links?.next?.href ?? null;
  }
  return all;
}

function buildAbsenceQuery(window: HrSyncWindow): string {
  const params = new URLSearchParams();
  params.set("limit", "100");

  if (window.updatedSince) params.set("updated_at.gte", window.updatedSince);
  if (window.updatedUntil) params.set("updated_at.lte", window.updatedUntil);

  return `/absence-periods?${params.toString()}`;
}

function toHrAbsence(item: PersonioAbsence): HrAbsence {
  const status = (item.approval?.status ?? "UNKNOWN").toUpperCase();
  const mappedStatus: HrAbsence["status"] =
    status === "APPROVED"
      ? "approved"
      : status === "PENDING"
        ? "pending"
        : status === "REJECTED"
          ? "rejected"
          : status === "DELETION_PENDING"
            ? "cancelled"
            : "unknown";

  const endDate = item.ends_at?.date_time ?? item.starts_from.date_time;
  return {
    externalAbsenceId: item.id,
    externalPersonId: item.person.id,
    status: mappedStatus,
    type: item.absence_type?.id ?? "unknown",
    startDate: toIsoDate(item.starts_from.date_time),
    endDate: toIsoDate(endDate),
    note: item.comment ?? null,
    updatedAt: item.updated_at ?? null,
  };
}

export function createPersonioClient(): HrProviderClient {
  return {
    provider: "personio",
    async healthCheck() {
      await getAccessToken();
    },
    async listEmployees(): Promise<HrEmployee[]> {
      const people = await collectPaginated<PersonioPerson>("/persons?limit=100");
      return people
        .filter((p) => typeof p.email === "string" && p.email.trim().length > 0)
        .map((p) => ({
          externalPersonId: p.id,
          email: String(p.email),
          fullName: [p.first_name, p.last_name].filter(Boolean).join(" ").trim() || null,
        }));
    },
    async listAbsences(window: HrSyncWindow): Promise<HrAbsence[]> {
      const path = buildAbsenceQuery(window);
      const absences = await collectPaginated<PersonioAbsence>(path);
      return absences.map(toHrAbsence);
    },
  };
}
