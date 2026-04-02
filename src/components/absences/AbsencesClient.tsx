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
import type { Absence, AbsenceType, PlannerMember } from "@/lib/types";

interface AbsencesClientProps {
  /** Nutzer mit Logi-App-Zugang (`get_logi_planner_members`) */
  teamMembers: PlannerMember[];
  absences: Absence[];
  /** Eigenes Profil in der Teamliste; null = nicht in `logi_user_access` */
  currentMember: PlannerMember | null;
  plannerLoadError?: string | null;
}

export default function AbsencesClient({
  teamMembers,
  absences,
  currentMember,
  plannerLoadError,
}: AbsencesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
      profile_id: string;
      type: AbsenceType;
      start_date: string;
      end_date: string;
      note: string;
    }) => {
      setFormError(null);
      const result = await addAbsence(data);
      if (result && "error" in result && result.error) {
        setFormError(result.error);
        return;
      }
      if (result && "success" in result && result.success) {
        setFormError(null);
        setShowForm(false);
        startTransition(() => {
          router.refresh();
        });
        return;
      }
      setFormError(
        "Speichern fehlgeschlagen. Bitte erneut versuchen oder Seite neu laden."
      );
    },
    [router]
  );

  const openForm = useCallback(() => {
    setFormError(null);
    setShowForm(true);
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];
  const upcomingAbsences = absences
    .filter((a) => a.end_date >= todayStr)
    .sort((a, b) => a.start_date.localeCompare(b.start_date))
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-orendt-black tracking-tight">
            Abwesenheitsplaner
          </h1>
          <p className="font-body text-gray-600 mt-1">
            Alle Teammitglieder und deren Abwesenheiten. Eintragen kannst du nur
            für dein eigenes Profil.
          </p>
        </div>
        {currentMember ? (
          <Button onClick={openForm} disabled={isPending}>
            <Plus className="w-4 h-4" />
            Eigene Abwesenheit
          </Button>
        ) : (
          <p className="font-body text-sm text-gray-500 max-w-xs text-right">
            Kein Logi-App-Zugang in der Teamliste — Eintragen nicht möglich.
          </p>
        )}
      </div>

      {plannerLoadError ? (
        <Card className="p-6">
          <p className="font-body text-sm text-gray-600">
            Teamliste konnte nicht geladen werden: {plannerLoadError}
          </p>
        </Card>
      ) : teamMembers.length === 0 ? (
        <Card className="p-6">
          <p className="font-body text-sm text-gray-600">
            Es sind keine Nutzer mit Logi-App-Zugang in{" "}
            <code className="text-xs bg-gray-100 px-1 rounded">
              logi_user_access
            </code>{" "}
            hinterlegt.
          </p>
        </Card>
      ) : (
        <AbsenceCalendar
          year={year}
          month={month}
          teamMembers={teamMembers}
          absences={absences}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
        />
      )}

      {upcomingAbsences.length > 0 && teamMembers.length > 0 && (
        <Card>
          <h3 className="font-display text-base font-semibold text-orendt-black mb-3">
            Anstehende Abwesenheiten
          </h3>
          <div className="divide-y divide-gray-100">
            {upcomingAbsences.map((absence) => {
              const member = teamMembers.find(
                (m) => m.id === absence.profile_id
              );
              return (
                <div
                  key={absence.id}
                  className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="w-7 h-7 shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="font-display text-xs font-semibold text-gray-600">
                        {member?.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("") || "?"}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-body text-sm font-medium text-orendt-black whitespace-nowrap truncate">
                        {member?.full_name}
                      </p>
                      <p className="font-body text-xs text-gray-500">
                        {absence.start_date === absence.end_date
                          ? new Date(
                              absence.start_date + "T12:00:00"
                            ).toLocaleDateString("de-DE", {
                              day: "numeric",
                              month: "short",
                            })
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

      {showForm && currentMember && (
        <AbsenceForm
          currentMember={currentMember}
          onSubmit={handleSubmit}
          onClose={() => {
            setFormError(null);
            setShowForm(false);
          }}
          submitError={formError}
        />
      )}
    </div>
  );
}
