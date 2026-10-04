import { classById } from "@/data/classes";
import type { CertStatus, Coach, Slot, Venue } from "@/data/types";
import { endOf, toMin, weekday } from "./date";
import { distanceKm, km } from "./geo";

export type Issue = "Certification" | "Distance" | "Disponibilité" | "Tarif";
export type Fit = { ok: boolean; km: number; issues: Issue[]; reason: string };

/** Statut d'une certification, en tenant compte des décisions de l'admin pendant la démo. */
export type CertOverrides = Record<string, CertStatus>;
export const certStatus = (coach: Coach, cert: string, overrides: CertOverrides) =>
  overrides[`${coach.id}:${cert}`] ?? coach.certs.find((c) => c.id === cert)?.status;

/**
 * Un coach convient à un créneau s'il a une certification exigée et vérifiée,
 * si la salle est dans sa zone d'intervention, s'il est disponible sur toute
 * la séance, et si le tarif atteint son minimum horaire.
 */
export function fit(coach: Coach, slot: Slot, venue: Venue, overrides: CertOverrides = {}): Fit {
  const d = distanceKm(venue, coach);
  const issues: Issue[] = [];
  const requires = classById(slot.classId).requires;
  if (!requires.some((c) => certStatus(coach, c, overrides) === "verified")) issues.push("Certification");
  if (d > coach.radiusKm) issues.push("Distance");
  const day = weekday(slot.date);
  const [s, e] = [toMin(slot.start), toMin(endOf(slot.start, slot.duration))];
  if (!coach.availability.some((a) => a.days.includes(day) && toMin(a.from) <= s && toMin(a.to) >= e)) issues.push("Disponibilité");
  if (slot.price / (slot.duration / 60) < coach.minHourly) issues.push("Tarif");
  const reason = issues.length ? issues.join(" · ") : ["Certifié ✓", km(d), "disponible"].join(" · ");
  return { ok: issues.length === 0, km: d, issues, reason };
}
