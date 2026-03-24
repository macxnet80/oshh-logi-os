import { createClient } from "@/lib/supabase/server";

/** Profile aller Nutzer mit Logi-App-Zugang (SECURITY DEFINER-RPC). */
export async function getLogiPlannerMembers() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_logi_planner_members");

  if (error) throw error;
  return data;
}

export async function getAbsences(startDate?: string, endDate?: string) {
  const supabase = await createClient();
  let query = supabase.from("absences").select("*").order("start_date");

  if (startDate) {
    query = query.gte("end_date", startDate);
  }
  if (endDate) {
    query = query.lte("start_date", endDate);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
