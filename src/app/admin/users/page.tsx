import { requireLogiAdmin } from "@/lib/authz-server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { LogiUserAccessRow } from "@/lib/logi-access";
import type { User } from "@supabase/supabase-js";
import AdminUsersTable from "./AdminUsersTable";
import Card from "@/components/ui/Card";
import { PROFILE_DISPLAY_NAME_MAX_LENGTH } from "./constants";

type PageProps = {
  searchParams: Promise<{ ok?: string; err?: string }>;
};

export default async function AdminUsersPage({ searchParams }: PageProps) {
  await requireLogiAdmin();
  const params = await searchParams;

  let users: User[] = [];
  let accessRows: LogiUserAccessRow[] = [];
  const fullNameByUserId = new Map<string, string>();
  let loadError: string | null = null;

  try {
    const service = createServiceRoleClient();
    const perPage = 200;
    let page = 1;
    const allUsers: User[] = [];
    for (;;) {
      const { data, error } = await service.auth.admin.listUsers({
        page,
        perPage,
      });
      if (error) {
        throw new Error(error.message);
      }
      allUsers.push(...data.users);
      if (data.users.length < perPage) break;
      page += 1;
    }

    const [
      { data: accessData, error: accessError },
      { data: profilesData, error: profilesError },
    ] = await Promise.all([
      service.from("logi_user_access").select("*"),
      service.from("profiles").select("id, full_name"),
    ]);

    if (accessError) {
      loadError = accessError.message;
    } else {
      accessRows = (accessData ?? []) as LogiUserAccessRow[];
    }

    if (profilesError && !loadError) {
      loadError = profilesError.message;
    }

    for (const p of profilesData ?? []) {
      if (p.id && p.full_name) {
        fullNameByUserId.set(p.id, p.full_name);
      }
    }

    users = allUsers.sort((a, b) => {
      const nameA =
        fullNameByUserId.get(a.id)?.trim() ||
        (a.user_metadata as { full_name?: string } | undefined)?.full_name ||
        "";
      const nameB =
        fullNameByUserId.get(b.id)?.trim() ||
        (b.user_metadata as { full_name?: string } | undefined)?.full_name ||
        "";
      const cmp = String(nameA).localeCompare(String(nameB), "de", {
        sensitivity: "base",
      });
      if (cmp !== 0) return cmp;
      return (a.email ?? "").localeCompare(b.email ?? "", "de");
    });
  } catch (e) {
    loadError =
      e instanceof Error ? e.message : "Daten konnten nicht geladen werden.";
  }

  const accessByUserId = Object.fromEntries(
    accessRows.map((r) => [r.user_id, r] as const)
  ) as Record<string, LogiUserAccessRow>;

  const fullNameRecord = Object.fromEntries(fullNameByUserId) as Record<
    string,
    string
  >;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-orendt-black tracking-tight">
          Benutzer & Teams
        </h1>
        {params.ok ? (
          <p className="mt-2 font-body text-sm text-status-free" role="status">
            Änderungen gespeichert.
          </p>
        ) : null}
        {params.err ? (
          <p className="mt-2 font-body text-sm text-status-occupied" role="alert">
            {params.err === "invalid"
              ? "Ungültige Eingabe."
              : params.err === "name_empty"
                ? "Der Anzeigename darf nicht leer sein."
                : params.err === "name_too_long"
                  ? `Der Name ist zu lang (max. ${PROFILE_DISPLAY_NAME_MAX_LENGTH} Zeichen).`
                  : params.err}
          </p>
        ) : null}
        <p className="font-body text-gray-600 mt-1 max-w-2xl">
          <strong className="text-orendt-black">Name</strong> kannst du hier
          anpassen (wird in{" "}
          <code className="text-xs bg-gray-100 px-1 rounded">profiles</code> und
          Auth-Metadaten gespeichert).{" "}
          <strong className="text-orendt-black">Team-Mitglied</strong> speichert
          sofort — Zugang zu logi-OS nur mit Haken; ohne Haken keine Zuordnung
          als Logistik-Team. Admin-Rechte steuerst du in der anderen App (
          <code className="text-xs bg-gray-100 px-1 rounded">profiles.role</code>
          ).
        </p>
      </div>

      {loadError ? (
        <Card className="p-6 border-status-occupied-bg bg-status-occupied-bg/30">
          <p className="font-body text-sm text-status-occupied">{loadError}</p>
          <p className="font-body text-xs text-gray-600 mt-2">
            Prüfe, ob{" "}
            <code className="text-xs bg-white/80 px-1 rounded">
              SUPABASE_SERVICE_ROLE_KEY
            </code>{" "}
            serverseitig in{" "}
            <code className="text-xs bg-white/80 px-1 rounded">.env.local</code>{" "}
            gesetzt ist (nie im Client).
          </p>
        </Card>
      ) : (
        <AdminUsersTable
          users={users}
          accessByUserId={accessByUserId}
          fullNameByUserId={fullNameRecord}
        />
      )}
    </div>
  );
}
