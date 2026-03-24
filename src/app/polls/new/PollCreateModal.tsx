"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createPoll, type CreatePollState } from "./actions";

function PollCreateModalDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const questionId = `${baseId}-question`;
  const optionsId = `${baseId}-options`;
  const dialogTitleId = `${baseId}-dialog-title`;

  const [state, formAction, pending] = useActionState(
    createPoll,
    null as CreatePollState
  );

  useEffect(() => {
    if (state && "ok" in state && state.ok) {
      onClose();
      router.refresh();
    }
  }, [state, onClose, router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, pending]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Dialog schließen"
        className="absolute inset-0 bg-orendt-black/45 backdrop-blur-sm cursor-default"
        onClick={() => {
          if (!pending) onClose();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
        className="relative w-full max-w-lg max-h-[min(90vh,720px)] overflow-y-auto bg-white rounded-2xl border border-gray-200 shadow-xl animate-fade-in"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-5 py-4 border-b border-gray-100 bg-white rounded-t-2xl">
          <h2
            id={dialogTitleId}
            className="font-display text-lg font-semibold text-orendt-black"
          >
            Neue Abstimmung
          </h2>
          <button
            type="button"
            onClick={() => {
              if (!pending) onClose();
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-orendt-black transition-colors cursor-pointer"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        <form action={formAction} className="px-5 py-5 space-y-5">
          {state && "error" in state ? (
            <p
              className="font-body text-sm text-status-occupied bg-status-occupied-bg/40 border border-status-occupied/15 px-4 py-3 rounded-xl"
              role="alert"
            >
              {state.error}
            </p>
          ) : null}

          <Input
            id={titleId}
            name="title"
            label="Titel"
            required
            maxLength={200}
            placeholder="z. B. Team-Event Dezember"
            disabled={pending}
          />

          <Input
            id={questionId}
            name="question"
            label="Frage"
            required
            maxLength={500}
            placeholder="z. B. Welcher Tag passt dir besser?"
            disabled={pending}
          />

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={optionsId}
              className="font-body text-sm font-medium text-gray-700"
            >
              Antwortoptionen (eine pro Zeile)
            </label>
            <textarea
              id={optionsId}
              name="options"
              required
              rows={5}
              placeholder={"Montag\nDienstag\nMittwoch"}
              disabled={pending}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-body text-base text-orendt-black placeholder:text-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orendt-accent focus:border-transparent resize-y min-h-[120px] disabled:opacity-60 shadow-subtle"
            />
            <p className="font-body text-xs text-gray-500">
              Mindestens 2 Optionen, maximal 20 — jede Option nur einmal.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <Button type="submit" disabled={pending} className="rounded-xl">
              {pending ? "Wird gespeichert…" : "Erstellen"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="rounded-xl"
              disabled={pending}
              onClick={onClose}
            >
              Abbrechen
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PollCreateModal() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);

  return (
    <>
      <Button
        type="button"
        className="rounded-xl shrink-0"
        onClick={() => {
          setSession((s) => s + 1);
          setOpen(true);
        }}
      >
        Neue Abstimmung
      </Button>
      {open ? (
        <PollCreateModalDialog
          key={session}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
