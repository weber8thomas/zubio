import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { brand } from "@/config/brand";
import { matchProviders, type Match, type Rejection } from "@/core/matching";
import type { ProviderCandidate } from "@/core/types";
import { requiredCredentials } from "@/core/vertical";
import type { Database } from "@/lib/database.types";
import { todayIso } from "@/lib/format";
import { getVertical } from "@/verticals";

type Client = SupabaseClient<Database>;

export const MAX_OFFERS_PER_ROUND = 5;

/**
 * Évalue tous les prestataires de la verticale pour un créneau : chargement des
 * candidats (sous la RLS de la salle connectée), puis matching pur (src/core).
 */
export async function evaluateSlot(
  supabase: Client,
  slotId: string,
): Promise<{ matches: Match[]; rejections: Rejection[]; alreadyAsked: number }> {
  const { data: slot, error } = await supabase
    .from("slots")
    .select("id, skill, starts_at, ends_at, rate_cents, search_radius_km, venue_id, venues(lat, lng, vertical)")
    .eq("id", slotId)
    .single();
  if (error || !slot?.venues) throw new Error("Créneau introuvable");
  const vertical = getVertical(slot.venues.vertical);

  const [providers, favorites, offers] = await Promise.all([
    supabase
      .from("providers")
      .select(
        "id, display_name, lat, lng, radius_km, min_hourly_rate_cents, rating, provider_skills(skill), credentials(kind, status, expires_on), availabilities(weekday, start_time, end_time)",
      )
      .eq("vertical", vertical.id),
    supabase.from("favorites").select("provider_id").eq("venue_id", slot.venue_id),
    supabase.from("offers").select("provider_id").eq("slot_id", slot.id),
  ]);

  const rows = providers.data ?? [];
  const { data: busy } = await supabase.rpc("provider_busy_ranges", {
    p_providers: rows.map((p) => p.id),
    p_from: slot.starts_at,
    p_to: slot.ends_at,
  });

  const candidates: ProviderCandidate[] = rows.map((p) => ({
    id: p.id,
    name: p.display_name,
    location: { lat: p.lat, lng: p.lng },
    radiusKm: p.radius_km,
    minHourlyRateCents: p.min_hourly_rate_cents,
    rating: Number(p.rating),
    skills: p.provider_skills.map((s) => s.skill),
    credentials: p.credentials.map((c) => ({ kind: c.kind, status: c.status, expiresOn: c.expires_on })),
    availabilities: p.availabilities.map((a) => ({ weekday: a.weekday, start: a.start_time, end: a.end_time })),
    busy: (busy ?? [])
      .filter((b) => b.provider_id === p.id)
      .map((b) => ({ startsAt: b.starts_at, endsAt: b.ends_at })),
  }));

  const asked = new Set((offers.data ?? []).map((o) => o.provider_id));
  const result = matchProviders(
    {
      skill: slot.skill,
      startsAt: slot.starts_at,
      endsAt: slot.ends_at,
      rateCents: slot.rate_cents,
      searchRadiusKm: slot.search_radius_km,
      location: { lat: slot.venues.lat, lng: slot.venues.lng },
    },
    candidates,
    {
      requiredCredentials: requiredCredentials(vertical, slot.skill),
      credentialLabel: vertical.labels.credential,
      favoriteIds: new Set((favorites.data ?? []).map((f) => f.provider_id)),
      excludedIds: asked,
      timeZone: brand.timeZone,
      today: todayIso(),
    },
  );
  return { ...result, alreadyAsked: asked.size };
}

/** Lance une vague de propositions : les meilleurs prestataires non encore sollicités reçoivent une offre. */
export async function sendOffers(supabase: Client, slotId: string): Promise<number> {
  const { matches } = await evaluateSlot(supabase, slotId);
  const selected = matches.slice(0, MAX_OFFERS_PER_ROUND);
  if (selected.length === 0) return 0;
  const { error } = await supabase.from("offers").insert(
    selected.map((m) => ({
      slot_id: slotId,
      provider_id: m.providerId,
      score: m.score,
      distance_km: m.distanceKm,
      reason: m.reason,
    })),
  );
  if (error) throw new Error("Impossible d'envoyer les propositions");
  return selected.length;
}
