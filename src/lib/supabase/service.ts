import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { requireSupabasePublicConfig } from "@/lib/supabase/env";

/**
 * Nur serverseitig (Server Actions, Route Handlers).
 * Benötigt den Service-Role-Schlüssel aus der Umgebung — niemals an den Client geben.
 */
export function createServiceRoleClient() {
  const { url } = requireSupabasePublicConfig();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "Geheimer Service-Schlüssel für Admin-Funktionen fehlt (nur serverseitig, siehe .env.example)."
    );
  }
  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
