import { NextResponse } from "next/server";
import {
  checkCheckinRateLimit,
  getClientIpFromHeaders,
} from "@/lib/checkin-rate-limit";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

type CheckinSuccess = {
  ok: true;
  action: "checkin" | "checkout";
  name: string;
  time: string;
};

type CheckinError = {
  ok: false;
  error: string;
};

function normalizePin(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 4) return null;
  return digits;
}

export async function POST(request: Request) {
  const ip = getClientIpFromHeaders(request.headers);
  if (!checkCheckinRateLimit(`checkin:${ip}`)) {
    return NextResponse.json<CheckinError>(
      { ok: false, error: "Zu viele Versuche. Bitte in einer Minute erneut versuchen." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<CheckinError>(
      { ok: false, error: "Ungültige Anfrage." },
      { status: 400 }
    );
  }

  const pin = normalizePin(
    typeof body === "object" && body !== null && "pin" in body
      ? (body as { pin?: unknown }).pin
      : null
  );
  if (!pin) {
    return NextResponse.json<CheckinError>(
      { ok: false, error: "Bitte eine vierstellige PIN eingeben." },
      { status: 400 }
    );
  }

  try {
    const service = createServiceRoleClient();

    const { data: freelancer, error: findErr } = await service
      .from("freelancers")
      .select("id, name, pin, is_active")
      .eq("pin", pin)
      .maybeSingle();

    if (findErr) {
      console.error("[checkin] freelancer lookup", findErr);
      return NextResponse.json<CheckinError>(
        { ok: false, error: "Technischer Fehler. Bitte später erneut versuchen." },
        { status: 500 }
      );
    }

    if (!freelancer || !freelancer.is_active) {
      return NextResponse.json<CheckinError>(
        { ok: false, error: "PIN unbekannt oder Freelancer deaktiviert." },
        { status: 401 }
      );
    }

    const { data: openRow, error: openErr } = await service
      .from("freelancer_checkins")
      .select("id, check_in")
      .eq("freelancer_id", freelancer.id)
      .is("check_out", null)
      .order("check_in", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (openErr) {
      console.error("[checkin] open session lookup", openErr);
      return NextResponse.json<CheckinError>(
        { ok: false, error: "Technischer Fehler. Bitte später erneut versuchen." },
        { status: 500 }
      );
    }

    const now = new Date().toISOString();

    if (openRow) {
      const { error: updErr } = await service
        .from("freelancer_checkins")
        .update({ check_out: now })
        .eq("id", openRow.id);

      if (updErr) {
        console.error("[checkin] checkout update", updErr);
        return NextResponse.json<CheckinError>(
          { ok: false, error: "Checkout fehlgeschlagen." },
          { status: 500 }
        );
      }

      return NextResponse.json<CheckinSuccess>({
        ok: true,
        action: "checkout",
        name: freelancer.name,
        time: now,
      });
    }

    const { error: insErr } = await service.from("freelancer_checkins").insert({
      freelancer_id: freelancer.id,
      check_in: now,
      check_out: null,
    });

    if (insErr) {
      console.error("[checkin] checkin insert", insErr);
      return NextResponse.json<CheckinError>(
        { ok: false, error: "Check-in fehlgeschlagen." },
        { status: 500 }
      );
    }

    return NextResponse.json<CheckinSuccess>({
      ok: true,
      action: "checkin",
      name: freelancer.name,
      time: now,
    });
  } catch (e) {
    console.error("[checkin]", e);
    return NextResponse.json<CheckinError>(
      {
        ok: false,
        error:
          e instanceof Error && e.message.includes("Service-Schlüssel")
            ? "Server nicht konfiguriert."
            : "Technischer Fehler.",
      },
      { status: 500 }
    );
  }
}
