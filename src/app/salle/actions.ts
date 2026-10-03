"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireVenue } from "@/lib/data/salle";
import { sendOffers } from "@/lib/data/matching";
import { localToIso } from "@/lib/format";
import { publishSlotSchema, uuidSchema } from "@/lib/validation";
import { sport } from "@/verticals/sport";

export type PublishState = { errors?: Record<string, string>; message?: string };

export async function publishSlot(_: PublishState, formData: FormData): Promise<PublishState> {
  const { supabase, venue } = await requireVenue();
  const parsed = publishSlotSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { errors };
  }
  const { skill, date, start, duration, rate, notes } = parsed.data;
  if (!sport.skills.some((s) => s.id === skill)) return { errors: { skill: "Discipline inconnue" } };

  const startsAt = localToIso(date, start);
  if (new Date(startsAt) < new Date()) return { errors: { date: "Ce créneau est déjà passé" } };
  const endsAt = new Date(new Date(startsAt).getTime() + duration * 60_000).toISOString();

  const { data: slot, error } = await supabase
    .from("slots")
    .insert({
      venue_id: venue.id,
      skill,
      starts_at: startsAt,
      ends_at: endsAt,
      rate_cents: Math.round(rate * 100),
      notes,
      search_radius_km: sport.defaults.searchRadiusKm,
    })
    .select("id")
    .single();
  if (error || !slot) return { message: "La publication a échoué. Réessayez." };

  await sendOffers(supabase, slot.id);
  revalidatePath("/salle");
  redirect(`/salle/creneaux/${slot.id}?publie=1`);
}

const RADIUS_STEP_KM = 10;
const RADIUS_MAX_KM = 50;

/** Démo : simule 10 minutes sans réponse en élargissant le rayon de recherche. */
export async function simulateNoAnswer(formData: FormData) {
  const { supabase, venue } = await requireVenue();
  const slotId = uuidSchema.parse(formData.get("slotId"));
  const { data: slot } = await supabase
    .from("slots")
    .select("id, status, search_radius_km")
    .eq("id", slotId)
    .eq("venue_id", venue.id)
    .single();
  if (!slot || slot.status !== "open") redirect(`/salle/creneaux/${slotId}`);

  const radius = Math.min(slot.search_radius_km + RADIUS_STEP_KM, RADIUS_MAX_KM);
  await supabase.from("slots").update({ search_radius_km: radius }).eq("id", slot.id);
  const sent = await sendOffers(supabase, slot.id);
  redirect(`/salle/creneaux/${slot.id}?elargi=${sent}`);
}

export async function toggleFavorite(formData: FormData) {
  const { supabase, venue } = await requireVenue();
  const providerId = uuidSchema.parse(formData.get("providerId"));
  const isFavorite = formData.get("favorite") === "1";
  if (isFavorite) {
    await supabase.from("favorites").delete().eq("venue_id", venue.id).eq("provider_id", providerId);
  } else {
    await supabase.from("favorites").insert({ venue_id: venue.id, provider_id: providerId });
  }
  revalidatePath("/salle/coachs");
}
