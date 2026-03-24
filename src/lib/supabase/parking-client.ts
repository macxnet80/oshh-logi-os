"use client";

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type AvailabilityWithRelations = {
  id: string;
  spot_id: string;
  date: string;
  spot: { id: string; label: string; zone: string | null } | null;
  released_by_user: { id: string; full_name: string } | null;
};

export async function getAppSetting(key: string) {
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", key)
    .single();

  return { data: data?.value ?? null, error };
}

export async function getMyReservations(userId: string, fromDate: string) {
  const { data, error } = await supabase
    .from("reservations")
    .select(
      `
      *,
      spot:parking_spots(id, label, zone)
    `
    )
    .eq("user_id", userId)
    .eq("status", "confirmed")
    .gte("date", fromDate)
    .order("date");

  return { data, error };
}

export async function cancelReservation(reservationId: string) {
  const { data, error } = await supabase
    .from("reservations")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("id", reservationId)
    .select()
    .single();

  return { data, error };
}

export async function reserveSpot(
  spotId: string,
  availabilityId: string,
  userId: string,
  date: string
) {
  const cleanAvailabilityId =
    availabilityId.startsWith("recurring-") ||
    availabilityId.startsWith("permanent-")
      ? null
      : availabilityId;

  const { data, error } = await supabase
    .from("reservations")
    .insert({
      spot_id: spotId,
      availability_id: cleanAvailabilityId,
      user_id: userId,
      date,
    })
    .select()
    .single();

  return { data, error };
}

export async function getAvailableSpotsForDate(date: string) {
  const jsDay = new Date(date).getDay();
  const weekday = jsDay === 0 ? 0 : jsDay;

  const { data, error } = await supabase
    .from("availabilities")
    .select(
      `
      *,
      spot:parking_spots(id, label, zone),
      released_by_user:profiles!released_by(id, full_name)
    `
    )
    .eq("date", date);

  if (error) return { data: null, error };

  let recurringAvail: Array<{
    id: string;
    spot_id: string;
    spot: { id: string; label: string; zone: string | null } | null;
    owner: { id: string; full_name: string } | null;
  }> = [];

  if (weekday >= 1 && weekday <= 5) {
    const { data: recur } = await supabase
      .from("recurring_availabilities")
      .select(
        `
        *,
        spot:parking_spots(id, label, zone),
        owner:profiles!owner_id(id, full_name)
      `
      )
      .eq("weekday", weekday);

    recurringAvail = recur ?? [];
  }

  const { data: permanentSpots } = await supabase
    .from("parking_spots")
    .select("id, label, zone")
    .eq("is_permanently_released", true)
    .eq("is_active", true);

  const permanentSpotIds = (permanentSpots ?? []).map((s) => s.id);
  let permanentAssignments: Array<{
    spot_id: string;
    user: { id: string; full_name: string } | null;
  }> = [];

  if (permanentSpotIds.length > 0) {
    const { data: assigns } = await supabase
      .from("spot_assignments")
      .select("spot_id, user:profiles(id, full_name)")
      .in("spot_id", permanentSpotIds)
      .is("valid_until", null);

    permanentAssignments = assigns ?? [];
  }

  const permanentOwnerMap: Record<
    string,
    Array<{ id: string; full_name: string } | null>
  > = {};
  for (const assignment of permanentAssignments) {
    if (!permanentOwnerMap[assignment.spot_id]) {
      permanentOwnerMap[assignment.spot_id] = [];
    }
    permanentOwnerMap[assignment.spot_id].push(assignment.user);
  }

  const { data: blocks } = await supabase
    .from("spot_blocks")
    .select("spot_id")
    .eq("date", date);
  const blockedSpotIds = new Set((blocks ?? []).map((b) => b.spot_id));

  const { data: reservations } = await supabase
    .from("reservations")
    .select("spot_id")
    .eq("date", date)
    .eq("status", "confirmed");
  const reservedSpotIds = new Set((reservations ?? []).map((r) => r.spot_id));

  const explicitAvail = (data ?? []) as AvailabilityWithRelations[];
  const explicitSpotIds = new Set(explicitAvail.map((a) => a.spot_id));

  const recurringMapped: AvailabilityWithRelations[] = recurringAvail
    .filter((r) => !explicitSpotIds.has(r.spot_id))
    .map((r) => ({
      id: `recurring-${r.id}`,
      spot_id: r.spot_id,
      date,
      spot: r.spot,
      released_by_user: r.owner,
    }));

  const coveredSpotIds = new Set([
    ...explicitSpotIds,
    ...recurringMapped.map((r) => r.spot_id),
  ]);

  const permanentMapped: AvailabilityWithRelations[] = (permanentSpots ?? [])
    .filter((spot) => !coveredSpotIds.has(spot.id) && !blockedSpotIds.has(spot.id))
    .map((spot) => ({
      id: `permanent-${spot.id}`,
      spot_id: spot.id,
      date,
      spot: { id: spot.id, label: spot.label, zone: spot.zone },
      released_by_user: permanentOwnerMap[spot.id]?.[0] ?? null,
    }));

  const allAvail = [...explicitAvail, ...recurringMapped, ...permanentMapped];
  const available = allAvail.filter(
    (a) => !reservedSpotIds.has(a.spot_id) && !blockedSpotIds.has(a.spot_id)
  );

  return { data: available, error: null };
}
