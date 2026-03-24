import type { Metadata } from "next";
import { Sora, Instrument_Sans } from "next/font/google";
import Header from "@/components/layout/Header";
import { createClient } from "@/lib/supabase/server";
import { hasLogiAppAccess, isLogiOsAdmin } from "@/lib/logi-app-access";
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hasAppAccess = false;
  let isAdmin = false;
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
  }

  return (
    <html lang="de">
      <body
        className={`${sora.variable} ${instrumentSans.variable} antialiased`}
      >
        <Header
          userEmail={user?.email ?? null}
          hasAppAccess={hasAppAccess}
          isAdmin={isAdmin}
        />
        <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
