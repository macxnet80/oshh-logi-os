/** Vier Ziffern, nur Ziffern (gleiche Regel wie Check-in-Terminal). */
export function normalizeFreelancerPin(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 4) return null;
  return digits;
}
