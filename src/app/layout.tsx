import type { Metadata } from "next";
import { Sora, Instrument_Sans } from "next/font/google";
import Header from "@/components/layout/Header";
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
    <html lang="de">
      <body
        className={`${sora.variable} ${instrumentSans.variable} antialiased`}
      >
        <Header />
        <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
