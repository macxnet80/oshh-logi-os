/**
 * Führt `fn` im nächsten Task aus (nach dem aktuellen Klick-Handler).
 * Hilft bei INP: Browser kann zuerst reagieren (z. B. :active), bevor
 * synchrone Dialoge (`confirm`) oder schwere Arbeit laufen.
 */
export function deferAfterClick(fn: () => void): void {
  setTimeout(fn, 0);
}
