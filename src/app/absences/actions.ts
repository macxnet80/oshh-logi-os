"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addAbsence(formData: {
  profile_id: string;
  type: string;
  start_date: string;
  end_date: string;
  note: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id || formData.profile_id !== user.id) {
    return {
      error:
        "Du kannst nur Abwesenheiten für dein eigenes Profil eintragen.",
    };
  }

  const { error } = await supabase.from("absences").insert({
    profile_id: formData.profile_id,
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return { error: "Nicht berechtigt." };
  }

  const { data: row } = await supabase
    .from("absences")
    .select("profile_id")
    .eq("id", id)
    .maybeSingle();

  if (!row || row.profile_id !== user.id) {
    return { error: "Du kannst nur eigene Einträge löschen." };
  }

  const { error } = await supabase.from("absences").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/absences");
  return { success: true };
}
