export function parseOptions(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

export function validatePollFields(
  title: string,
  questionText: string,
  options: string[]
): { error: string } | null {
  if (!title || title.length > 200) {
    return { error: "Bitte einen gültigen Titel angeben." };
  }
  if (!questionText || questionText.length > 500) {
    return { error: "Bitte die Frage ausfüllen." };
  }
  if (options.length < 2 || options.length > 20) {
    return {
      error: "Mindestens 2 und höchstens 20 Antwortoptionen (je eine Zeile).",
    };
  }
  const seen = new Set<string>();
  for (const o of options) {
    const k = o.trim().toLowerCase();
    if (seen.has(k)) {
      return {
        error:
          "Jede Antwortoption darf nur einmal vorkommen (keine doppelten Zeilen).",
      };
    }
    seen.add(k);
  }
  return null;
}
