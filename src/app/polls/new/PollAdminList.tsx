"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { deletePoll, updatePoll, type PollMutationState } from "./actions";

export type AdminPollRow = {
  id: string;
  title: string;
  question: string;
  optionsText: string;
  voteCount: number;
};

function PollEditForm({
  poll,
  onCancel,
  onSaved,
}: {
  poll: AdminPollRow;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const formPrefix = useId();
  const titleId = `${formPrefix}-title`;
  const questionId = `${formPrefix}-question`;
  const optionsId = `${formPrefix}-options`;

  const [updateState, updateAction, updatePending] = useActionState(
    updatePoll,
    null as PollMutationState
  );

  useEffect(() => {
    if (updateState && "ok" in updateState && updateState.ok) {
      onSaved();
    }
  }, [updateState, onSaved]);

  return (
    <form action={updateAction} className="space-y-4">
      <input type="hidden" name="pollId" value={poll.id} />
      {updateState && "error" in updateState ? (
        <p
          className="font-body text-sm text-status-occupied bg-status-occupied-bg/40 border border-status-occupied/15 px-4 py-3 rounded-xl"
          role="alert"
        >
          {updateState.error}
        </p>
      ) : null}
      <Input
        id={titleId}
        name="title"
        label="Titel"
        required
        maxLength={200}
        defaultValue={poll.title}
        disabled={updatePending}
      />
      <Input
        id={questionId}
        name="question"
        label="Frage"
        required
        maxLength={500}
        defaultValue={poll.question}
        disabled={updatePending}
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
          defaultValue={poll.optionsText}
          disabled={updatePending}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-body text-base text-orendt-black placeholder:text-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orendt-accent focus:border-transparent resize-y min-h-[120px] disabled:opacity-60 shadow-subtle"
        />
        <p className="font-body text-xs text-gray-500">
          Geänderte oder entfernte Optionen können bestehende Stimmen „verwaisen“
          — Texte nur ändern, wenn nötig.
        </p>
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        <Button type="submit" disabled={updatePending} className="rounded-xl">
          {updatePending ? "Speichert…" : "Speichern"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="rounded-xl"
          disabled={updatePending}
          onClick={onCancel}
        >
          Abbrechen
        </Button>
      </div>
    </form>
  );
}

function PollViewCard({
  poll,
  onEdit,
}: {
  poll: AdminPollRow;
  onEdit: () => void;
}) {
  const router = useRouter();
  const [deleteState, deleteAction, deletePending] = useActionState(
    deletePoll,
    null as PollMutationState
  );

  useEffect(() => {
    if (deleteState && "ok" in deleteState && deleteState.ok) {
      router.refresh();
    }
  }, [deleteState, router]);

  return (
    <Card className="border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <h3 className="font-display text-lg font-semibold text-orendt-black">
            {poll.title}
          </h3>
          <p className="font-body text-sm text-gray-600 line-clamp-2">
            {poll.question}
          </p>
          <p className="font-body text-xs text-gray-500 pt-1">
            {poll.voteCount}{" "}
            {poll.voteCount === 1 ? "Auswahl" : "Auswahlen"} gesamt
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="rounded-xl"
            onClick={onEdit}
          >
            <Pencil className="w-4 h-4" aria-hidden />
            Bearbeiten
          </Button>
          <form
            action={deleteAction}
            className="inline"
            onSubmit={(e) => {
              if (
                !window.confirm(
                  "Diese Abstimmung und alle Stimmen wirklich löschen?"
                )
              ) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="pollId" value={poll.id} />
            <Button
              type="submit"
              variant="danger"
              size="sm"
              className="rounded-xl"
              disabled={deletePending}
            >
              <Trash2 className="w-4 h-4" aria-hidden />
              {deletePending ? "…" : "Löschen"}
            </Button>
          </form>
        </div>
      </div>
      {deleteState && "error" in deleteState ? (
        <p className="font-body text-sm text-status-occupied mt-3" role="alert">
          {deleteState.error}
        </p>
      ) : null}
    </Card>
  );
}

function PollAdminRow({ poll }: { poll: AdminPollRow }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <Card className="border-gray-200 border-orendt-black/10 ring-1 ring-orendt-accent/25">
        <PollEditForm
          poll={poll}
          onCancel={() => setEditing(false)}
          onSaved={() => setEditing(false)}
        />
      </Card>
    );
  }

  return <PollViewCard poll={poll} onEdit={() => setEditing(true)} />;
}

export default function PollAdminList({ polls }: { polls: AdminPollRow[] }) {
  return (
    <section className="space-y-4" aria-labelledby="admin-polls-list-heading">
      <h2
        id="admin-polls-list-heading"
        className="font-display text-xl font-semibold text-orendt-black"
      >
        Aktive Abstimmungen
      </h2>
      {polls.length === 0 ? (
        <Card>
          <p className="font-body text-sm text-gray-600">
            Keine aktiven Abstimmungen. Lege unten eine neue an.
          </p>
        </Card>
      ) : (
        <ul className="space-y-4">
          {polls.map((p) => (
            <li key={p.id}>
              <PollAdminRow poll={p} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
