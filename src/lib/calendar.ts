export function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

export function getStartOfWeek(date: Date): Date {
  const start = new Date(date);
  const day = start.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

export function getWorkWeekDays(anchorDate: Date): Date[] {
  const monday = getStartOfWeek(anchorDate);
  return Array.from({ length: 5 }, (_, index) => addDays(monday, index));
}

export function getWorkWeekLabel(anchorDate: Date): string {
  const days = getWorkWeekDays(anchorDate);
  const firstDay = days[0];
  const lastDay = days[days.length - 1];

  const format = (date: Date) =>
    date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
    });

  return `${format(firstDay)} – ${format(lastDay)}`;
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function isDateInRange(
  date: Date,
  startDate: string,
  endDate: string
): boolean {
  const d = formatDate(date);
  return d >= startDate && d <= endDate;
}

const MONTH_NAMES = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

const DAY_NAMES_SHORT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export function getMonthName(month: number): string {
  return MONTH_NAMES[month];
}

export function getDayNameShort(date: Date): string {
  // getDay(): 0=Sun, adjust to Mon=0
  const day = (date.getDay() + 6) % 7;
  return DAY_NAMES_SHORT[day];
}
