"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { ROLE_HOME, type Role } from "@/lib/auth";
import { publicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const DEMO_ACCOUNTS: Record<Role, string> = {
  admin: "admin@zubio.demo",
  salle: "salle@zubio.demo",
  coach: "coach@zubio.demo",
};

const demoRole = z.enum(["admin", "salle", "coach"]);

/** Connexion en un clic aux comptes de démo créés par supabase/seed.sql. */
export async function signInAsDemo(formData: FormData) {
  if (!publicEnv.demoMode) redirect("/connexion");
  const role = demoRole.parse(formData.get("role"));
  const password = process.env.DEMO_PASSWORD;
  if (!password) redirect("/demo?erreur=config");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: DEMO_ACCOUNTS[role], password });
  if (error) redirect("/demo?erreur=connexion");
  redirect(ROLE_HOME[role]);
}

export type MagicLinkState = { status: "idle" | "sent" | "error"; message?: string };

const magicLinkSchema = z.object({ email: z.email("Adresse e-mail invalide") });

/** Lien magique pour les comptes réels (aucune création de compte depuis ce formulaire). */
export async function sendMagicLink(_: MagicLinkState, formData: FormData): Promise<MagicLinkState> {
  const parsed = magicLinkSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { shouldCreateUser: false, emailRedirectTo: `${publicEnv.siteUrl}/auth/callback` },
  });
  if (error) {
    return { status: "error", message: "Envoi impossible. Ce compte existe-t-il bien ?" };
  }
  return { status: "sent" };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(publicEnv.demoMode ? "/demo" : "/connexion");
}
