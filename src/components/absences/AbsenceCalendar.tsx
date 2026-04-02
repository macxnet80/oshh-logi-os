"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getDaysInMonth,
  formatDate,
  isWeekend,
  isToday,
  isDateInRange,
  getMonthName,
  getDayNameShort,
} from "@/lib/calendar";
import { ABSENCE_CONFIG, type PlannerMember, type Absence } from "@/lib/types";

interface AbsenceCalendarProps {
  year: number;
  month: number;
  teamMembers: PlannerMember[];
  absences: Absence[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export default function AbsenceCalendar({
  year,
  month,
  teamMembers,
  absences,
  onPrevMonth,
  onNextMonth,
  onToday,
}: AbsenceCalendarProps) {
  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);

  // Build a lookup: profileId -> date -> absenceType
  const absenceMap = useMemo(() => {
    const map: Record<string, Record<string, Absence>> = {};
    for (const absence of absences) {
      if (!map[absence.profile_id]) {
        map[absence.profile_id] = {};
      }
      // Fill each day in range
      for (const day of days) {
        if (isDateInRange(day, absence.start_date, absence.end_date)) {
          map[absence.profile_id][formatDate(day)] = absence;
        }
      }
    }
    return map;
  }, [absences, days]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-subtle">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onPrevMonth}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Vorheriger Monat"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="font-display text-lg font-semibold text-orendt-black min-w-[180px] text-center">
            {getMonthName(month)} {year}
          </h2>
          <button
            onClick={onNextMonth}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Nächster Monat"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={onToday}
          className="px-3 py-1.5 text-sm font-body font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          Heute
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-gray-50 px-4 py-2 text-left font-body text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 min-w-[200px] max-w-[200px]">
                Mitarbeiter
              </th>
              {days.map((day) => {
                const weekend = isWeekend(day);
                const today = isToday(day);
                return (
                  <th
                    key={formatDate(day)}
                    className={`
                      px-0 py-2 text-center border-b border-gray-200 min-w-[36px]
                      ${weekend ? "bg-gray-100" : "bg-gray-50"}
                      ${today ? "bg-orendt-accent/10" : ""}
                    `}
                  >
                    <div className="font-body text-[10px] text-gray-400">
                      {getDayNameShort(day)}
                    </div>
                    <div
                      className={`
                        font-display text-xs font-medium
                        ${today ? "text-orendt-black font-bold" : weekend ? "text-gray-400" : "text-gray-600"}
                      `}
                    >
                      {day.getDate()}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {teamMembers.map((member) => (
              <tr key={member.id} className="group">
                <td className="sticky left-0 z-10 bg-white px-4 py-2 border-b border-gray-100 group-hover:bg-gray-50 transition-colors max-w-[200px] overflow-hidden">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="font-display text-xs font-semibold text-gray-600">
                        {member.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-body text-sm font-medium text-orendt-black leading-tight whitespace-nowrap truncate">
                        {member.full_name}
                      </p>
                    </div>
                  </div>
                </td>
                {days.map((day) => {
                  const dateStr = formatDate(day);
                  const absence = absenceMap[member.id]?.[dateStr];
                  const weekend = isWeekend(day);
                  const today = isToday(day);

                  return (
                    <td
                      key={dateStr}
                      className={`
                        px-0.5 py-1 border-b border-gray-100 text-center
                        ${weekend ? "bg-gray-50" : ""}
                        ${today ? "bg-orendt-accent/5" : ""}
                      `}
                    >
                      {absence && (
                        <div
                          className="w-full h-6 rounded-sm flex items-center justify-center"
                          style={{
                            backgroundColor: ABSENCE_CONFIG[absence.type].bgColor,
                            borderLeft: `2px solid ${ABSENCE_CONFIG[absence.type].color}`,
                          }}
                          title={`${ABSENCE_CONFIG[absence.type].label}${absence.note ? ` — ${absence.note}` : ""}`}
                        >
                          <span
                            className="font-body text-[9px] font-medium truncate px-0.5"
                            style={{ color: ABSENCE_CONFIG[absence.type].color }}
                          >
                            {(absence.type === "leaving_early" ||
                              absence.type === "coming_late") &&
                            absence.note
                              ? absence.note.match(/^ab (\d{1,2}:\d{2})/)?.[1] ?? "F"
                              : ABSENCE_CONFIG[absence.type].label.charAt(0)}
                          </span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 px-5 py-3 border-t border-gray-200 bg-gray-50">
        {Object.entries(ABSENCE_CONFIG).map(([key, config]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: config.color }}
            />
            <span className="font-body text-xs text-gray-600">
              {config.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
