"use client";

import { useState, useCallback, useTransition } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import AbsenceCalendar from "@/components/absences/AbsenceCalendar";
import AbsenceForm from "@/components/absences/AbsenceForm";
import AbsenceBadge from "@/components/absences/AbsenceBadge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { addAbsence } from "@/app/absences/actions";
import type { Absence, AbsenceType, Employee } from "@/lib/types";

interface AbsencesClientProps {
  employees: Employee[];
  absences: Absence[];
}

export default function AbsencesClient({
  employees,
  absences,
}: AbsencesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [showForm, setShowForm] = useState(false);

  const handlePrevMonth = useCallback(() => {
    setMonth((prev) => {
      if (prev === 0) {
        setYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setMonth((prev) => {
      if (prev === 11) {
        setYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }, []);

  const handleToday = useCallback(() => {
    const today = new Date();
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  }, []);

  const handleSubmit = useCallback(
    async (data: {
      employee_id: string;
      type: AbsenceType;
      start_date: string;
      end_date: string;
      note: string;
    }) => {
      const result = await addAbsence(data);
      if (result.success) {
        setShowForm(false);
        startTransition(() => {
          router.refresh();
        });
      }
    },
    [router]
  );

  // Upcoming absences (sorted by start date)
  const todayStr = new Date().toISOString().split("T")[0];
  const upcomingAbsences = absences
    .filter((a) => a.end_date >= todayStr)
    .sort((a, b) => a.start_date.localeCompare(b.start_date))
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-orendt-black tracking-tight">
            Abwesenheitsplaner
          </h1>
          <p className="font-body text-gray-600 mt-1">
            Übersicht aller Team-Abwesenheiten auf einen Blick.
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={isPending}>
          <Plus className="w-4 h-4" />
          Eintragen
        </Button>
      </div>

      {/* Calendar */}
      <AbsenceCalendar
        year={year}
        month={month}
        employees={employees}
        absences={absences}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
      />

      {/* Upcoming Absences */}
      {upcomingAbsences.length > 0 && (
        <Card>
          <h3 className="font-display text-base font-semibold text-orendt-black mb-3">
            Anstehende Abwesenheiten
          </h3>
          <div className="divide-y divide-gray-100">
            {upcomingAbsences.map((absence) => {
              const employee = employees.find(
                (e) => e.id === absence.employee_id
              );
              return (
                <div
                  key={absence.id}
                  className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="font-display text-xs font-semibold text-gray-600">
                        {employee?.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("") || "?"}
                      </span>
                    </div>
                    <div>
                      <p className="font-body text-sm font-medium text-orendt-black">
                        {employee?.full_name}
                      </p>
                      <p className="font-body text-xs text-gray-500">
                        {absence.start_date === absence.end_date
                          ? new Date(absence.start_date + "T12:00:00").toLocaleDateString(
                              "de-DE",
                              { day: "numeric", month: "short" }
                            )
                          : `${new Date(absence.start_date + "T12:00:00").toLocaleDateString(
                              "de-DE",
                              { day: "numeric", month: "short" }
                            )} – ${new Date(absence.end_date + "T12:00:00").toLocaleDateString(
                              "de-DE",
                              { day: "numeric", month: "short" }
                            )}`}
                        {absence.note && ` · ${absence.note}`}
                      </p>
                    </div>
                  </div>
                  <AbsenceBadge type={absence.type} />
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Form Modal */}
      {showForm && (
        <AbsenceForm
          employees={employees}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
