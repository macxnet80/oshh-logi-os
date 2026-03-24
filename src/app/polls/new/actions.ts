"use server";

import { revalidatePath } from "next/cache";
import { requireLogiPollCreator } from "@/lib/authz-server";
import type { Json } from "@/lib/database.types";
import { LOGI_POLL_TABLES } from "@/lib/polls/supabase-tables";
import { parseOptions, validatePollFields } from "./poll-admin-shared";

export type CreatePollState =
  | null
  | { error: string }
  | { ok: true };
export type PollMutationState =
  | null
  | { error: string }
  | { ok: true };

export async function createPoll(
  _prev: CreatePollState,
  formData: FormData
): Promise<CreatePollState> {
  const { supabase, user } = await requireLogiPollCreator();

  const title = String(formData.get("title") ?? "").trim();
  const questionText = String(formData.get("question") ?? "").trim();
  const options = parseOptions(String(formData.get("options") ?? ""));

  const v = validatePollFields(title, questionText, options);
  if (v) return v;

  const { data: poll, error: insertError } = await supabase
    .from(LOGI_POLL_TABLES.polls)
    .insert({
      title,
      question: questionText,
      options: options as unknown as Json,
      is_active: true,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (insertError || !poll) {
    return {
      error:
        insertError?.message ??
        "Umfrage konnte nicht angelegt werden. Ist die Tabelle logi_polls in Supabase angelegt?",
    };
  }

  revalidatePath("/");
  revalidatePath("/polls/new");
  return { ok: true };
}

export async function updatePoll(
  _prev: PollMutationState,
  formData: FormData
): Promise<PollMutationState> {
  const { supabase } = await requireLogiPollCreator();

  const pollId = String(formData.get("pollId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const questionText = String(formData.get("question") ?? "").trim();
  const options = parseOptions(String(formData.get("options") ?? ""));

  if (!pollId) {
    return { error: "Ungültige Abstimmung." };
  }

  const v = validatePollFields(title, questionText, options);
  if (v) return v;

  const { data: updated, error: updError } = await supabase
    .from(LOGI_POLL_TABLES.polls)
    .update({
      title,
      question: questionText,
      options: options as unknown as Json,
      updated_at: new Date().toISOString(),
    })
    .eq("id", pollId)
    .eq("is_active", true)
    .select("id")
    .maybeSingle();

  if (updError) {
    return { error: updError.message };
  }
  if (!updated) {
    return {
      error:
        "Abstimmung nicht gefunden oder keine Berechtigung zum Bearbeiten.",
    };
  }

  revalidatePath("/");
  revalidatePath("/polls/new");
  return { ok: true };
}

export async function deletePoll(
  _prev: PollMutationState,
  formData: FormData
): Promise<PollMutationState> {
  const { supabase } = await requireLogiPollCreator();

  const pollId = String(formData.get("pollId") ?? "").trim();
  if (!pollId) {
    return { error: "Ungültige Abstimmung." };
  }

  const { error: delError } = await supabase
    .from(LOGI_POLL_TABLES.polls)
    .delete()
    .eq("id", pollId);

  if (delError) {
    return { error: delError.message };
  }

  revalidatePath("/");
  revalidatePath("/polls/new");
  return { ok: true };
}
