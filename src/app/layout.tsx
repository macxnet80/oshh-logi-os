import type { Metadata } from "next";
import { Suspense } from "react";
import { Sora, Instrument_Sans } from "next/font/google";
import AuthHeader from "@/components/layout/AuthHeader";
import {
  HeaderSkeleton,
  MainContentSkeleton,
} from "@/components/layout/PageShellFallback";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body
        className={`${sora.variable} ${instrumentSans.variable} antialiased`}
        suppressHydrationWarning
      >
        <Suspense fallback={<HeaderSkeleton />}>
          <AuthHeader />
        </Suspense>
        <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <Suspense fallback={<MainContentSkeleton />}>{children}</Suspense>
        </main>
      </body>
    </html>
  );
}
