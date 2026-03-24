import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { requireSupabasePublicConfig } from "@/lib/supabase/env";

/**
 * Nur serverseitig (Server Actions, Route Handlers).
 * Benötigt SUPABASE_SERVICE_ROLE_KEY — niemals an den Client geben.
 */
export function createServiceRoleClient() {
  const { url } = requireSupabasePublicConfig();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY fehlt (nur auf dem Server, für Admin-Funktionen)."
    );
  }
  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
