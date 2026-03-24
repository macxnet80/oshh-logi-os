import type { Json } from "@/lib/database.types";

export function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

export type LogiPollRow = {
  id: string;
  title: string;
  question: string;
  options: Json;
  is_active: boolean;
};

export type LogiPollVoteRow = {
  user_id: string;
  selected_option: string;
};

/** UI-Zustand für eine logi-Umfrage (Mehrfachauswahl). */
export type LogiPollViewState = {
  pollId: string;
  title: string;
  questionText: string;
  options: string[];
  /** Auswahlen je Option (eine Zeile in logi_poll_votes pro Treffer). */
  counts: Record<string, number>;
  /** Summe aller gespeicherten Auswahlen. */
  totalSelections: number;
  /** Nutzer mit mindestens einer Auswahl. */
  participantCount: number;
  hasVoted: boolean;
  /** Aktuelle Auswahlen des angemeldeten Nutzers (Reihenfolge wie in `options`). */
  myChoices: string[];
};

export function buildLogiPollViewState(
  poll: LogiPollRow,
  votes: LogiPollVoteRow[],
  currentUserId: string
): LogiPollViewState | null {
  const options = asStringArray(poll.options);
  if (options.length < 2) return null;

  const counts: Record<string, number> = {};
  for (const opt of options) {
    counts[opt] = 0;
  }

  const participants = new Set<string>();
  const mySet = new Set<string>();

  for (const v of votes) {
    if (typeof v.selected_option === "string" && v.selected_option in counts) {
      counts[v.selected_option] += 1;
    }
    if (v.user_id) {
      participants.add(v.user_id);
    }
    if (v.user_id === currentUserId && options.includes(v.selected_option)) {
      mySet.add(v.selected_option);
    }
  }

  const myChoices = options.filter((o) => mySet.has(o));

  return {
    pollId: poll.id,
    title: poll.title,
    questionText: poll.question,
    options,
    counts,
    totalSelections: votes.length,
    participantCount: participants.size,
    hasVoted: myChoices.length > 0,
    myChoices,
  };
}

export function sameChoiceSets(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((x, i) => x === sb[i]);
}
