"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/authz-server";
import { asStringArray } from "@/lib/polls/logi-polls-model";
import { LOGI_POLL_TABLES } from "@/lib/polls/supabase-tables";

/** Mehrfachauswahl: FormData pollId, option, select ("1" = anwählen, "0" = abwählen). */
export async function togglePollOption(
  formData: FormData
): Promise<{ ok: true } | { error: string }> {
  const { supabase, user } = await requireUser();

  const pollId = String(formData.get("pollId") ?? "").trim();
  const option = String(formData.get("option") ?? "").trim();
  const selectRaw = String(formData.get("select") ?? "1").trim();
  const wantSelect = selectRaw === "1" || selectRaw === "true";

  if (!pollId || !option) {
    return { error: "Ungültige Abstimmung." };
  }

  const { data: poll, error: pollError } = await supabase
    .from(LOGI_POLL_TABLES.polls)
    .select("id, options, is_active")
    .eq("id", pollId)
    .maybeSingle();

  if (pollError || !poll) {
    return { error: "Umfrage nicht gefunden." };
  }
  if (!poll.is_active) {
    return { error: "Diese Umfrage ist nicht mehr aktiv." };
  }

  const allowed = asStringArray(poll.options);
  if (!allowed.includes(option)) {
    return { error: "Ungültige Antwortoption." };
  }

  if (wantSelect) {
    const { error: insErr } = await supabase.from(LOGI_POLL_TABLES.votes).insert({
      poll_id: pollId,
      user_id: user.id,
      selected_option: option,
      updated_at: new Date().toISOString(),
    });

    if (insErr) {
      const code = (insErr as { code?: string }).code;
      if (code === "23505") {
        revalidatePath("/");
        return { ok: true };
      }
      return { error: insErr.message };
    }
  } else {
    const { error: delErr } = await supabase
      .from(LOGI_POLL_TABLES.votes)
      .delete()
      .eq("poll_id", pollId)
      .eq("user_id", user.id)
      .eq("selected_option", option);

    if (delErr) {
      return { error: delErr.message };
    }
  }

  revalidatePath("/");
  return { ok: true };
}
