import "server-only";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";

/** Session salle + sa structure. Toute page ou action de l'espace salle passe par ici. */
export async function requireVenue() {
  const session = await requireRole("salle");
  const { data: venue } = await session.supabase
    .from("venues")
    .select("id, name, commune, address, phone, lat, lng, vertical")
    .eq("owner_id", session.user.id)
    .order("created_at")
    .limit(1)
    .maybeSingle();
  if (!venue) redirect("/connexion");
  return { ...session, venue };
}
