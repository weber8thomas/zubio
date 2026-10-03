import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

export type Role = Database["public"]["Enums"]["app_role"];

export const ROLE_HOME: Record<Role, string> = {
  admin: "/admin",
  salle: "/salle",
  coach: "/coach",
};

/** Utilisateur connecté et son rôle, lus côté serveur (jamais transmis par le client). */
export const getSession = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", data.user.id)
    .single();
  if (!profile) return null;
  return { supabase, user: data.user, profile };
});

/**
 * Garde de route et d'action serveur : exige un rôle précis.
 * Redirige vers la page de connexion ou vers l'espace du rôle réel.
 */
export async function requireRole(role: Role) {
  const session = await getSession();
  if (!session) redirect("/connexion");
  if (session.profile.role !== role) redirect(ROLE_HOME[session.profile.role]);
  return session;
}
