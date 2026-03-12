export type AbsenceType =
  | "vacation"
  | "day_off"
  | "leaving_early"
  | "sick"
  | "home_office";

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
  employee_id: string;
  type: AbsenceType;
  start_date: string;
  end_date: string;
  note: string | null;
  created_at: string | null;
}

export interface AbsenceWithEmployee extends Absence {
  employee: Employee;
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
