"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";

type Phase = "idle" | "loading" | "success" | "error";

type SuccessPayload = {
  action: "checkin" | "checkout";
  name: string;
  time: string;
};

export default function CheckinTerminal() {
  const [pin, setPin] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessPayload | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Verhindert doppelte POSTs (4. Ziffer + „Bestätigen“, Doppeltap, Race). */
  const submitInFlightRef = useRef(false);

  const clearReset = useCallback(() => {
    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
      resetTimer.current = null;
    }
  }, []);

  const scheduleReset = useCallback(() => {
    clearReset();
    resetTimer.current = setTimeout(() => {
      setPin("");
      setPhase("idle");
      setMessage(null);
      setSuccess(null);
    }, 5000);
  }, [clearReset]);

  useEffect(() => {
    return () => clearReset();
  }, [clearReset]);

  const submit = useCallback(
    async (digits: string) => {
      if (digits.length !== 4) return;
      if (submitInFlightRef.current) return;
      submitInFlightRef.current = true;
      setPhase("loading");
      setMessage(null);
      setSuccess(null);

      try {
        const res = await fetch("/api/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin: digits }),
        });
        const data = (await res.json()) as
          | { ok: true; action: "checkin" | "checkout"; name: string; time: string }
          | { ok: false; error?: string };

        if (!res.ok || !data || typeof data !== "object" || !("ok" in data)) {
          setPhase("error");
          setMessage("Unerwartete Antwort vom Server.");
          scheduleReset();
          return;
        }

        if (!data.ok) {
          setPhase("error");
          setMessage(
            "error" in data && data.error
              ? data.error
              : "Etwas ist schiefgelaufen."
          );
          scheduleReset();
          return;
        }

        setPhase("success");
        setSuccess({
          action: data.action,
          name: data.name,
          time: data.time,
        });
        scheduleReset();
      } catch {
        setPhase("error");
        setMessage("Netzwerkfehler. Bitte erneut versuchen.");
        scheduleReset();
      } finally {
        submitInFlightRef.current = false;
      }
    },
    [scheduleReset]
  );

  const onDigit = (d: string) => {
    if (phase === "loading") return;
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
  };

  const onBackspace = () => {
    if (phase === "loading") return;
    setPin((p) => p.slice(0, -1));
    setMessage(null);
    setSuccess(null);
    setPhase("idle");
  };

  const onClear = () => {
    if (phase === "loading") return;
    setPin("");
    setMessage(null);
    setSuccess(null);
    setPhase("idle");
    clearReset();
  };

  const formatTime = (iso: string) => {
    try {
      return new Intl.DateTimeFormat("de-DE", {
        dateStyle: "short",
        timeStyle: "medium",
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 max-w-md mx-auto w-full py-6">
      <div className="text-center space-y-2">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-orendt-black">
          Check-in / Check-out
        </h1>
        <p className="font-body text-sm text-gray-600">
          Gib deine vierstellige PIN ein und tippe auf „Bestätigen“.
        </p>
      </div>

      <div
        className="flex justify-center gap-3"
        role="status"
        aria-live="polite"
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`
              w-12 h-14 sm:w-14 sm:h-16 rounded-xl border-2 flex items-center justify-center
              font-display text-2xl font-semibold
              ${
                pin.length > i
                  ? "border-orendt-black bg-white text-orendt-black"
                  : "border-gray-200 bg-gray-50 text-gray-300"
              }
            `}
          >
            {pin[i] ?? ""}
          </div>
        ))}
      </div>

      {phase === "success" && success ? (
        <div
          className="w-full rounded-2xl border border-status-free bg-status-free-bg px-4 py-4 text-center"
          role="status"
        >
          <p className="font-display text-lg font-semibold text-orendt-black">
            Hallo {success.name}!
          </p>
          <p className="font-body text-sm text-gray-700 mt-2">
            {success.action === "checkin"
              ? "Du bist eingecheckt."
              : "Du bist ausgecheckt."}
          </p>
          <p className="font-body text-xs text-gray-500 mt-1">
            {formatTime(success.time)}
          </p>
        </div>
      ) : null}

      {phase === "error" && message ? (
        <div
          className="w-full rounded-2xl border border-status-occupied bg-status-occupied-bg px-4 py-3 text-center"
          role="alert"
        >
          <p className="font-body text-sm text-status-occupied">{message}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => onDigit(d)}
            disabled={phase === "loading"}
            className="h-14 sm:h-16 rounded-xl bg-white border border-gray-200 font-display text-xl font-semibold text-orendt-black shadow-sm hover:bg-gray-50 active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          onClick={onClear}
          disabled={phase === "loading"}
          className="h-14 sm:h-16 rounded-xl bg-gray-100 border border-gray-200 font-body text-sm font-semibold text-gray-700 hover:bg-gray-200 disabled:opacity-50"
        >
          C
        </button>
        <button
          type="button"
          onClick={() => onDigit("0")}
          disabled={phase === "loading"}
          className="h-14 sm:h-16 rounded-xl bg-white border border-gray-200 font-display text-xl font-semibold text-orendt-black shadow-sm hover:bg-gray-50 active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          0
        </button>
        <button
          type="button"
          onClick={onBackspace}
          disabled={phase === "loading"}
          className="h-14 sm:h-16 rounded-xl bg-gray-100 border border-gray-200 font-body text-sm font-semibold text-gray-700 hover:bg-gray-200 disabled:opacity-50"
        >
          ⌫
        </button>
      </div>

      {phase === "loading" ? (
        <p className="font-body text-sm text-gray-500">Bitte warten …</p>
      ) : null}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => void submit(pin)}
        disabled={pin.length !== 4 || phase === "loading"}
        className="w-full max-w-xs"
      >
        Bestätigen
      </Button>
    </div>
  );
}
