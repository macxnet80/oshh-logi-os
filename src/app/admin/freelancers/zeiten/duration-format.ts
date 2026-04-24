const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * Dauer zwischen zwei ISO-Zeitpunkten als Stunden:Minuten (z. B. 02:30).
 * Minuten werden immer zweistellig; Stunden ab 100 ungekürzt.
 */
export function formatDurationHhMm(
  checkIn: string,
  checkOut: string | null
): string | null {
  if (!checkOut) return null;
  const a = new Date(checkIn).getTime();
  const b = new Date(checkOut).getTime();
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return null;
  const totalMin = Math.round((b - a) / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, "0")}:${pad2(m)}`;
}
