import Header from "@/components/layout/Header";
import { getLogiSession } from "@/lib/auth/logi-session";

export default async function AuthHeader() {
  const { supabase, userEmail, hasAppAccess, isAdmin, canCreatePolls } =
    await getLogiSession();

  return (
    <>
      {!supabase ? (
        <div
          role="alert"
          className="bg-status-occupied-bg text-status-occupied px-4 py-3 font-body text-sm text-center border-b border-status-occupied/20"
        >
          Server-Konfiguration unvollständig: Bitte im Hosting die
          Backend-URL und den öffentlichen API-Schlüssel als
          Umgebungsvariablen setzen (siehe{" "}
          <code className="font-mono text-xs">.env.example</code>
          ), neu deployen und die Seite neu laden.
        </div>
      ) : null}
      <Header
        userEmail={userEmail}
        hasAppAccess={hasAppAccess}
        isAdmin={isAdmin}
        canCreatePolls={canCreatePolls}
      />
    </>
  );
}
