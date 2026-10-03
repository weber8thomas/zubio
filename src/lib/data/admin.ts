import "server-only";
import { cookies } from "next/headers";
import type { SlotStatus } from "@/core/types";
import { requireRole } from "@/lib/auth";
import { getVertical, VERTICAL_COOKIE } from "@/verticals";

/** Verticale choisie dans l'espace admin (cookie), sport par défaut. */
export async function activeVertical() {
  return getVertical((await cookies()).get(VERTICAL_COOKIE)?.value);
}

/** Session admin + verticale active. Toute page de l'espace admin passe par ici. */
export async function requireAdmin() {
  const session = await requireRole("admin");
  return { ...session, vertical: await activeVertical() };
}

/** Part des créneaux pourvus ou terminés parmi ceux qui n'ont pas été annulés, en %. */
export function fillRate(statuses: SlotStatus[]): number | null {
  const counted = statuses.filter((s) => s !== "cancelled");
  if (!counted.length) return null;
  const filled = counted.filter((s) => s === "filled" || s === "done").length;
  return Math.round((filled / counted.length) * 100);
}
