/** Entspricht `public.profiles.role` — Admins der Haupt-App erhalten logi-OS-Zugang. */
export function isProfileAdminForLogi(role: string | null | undefined): boolean {
  return role === "admin";
}

/** Zugang: `profiles.role = admin` ODER Zeile in `logi_user_access` (Logistik / logi-Admin). */
export function hasLogiAppAccess(
  access: { team: string; is_admin: boolean } | null | undefined,
  profileRole?: string | null
): boolean {
  if (isProfileAdminForLogi(profileRole)) return true;
  if (!access) return false;
  return access.team === "logistik" || access.is_admin === true;
}

/** Admin-Bereich /admin: logi_user_access.is_admin ODER profiles.role = admin. */
export function isLogiOsAdmin(
  access: { is_admin: boolean } | null | undefined,
  profileRole?: string | null
): boolean {
  if (isProfileAdminForLogi(profileRole)) return true;
  return access?.is_admin === true;
}
