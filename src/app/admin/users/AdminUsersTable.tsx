"use client";

import type { User } from "@supabase/supabase-js";
import type { LogiUserAccessRow } from "@/lib/logi-access";
import { updateLogiUserAccess, updateProfileDisplayName } from "./actions";
import { PROFILE_DISPLAY_NAME_MAX_LENGTH } from "./constants";

type AccessRecord = Record<string, LogiUserAccessRow | undefined>;

/** Ausgangswert fürs Namensfeld (Profil bevorzugt, sonst Auth-Metadaten). */
function defaultNameInputValue(
  u: User,
  profileFullName: string | undefined
): string {
  const fromProfile = profileFullName?.trim();
  if (fromProfile) return fromProfile;
  const meta = u.user_metadata as { full_name?: string } | undefined;
  if (meta?.full_name && String(meta.full_name).trim()) {
    return String(meta.full_name).trim();
  }
  return "";
}

export default function AdminUsersTable({
  users,
  accessByUserId,
  fullNameByUserId,
}: {
  users: User[];
  accessByUserId: AccessRecord;
  fullNameByUserId: Record<string, string | undefined>;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-subtle">
      <table className="w-full min-w-[720px] font-body text-sm text-left">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 font-display font-semibold text-orendt-black">
              Name
            </th>
            <th className="px-4 py-3 font-display font-semibold text-orendt-black">
              E-Mail
            </th>
            <th className="px-4 py-3 font-display font-semibold text-orendt-black">
              Team
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const row = accessByUserId[u.id];
            const isLogistik = row?.team === "logistik";
            const nameDefault = defaultNameInputValue(
              u,
              fullNameByUserId[u.id]
            );

            return (
              <tr
                key={u.id}
                className="border-b border-gray-100 last:border-0 align-middle"
              >
                <td className="px-4 py-3 text-gray-800 min-w-[220px] max-w-[320px]">
                  <form
                    action={updateProfileDisplayName}
                    className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2"
                  >
                    <input type="hidden" name="user_id" value={u.id} />
                    <input
                      type="text"
                      name="full_name"
                      defaultValue={nameDefault}
                      required
                      maxLength={PROFILE_DISPLAY_NAME_MAX_LENGTH}
                      placeholder="Vor- und Nachname"
                      autoComplete="name"
                      className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 font-body text-sm text-orendt-black placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orendt-accent"
                    />
                    <button
                      type="submit"
                      className="shrink-0 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 font-body text-xs font-medium text-orendt-black hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orendt-accent cursor-pointer"
                    >
                      Speichern
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3 text-gray-800 max-w-[240px]">
                  <span className="block truncate" title={u.email ?? undefined}>
                    {u.email ?? u.id}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <form action={updateLogiUserAccess}>
                    <input type="hidden" name="user_id" value={u.id} />
                    <label className="inline-flex items-center gap-2.5 text-gray-800 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        name="team_logistik"
                        value="true"
                        defaultChecked={isLogistik}
                        className="h-4 w-4 rounded border-gray-300 text-orendt-black focus:ring-orendt-accent cursor-pointer"
                        onChange={(e) => {
                          e.currentTarget.form?.requestSubmit();
                        }}
                      />
                      <span className="font-body text-sm font-medium">
                        Team-Mitglied
                      </span>
                    </label>
                  </form>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
