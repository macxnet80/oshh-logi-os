import { redirect } from "next/navigation";
import { createClientIfConfigured } from "@/lib/supabase/server";
import { isLogiOsAdmin, isLogiPollCreator } from "@/lib/logi-app-access";

export async function requireUser() {
  const supabase = await createClientIfConfigured();
  if (!supabase) {
    redirect("/login?error=config");
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }
  return { supabase, user };
}

/**
 * Seiten unter /admin — `logi_user_access.is_admin` oder `profiles.role = admin`
 * (gemeinsame Nutzer mit der Haupt-App).
 */
export async function requireLogiAdmin() {
  const { supabase, user } = await requireUser();
  const [{ data: row }, { data: profile }] = await Promise.all([
    supabase
      .from("logi_user_access")
      .select("is_admin")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
  ]);

  if (!isLogiOsAdmin(row ?? null, profile?.role ?? null)) {
    redirect("/");
  }

  return { supabase, user };
}

/** Abstimmung anlegen: Profil-Admin oder logi_user_access.is_admin. */
export async function requireLogiPollCreator() {
  const { supabase, user } = await requireUser();
  const [{ data: row }, { data: profile }] = await Promise.all([
    supabase
      .from("logi_user_access")
      .select("is_admin")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
  ]);

  if (!isLogiPollCreator(row ?? null, profile?.role ?? null)) {
    redirect("/");
  }

  return { supabase, user };
}
