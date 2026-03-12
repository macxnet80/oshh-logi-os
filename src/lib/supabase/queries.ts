import { createClient } from "@/lib/supabase/server";

export async function getEmployees() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .order("full_name");

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
