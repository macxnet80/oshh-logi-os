export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function toIsoDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Ungültiges Datum erhalten: ${value}`);
  }
  return date.toISOString().slice(0, 10);
}
