import LoginForm from "@/app/login/LoginForm";

type Props = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

function sanitizeNext(next: string | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }
  return next;
}

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const nextPath = sanitizeNext(params.next);
  const callbackError =
    params.error === "auth_callback"
      ? "Anmeldung ist fehlgeschlagen. Bitte versuche es erneut."
      : params.error === "config"
        ? "Supabase ist auf dem Server nicht konfiguriert (Umgebungsvariablen in Vercel prüfen)."
        : undefined;

  return (
    <LoginForm nextPath={nextPath} callbackError={callbackError} />
  );
}
