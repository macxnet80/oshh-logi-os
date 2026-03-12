"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
export async function addAbsence(formData: {
  employee_id: string;
  type: string;
  start_date: string;
  end_date: string;
  note: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from("absences").insert({
    employee_id: formData.employee_id,
    type: formData.type,
    start_date: formData.start_date,
    end_date: formData.end_date,
    note: formData.note || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/absences");
  return { success: true };
}

export async function removeAbsence(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("absences").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/absences");
  return { success: true };
}
