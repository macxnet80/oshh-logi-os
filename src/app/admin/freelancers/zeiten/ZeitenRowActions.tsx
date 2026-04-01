"use client";

import { useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import { deleteFreelancerCheckinForm, updateFreelancerCheckin } from "./actions";

/** `datetime-local` Wert (Browser-Lokalzeit). */
function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDisplay(iso: string) {
  try {
    return new Intl.DateTimeFormat("de-DE", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function durationLabel(checkIn: string, checkOut: string | null) {
  if (!checkOut) return "—";
  const a = new Date(checkIn).getTime();
  const b = new Date(checkOut).getTime();
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return "—";
  return String(Math.round((b - a) / 60_000));
}

export default function ZeitenRowActions({
  id,
  name,
  checkInIso,
  checkOutIso,
  nextUrl,
}: {
  id: string;
  name: string;
  checkInIso: string;
  checkOutIso: string | null;
  nextUrl: string;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    if (
      !confirm(
        "Diesen Zeiteintrag wirklich löschen? Dies kann nicht rückgängig gemacht werden."
      )
    ) {
      return;
    }
    startTransition(() => {
      const fd = new FormData();
      fd.set("id", id);
      fd.set("next", nextUrl);
      void deleteFreelancerCheckinForm(fd);
    });
  };

  if (editing) {
    return (
      <td className="py-3 pl-2 align-top" colSpan={5}>
        <form
          action={updateFreelancerCheckin}
          className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/80 p-4 max-w-xl"
        >
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="next" value={nextUrl} />
          <p className="font-body text-xs font-medium text-gray-600">{name}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor={`check-in-${id}`}
                className="font-body text-xs font-medium text-gray-600 block mb-1"
              >
                Check-in
              </label>
              <input
                id={`check-in-${id}`}
                name="check_in"
                type="datetime-local"
                required
                defaultValue={toDatetimeLocalValue(checkInIso)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 font-body text-sm bg-white"
              />
            </div>
            <div>
              <label
                htmlFor={`check-out-${id}`}
                className="font-body text-xs font-medium text-gray-600 block mb-1"
              >
                Check-out (leer = offen)
              </label>
              <input
                id={`check-out-${id}`}
                name="check_out"
                type="datetime-local"
                defaultValue={
                  checkOutIso ? toDatetimeLocalValue(checkOutIso) : ""
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 font-body text-sm bg-white"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm" disabled={pending}>
              Speichern
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={pending}
              onClick={() => setEditing(false)}
            >
              Abbrechen
            </Button>
          </div>
        </form>
      </td>
    );
  }

  return (
    <>
      <td className="py-3 pr-4 font-medium text-orendt-black">{name}</td>
      <td className="py-3 pr-4">{formatDisplay(checkInIso)}</td>
      <td className="py-3 pr-4">
        {checkOutIso ? (
          formatDisplay(checkOutIso)
        ) : (
          <span className="text-status-reserved">Offen</span>
        )}
      </td>
      <td className="py-3 pr-4">{durationLabel(checkInIso, checkOutIso)}</td>
      <td className="py-3 pl-2 text-right whitespace-nowrap">
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setEditing(true)}
          >
            Bearbeiten
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            disabled={pending}
            onClick={handleDelete}
          >
            Löschen
          </Button>
        </div>
      </td>
    </>
  );
}
