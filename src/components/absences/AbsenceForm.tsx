"use client";

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { ABSENCE_CONFIG, type AbsenceType, type PlannerMember } from "@/lib/types";

interface AbsenceFormProps {
  currentMember: PlannerMember;
  onSubmit: (data: {
    profile_id: string;
    type: AbsenceType;
    start_date: string;
    end_date: string;
    note: string;
  }) => void | Promise<void>;
  onClose: () => void;
  /** Server- oder Validierungsfehler nach Eintragen */
  submitError?: string | null;
}

const typeOptions = Object.entries(ABSENCE_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
}));

export default function AbsenceForm({
  currentMember,
  onSubmit,
  onClose,
  submitError,
}: AbsenceFormProps) {
  const today = new Date().toISOString().split("T")[0];
  const [type, setType] = useState<AbsenceType>("vacation");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [note, setNote] = useState("");
  const [leavingTime, setLeavingTime] = useState("14:00");
  const [arrivalTime, setArrivalTime] = useState("10:00");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const finalNote =
      type === "leaving_early"
        ? `ab ${leavingTime}${note ? ` – ${note}` : ""}`
        : type === "coming_late"
          ? `ab ${arrivalTime}${note ? ` – ${note}` : ""}`
          : note;
    setIsSubmitting(true);
    try {
      await onSubmit({
        profile_id: currentMember.id,
        type,
        start_date: startDate,
        end_date:
          type === "leaving_early" || type === "coming_late"
            ? startDate
            : endDate,
        note: finalNote,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-orendt-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-semibold text-orendt-black">
            Eigene Abwesenheit
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="font-body text-xs font-medium text-gray-500 uppercase tracking-wide">
              Für
            </p>
            <p className="font-body text-sm font-semibold text-orendt-black mt-0.5">
              {currentMember.full_name}
            </p>
            <p className="font-body text-xs text-gray-500 mt-0.5">
              {currentMember.email}
            </p>
          </div>

          <Select
            id="type"
            label="Art der Abwesenheit"
            options={typeOptions}
            value={type}
            onChange={(e) => {
              const next = e.target.value as AbsenceType;
              setType(next);
              if (next === "leaving_early" || next === "coming_late") {
                setEndDate(startDate);
              }
            }}
          />

          {type === "leaving_early" ? (
            <div className="grid grid-cols-2 gap-3">
              <Input
                id="start_date"
                label="Datum"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setEndDate(e.target.value);
                }}
                required
              />
              <Input
                id="leaving_time"
                label="Uhrzeit"
                type="time"
                value={leavingTime}
                onChange={(e) => setLeavingTime(e.target.value)}
                required
              />
            </div>
          ) : type === "coming_late" ? (
            <div className="grid grid-cols-2 gap-3">
              <Input
                id="start_date_late"
                label="Datum"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setEndDate(e.target.value);
                }}
                required
              />
              <Input
                id="arrival_time"
                label="Ankunft ab"
                type="time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                required
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Input
                id="start_date"
                label="Von"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
              <Input
                id="end_date"
                label="Bis"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                required
              />
            </div>
          )}

          <Input
            id="note"
            label="Notiz (optional)"
            placeholder={
              type === "leaving_early"
                ? "z.B. Arzttermin..."
                : type === "coming_late"
                  ? "z.B. Kindergarten..."
                  : "z.B. Halber Tag, ab 14 Uhr..."
            }
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          {submitError ? (
            <p
              className="font-body text-sm text-status-occupied bg-status-occupied-bg/40 border border-status-occupied/15 px-4 py-3 rounded-xl"
              role="alert"
            >
              {submitError}
            </p>
          ) : null}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Abbrechen
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Wird gespeichert…" : "Eintragen"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
