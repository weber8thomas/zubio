import "server-only";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";

/** Session coach + sa fiche prestataire. Toute page ou action de l'espace coach passe par ici. */
export async function requireProvider() {
  const session = await requireRole("coach");
  const { data: provider } = await session.supabase
    .from("providers")
    .select("id, display_name, bio, commune, radius_km, min_hourly_rate_cents, rating, missions_count, vertical")
    .eq("user_id", session.user.id)
    .maybeSingle();
  if (!provider) redirect("/connexion");
  return { ...session, provider };
}
