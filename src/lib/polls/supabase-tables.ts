/**
 * Kurzabstimmungen nur über diese Tabellen — nicht `surveys`, `questions` oder `responses`
 * (andere Projekte / Legacy).
 */
export const LOGI_POLL_TABLES = {
  polls: "logi_polls",
  votes: "logi_poll_votes",
} as const;
