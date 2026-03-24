-- =============================================================================
-- VERALTET — gehört zur alten Tabelle public.responses / surveys.
-- logi-OS nutzt stattdessen public.logi_poll_votes mit UNIQUE (poll_id, user_id).
-- Siehe: supabase/sql/logi_polls_tables.sql
-- =============================================================================
--
-- (Historischer Inhalt — nur ausführen, wenn du noch das Legacy-Schema pflegst.)
--
-- CREATE UNIQUE INDEX IF NOT EXISTS responses_logi_poll_one_vote_per_user
-- ON public.responses (survey_id, ((answers ->> 'voter_id')))
-- WHERE coalesce(answers ->> 'voter_id', '') <> '';

SELECT 1; -- no-op, damit die Datei im Editor „harmlos“ ausführbar bleibt
