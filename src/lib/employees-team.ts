/** E-Mail-Vergleich für Auth vs. `profiles.email` (Groß-/Kleinschreibung). */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
