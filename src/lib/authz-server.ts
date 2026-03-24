import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isLogiOsAdmin } from "@/lib/logi-app-access";

export async function requireUser() {
  const supabase = await createClient();
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
