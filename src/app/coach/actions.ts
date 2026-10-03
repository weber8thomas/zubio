"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { COMMUNES } from "@/config/area";
import { requireProvider } from "@/lib/data/coach";
import { availabilitySchema, providerProfileSchema, uuidSchema } from "@/lib/validation";
import { sport } from "@/verticals/sport";

/** Accepter une offre : transaction côté base (accept_offer), identité imposée par la session. */
export async function acceptOffer(formData: FormData) {
  const { supabase } = await requireProvider();
  const offerId = uuidSchema.parse(formData.get("offerId"));
  const { data } = await supabase.rpc("accept_offer", { p_offer: offerId });
  revalidatePath("/coach", "layout");
  redirect(data === "accepted" ? "/coach/missions?confirme=1" : "/coach?pris=1");
}

export async function declineOffer(formData: FormData) {
  const { supabase } = await requireProvider();
  const offerId = uuidSchema.parse(formData.get("offerId"));
  await supabase.rpc("decline_offer", { p_offer: offerId });
  revalidatePath("/coach");
}

export type FormState = { error?: string; ok?: boolean };

export async function addAvailability(_: FormState, formData: FormData): Promise<FormState> {
  const { supabase, provider } = await requireProvider();
  const parsed = availabilitySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { error } = await supabase.from("availabilities").insert({
    provider_id: provider.id,
    weekday: parsed.data.weekday,
    start_time: parsed.data.start,
    end_time: parsed.data.end,
  });
  if (error) return { error: "Enregistrement impossible" };
  revalidatePath("/coach/disponibilites");
  return { ok: true };
}

export async function removeAvailability(formData: FormData) {
  const { supabase, provider } = await requireProvider();
  const id = uuidSchema.parse(formData.get("id"));
  await supabase.from("availabilities").delete().eq("id", id).eq("provider_id", provider.id);
  revalidatePath("/coach/disponibilites");
}

export async function updateProfile(_: FormState, formData: FormData): Promise<FormState> {
  const { supabase, provider } = await requireProvider();
  const parsed = providerProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const commune = COMMUNES.find((c) => c.name === parsed.data.commune);
  if (!commune) return { error: "Commune non couverte" };
  const { error } = await supabase
    .from("providers")
    .update({
      bio: parsed.data.bio,
      commune: commune.name,
      lat: commune.lat,
      lng: commune.lng,
      radius_km: parsed.data.radiusKm,
      min_hourly_rate_cents: Math.round(parsed.data.minRate * 100),
    })
    .eq("id", provider.id);
  if (error) return { error: "Enregistrement impossible" };
  revalidatePath("/coach/profil");
  return { ok: true };
}

/** Déclarer un diplôme : il reste « en attente » jusqu'à validation par l'admin (imposé par la RLS). */
export async function declareCredential(formData: FormData) {
  const { supabase, provider } = await requireProvider();
  const kind = String(formData.get("kind"));
  if (!sport.credentials.some((c) => c.id === kind)) return;
  await supabase.from("credentials").insert({ provider_id: provider.id, kind, status: "pending" });
  revalidatePath("/coach/profil");
}
