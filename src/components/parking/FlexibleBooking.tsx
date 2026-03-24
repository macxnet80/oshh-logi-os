"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  cancelReservation,
  getAppSetting,
  getAvailableSpotsForDate,
  getMyReservations,
  reserveSpot,
} from "@/lib/supabase/parking-client";

type FlexibleBookingProps = {
  userId: string;
};

type BookingState = {
  id: string;
  spot_id: string;
  spot?: { label?: string; zone?: string | null } | null;
};

type AvailableSpotState = {
  id: string;
  spot_id: string;
  spot?: { label?: string; zone?: string | null } | null;
  released_by_user?: { full_name?: string | null } | null;
};

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

/** Typography inside the spot badge scales with label length so long names stay inside the box. */
function spotBadgeTextClass(label: string) {
  const n = label.length;
  if (n <= 4) return "text-4xl leading-none";
  if (n <= 7) return "text-3xl leading-tight";
  if (n <= 11) return "text-2xl leading-tight";
  if (n <= 16) return "text-xl leading-snug tracking-tight";
  return "text-lg leading-snug tracking-tight break-words";
}

function ParkingSpotBadge({
  label,
  variant,
}: {
  label: string;
  variant: "reserved" | "available";
}) {
  const text = label || "?";
  const typo = spotBadgeTextClass(text);
  const isReserved = variant === "reserved";

  return (
    <div
      className={[
        "inline-flex items-center justify-center rounded-2xl mb-6 px-4 py-4",
        "min-h-[5.5rem] min-w-[5.5rem] max-w-[14rem] sm:max-w-[16rem]",
        "text-balance",
        isReserved
          ? "bg-orendt-black shadow-xl"
          : "bg-gray-50 border-2 border-gray-200",
      ].join(" ")}
    >
      <span
        className={[
          "font-display font-bold text-center break-words hyphens-auto",
          typo,
          isReserved ? "text-orendt-accent" : "text-orendt-black",
        ].join(" ")}
      >
        {text}
      </span>
    </div>
  );
}

export default function FlexibleBooking({ userId }: FlexibleBookingProps) {
  const today = useMemo(() => getToday(), []);
  const [firstAvailableSpot, setFirstAvailableSpot] =
    useState<AvailableSpotState | null>(null);
  const [myTodayReservation, setMyTodayReservation] =
    useState<BookingState | null>(null);
  const [keyBoxPin, setKeyBoxPin] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);

    const { data: reservations } = await getMyReservations(userId, today);
    const todayReservation = (reservations ?? []).find((r) => r.date === today);
    setMyTodayReservation(todayReservation ?? null);

    if (todayReservation) {
      const { data: pin } = await getAppSetting("key_box_pin");
      setKeyBoxPin(pin ?? null);
      setFirstAvailableSpot(null);
      setLoading(false);
      return;
    }

    setKeyBoxPin(null);
    const { data: available } = await getAvailableSpotsForDate(today);
    const sorted = (available ?? []).sort(
      (a, b) => (a.spot?.label ?? "").localeCompare(b.spot?.label ?? "")
    );
    setFirstAvailableSpot(sorted.length > 0 ? sorted[0] : null);
    setLoading(false);
  }, [today, userId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);
    return () => {
      window.clearTimeout(timer);
    };
  }, [loadData]);

  async function handleBook() {
    if (!firstAvailableSpot || booking) return;
    setBooking(true);

    const { error } = await reserveSpot(
      firstAvailableSpot.spot_id,
      firstAvailableSpot.id,
      userId,
      today
    );

    if (error) {
      alert(error.message || "Fehler beim Buchen");
    }

    await loadData();
    setBooking(false);
  }

  async function handleCancel() {
    if (!myTodayReservation || cancelling) return;
    const confirmed = confirm(
      "Möchtest du deinen Platz wirklich freigeben? Er ist sofort wieder verfügbar."
    );
    if (!confirmed) return;

    setCancelling(true);
    const { error } = await cancelReservation(myTodayReservation.id);

    if (error) {
      alert(error.message || "Fehler beim Freigeben");
    }

    await loadData();
    setCancelling(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-gray-200">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-orendt-black rounded-full animate-spin" />
      </div>
    );
  }

  if (myTodayReservation) {
    return (
      <div className="bg-white p-8 rounded-2xl border-2 border-orendt-accent/40 shadow-sm animate-fade-in">
        <div className="text-center">
          <p className="text-[11px] font-display font-bold text-gray-500 uppercase tracking-[0.18em] mb-3">
            Dein Platz heute
          </p>

          <ParkingSpotBadge
            label={myTodayReservation.spot?.label ?? "?"}
            variant="reserved"
          />

          <h2 className="font-display text-2xl font-bold text-orendt-black uppercase tracking-tight mb-2">
            Platz gesichert
          </h2>

          <p className="text-sm text-gray-600 font-body max-w-sm mx-auto leading-relaxed mb-6">
            Dein Parkplatz{" "}
            <span className="font-bold text-orendt-black">
              {myTodayReservation.spot?.label ?? "?"}
            </span>{" "}
            im Bereich{" "}
            <span className="font-bold text-orendt-black">
              {myTodayReservation.spot?.zone ?? "Unbekannt"}
            </span>{" "}
            ist heute für dich reserviert.
          </p>

          <div className="flex flex-col items-center gap-4 mt-6">
            {keyBoxPin ? (
              <div className="p-5 bg-gray-50 border-2 border-orendt-accent/40 rounded-2xl">
                <p className="text-[10px] font-display font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">
                  Schlüsselkasten PIN
                </p>
                <p className="font-mono text-3xl font-bold text-orendt-black tracking-[0.4em]">
                  {keyBoxPin}
                </p>
              </div>
            ) : null}

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-orendt-accent animate-pulse" />
              <span className="text-[10px] font-display font-bold text-gray-500 uppercase tracking-wider">
                Gültig bis Mitternacht
              </span>
            </div>

            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="mt-2 px-6 py-3 bg-white text-gray-600 font-display text-xs font-bold uppercase tracking-[0.15em] rounded-xl border border-gray-200 hover:border-red-300 hover:text-red-500 hover:bg-red-50 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {cancelling ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                  Wird freigegeben...
                </div>
              ) : (
                "Platz freigeben"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (firstAvailableSpot) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm animate-fade-in">
        <div className="text-center">
          <p className="text-[11px] font-display font-bold text-gray-500 uppercase tracking-[0.18em] mb-3">
            Verfügbar heute
          </p>

          <ParkingSpotBadge
            label={firstAvailableSpot.spot?.label ?? "?"}
            variant="available"
          />

          <h2 className="font-display text-2xl font-bold text-orendt-black uppercase tracking-tight mb-2">
            Ein Platz wartet auf dich
          </h2>

          <p className="text-sm text-gray-600 font-body max-w-sm mx-auto leading-relaxed mb-2">
            Bereich{" "}
            <span className="font-bold text-orendt-black">
              {firstAvailableSpot.spot?.zone ?? "Unbekannt"}
            </span>
            {firstAvailableSpot.released_by_user?.full_name ? (
              <>
                {" "}
                · Freigegeben von{" "}
                <span className="font-bold text-orendt-black">
                  {firstAvailableSpot.released_by_user.full_name.split(" ")[0]}
                </span>
              </>
            ) : null}
          </p>

          <p className="text-[10px] font-display font-bold text-gray-500 uppercase tracking-widest mb-8">
            First come, first served
          </p>

          <button
            onClick={handleBook}
            disabled={booking}
            className="w-full sm:w-auto px-12 py-5 bg-orendt-black text-orendt-accent font-display text-sm font-bold uppercase tracking-[0.2em] rounded-2xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 shadow-xl hover:shadow-2xl cursor-pointer"
          >
            {booking ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-4 h-4 border-2 border-orendt-accent/30 border-t-orendt-accent rounded-full animate-spin" />
                Wird gebucht...
              </div>
            ) : (
              "Platz sichern"
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-gray-200 shadow-sm animate-fade-in">
      <div className="text-center">
        <div className="text-6xl mb-6">🚗💨</div>
        <h2 className="font-display text-2xl font-bold text-orendt-black uppercase tracking-tight mb-3">
          Alles belegt
        </h2>
        <p className="text-base text-gray-600 font-body max-w-md mx-auto leading-relaxed mb-3">
          Heute waren alle schneller. Versuch es morgen nochmal.
        </p>
        <p className="text-sm text-gray-500 font-body max-w-md mx-auto leading-relaxed">
          Falls jemand seinen Platz freigibt, wird er sofort wieder buchbar.
        </p>
      </div>
    </div>
  );
}
