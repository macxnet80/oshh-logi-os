import "server-only";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isLogiOsAdmin } from "@/lib/logi-app-access";

const PATH_ZEITEN = "/admin/freelancers/zeiten";

function safeZeitenNext(raw: string): string {
  const t = raw.trim();
  if (t.startsWith("/admin/freelancers/zeiten")) return t;
  return PATH_ZEITEN;
}

export function zeitenRedirectUrl(
  nextPath: string,
  key: "ok" | "err",
  value: string
): string {
  const u = new URL(nextPath, "https://zeiten.internal");
  u.searchParams.set(key, value);
  return u.pathname + u.search;
}

export type ZeitenCheckinUpdateResult = { destination: string };

/**
 * Update-Logik für Freelancer-Checkin-Zeiten (ohne redirect), für Server Action
 * und Route Handler.
 */
export async function runZeitenCheckinUpdate(
  formData: FormData
): Promise<ZeitenCheckinUpdateResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      destination: `/login?next=${encodeURIComponent(PATH_ZEITEN)}`,
    };
  }

  const [{ data: access }, { data: profile }] = await Promise.all([
    supabase
      .from("logi_user_access")
      .select("is_admin")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
  ]);

  if (!isLogiOsAdmin(access ?? null, profile?.role ?? null)) {
    return { destination: "/" };
  }

  const id = String(formData.get("id") ?? "").trim();
  const checkInRaw = String(formData.get("check_in") ?? "").trim();
  const checkOutRaw = String(formData.get("check_out") ?? "").trim();
  const nextUrl = safeZeitenNext(String(formData.get("next") ?? ""));

  if (!id || !checkInRaw) {
    return { destination: zeitenRedirectUrl(nextUrl, "err", "zeiten_invalid") };
  }

  const checkIn = new Date(checkInRaw);
  if (Number.isNaN(checkIn.getTime())) {
    return { destination: zeitenRedirectUrl(nextUrl, "err", "zeiten_invalid") };
  }

  let checkOutIso: string | null = null;
  if (checkOutRaw) {
    const checkOut = new Date(checkOutRaw);
    if (Number.isNaN(checkOut.getTime())) {
      return { destination: zeitenRedirectUrl(nextUrl, "err", "zeiten_invalid") };
    }
    if (checkOut < checkIn) {
      return { destination: zeitenRedirectUrl(nextUrl, "err", "zeiten_range") };
    }
    checkOutIso = checkOut.toISOString();
  }

  const { data: row, error: fetchErr } = await supabase
    .from("freelancer_checkins")
    .select("id, freelancer_id")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr || !row) {
    return { destination: zeitenRedirectUrl(nextUrl, "err", "zeiten_not_found") };
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
      return { destination: zeitenRedirectUrl(nextUrl, "err", "zeiten_open_conflict") };
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
    return { destination: zeitenRedirectUrl(nextUrl, "err", "zeiten_update_failed") };
  }

  revalidatePath(PATH_ZEITEN);
  return { destination: zeitenRedirectUrl(nextUrl, "ok", "zeiten_updated") };
}
