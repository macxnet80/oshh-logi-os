"use client";

import { useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import { deferAfterClick } from "@/lib/defer-inp";
import { deleteFreelancerCheckinForm } from "./actions";
import { formatDurationHhMm } from "./duration-format";

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
  return formatDurationHhMm(checkIn, checkOut) ?? "—";
}

/**
 * Wandelt `datetime-local` (Wandzeit in der Systemzeitzone des Nutzers) in ISO-UTC um.
 * `new Date("…T09:00")` ist in Browsern/Engines oft **UTC** — falsch. Stattdessen
 * Kalender-Komponenten und `new Date(y, m, d, h, min)` (immer lokal) verwenden.
 */
function datetimeLocalStringToIsoUtc(v: string): string | null {
  const t = v.trim();
  if (!t) return null;
  const m = t.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/
  );
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const h = Number(m[4]);
  const mi = Number(m[5]);
  const s = m[6] != null ? Number(m[6]) : 0;
  if (![y, mo, d, h, mi, s].every((n) => Number.isFinite(n))) return null;
  const local = new Date(y, mo - 1, d, h, mi, s, 0);
  if (Number.isNaN(local.getTime())) return null;
  return local.toISOString();
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
  const [isSaving, setIsSaving] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    deferAfterClick(() => {
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
    });
  };

  if (editing) {
    return (
      <td className="py-3 pl-2 align-top" colSpan={5}>
        <form
          className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/80 p-4 max-w-xl"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const inPicker = form.elements.namedItem(
              "check_in_local"
            ) as HTMLInputElement;
            const outPicker = form.elements.namedItem(
              "check_out_local"
            ) as HTMLInputElement;
            const inHidden = form.elements.namedItem("check_in") as HTMLInputElement;
            const outHidden = form.elements.namedItem("check_out") as HTMLInputElement;

            const inIso = datetimeLocalStringToIsoUtc(inPicker.value);
            if (!inIso) {
              window.alert(
                "Check-in konnte nicht gelesen werden. Bitte Datum und Uhrzeit vollständig setzen."
              );
              return;
            }
            inHidden.value = inIso;
            const outRaw = outPicker.value.trim();
            if (outRaw) {
              const outIso = datetimeLocalStringToIsoUtc(outRaw);
              if (!outIso) {
                window.alert(
                  "Check-out konnte nicht gelesen werden. Bitte Uhrzeit prüfen oder leer lassen."
                );
                return;
              }
              outHidden.value = outIso;
            } else {
              outHidden.value = "";
            }

            const fd = new FormData(form);
            setIsSaving(true);
            try {
              const res = await fetch("/api/admin/freelancer-zeiten/checkin", {
                method: "POST",
                body: fd,
                credentials: "include",
              });
              const data = (await res.json().catch(() => ({}))) as {
                destination?: string;
                error?: string;
              };
              if (!res.ok) {
                window.alert(data.error ?? "Speichern ist fehlgeschlagen.");
                return;
              }
              if (data.destination) {
                window.location.assign(data.destination);
              }
            } catch {
              window.alert("Netzwerkfehler. Bitte erneut versuchen.");
            } finally {
              setIsSaving(false);
            }
          }}
        >
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="next" value={nextUrl} />
          <input type="hidden" name="check_in" defaultValue="" />
          <input type="hidden" name="check_out" defaultValue="" />
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
                name="check_in_local"
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
                name="check_out_local"
                type="datetime-local"
                defaultValue={
                  checkOutIso ? toDatetimeLocalValue(checkOutIso) : ""
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 font-body text-sm bg-white"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm" disabled={isSaving || pending}>
              {isSaving ? "Speichern…" : "Speichern"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isSaving || pending}
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
