import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";
import {
  getSupabasePublicConfig,
  requireSupabasePublicConfig,
} from "@/lib/supabase/env";

export type SupabaseServerClient = ReturnType<
  typeof createServerClient<Database>
>;

/** Ohne gültige Env-Variablen: `null` (kein Throw) — z. B. für Layout ohne 500er. */
export async function createClientIfConfigured(): Promise<SupabaseServerClient | null> {
  const { url, key } = getSupabasePublicConfig();
  if (!url || !key) return null;
  const cookieStore = await cookies();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing sessions.
        }
      },
    },
  });
}

export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = requireSupabasePublicConfig();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing sessions.
        }
      },
    },
  });
}
