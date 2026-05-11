import { createHrProviderClient } from "@/lib/hr-sync/provider";
import { normalizeEmail } from "@/lib/hr-sync/utils";
import { createServiceRoleClient } from "@/lib/supabase/service";

type SyncCounts = {
  employees_total: number;
  employees_matched: number;
  employees_unmatched: number;
  absences_total: number;
  absences_approved: number;
  absences_synced: number;
  absences_skipped_no_match: number;
};

type SyncOptions = {
  triggeredBy: "scheduler" | "manual";
  timezone?: string;
};

function mapExternalAbsenceTypeToAppType(input: string): string {
  const normalized = input.trim().toLowerCase();
  if (normalized.includes("sick") || normalized.includes("krank")) return "sick";
  if (normalized.includes("home") || normalized.includes("office")) return "home_office";
  if (normalized.includes("late")) return "coming_late";
  if (normalized.includes("early")) return "leaving_early";
  if (normalized.includes("off")) return "day_off";
  return "vacation";
}

export async function runDailyHrSync({
  triggeredBy,
  timezone = "Europe/Berlin",
}: SyncOptions) {
  const service = createServiceRoleClient();
  const providerClient = createHrProviderClient();
  const now = new Date().toISOString();

  const { data: runRow, error: runErr } = await service
    .from("hr_sync_runs")
    .insert({
      provider: providerClient.provider,
      status: "running",
      triggered_by: triggeredBy,
      timezone,
      started_at: now,
    })
    .select("id")
    .single();

  if (runErr || !runRow) {
    throw new Error(runErr?.message ?? "Sync-Lauf konnte nicht gestartet werden.");
  }

  const counts: SyncCounts = {
    employees_total: 0,
    employees_matched: 0,
    employees_unmatched: 0,
    absences_total: 0,
    absences_approved: 0,
    absences_synced: 0,
    absences_skipped_no_match: 0,
  };

  try {
    await providerClient.healthCheck();

    const { data: lastRun } = await service
      .from("hr_sync_runs")
      .select("finished_at")
      .eq("provider", providerClient.provider)
      .in("status", ["success", "partial"])
      .not("finished_at", "is", null)
      .order("finished_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const windowEnd = new Date().toISOString();
    const fallbackSince = new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString();
    const windowStart = lastRun?.finished_at ?? fallbackSince;

    const [employees, absences, profilesResult] = await Promise.all([
      providerClient.listEmployees(),
      providerClient.listAbsences({ updatedSince: windowStart, updatedUntil: windowEnd }),
      service.from("profiles").select("id, email"),
    ]);

    if (profilesResult.error) throw new Error(profilesResult.error.message);

    const profilesByEmail = new Map<string, { id: string; email: string }>();
    for (const p of profilesResult.data ?? []) {
      profilesByEmail.set(normalizeEmail(p.email), p);
    }

    const externalToProfileId = new Map<string, string>();
    counts.employees_total = employees.length;

    for (const employee of employees) {
      const emailNorm = normalizeEmail(employee.email);
      const profile = profilesByEmail.get(emailNorm);
      const syncStatus = profile ? "matched" : "unmatched";

      if (profile) {
        counts.employees_matched += 1;
        externalToProfileId.set(employee.externalPersonId, profile.id);
      } else {
        counts.employees_unmatched += 1;
      }

      const { error: mapErr } = await service.from("hr_identity_mappings").upsert(
        {
          provider: providerClient.provider,
          external_person_id: employee.externalPersonId,
          email_normalized: emailNorm,
          profile_id: profile?.id ?? null,
          sync_status: syncStatus,
          last_synced_at: now,
          updated_at: now,
        },
        { onConflict: "provider,external_person_id" }
      );
      if (mapErr) throw new Error(mapErr.message);
    }

    counts.absences_total = absences.length;
    const approved = absences.filter((a) => a.status === "approved");
    counts.absences_approved = approved.length;

    for (const absence of approved) {
      const profileId = externalToProfileId.get(absence.externalPersonId);
      if (!profileId) {
        counts.absences_skipped_no_match += 1;
        continue;
      }

      const payload = {
        profile_id: profileId,
        type: mapExternalAbsenceTypeToAppType(absence.type),
        start_date: absence.startDate,
        end_date: absence.endDate,
        note: absence.note ?? null,
        source: providerClient.provider,
        external_absence_id: absence.externalAbsenceId,
        source_event_id: absence.updatedAt ?? null,
        updated_at: now,
      };

      const { data: existing, error: existingErr } = await service
        .from("absences")
        .select("id")
        .eq("source", providerClient.provider)
        .eq("external_absence_id", absence.externalAbsenceId)
        .maybeSingle();

      if (existingErr) throw new Error(existingErr.message);

      if (existing?.id) {
        const { error: updateErr } = await service
          .from("absences")
          .update(payload)
          .eq("id", existing.id);
        if (updateErr) throw new Error(updateErr.message);
      } else {
        const { error: insertErr } = await service.from("absences").insert(payload);
        if (insertErr) throw new Error(insertErr.message);
      }

      counts.absences_synced += 1;
    }

    const status =
      counts.employees_unmatched > 0 || counts.absences_skipped_no_match > 0
        ? "partial"
        : "success";

    await service
      .from("hr_sync_runs")
      .update({
        status,
        counts,
        finished_at: new Date().toISOString(),
        window_start: windowStart,
        window_end: windowEnd,
      })
      .eq("id", runRow.id);

    return { runId: runRow.id, status, counts, provider: providerClient.provider };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler im HR-Sync.";
    await service
      .from("hr_sync_runs")
      .update({
        status: "failed",
        counts,
        error_message: message,
        finished_at: new Date().toISOString(),
      })
      .eq("id", runRow.id);
    throw error;
  }
}
