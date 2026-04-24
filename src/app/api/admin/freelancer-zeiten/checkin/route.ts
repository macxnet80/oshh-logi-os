import { NextResponse } from "next/server";
import { runZeitenCheckinUpdate } from "@/app/admin/freelancers/zeiten/zeiten-checkin-update.server";

export const runtime = "nodejs";

/**
 * Formular-Update ohne RSC-Server-Action-Transport (vermeidet
 * "An unexpected response was received from the server" in manchen Setups).
 */
export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Ungültige Anfrage." },
      { status: 400 }
    );
  }

  const { destination } = await runZeitenCheckinUpdate(formData);
  return NextResponse.json({ destination });
}
