export function getSupabasePublicConfig(): {
  url: string | undefined;
  key: string | undefined;
} {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return { url, key };
}

export function requireSupabasePublicConfig(): { url: string; key: string } {
  const { url, key } = getSupabasePublicConfig();
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (oder NEXT_PUBLIC_SUPABASE_ANON_KEY) müssen in .env.local gesetzt sein."
    );
  }
  return { url, key };
}
