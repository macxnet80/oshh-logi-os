"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireLogiAdmin } from "@/lib/authz-server";
import { createClient } from "@/lib/supabase/server";

const PATH_FREELANCERS = "/admin/freelancers";
const PATH_ZEITEN = "/admin/freelancers/zeiten";

const FREELANCER_NAME_MAX_LENGTH = 120;

async function generateUniquePin(): Promise<string> {
  const supabase = await createClient();
  for (let attempt = 0; attempt < 64; attempt++) {
    const pin = String(randomInt(0, 10000)).padStart(4, "0");
    const { data } = await supabase
      .from("freelancers")
      .select("id")
      .eq("pin", pin)
      .maybeSingle();
    if (!data) return pin;
  }
  throw new Error("Kein freier PIN verfügbar.");
}

export async function updateFreelancerName(formData: FormData): Promise<void> {
  await requireLogiAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!id) {
    redirect(`${PATH_FREELANCERS}?err=invalid`);
  }
  if (!name) {
    redirect(`${PATH_FREELANCERS}?err=name_empty`);
  }
  if (name.length > FREELANCER_NAME_MAX_LENGTH) {
    redirect(`${PATH_FREELANCERS}?err=name_too_long`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("freelancers").update({ name }).eq("id", id);

  if (error) {
    redirect(`${PATH_FREELANCERS}?err=update_failed`);
  }

  revalidatePath(PATH_FREELANCERS);
  revalidatePath(PATH_ZEITEN);
  redirect(`${PATH_FREELANCERS}?ok=edited`);
}

export async function createFreelancer(formData: FormData): Promise<void> {
  await requireLogiAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    redirect(`${PATH_FREELANCERS}?err=name_empty`);
  }
  if (name.length > FREELANCER_NAME_MAX_LENGTH) {
    redirect(`${PATH_FREELANCERS}?err=name_too_long`);
  }

  const supabase = await createClient();
  const pin = await generateUniquePin();

  const { error } = await supabase.from("freelancers").insert({
    name,
    pin,
    is_active: true,
  });

  if (error) {
    redirect(`${PATH_FREELANCERS}?err=create_failed`);
  }

  revalidatePath(PATH_FREELANCERS);
  revalidatePath(PATH_ZEITEN);
  redirect(`${PATH_FREELANCERS}?ok=created`);
}

export async function toggleFreelancerActive(id: string, nextActive: boolean): Promise<void> {
  await requireLogiAdmin();
  if (!id) {
    redirect(`${PATH_FREELANCERS}?err=invalid`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("freelancers")
    .update({ is_active: nextActive })
    .eq("id", id);

  if (error) {
    redirect(`${PATH_FREELANCERS}?err=update_failed`);
  }

  revalidatePath(PATH_FREELANCERS);
  revalidatePath(PATH_ZEITEN);
  redirect(`${PATH_FREELANCERS}?ok=updated`);
}

export async function regenerateFreelancerPin(id: string): Promise<void> {
  await requireLogiAdmin();
  if (!id) {
    redirect(`${PATH_FREELANCERS}?err=invalid`);
  }

  const supabase = await createClient();
  const pin = await generateUniquePin();

  const { error } = await supabase.from("freelancers").update({ pin }).eq("id", id);

  if (error) {
    redirect(`${PATH_FREELANCERS}?err=pin_failed`);
  }

  revalidatePath(PATH_FREELANCERS);
  redirect(`${PATH_FREELANCERS}?ok=pin`);
}

export async function deleteFreelancer(id: string): Promise<void> {
  await requireLogiAdmin();
  if (!id) {
    redirect(`${PATH_FREELANCERS}?err=invalid`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("freelancers").delete().eq("id", id);

  if (error) {
    redirect(`${PATH_FREELANCERS}?err=delete_failed`);
  }

  revalidatePath(PATH_FREELANCERS);
  revalidatePath(PATH_ZEITEN);
  redirect(`${PATH_FREELANCERS}?ok=deleted`);
}
