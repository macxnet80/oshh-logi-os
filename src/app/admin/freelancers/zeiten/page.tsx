import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Card from "@/components/ui/Card";
import ZeitenExportButton, {
  type ZeitenExportRow,
} from "./ZeitenExportButton";
import ZeitenFreelancerFilter from "./ZeitenFreelancerFilter";
import ZeitenRowActions from "./ZeitenRowActions";
import { durationDecimalHours, formatDurationHhMm } from "./duration-format";
import { formatEur, hourlyRateFromDb } from "./money-format";
import { loadFreelancerBillingMap } from "@/lib/freelancer-billing-query";

type PageProps = {
  searchParams: Promise<{
    range?: string;
    freelancer?: string;
    ok?: string;
    err?: string;
  }>;
};

const errMessages: Record<string, string> = {
  zeiten_invalid: "Ungültige oder unvollständige Zeitangaben.",
  zeiten_range: "Check-out muss nach dem Check-in liegen.",
  zeiten_not_found: "Eintrag wurde nicht gefunden.",
  zeiten_open_conflict:
    "Für diesen Freelancer gibt es bereits eine andere offene Session. Zuerst dort ein Check-out setzen oder Zeiten anpassen.",
  zeiten_update_failed: "Speichern ist fehlgeschlagen.",
  zeiten_delete_failed: "Löschen ist fehlgeschlagen.",
};

const okMessages: Record<string, string> = {
  zeiten_updated: "Zeiten wurden gespeichert.",
  zeiten_deleted: "Eintrag wurde gelöscht.",
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

export default async function AdminFreelancerZeitenPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const range = params.range === "month" || params.range === "30d" ? params.range : "week";
  const freelancerFilter = params.freelancer?.trim() || "";
  const okKey = params.ok;
  const errKey = params.err;

  const { from, to } = getRangeBounds(range);

  const supabase = await createClient();

  const { data: freelancerList } = await supabase
    .from("freelancers")
    .select("id, name")
    .order("name", { ascending: true });

  const billingByFreelancerId = await loadFreelancerBillingMap(supabase);

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

  type FlRel = {
    name: string;
    hourly_rate_eur?: unknown;
    input_vat_deductible?: boolean | null;
  };
  type Row = {
    id: string;
    check_in: string;
    check_out: string | null;
    freelancer_id: string;
    freelancers: FlRel | FlRel[] | null;
  };

  function freelancerFromRow(r: Row): FlRel {
    const raw = r.freelancers;
    const base: FlRel = Array.isArray(raw)
      ? (raw[0] ?? { name: "—" })
      : (raw ?? { name: "—" });
    const b = billingByFreelancerId.get(r.freelancer_id);
    return {
      name: base.name,
      hourly_rate_eur: b?.hourly_rate_eur ?? 0,
      input_vat_deductible: b?.input_vat_deductible !== false,
    };
  }

  const exportRows: ZeitenExportRow[] = [];
  let exportSumNetEur = 0;
  for (const r of (rows as Row[] | null) ?? []) {
    const fl = freelancerFromRow(r);
    const name = fl.name || "—";
    const d = formatDurationHhMm(r.check_in, r.check_out);
    const hours = durationDecimalHours(r.check_in, r.check_out);
    const rate = hourlyRateFromDb(fl.hourly_rate_eur);
    const totalEur = hours !== null ? hours * rate : null;
    if (totalEur !== null) {
      exportSumNetEur += totalEur;
    }
    const vatDeduct = fl.input_vat_deductible !== false;
    exportRows.push({
      name,
      checkIn: formatDt(r.check_in),
      checkOut: r.check_out ? formatDt(r.check_out) : "—",
      durationHhMm: d,
      hourlyRateLabel: `${formatEur(rate)}/h`,
      totalLabel: totalEur !== null ? formatEur(totalEur) : "—",
      vatDeductibleLabel: vatDeduct ? "Ja" : "Nein",
    });
  }

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

  const nextParams = new URLSearchParams();
  nextParams.set("range", range);
  if (freelancerFilter) nextParams.set("freelancer", freelancerFilter);
  const nextUrl = `${base}?${nextParams.toString()}`;

  const selectedFreelancerName =
    freelancerFilter && freelancerList?.length
      ? (freelancerList.find((f) => f.id === freelancerFilter)?.name ?? null)
      : null;

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

      {okKey && okMessages[okKey] ? (
        <div
          className="rounded-xl border border-status-free bg-status-free-bg px-4 py-3 font-body text-sm text-orendt-black"
          role="status"
        >
          {okMessages[okKey]}
        </div>
      ) : null}

      {errKey && errMessages[errKey] ? (
        <div
          className="rounded-xl border border-status-occupied bg-status-occupied-bg px-4 py-3 font-body text-sm text-status-occupied"
          role="alert"
        >
          {errMessages[errKey]}
        </div>
      ) : null}

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

          <ZeitenExportButton
            rows={exportRows}
            meta={{
              periodLabel: rangeLabel,
              rangeText: `${formatDt(from)} – ${formatDt(to)}`,
              freelancerScope: selectedFreelancerName ?? "Alle Freelancer",
              sumNetEurLabel: formatEur(exportSumNetEur),
            }}
          />
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] font-body text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600">
                <th className="py-2 pr-4 font-semibold">Name</th>
                <th className="py-2 pr-4 font-semibold">Check-in</th>
                <th className="py-2 pr-4 font-semibold">Check-out</th>
                <th className="py-2 pr-4 font-semibold">Dauer (hh:MM)</th>
                <th className="py-2 pr-4 font-semibold text-right">€/h (netto)</th>
                <th className="py-2 pr-4 font-semibold text-right">Gesamt</th>
                <th className="py-2 pr-4 font-semibold">Vorsteuer</th>
                <th className="py-2 pl-2 font-semibold text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {(rows as Row[] | null)?.length ? (
                (rows as Row[]).map((r) => {
                  const fl = freelancerFromRow(r);
                  const name = fl.name || "—";
                  const hours = durationDecimalHours(r.check_in, r.check_out);
                  const rate = hourlyRateFromDb(fl.hourly_rate_eur);
                  const totalEur = hours !== null ? hours * rate : null;
                  const vatDeduct = fl.input_vat_deductible !== false;
                  return (
                    <tr key={r.id} className="border-b border-gray-100 align-top">
                      <ZeitenRowActions
                        id={r.id}
                        name={name}
                        checkInIso={r.check_in}
                        checkOutIso={r.check_out}
                        nextUrl={nextUrl}
                        hourlyRateLabel={`${formatEur(rate)}/h`}
                        totalLabel={totalEur !== null ? formatEur(totalEur) : "—"}
                        vatDeductibleLabel={vatDeduct ? "Ja" : "Nein"}
                      />
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-gray-500">
                    Keine Einträge im gewählten Zeitraum.
                  </td>
                </tr>
              )}
            </tbody>
            {(rows as Row[] | null)?.length ? (
              <tfoot>
                <tr className="border-t border-gray-200 bg-gray-50/80 font-medium text-orendt-black">
                  <td colSpan={5} className="py-3 pr-4 text-right font-body text-sm">
                    Summe (netto, abgeschlossene Zeiten)
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums font-semibold">
                    {formatEur(exportSumNetEur)}
                  </td>
                  <td colSpan={2} className="py-3" />
                </tr>
              </tfoot>
            ) : null}
          </table>
        </div>
      </Card>
    </div>
  );
}
