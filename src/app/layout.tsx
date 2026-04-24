import type { Metadata } from "next";
import { Sora, Instrument_Sans } from "next/font/google";
import Header from "@/components/layout/Header";
import {
  createClientIfConfigured,
} from "@/lib/supabase/server";
import {
  hasLogiAppAccess,
  isLogiOsAdmin,
  isLogiPollCreator,
} from "@/lib/logi-app-access";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "logi-OS — Orendt Studios",
  description: "Operations Dashboard für die Logistik von Orendt Studios",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClientIfConfigured();

  let userEmail: string | null = null;
  let hasAppAccess = false;
  let isAdmin = false;
  let canCreatePolls = false;

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email ?? null;

    if (user) {
      const [{ data: access }, { data: profile }] = await Promise.all([
        supabase
          .from("logi_user_access")
          .select("team, is_admin")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
      ]);
      const profileRole = profile?.role ?? null;
      hasAppAccess = hasLogiAppAccess(access, profileRole);
      isAdmin = isLogiOsAdmin(access, profileRole);
      canCreatePolls = isLogiPollCreator(access ?? null, profileRole);
    }
  }

  return (
    <html lang="de" suppressHydrationWarning>
      <body
        className={`${sora.variable} ${instrumentSans.variable} antialiased`}
        suppressHydrationWarning
      >
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
        <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
