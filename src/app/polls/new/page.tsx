import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireLogiPollCreator } from "@/lib/authz-server";
import { LOGI_POLL_TABLES } from "@/lib/polls/supabase-tables";
import { asStringArray } from "@/lib/polls/logi-polls-model";
import PollCreateModal from "./PollCreateModal";
import PollAdminList, { type AdminPollRow } from "./PollAdminList";

export default async function NewPollPage() {
  const { supabase } = await requireLogiPollCreator();

  const { data: polls } = await supabase
    .from(LOGI_POLL_TABLES.polls)
    .select("id, title, question, options")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const pollList = polls ?? [];
  const pollIds = pollList.map((p) => p.id);
  const countByPoll = new Map<string, number>();
  if (pollIds.length > 0) {
    const { data: votes } = await supabase
      .from(LOGI_POLL_TABLES.votes)
      .select("poll_id")
      .in("poll_id", pollIds);
    for (const v of votes ?? []) {
      countByPoll.set(v.poll_id, (countByPoll.get(v.poll_id) ?? 0) + 1);
    }
  }

  const rows: AdminPollRow[] = pollList.map((p) => ({
    id: p.id,
    title: p.title,
    question: p.question,
    optionsText: asStringArray(p.options).join("\n"),
    voteCount: countByPoll.get(p.id) ?? 0,
  }));

  return (
    <div className="space-y-10 animate-fade-in max-w-2xl">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-body text-sm text-gray-600 hover:text-orendt-black mb-4 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orendt-accent focus-visible:ring-offset-2"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden />
          Zurück zum Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-orendt-black tracking-tight">
              Abstimmungen
            </h1>
            <p className="font-body text-gray-600 mt-1">
              Aktive Umfragen verwalten — neue Abstimmungen über „Neue
              Abstimmung“ anlegen.
            </p>
          </div>
          <PollCreateModal />
        </div>
      </div>

      <PollAdminList polls={rows} />
    </div>
  );
}
