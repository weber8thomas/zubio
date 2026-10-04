import { addDays, today } from "@/lib/date";
import type { Application, Invite, Slot } from "./types";

// Situation de départ de la démo, recalculée à partir de la date du jour.

/** Salle connectée dans la démo. */
export const MY_VENUE_ID = "baiona-training";

type SeedSlot = Partial<Slot> & Pick<Slot, "id" | "venueId" | "classId" | "start" | "duration" | "price"> & { in: number };

const SLOTS: SeedSlot[] = [
  { id: "s1", venueId: MY_VENUE_ID, classId: "rpm", in: 2, start: "19:00", duration: 45, price: 36, capacity: 25, urgent: true },
  { id: "s2", venueId: MY_VENUE_ID, classId: "pilates", in: 5, start: "12:15", duration: 45, price: 36, capacity: 12, level: "debutant" },
  { id: "s3", venueId: MY_VENUE_ID, classId: "crosstraining", in: 1, start: "07:00", duration: 60, price: 40, status: "filled", coachId: "julen" },
  { id: "s4", venueId: MY_VENUE_ID, classId: "pilates", in: 4, start: "18:30", duration: 60, price: 40, status: "filled", coachId: "maialen" },
  { id: "s5", venueId: MY_VENUE_ID, classId: "caf", in: -3, start: "18:00", duration: 45, price: 34, status: "done", coachId: "garazi" },
  { id: "s6", venueId: "oceania-bayonne", classId: "bodypump", in: 3, start: "12:30", duration: 55, price: 42, capacity: 30 },
  { id: "s7", venueId: "oceania-bayonne", classId: "aquabike", in: 2, start: "10:00", duration: 45, price: 34, capacity: 14 },
  { id: "s8", venueId: "clark-powell-bayonne", classId: "pilates", in: 6, start: "18:30", duration: 60, price: 40, capacity: 15 },
  { id: "s9", venueId: "club-abdo-bayonne", classId: "caf", in: 1, start: "18:30", duration: 45, price: 34, instant: true },
  { id: "s10", venueId: "lagon-fitness-anglet", classId: "aquagym", in: 4, start: "11:00", duration: 45, price: 32, kind: "regulier", weeks: 8 },
  { id: "s11", venueId: "maison-sportive-biarritz", classId: "reformer", in: 9, start: "19:15", duration: 50, price: 48, kind: "evenement", notes: "Masterclass de lancement du studio Reformer, 12 machines." },
  { id: "s12", venueId: "bestraining-biarritz", classId: "bodycombat", in: 3, start: "19:30", duration: 55, price: 42, instant: true },
  { id: "s13", venueId: "orange-bleue-biarritz", classId: "dance", in: 5, start: "20:00", duration: 60, price: 36 },
  { id: "s14", venueId: "keepcool-anglet", classId: "hiit", in: 2, start: "07:15", duration: 45, price: 34 },
  { id: "s15", venueId: "gochoa-anglet", classId: "bodypump", in: 7, start: "18:00", duration: 55, price: 40, status: "filled", coachId: "maialen" },
  { id: "s16", venueId: "clark-powell-bayonne", classId: "pilates", in: -6, start: "12:30", duration: 60, price: 40, status: "done", coachId: "maialen" },
  { id: "s17", venueId: "snb-fitness", classId: "stretching", in: -2, start: "19:00", duration: 45, price: 30, status: "done", coachId: "maialen" },
  { id: "s18", venueId: MY_VENUE_ID, classId: "bodypump", in: -1, start: "18:30", duration: 55, price: 42, capacity: 30, status: "filled", coachId: "antton" },
];

export function initialSlots(): Slot[] {
  const t = today();
  const now = Date.now();
  return SLOTS.map(({ in: offset, ...s }, i) => ({
    capacity: 20,
    level: "tous",
    audience: "Adultes",
    language: "Français",
    kind: "remplacement",
    urgent: false,
    equipment: true,
    weeks: 1,
    instant: false,
    notes: "",
    status: "open",
    ...s,
    date: addDays(t, offset),
    publishedAt: now - (i + 1) * 3_600_000,
    filledAt: s.coachId ? now - (i + 1) * 3_600_000 + (5 + i * 3) * 60_000 : undefined,
  }));
}

export const INITIAL_APPLICATIONS: Application[] = [
  { id: "a1", slotId: "s1", coachId: "antton", message: "Je connais bien votre studio vélo, je peux venir 15 min avant pour régler les machines.", status: "pending", at: Date.now() - 50 * 60_000 },
  { id: "a2", slotId: "s1", coachId: "hugo", message: "Disponible, la nouvelle chorégraphie RPM est prête.", status: "pending", at: Date.now() - 35 * 60_000 },
  { id: "a3", slotId: "s6", coachId: "maialen", message: "", status: "pending", at: Date.now() - 20 * 60_000 },
];

/** Invitations envoyées par des salles à des coachs. */
export const INITIAL_INVITES: Invite[] = [{ slotId: "s8", coachId: "maialen" }];
