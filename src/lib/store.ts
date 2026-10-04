import { useSyncExternalStore } from "react";
import { COACHES, coachById, ME } from "@/data/coaches";
import { INITIAL_APPLICATIONS, INITIAL_INVITES, initialSlots, MY_VENUE_ID } from "@/data/seed";
import type { Application, CertStatus, Invite, Slot } from "@/data/types";
import { VENUES } from "@/data/venues";
import type { InvoiceStatus } from "./invoicing";
import { type CertOverrides, fit } from "./matching";

// État de la démo, gardé dans le navigateur (localStorage). Aucun serveur.
export type State = { slots: Slot[]; applications: Application[]; invites: Invite[]; certs: CertOverrides; invoices?: Record<string, InvoiceStatus> };

const KEY = "zubio-demo-v3";
const initial = (): State => ({ slots: initialSlots(), applications: INITIAL_APPLICATIONS, invites: INITIAL_INVITES, certs: {} });

let state: State = (() => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "") as State;
  } catch {
    return initial();
  }
})();
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Navigation privée : la démo marche quand même, sans mémoire.
  }
  listeners.forEach((l) => l());
}

export const useStore = () =>
  useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => state,
  );

export const venueById = (id: string) => VENUES.find((v) => v.id === id) ?? VENUES[0];
export const myVenue = () => venueById(MY_VENUE_ID);
export const slotById = (s: State, id: string) => s.slots.find((x) => x.id === id);

/** Coachs compatibles avec un créneau (notifiés), du plus proche au plus loin. */
export const matchesFor = (s: State, slot: Slot) =>
  COACHES.map((c) => ({ coach: c, fit: fit(c, slot, venueById(slot.venueId), s.certs) }))
    .filter((m) => m.fit.ok)
    .sort((a, b) => b.coach.rating - a.coach.rating || a.fit.km - b.fit.km);

const uid = () => Math.random().toString(36).slice(2, 9);

const MESSAGES = [
  "Disponible et motivé·e, je connais bien ce format.",
  "Je donne ce cours chaque semaine dans une autre salle du coin.",
  "Partant·e ! Je peux arriver un peu avant pour préparer la salle.",
];

export const actions = {
  publish(input: Omit<Slot, "id" | "status" | "publishedAt" | "venueId">) {
    const slot: Slot = { ...input, id: uid(), venueId: MY_VENUE_ID, status: "open", publishedAt: Date.now() };
    set({ slots: [...state.slots, slot] });
    return slot.id;
  },

  setRadius(slotId: string, radiusKm: number) {
    set({ slots: state.slots.map((s) => (s.id === slotId ? { ...s, radiusKm } : s)) });
  },

  apply(slotId: string, message: string, coachId = ME.id) {
    set({ applications: [...state.applications, { id: uid(), slotId, coachId, message, status: "pending", at: Date.now() }] });
  },

  /** Réservation instantanée : le coach est confirmé tout de suite. */
  book(slotId: string, coachId = ME.id) {
    const app: Application = { id: uid(), slotId, coachId, message: "", status: "selected", at: Date.now() };
    set({
      slots: state.slots.map((s) => (s.id === slotId ? { ...s, status: "filled", coachId, filledAt: Date.now() } : s)),
      applications: [...state.applications.map((a) => (a.slotId === slotId && a.status === "pending" ? { ...a, status: "rejected" as const } : a)), app],
    });
  },

  withdraw(applicationId: string) {
    set({ applications: state.applications.map((a) => (a.id === applicationId ? { ...a, status: "withdrawn" } : a)) });
  },

  /** La salle choisit un candidat : créneau confirmé, les autres candidatures sont closes. */
  select(applicationId: string) {
    const app = state.applications.find((a) => a.id === applicationId)!;
    set({
      slots: state.slots.map((s) => (s.id === app.slotId ? { ...s, status: "filled", coachId: app.coachId, filledAt: Date.now() } : s)),
      applications: state.applications.map((a) =>
        a.slotId !== app.slotId || a.status !== "pending" ? a : { ...a, status: a.id === applicationId ? "selected" : "rejected" },
      ),
    });
  },

  /** Démo : quelques coachs compatibles postulent. */
  simulateApplications(slotId: string) {
    const slot = slotById(state, slotId)!;
    const already = new Set(state.applications.filter((a) => a.slotId === slotId).map((a) => a.coachId));
    const fresh = matchesFor(state, slot)
      .filter((m) => !already.has(m.coach.id) && m.coach.id !== ME.id)
      .slice(0, 3)
      .map((m, i): Application => ({ id: uid(), slotId, coachId: m.coach.id, message: MESSAGES[i % MESSAGES.length], status: "pending", at: Date.now() + i }));
    set({ applications: [...state.applications, ...fresh] });
    return fresh.length;
  },

  invite(slotId: string, coachId: string) {
    if (!state.invites.some((i) => i.slotId === slotId && i.coachId === coachId)) set({ invites: [...state.invites, { slotId, coachId }] });
  },

  /** Démo : la séance a eu lieu, les factures sont émises. */
  complete(slotId: string) {
    set({ slots: state.slots.map((s) => (s.id === slotId ? { ...s, status: "done" } : s)) });
  },

  setInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
    set({ invoices: { ...state.invoices, [invoiceId]: status } });
  },

  decideCert(coachId: string, certId: string, status: CertStatus) {
    set({ certs: { ...state.certs, [`${coachId}:${certId}`]: status } });
  },

  reset() {
    set(initial());
  },
};

/** Nom du coach, pour les messages. */
export const coachName = (id: string) => coachById(id).name;
