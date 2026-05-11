import { NextResponse } from "next/server";
import { runDailyHrSync } from "@/lib/hr-sync/sync";

export const runtime = "nodejs";

function isBerlinSixOClockNow(): boolean {
  const parts = new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .formatToParts(new Date())
    .reduce<Record<string, string>>((acc, part) => {
      if (part.type !== "literal") acc[part.type] = part.value;
      return acc;
    }, {});

  return parts.hour === "06" && parts.minute === "00";
}

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;

  // Fallback for custom trigger clients.
  const querySecret = new URL(request.url).searchParams.get("secret");
  return querySecret === secret;
}

async function handle(request: Request, triggeredBy: "scheduler" | "manual") {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Nicht autorisiert." }, { status: 401 });
  }

  try {
    const result = await runDailyHrSync({ triggeredBy, timezone: "Europe/Berlin" });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "HR-Sync fehlgeschlagen.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const force = url.searchParams.get("force") === "1";
  if (!force && !isBerlinSixOClockNow()) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "Außerhalb des 06:00 Europe/Berlin Fensters.",
    });
  }
  return handle(request, "scheduler");
}

export async function POST(request: Request) {
  return handle(request, "manual");
}
