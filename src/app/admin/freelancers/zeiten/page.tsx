import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Card from "@/components/ui/Card";
import ZeitenExportButton, {
  type ZeitenExportRow,
} from "./ZeitenExportButton";
import ZeitenFreelancerFilter from "./ZeitenFreelancerFilter";

type PageProps = {
  searchParams: Promise<{
    range?: string;
    freelancer?: string;
  }>;
};

function getRangeBounds(period: string): { from: string; to: string } {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const start = new Date(now);

  if (period === "month") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  } else if (period === "week") {
    const day = start.getDay();
    const offset = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + offset);
    start.setHours(0, 0, 0, 0);
  } else {
    start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);
  }

  return { from: start.toISOString(), to: end.toISOString() };
}

function formatDt(iso: string) {
  try {
    return new Intl.DateTimeFormat("de-DE", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function durationMinutes(checkIn: string, checkOut: string | null): number | null {
  if (!checkOut) return null;
  const a = new Date(checkIn).getTime();
  const b = new Date(checkOut).getTime();
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return null;
  return Math.round((b - a) / 60_000);
}

export default async function AdminFreelancerZeitenPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const range = params.range === "month" || params.range === "30d" ? params.range : "week";
  const freelancerFilter = params.freelancer?.trim() || "";

  const { from, to } = getRangeBounds(range);

  const supabase = await createClient();

  const { data: freelancerList } = await supabase
    .from("freelancers")
    .select("id, name")
    .order("name", { ascending: true });

  let query = supabase
    .from("freelancer_checkins")
    .select(
      `
      id,
      check_in,
      check_out,
      freelancer_id,
      freelancers (
        name
      )
    `
    )
    .gte("check_in", from)
    .lte("check_in", to)
    .order("check_in", { ascending: false });

  if (freelancerFilter) {
    query = query.eq("freelancer_id", freelancerFilter);
  }

  const { data: rows, error } = await query;

  type Row = {
    id: string;
    check_in: string;
    check_out: string | null;
    freelancer_id: string;
    freelancers: { name: string } | { name: string }[] | null;
  };

  const exportRows: ZeitenExportRow[] = (rows as Row[] | null)?.map((r) => {
    const name = Array.isArray(r.freelancers)
      ? r.freelancers[0]?.name ?? "—"
      : r.freelancers?.name ?? "—";
    const d = durationMinutes(r.check_in, r.check_out);
    return {
      name,
      checkIn: formatDt(r.check_in),
      checkOut: r.check_out ? formatDt(r.check_out) : "—",
      durationMin: d,
    };
  }) ?? [];

  const base = "/admin/freelancers/zeiten";
  const link = (r: string, f?: string) => {
    const u = new URLSearchParams();
    u.set("range", r);
    if (f) u.set("freelancer", f);
    const q = u.toString();
    return q ? `${base}?${q}` : base;
  };

  const rangeLabel =
    range === "month"
      ? "dieser Monat"
      : range === "30d"
        ? "letzte 30 Tage"
        : "diese Woche";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-orendt-black">
          Freelancer-Zeiten
        </h1>
        <p className="font-body text-sm text-gray-600 mt-1">
          Zeitraum: {rangeLabel} ({formatDt(from)} – {formatDt(to)})
        </p>
      </div>

      {error ? (
        <p className="font-body text-sm text-status-occupied">
          Daten konnten nicht geladen werden: {error.message}
        </p>
      ) : null}

      <Card className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4 flex-wrap">
          <div>
            <p className="font-body text-xs font-medium text-gray-600 mb-2">
              Zeitraum
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={link("week", freelancerFilter || undefined)}
                className={`px-3 py-1.5 rounded-lg font-body text-sm font-medium border ${
                  range === "week"
                    ? "bg-orendt-black text-white border-orendt-black"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Diese Woche
              </Link>
              <Link
                href={link("month", freelancerFilter || undefined)}
                className={`px-3 py-1.5 rounded-lg font-body text-sm font-medium border ${
                  range === "month"
                    ? "bg-orendt-black text-white border-orendt-black"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Dieser Monat
              </Link>
              <Link
                href={link("30d", freelancerFilter || undefined)}
                className={`px-3 py-1.5 rounded-lg font-body text-sm font-medium border ${
                  range === "30d"
                    ? "bg-orendt-black text-white border-orendt-black"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Letzte 30 Tage
              </Link>
            </div>
          </div>

          <ZeitenFreelancerFilter
            options={freelancerList ?? []}
            range={range}
            selectedId={freelancerFilter}
          />

          <ZeitenExportButton rows={exportRows} />
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] font-body text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600">
                <th className="py-2 pr-4 font-semibold">Name</th>
                <th className="py-2 pr-4 font-semibold">Check-in</th>
                <th className="py-2 pr-4 font-semibold">Check-out</th>
                <th className="py-2 pr-4 font-semibold">Dauer (Min.)</th>
              </tr>
            </thead>
            <tbody>
              {(rows as Row[] | null)?.length ? (
                (rows as Row[]).map((r) => {
                  const name = Array.isArray(r.freelancers)
                    ? r.freelancers[0]?.name ?? "—"
                    : r.freelancers?.name ?? "—";
                  const d = durationMinutes(r.check_in, r.check_out);
                  return (
                    <tr key={r.id} className="border-b border-gray-100">
                      <td className="py-3 pr-4 font-medium text-orendt-black">
                        {name}
                      </td>
                      <td className="py-3 pr-4">{formatDt(r.check_in)}</td>
                      <td className="py-3 pr-4">
                        {r.check_out ? formatDt(r.check_out) : (
                          <span className="text-status-reserved">Offen</span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        {d === null ? "—" : String(d)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-gray-500">
                    Keine Einträge im gewählten Zeitraum.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
