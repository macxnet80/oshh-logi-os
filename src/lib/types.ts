export type AbsenceType =
  | "vacation"
  | "day_off"
  | "leaving_early"
  | "coming_late"
  | "sick"
  | "home_office";

/** Profilzeilen für Nutzer mit Logi-App-Zugang (`logi_user_access`), Abwesenheitsplaner. */
export interface PlannerMember {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
}

/** Legacy-Mock / alte Stammdaten (nicht mehr für den Planer genutzt). */
export interface Employee {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  department: string | null;
  created_at: string | null;
}

export interface Absence {
  id: string;
  profile_id: string;
  type: AbsenceType;
  start_date: string;
  end_date: string;
  note: string | null;
  created_at: string | null;
}

export interface AbsenceWithMember extends Absence {
  member: PlannerMember;
}

// Absence type display config
export const ABSENCE_CONFIG: Record<
  AbsenceType,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  vacation: {
    label: "Urlaub",
    color: "#E8FF00",
    bgColor: "rgba(232, 255, 0, 0.15)",
    icon: "Palmtree",
  },
  day_off: {
    label: "Frei",
    color: "#3B82F6",
    bgColor: "#EFF6FF",
    icon: "Calendar",
  },
  leaving_early: {
    label: "Früher gehen",
    color: "#F59E0B",
    bgColor: "#FFFBEB",
    icon: "Clock",
  },
  coming_late: {
    label: "Später kommen",
    color: "#8B5CF6",
    bgColor: "#F5F3FF",
    icon: "Sunrise",
  },
  sick: {
    label: "Krank",
    color: "#EF4444",
    bgColor: "#FEF2F2",
    icon: "Thermometer",
  },
  home_office: {
    label: "Homeoffice",
    color: "#22C55E",
    bgColor: "#F0FDF4",
    icon: "Home",
  },
};
