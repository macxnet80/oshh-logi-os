"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireLogiAdmin } from "@/lib/authz-server";
import { createClient } from "@/lib/supabase/server";

const PATH_ZEITEN = "/admin/freelancers/zeiten";

function safeZeitenNext(raw: string): string {
  const t = raw.trim();
  if (t.startsWith("/admin/freelancers/zeiten")) return t;
  return PATH_ZEITEN;
}

export async function updateFreelancerCheckin(formData: FormData): Promise<void> {
  await requireLogiAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const checkInRaw = String(formData.get("check_in") ?? "").trim();
  const checkOutRaw = String(formData.get("check_out") ?? "").trim();
  const nextUrl = safeZeitenNext(String(formData.get("next") ?? ""));

  if (!id || !checkInRaw) {
    redirect(`${nextUrl}?err=zeiten_invalid`);
  }

  const checkIn = new Date(checkInRaw);
  if (Number.isNaN(checkIn.getTime())) {
    redirect(`${nextUrl}?err=zeiten_invalid`);
  }

  let checkOutIso: string | null = null;
  if (checkOutRaw) {
    const checkOut = new Date(checkOutRaw);
    if (Number.isNaN(checkOut.getTime())) {
      redirect(`${nextUrl}?err=zeiten_invalid`);
    }
    if (checkOut < checkIn) {
      redirect(`${nextUrl}?err=zeiten_range`);
    }
    checkOutIso = checkOut.toISOString();
  }

  const supabase = await createClient();

  const { data: row, error: fetchErr } = await supabase
    .from("freelancer_checkins")
    .select("id, freelancer_id")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr || !row) {
    redirect(`${nextUrl}?err=zeiten_not_found`);
  }

  if (checkOutIso === null) {
    const { data: otherOpen } = await supabase
      .from("freelancer_checkins")
      .select("id")
      .eq("freelancer_id", row.freelancer_id)
      .is("check_out", null)
      .neq("id", id)
      .maybeSingle();

    if (otherOpen) {
      redirect(`${nextUrl}?err=zeiten_open_conflict`);
    }
  }

  const { error } = await supabase
    .from("freelancer_checkins")
    .update({
      check_in: checkIn.toISOString(),
      check_out: checkOutIso,
    })
    .eq("id", id);

  if (error) {
    redirect(`${nextUrl}?err=zeiten_update_failed`);
  }

  revalidatePath(PATH_ZEITEN);
  redirect(`${nextUrl}?ok=zeiten_updated`);
}

export async function deleteFreelancerCheckinForm(formData: FormData): Promise<void> {
  await requireLogiAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const nextUrl = safeZeitenNext(String(formData.get("next") ?? ""));

  if (!id) {
    redirect(`${nextUrl}?err=zeiten_invalid`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("freelancer_checkins").delete().eq("id", id);

  if (error) {
    redirect(`${nextUrl}?err=zeiten_delete_failed`);
  }

  revalidatePath(PATH_ZEITEN);
  redirect(`${nextUrl}?ok=zeiten_deleted`);
}
