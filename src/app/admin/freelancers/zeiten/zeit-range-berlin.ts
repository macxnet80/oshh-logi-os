/** Zeitraumberechnung mit Europe/Berlin (Kalenderwände wie in DE). */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function berlinNumericParts(epochMs: number): {
  y: number;
  m: number;
  d: number;
  dow: number; // JS: So=0 … Sa=6, in Berlin lokaler Datumswall
  h: number;
  minu: number;
  s: number;
} {
  const dtf = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = dtf.formatToParts(new Date(epochMs));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? "");
  let wk = parts.find((p) => p.type === "weekday")?.value ?? "";
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return {
    y: get("year"),
    m: get("month"),
    d: get("day"),
    dow: map[wk.slice(0, 3)] ?? 0,
    h: get("hour"),
    minu: get("minute"),
    s: get("second"),
  };
}

/** Ersten UTC-Zeitpunkt suchen (15-Min-Schritte), bei dem die Berlin-Uhrzeit y-mo-d h:m:s liegt. */
function instantBerlinClock(
  y: number,
  mo: number,
  d: number,
  h: number,
  minu: number,
  s: number
): Date {
  const anchor = Date.UTC(y, mo - 1, d, 18, 0, 0, 0);
  const stepMs = 15 * 60 * 1000;
  let bestDelta = Infinity;
  let bestT = anchor;
  const windowMs = 4 * 24 * 60 * 60 * 1000;
  const start = anchor - windowMs;
  const end = anchor + windowMs;
  for (let t = start; t <= end; t += stepMs) {
    const p = berlinNumericParts(t);
    if (p.y !== y || p.m !== mo || p.d !== d) continue;
    const delta =
      Math.abs(p.h - h) * 3600 + Math.abs(p.minu - minu) * 60 + Math.abs(p.s - s);
    if (delta < bestDelta) {
      bestDelta = delta;
      bestT = t;
      if (delta === 0) break;
    }
  }
  return new Date(bestT);
}

function addDaysGregorianCalendar(
  y: number,
  m: number,
  d: number,
  deltaDays: number
): { y: number; m: number; d: number } {
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + deltaDays);
  return {
    y: dt.getUTCFullYear(),
    m: dt.getUTCMonth() + 1,
    d: dt.getUTCDate(),
  };
}

function daysInMonth(y: number, mo: number): number {
  return new Date(Date.UTC(y, mo, 0)).getUTCDate();
}

export type ZeitenRangePreset =
  | "week"
  | "last-week"
  | "month"
  | "last-month"
  | "custom";

/** „Heute“ in Berlin als YYYY-MM-DD. */
export function formatBerlinYmdUtc(nowMs = Date.now()): string {
  const p = berlinNumericParts(nowMs);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${p.y}-${pad(p.m)}-${pad(p.d)}`;
}

export function isoRangeInclusiveBerlinYmd(fromYmd: string, toYmd: string) {
  if (!DATE_RE.test(fromYmd) || !DATE_RE.test(toYmd)) {
    return null;
  }
  let [a, b] = [fromYmd, toYmd];
  if (a > b) [a, b] = [b, a];

  const [yf, mf, df] = a.split("-").map(Number);
  const [yt, mt, dt] = b.split("-").map(Number);

  const fromIso = instantBerlinClock(yf, mf, df, 0, 0, 0).toISOString();
  const lastSec = instantBerlinClock(yt, mt, dt, 23, 59, 59);
  const toIso = new Date(lastSec.getTime() + 999).toISOString();
  return { from: fromIso, to: toIso };
}

export function getPresetIsoRange(range: Exclude<ZeitenRangePreset, "custom">): {
  from: string;
  to: string;
} {
  const t = berlinNumericParts(Date.now());
  /** Tage zurück bis Montag derselben Berlin-Woche (Mo=Start). */
  const mondayDelta = (t.dow + 6) % 7;
  const thisWeekMonday = addDaysGregorianCalendar(t.y, t.m, t.d, -mondayDelta);

  if (range === "week") {
    const fromIso = instantBerlinClock(
      thisWeekMonday.y,
      thisWeekMonday.m,
      thisWeekMonday.d,
      0,
      0,
      0
    ).toISOString();
    const lastSec = instantBerlinClock(t.y, t.m, t.d, 23, 59, 59);
    const toIso = new Date(lastSec.getTime() + 999).toISOString();
    return { from: fromIso, to: toIso };
  }

  if (range === "last-week") {
    const lwMon = addDaysGregorianCalendar(
      thisWeekMonday.y,
      thisWeekMonday.m,
      thisWeekMonday.d,
      -7
    );
    const lwSun = addDaysGregorianCalendar(lwMon.y, lwMon.m, lwMon.d, 6);

    const fromIso = instantBerlinClock(lwMon.y, lwMon.m, lwMon.d, 0, 0, 0).toISOString();
    const lastSec = instantBerlinClock(lwSun.y, lwSun.m, lwSun.d, 23, 59, 59);
    const toIso = new Date(lastSec.getTime() + 999).toISOString();
    return { from: fromIso, to: toIso };
  }

  if (range === "month") {
    const fromIso = instantBerlinClock(t.y, t.m, 1, 0, 0, 0).toISOString();
    const lastSec = instantBerlinClock(t.y, t.m, t.d, 23, 59, 59);
    const toIso = new Date(lastSec.getTime() + 999).toISOString();
    return { from: fromIso, to: toIso };
  }

  /* last-month: erster bis letzter Tag des Vor-Kalender-Monats in Berlin-Wand-Kalender */
  const prevTail = addDaysGregorianCalendar(t.y, t.m, 1, -1);
  const py = prevTail.y;
  const pm = prevTail.m;
  const dim = daysInMonth(py, pm);

  const fromIso = instantBerlinClock(py, pm, 1, 0, 0, 0).toISOString();
  const lastSec = instantBerlinClock(py, pm, dim, 23, 59, 59);
  const toIso = new Date(lastSec.getTime() + 999).toISOString();
  return { from: fromIso, to: toIso };
}

export function isValidZeitenRangePreset(
  value: string
): value is Exclude<ZeitenRangePreset, "custom"> {
  return (
    value === "week" ||
    value === "last-week" ||
    value === "month" ||
    value === "last-month"
  );
}

export { DATE_RE as ZEITEN_DATE_PARAM_RE };
