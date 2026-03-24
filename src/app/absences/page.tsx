import { createClient } from "@/lib/supabase/server";
import AbsencesClient from "@/components/absences/AbsencesClient";
import type { PlannerMember, Absence } from "@/lib/types";

export default async function AbsencesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: rpcRows, error: rpcError }, { data: allAbsences }] =
    await Promise.all([
      supabase.rpc("get_logi_planner_members"),
      supabase.from("absences").select("*").order("start_date"),
    ]);

  const teamMembers: PlannerMember[] = (rpcRows ?? []).map((row) => ({
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    avatar_url: row.avatar_url,
  }));

  const memberIds = new Set(teamMembers.map((m) => m.id));

  const absences = ((allAbsences as Absence[]) || []).filter((a) =>
    memberIds.has(a.profile_id)
  );

  const currentMember =
    user?.id != null
      ? teamMembers.find((m) => m.id === user.id) ?? null
      : null;

  return (
    <AbsencesClient
      teamMembers={teamMembers}
      absences={absences}
      currentMember={currentMember}
      plannerLoadError={rpcError?.message ?? null}
    />
  );
}
