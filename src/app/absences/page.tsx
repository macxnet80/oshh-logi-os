import { createClient } from "@/lib/supabase/server";
import AbsencesClient from "@/components/absences/AbsencesClient";
import type { Employee, Absence } from "@/lib/types";

export default async function AbsencesPage() {
  const supabase = await createClient();

  const [{ data: employees }, { data: absences }] = await Promise.all([
    supabase.from("employees").select("*").order("full_name"),
    supabase.from("absences").select("*").order("start_date"),
  ]);

  return (
    <AbsencesClient
      employees={(employees as Employee[]) || []}
      absences={(absences as Absence[]) || []}
    />
  );
}
