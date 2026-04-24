"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireLogiAdmin } from "@/lib/authz-server";
import {
  runZeitenCheckinUpdate,
  zeitenRedirectUrl,
} from "@/app/admin/freelancers/zeiten/zeiten-checkin-update.server";
import { createClient } from "@/lib/supabase/server";

const PATH_ZEITEN = "/admin/freelancers/zeiten";

function safeZeitenNext(raw: string): string {
  const t = raw.trim();
  if (t.startsWith("/admin/freelancers/zeiten")) return t;
  return PATH_ZEITEN;
}

export async function updateFreelancerCheckin(formData: FormData): Promise<void> {
  const { destination } = await runZeitenCheckinUpdate(formData);
  redirect(destination);
}

export async function deleteFreelancerCheckinForm(formData: FormData): Promise<void> {
  await requireLogiAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const nextUrl = safeZeitenNext(String(formData.get("next") ?? ""));

  if (!id) {
    redirect(zeitenRedirectUrl(nextUrl, "err", "zeiten_invalid"));
  }

  const supabase = await createClient();
  const { error } = await supabase.from("freelancer_checkins").delete().eq("id", id);

  if (error) {
    redirect(zeitenRedirectUrl(nextUrl, "err", "zeiten_delete_failed"));
  }

  revalidatePath(PATH_ZEITEN);
  redirect(zeitenRedirectUrl(nextUrl, "ok", "zeiten_deleted"));
}
