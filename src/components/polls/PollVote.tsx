"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Check } from "lucide-react";
import { togglePollOption } from "@/app/polls/actions";
import { sameChoiceSets } from "@/lib/polls/logi-polls-model";

type PollVoteProps = {
  pollId: string;
  questionText: string;
  options: string[];
  counts: Record<string, number>;
  totalSelections: number;
  participantCount: number;
  hasVoted: boolean;
  myChoices: string[];
  variant?: "default" | "compact";
  detailHref?: string;
};

export default function PollVote({
  pollId,
  questionText,
  options,
  counts,
  totalSelections,
  participantCount,
  hasVoted: _hasVoted,
  myChoices,
  variant = "default",
  detailHref,
}: PollVoteProps) {
  const router = useRouter();
  const groupId = useId();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [optimisticChoices, setOptimisticChoices] = useState<string[] | null>(
    null
  );

  const effective = optimisticChoices ?? myChoices;

  useEffect(() => {
    if (
      optimisticChoices !== null &&
      sameChoiceSets(optimisticChoices, myChoices)
    ) {
      setOptimisticChoices(null);
    }
  }, [myChoices, optimisticChoices]);

  const compact = variant === "compact";
  const titleClass = compact
    ? "font-display text-base font-semibold text-orendt-black leading-snug"
    : "font-display text-lg sm:text-xl font-semibold text-orendt-black leading-snug";
  const rowPad = compact ? "p-2.5 sm:p-3" : "p-3 sm:p-4";
  const gap = compact ? "gap-2.5" : "gap-3";

  async function toggleOption(option: string) {
    if (pending) return;
    setError(null);
    const isOn = effective.includes(option);
    const next = isOn
      ? effective.filter((o) => o !== option)
      : [...effective, option];
    setOptimisticChoices(next);

    const fd = new FormData();
    fd.set("pollId", pollId);
    fd.set("option", option);
    fd.set("select", isOn ? "0" : "1");
    setPending(true);
    try {
      const result = await togglePollOption(fd);
      if ("error" in result) {
        setOptimisticChoices(null);
        setError(result.error);
        return;
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={compact ? "space-y-4" : "space-y-5"}>
      <div>
        <h2 className={titleClass} id={groupId}>
          {questionText}
        </h2>
        <p className="font-body text-sm text-gray-500 mt-1.5">
          {participantCount} Teilnehmer · {totalSelections}{" "}
          {totalSelections === 1 ? "Auswahl" : "Auswahlen"}
          <span className="text-gray-600">
            {" "}
            — mehrere Antworten möglich, tippe zum An- und Abwählen.
          </span>
        </p>
      </div>

      <div
        role="group"
        aria-labelledby={groupId}
        className={`flex flex-col ${gap}`}
        aria-live="polite"
      >
        {options.map((opt, index) => {
          const n = counts[opt] ?? 0;
          const pct =
            totalSelections > 0 ? Math.round((n / totalSelections) * 100) : 0;
          const selected = effective.includes(opt);

          return (
            <div
              key={`${pollId}-${index}`}
              className={`
                rounded-xl border border-gray-200 bg-white shadow-subtle transition-all duration-200
                ${
                  selected
                    ? "ring-2 ring-orendt-accent/50 border-orendt-black/12 bg-gray-50/80"
                    : ""
                }
              `}
            >
              <button
                type="button"
                role="checkbox"
                aria-checked={selected}
                aria-posinset={index + 1}
                aria-setsize={options.length}
                aria-label={`${opt}, ${n} von ${totalSelections} Auswahlen`}
                disabled={pending}
                onClick={() => void toggleOption(opt)}
                className={`
                  flex ${gap} items-start w-full text-left rounded-xl cursor-pointer
                  transition-colors hover:bg-gray-50/90
                  disabled:opacity-55 disabled:cursor-not-allowed disabled:hover:bg-transparent
                  ${rowPad}
                `}
              >
                <span
                  className={`
                    mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded border-2 transition-colors pointer-events-none
                    ${
                      selected
                        ? "border-orendt-black bg-orendt-black"
                        : "border-gray-300 bg-white"
                    }
                  `}
                  aria-hidden
                >
                  {selected ? (
                    <Check
                      className="h-3 w-3 text-orendt-accent"
                      strokeWidth={3}
                    />
                  ) : null}
                </span>
                <div className="flex-1 min-w-0 space-y-2 pointer-events-none">
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`font-body text-sm sm:text-[15px] leading-snug ${
                        selected
                          ? "font-semibold text-orendt-black"
                          : "font-medium text-gray-800"
                      }`}
                    >
                      {opt}
                    </span>
                    <span className="font-body text-sm tabular-nums text-gray-500 shrink-0">
                      {n}
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden bg-gray-200">
                    <div
                      className="h-full rounded-full bg-orendt-accent transition-all duration-500 ease-out"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {pending ? (
        <p className="font-body text-xs text-gray-500">Wird gespeichert…</p>
      ) : null}
      {error ? (
        <p className="font-body text-sm text-status-occupied" role="alert">
          {error}
        </p>
      ) : null}
      {detailHref ? (
        <Link
          href={detailHref}
          className="inline-block font-body text-sm text-gray-600 hover:text-orendt-black underline underline-offset-2"
        >
          Zur vollständigen Seite
        </Link>
      ) : null}
    </div>
  );
}
