import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { skillLabel } from "@/core/vertical";
import type { Role } from "@/lib/auth";
import type { Database } from "@/lib/database.types";
import { formatSlotWhen } from "@/lib/format";
import { sport } from "@/verticals/sport";

/**
 * Résumé de la situation de l'utilisateur connecté. Les requêtes passent par
 * son propre client (RLS) : l'identité vient de la session, jamais du message.
 */
export async function statusSummary(supabase: SupabaseClient<Database>, role: Role): Promise<string> {
  const now = new Date().toISOString();

  if (role === "salle") {
    const { data } = await supabase
      .from("slots")
      .select("skill, starts_at, ends_at, status, providers(display_name), offers(status)")
      .gte("ends_at", now)
      .in("status", ["open", "filled"])
      .order("starts_at")
      .limit(5);
    if (!data?.length) return "Vous n'avez aucun créneau à venir. Publiez-en un depuis l'onglet « Publier ».";
    return data
      .map((s) => {
        const what = `${skillLabel(sport, s.skill)}, ${formatSlotWhen(s.starts_at, s.ends_at, true)}`;
        if (s.status === "filled") return `• ${what} : pourvu, avec ${s.providers?.display_name}.`;
        const waiting = s.offers.filter((o) => o.status === "pending").length;
        return `• ${what} : en attente, ${waiting} coach${waiting > 1 ? "s" : ""} sollicité${waiting > 1 ? "s" : ""}.`;
      })
      .join("\n");
  }

  if (role === "coach") {
    const [{ data: offers }, { data: missions }] = await Promise.all([
      supabase.from("offers").select("status, slots(starts_at)").eq("status", "pending"),
      supabase
        .from("slots")
        .select("skill, starts_at, ends_at, venues(name)")
        .eq("status", "filled")
        .gte("starts_at", now)
        .order("starts_at")
        .limit(1),
    ]);
    const pending = (offers ?? []).filter((o) => o.slots && o.slots.starts_at > now).length;
    const next = missions?.[0];
    const lines = [
      pending
        ? `• ${pending} offre${pending > 1 ? "s" : ""} en attente de votre réponse (onglet « Offres »).`
        : "• Aucune offre en attente.",
      next
        ? `• Prochaine mission : ${skillLabel(sport, next.skill)} chez ${next.venues?.name}, ${formatSlotWhen(next.starts_at, next.ends_at, true)}.`
        : "• Aucune mission à venir.",
    ];
    return lines.join("\n");
  }

  const [{ count: open }, { count: filled }] = await Promise.all([
    supabase.from("slots").select("id", { count: "exact", head: true }).eq("status", "open").gte("starts_at", now),
    supabase.from("slots").select("id", { count: "exact", head: true }).eq("status", "filled").gte("starts_at", now),
  ]);
  return `• ${open ?? 0} créneau(x) à venir en attente de coach.\n• ${filled ?? 0} créneau(x) à venir déjà pourvus.`;
}
