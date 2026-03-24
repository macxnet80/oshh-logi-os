"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireLogiAdmin } from "@/lib/authz-server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { PROFILE_DISPLAY_NAME_MAX_LENGTH } from "./constants";

export async function updateProfileDisplayName(formData: FormData): Promise<void> {
  await requireLogiAdmin();

  const userId = String(formData.get("user_id") ?? "").trim();
  const fullName = String(formData.get("full_name") ?? "").trim();

  if (!userId) {
    redirect("/admin/users?err=invalid");
  }
  if (!fullName) {
    redirect("/admin/users?err=name_empty");
  }
  if (fullName.length > PROFILE_DISPLAY_NAME_MAX_LENGTH) {
    redirect("/admin/users?err=name_too_long");
  }

  const service = createServiceRoleClient();

  const { data: authData, error: authErr } =
    await service.auth.admin.getUserById(userId);
  if (authErr || !authData.user?.email) {
    redirect(
      `/admin/users?err=${encodeURIComponent(authErr?.message ?? "Nutzer nicht gefunden")}`
    );
  }

  const email = authData.user.email;
  const now = new Date().toISOString();

  const { data: existingProfile } = await service
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (existingProfile) {
    const { error } = await service
      .from("profiles")
      .update({ full_name: fullName, updated_at: now })
      .eq("id", userId);
    if (error) {
      redirect(`/admin/users?err=${encodeURIComponent(error.message)}`);
    }
  } else {
    const { error } = await service.from("profiles").insert({
      id: userId,
      email,
      full_name: fullName,
      role: "user",
      updated_at: now,
    });
    if (error) {
      redirect(`/admin/users?err=${encodeURIComponent(error.message)}`);
    }
  }

  const meta =
    (authData.user.user_metadata as Record<string, unknown> | null) ?? {};
  const { error: metaErr } = await service.auth.admin.updateUserById(userId, {
    user_metadata: { ...meta, full_name: fullName },
  });
  if (metaErr) {
    redirect(`/admin/users?err=${encodeURIComponent(metaErr.message)}`);
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?ok=1");
}

export async function updateLogiUserAccess(formData: FormData): Promise<void> {
  await requireLogiAdmin();

  const userId = String(formData.get("user_id") ?? "").trim();
  const isTeamMember = formData.get("team_logistik") === "true";
  const team = isTeamMember ? "logistik" : "sonstige";

  if (!userId) {
    redirect("/admin/users?err=invalid");
  }

  try {
    const service = createServiceRoleClient();

    const { data: existing } = await service
      .from("logi_user_access")
      .select("is_admin")
      .eq("user_id", userId)
      .maybeSingle();

    const { error } = await service.from("logi_user_access").upsert(
      {
        user_id: userId,
        team,
        is_admin: existing?.is_admin ?? false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      redirect(`/admin/users?err=${encodeURIComponent(error.message)}`);
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unbekannter Fehler";
    redirect(`/admin/users?err=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?ok=1");
}
