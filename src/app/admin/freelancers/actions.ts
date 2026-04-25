"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireLogiAdmin } from "@/lib/authz-server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { normalizeFreelancerPin } from "./pin-utils";
import { parseMoneyInput } from "@/app/admin/freelancers/zeiten/money-format";
import { isMissingColumnError } from "@/lib/freelancer-billing-query";

const PATH_FREELANCERS = "/admin/freelancers";
const PATH_ZEITEN = "/admin/freelancers/zeiten";

const FREELANCER_NAME_MAX_LENGTH = 120;

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
  const pinRaw = String(formData.get("pin") ?? "");
  const pin = normalizeFreelancerPin(pinRaw);

  if (!name) {
    redirect(`${PATH_FREELANCERS}?err=name_empty`);
  }
  if (name.length > FREELANCER_NAME_MAX_LENGTH) {
    redirect(`${PATH_FREELANCERS}?err=name_too_long`);
  }
  if (!pin) {
    redirect(`${PATH_FREELANCERS}?err=pin_invalid`);
  }

  const rateRaw = String(formData.get("hourly_rate_eur") ?? "0").trim();
  const rateParsed = rateRaw === "" || rateRaw === "0" ? 0 : parseMoneyInput(rateRaw);
  if (rateParsed === null || rateParsed < 0 || rateParsed > 999_999.99) {
    redirect(`${PATH_FREELANCERS}?err=rate_invalid`);
  }
  const inputVatDeductible = formData.get("input_vat_deductible") === "on";

  const supabase = await createClient();

  const { data: pinTaken } = await supabase
    .from("freelancers")
    .select("id")
    .eq("pin", pin)
    .maybeSingle();

  if (pinTaken) {
    redirect(`${PATH_FREELANCERS}?err=pin_taken`);
  }

  let res = await supabase.from("freelancers").insert({
    name,
    pin,
    is_active: true,
    hourly_rate_eur: rateParsed,
    input_vat_deductible: inputVatDeductible,
  });

  if (res.error && isMissingColumnError(res.error)) {
    res = await supabase.from("freelancers").insert({
      name,
      pin,
      is_active: true,
    });
  }

  if (res.error) {
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

export async function updateFreelancerPin(formData: FormData): Promise<void> {
  await requireLogiAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const pinRaw = String(formData.get("pin") ?? "");
  const pin = normalizeFreelancerPin(pinRaw);

  if (!id) {
    redirect(`${PATH_FREELANCERS}?err=invalid`);
  }
  if (!pin) {
    redirect(`${PATH_FREELANCERS}?err=pin_invalid`);
  }

  const supabase = await createClient();

  const { data: conflict } = await supabase
    .from("freelancers")
    .select("id")
    .eq("pin", pin)
    .maybeSingle();

  if (conflict && conflict.id !== id) {
    redirect(`${PATH_FREELANCERS}?err=pin_taken`);
  }

  const { error } = await supabase.from("freelancers").update({ pin }).eq("id", id);

  if (error) {
    redirect(`${PATH_FREELANCERS}?err=pin_failed`);
  }

  revalidatePath(PATH_FREELANCERS);
  redirect(`${PATH_FREELANCERS}?ok=pin`);
}

export async function updateFreelancerBilling(formData: FormData): Promise<void> {
  await requireLogiAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const rateRaw = String(formData.get("hourly_rate_eur") ?? "").trim();
  if (!id) {
    redirect(`${PATH_FREELANCERS}?err=invalid`);
  }
  const parsed = rateRaw === "" ? 0 : parseMoneyInput(rateRaw);
  if (parsed === null || parsed < 0 || parsed > 999_999.99) {
    redirect(`${PATH_FREELANCERS}?err=rate_invalid`);
  }
  const inputVatDeductible = formData.get("input_vat_deductible") === "on";

  const payload = {
    hourly_rate_eur: parsed,
    input_vat_deductible: inputVatDeductible,
  };

  let updateError: { message: string } | null = null;
  try {
    const service = createServiceRoleClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- RPC in supabase/sql/freelancer_billing_columns.sql, nicht in database.types
    await (service as any)
      .rpc("logi_ensure_freelancer_billing_columns")
      .catch(() => {
        /* Funktion ggf. noch nicht deployed; Update versucht es trotzdem */
      });
    const { error } = await service
      .from("freelancers")
      .update(payload)
      .eq("id", id);
    updateError = error;
  } catch {
    const supabase = await createClient();
    const { error } = await supabase
      .from("freelancers")
      .update(payload)
      .eq("id", id);
    updateError = error;
  }

  if (updateError) {
    redirect(`${PATH_FREELANCERS}?err=billing_failed`);
  }

  revalidatePath(PATH_FREELANCERS);
  revalidatePath(PATH_ZEITEN);
  redirect(`${PATH_FREELANCERS}?ok=billing`);
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
