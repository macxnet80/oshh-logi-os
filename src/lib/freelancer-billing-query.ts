import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

/** Postgres „undefined_column“ */
function isMissingColumnError(
  e: { message?: string; code?: string } | null | undefined
): boolean {
  if (!e) return false;
  if (e.code === "42703") return true;
  const m = (e.message ?? "").toLowerCase();
  if (!m.includes("column") && !m.includes("does not exist")) return false;
  return (
    m.includes("hourly_rate_eur") ||
    m.includes("input_vat_deductible") ||
    m.includes("freelancers.")
  );
}

export type FreelancerBillingFields = {
  hourly_rate_eur: unknown;
  input_vat_deductible: boolean;
};

const DEFAULT_BILLING: FreelancerBillingFields = {
  hourly_rate_eur: 0,
  input_vat_deductible: true,
};

/**
 * Lädt Stundensatz/Vorsteuer pro Freelancer-ID.
 * Wenn die Spalten in der DB noch fehlen (keine Migration), leere Map → Defaults 0 / ja.
 */
export async function loadFreelancerBillingMap(
  supabase: SupabaseClient
): Promise<Map<string, FreelancerBillingFields>> {
  const map = new Map<string, FreelancerBillingFields>();
  const { data, error } = await supabase
    .from("freelancers")
    .select("id, hourly_rate_eur, input_vat_deductible");

  if (error) {
    if (isMissingColumnError(error)) {
      return map;
    }
    return map;
  }

  for (const row of data ?? []) {
    map.set(row.id, {
      hourly_rate_eur: row.hourly_rate_eur,
      input_vat_deductible: row.input_vat_deductible !== false,
    });
  }
  return map;
}

type FreelancerListRow = {
  id: string;
  name: string;
  pin: string;
  is_active: boolean;
  created_at: string;
  hourly_rate_eur?: unknown;
  input_vat_deductible?: boolean;
};

/**
 * Lädt die Freelancer-Liste; bei fehlenden Abrechnungsspalten nur Basisspalten + Defaults.
 */
export async function loadFreelancersForAdmin(supabase: SupabaseClient): Promise<{
  rows: FreelancerListRow[];
  error: { message: string } | null;
}> {
  const full = await supabase
    .from("freelancers")
    .select("id, name, pin, is_active, created_at, hourly_rate_eur, input_vat_deductible")
    .order("name", { ascending: true });

  if (full.error) {
    if (isMissingColumnError(full.error)) {
      const base = await supabase
        .from("freelancers")
        .select("id, name, pin, is_active, created_at")
        .order("name", { ascending: true });
      const rows: FreelancerListRow[] = (base.data ?? []).map((r) => ({
        ...r,
        hourly_rate_eur: DEFAULT_BILLING.hourly_rate_eur,
        input_vat_deductible: DEFAULT_BILLING.input_vat_deductible,
      }));
      return {
        rows,
        error: base.error,
      };
    }
    return {
      rows: [],
      error: full.error,
    };
  }

  return {
    rows: (full.data as FreelancerListRow[]) ?? [],
    error: null,
  };
}

export { isMissingColumnError, DEFAULT_BILLING };
