import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import {
  buildLogiPollViewState,
  type LogiPollRow,
  type LogiPollVoteRow,
  type LogiPollViewState,
} from "@/lib/polls/logi-polls-model";
import { LOGI_POLL_TABLES } from "@/lib/polls/supabase-tables";

export type ActiveDashboardPoll = LogiPollViewState;

export async function getActiveLogiPollsForDashboard(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<ActiveDashboardPoll[]> {
  const { data: polls } = await supabase
    .from(LOGI_POLL_TABLES.polls)
    .select("id, title, question, options, is_active")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (!polls?.length) return [];

  const pollIds = polls.map((p) => p.id);

  const { data: votes } = await supabase
    .from(LOGI_POLL_TABLES.votes)
    .select("poll_id, user_id, selected_option")
    .in("poll_id", pollIds);

  const byPoll = new Map<string, LogiPollVoteRow[]>();
  for (const v of votes ?? []) {
    const list = byPoll.get(v.poll_id) ?? [];
    list.push({
      user_id: v.user_id,
      selected_option: v.selected_option,
    });
    byPoll.set(v.poll_id, list);
  }

  const result: ActiveDashboardPoll[] = [];

  for (const p of polls) {
    const row: LogiPollRow = {
      id: p.id,
      title: p.title,
      question: p.question,
      options: p.options,
      is_active: p.is_active,
    };
    const view = buildLogiPollViewState(
      row,
      byPoll.get(p.id) ?? [],
      userId
    );
    if (view) result.push(view);
  }

  return result;
}
