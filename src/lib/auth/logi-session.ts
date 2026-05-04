import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import {
  createClientIfConfigured,
  type SupabaseServerClient,
} from "@/lib/supabase/server";
import {
  hasLogiAppAccess,
  isLogiOsAdmin,
  isLogiPollCreator,
} from "@/lib/logi-app-access";

export type LogiSession = {
  supabase: SupabaseServerClient | null;
  user: User | null;
  userEmail: string | null;
  hasAppAccess: boolean;
  isAdmin: boolean;
  canCreatePolls: boolean;
  profileRole: string | null;
};

/** Pro Render-Request einmal laden (Layout + Seite teilen sich das Ergebnis). */
export const getLogiSession = cache(async (): Promise<LogiSession> => {
  const supabase = await createClientIfConfigured();
  if (!supabase) {
    return {
      supabase: null,
      user: null,
      userEmail: null,
      hasAppAccess: false,
      isAdmin: false,
      canCreatePolls: false,
      profileRole: null,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hasAppAccess = false;
  let isAdmin = false;
  let canCreatePolls = false;
  let profileRole: string | null = null;

  if (user) {
    const [{ data: access }, { data: profile }] = await Promise.all([
      supabase
        .from("logi_user_access")
        .select("team, is_admin")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    ]);
    profileRole = profile?.role ?? null;
    hasAppAccess = hasLogiAppAccess(access, profileRole);
    isAdmin = isLogiOsAdmin(access, profileRole);
    canCreatePolls = isLogiPollCreator(access ?? null, profileRole);
  }

  return {
    supabase,
    user,
    userEmail: user?.email ?? null,
    hasAppAccess,
    isAdmin,
    canCreatePolls,
    profileRole,
  };
});
