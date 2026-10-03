"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { uuidSchema } from "@/lib/validation";
import { VERTICAL_COOKIE, verticals } from "@/verticals";

const verticalSchema = z.string().refine((id) => Object.hasOwn(verticals, id), "Verticale inconnue");

/** Change la verticale affichée dans l'espace admin (libellés, métiers, couleur d'accent). */
export async function setVertical(formData: FormData) {
  await requireRole("admin");
  const id = verticalSchema.parse(formData.get("vertical"));
  (await cookies()).set(VERTICAL_COOKIE, id, {
    path: "/admin",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/admin", "layout");
}

/** Valide un diplôme (ou justificatif) déclaré par un prestataire. La RLS réserve cette écriture à l'admin. */
export async function validateCredential(formData: FormData) {
  const { supabase } = await requireRole("admin");
  const credentialId = uuidSchema.parse(formData.get("credentialId"));
  const { error } = await supabase
    .from("credentials")
    .update({ status: "verified", verified_at: new Date().toISOString() })
    .eq("id", credentialId)
    .eq("status", "pending");
  if (error) throw new Error("Validation impossible");
  revalidatePath("/admin", "layout");
}
