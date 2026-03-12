"use client";

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { ABSENCE_CONFIG, type AbsenceType, type Employee } from "@/lib/types";

interface AbsenceFormProps {
  employees: Employee[];
  currentEmployeeId?: string;
  onSubmit: (data: {
    employee_id: string;
    type: AbsenceType;
    start_date: string;
    end_date: string;
    note: string;
  }) => void;
  onClose: () => void;
}

const typeOptions = Object.entries(ABSENCE_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
}));

export default function AbsenceForm({
  employees,
  currentEmployeeId,
  onSubmit,
  onClose,
}: AbsenceFormProps) {
  const today = new Date().toISOString().split("T")[0];
  const [employeeId, setEmployeeId] = useState(currentEmployeeId || employees[0]?.id || "");
  const [type, setType] = useState<AbsenceType>("vacation");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [note, setNote] = useState("");

  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: e.full_name,
  }));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      employee_id: employeeId,
      type,
      start_date: startDate,
      end_date: endDate,
      note,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-orendt-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-semibold text-orendt-black">
            Abwesenheit eintragen
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            id="employee"
            label="Mitarbeiter"
            options={employeeOptions}
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          />

          <Select
            id="type"
            label="Art der Abwesenheit"
            options={typeOptions}
            value={type}
            onChange={(e) => setType(e.target.value as AbsenceType)}
          />

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

          <Input
            id="note"
            label="Notiz (optional)"
            placeholder="z.B. Halber Tag, ab 14 Uhr..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Abbrechen
            </Button>
            <Button type="submit" className="flex-1">
              Eintragen
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
