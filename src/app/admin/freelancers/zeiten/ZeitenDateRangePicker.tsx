"use client";

import { useEffect, useState } from "react";
import type { ZeitenRangePreset } from "@/app/admin/freelancers/zeiten/zeit-range-berlin";

type Props = {
  rangeMode: ZeitenRangePreset;
  /** Bei range=custom: aktuelle Datumswerte vom Server */
  initialFrom?: string;
  initialTo?: string;
  freelancerId: string;
};

const base = "/admin/freelancers/zeiten";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function buildHref(
  freelancerId: string,
  fromYmd: string,
  toYmd: string
): string {
  const u = new URLSearchParams();
  u.set("range", "custom");
  if (freelancerId) u.set("freelancer", freelancerId);
  u.set("from", fromYmd);
  u.set("to", toYmd);
  return `${base}?${u.toString()}`;
}

export default function ZeitenDateRangePicker({
  rangeMode,
  initialFrom = "",
  initialTo = "",
  freelancerId,
}: Props) {
  const [von, setVon] = useState(initialFrom || "");
  const [bis, setBis] = useState(initialTo || "");

  useEffect(() => {
    if (rangeMode === "custom") {
      setVon(initialFrom || "");
      setBis(initialTo || "");
    } else {
      setVon("");
      setBis("");
    }
  }, [rangeMode, initialFrom, initialTo]);

  const maybeNavigate = (nextVon: string, nextBis: string) => {
    const a = nextVon.trim();
    const b = nextBis.trim();
    if (!DATE_RE.test(a) || !DATE_RE.test(b)) return;

    if (rangeMode !== "custom") {
      window.location.href = buildHref(freelancerId, a, b);
      return;
    }
    const unchanged = a === initialFrom && b === initialTo;
    if (!unchanged) {
      window.location.href = buildHref(freelancerId, a, b);
    }
  };

  return (
    <div
      className="flex shrink-0 flex-wrap items-end gap-3 md:gap-4"
      aria-label="Eigenes Datum (Von bis)"
    >
      <div className="flex items-center gap-2">
        <label
          htmlFor="zeiten-von"
          className="font-body text-xs font-medium text-gray-600 whitespace-nowrap"
        >
          Von
        </label>
        <input
          id="zeiten-von"
          type="date"
          value={von}
          onChange={(e) => {
            const v = e.target.value;
            setVon(v);
            maybeNavigate(v, bis);
          }}
          className="px-3 py-2 rounded-lg border border-gray-200 font-body text-sm bg-white text-orendt-black focus:outline-none focus:ring-2 focus:ring-orendt-accent focus:border-transparent min-w-[10.25rem]"
        />
      </div>
      <div className="flex items-center gap-2">
        <label
          htmlFor="zeiten-bis"
          className="font-body text-xs font-medium text-gray-600 whitespace-nowrap"
        >
          Bis
        </label>
        <input
          id="zeiten-bis"
          type="date"
          value={bis}
          onChange={(e) => {
            const v = e.target.value;
            setBis(v);
            maybeNavigate(von, v);
          }}
          className="px-3 py-2 rounded-lg border border-gray-200 font-body text-sm bg-white text-orendt-black focus:outline-none focus:ring-2 focus:ring-orendt-accent focus:border-transparent min-w-[10.25rem]"
        />
      </div>
    </div>
  );
}
