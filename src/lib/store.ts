import { useSyncExternalStore } from "react";
import { COACHES, coachById, ME } from "@/data/coaches";
import { INITIAL_APPLICATIONS, INITIAL_INVITES, initialSlots, MY_VENUE_ID } from "@/data/seed";
import type { Application, CertStatus, Coach, Invite, Slot } from "@/data/types";
import { VENUES } from "@/data/venues";
import type { InvoiceStatus } from "./invoicing";
import { type CertOverrides, fit } from "./matching";

// État de la démo, gardé dans le navigateur (localStorage). Aucun serveur.
export type State = {
  slots: Slot[];
  applications: Application[];
  invites: Invite[];
  certs: CertOverrides;
  invoices?: Record<string, InvoiceStatus>;
  /** Zone d'intervention modifiée par un coach pendant la démo. */
  radius?: Record<string, number>;
};

const KEY = "zubio-demo-v5";
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

/** Coach avec sa zone d'intervention à jour. */
export const live = (s: State, c: Coach): Coach => ({ ...c, radiusKm: s.radius?.[c.id] ?? c.radiusKm });

/** Coachs compatibles avec un créneau (notifiés) : la salle est dans leur zone, ils sont certifiés et disponibles. */
export const matchesFor = (s: State, slot: Slot) =>
  COACHES.map((c) => ({ coach: c, fit: fit(live(s, c), slot, venueById(slot.venueId), s.certs) }))
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

  setCoachRadius(coachId: string, km: number) {
    set({ radius: { ...state.radius, [coachId]: km } });
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

  /** La salle retient un candidat : il doit confirmer sa venue. */
  offer(applicationId: string) {
    set({ applications: state.applications.map((a) => (a.id === applicationId ? { ...a, status: "offered" } : a)) });
  },

  /** Le coach confirme : créneau confirmé des deux côtés, les autres candidatures sont closes. */
  confirm(applicationId: string) {
    const app = state.applications.find((a) => a.id === applicationId)!;
    set({
      slots: state.slots.map((s) => (s.id === app.slotId ? { ...s, status: "filled", coachId: app.coachId, filledAt: Date.now() } : s)),
      applications: state.applications.map((a) =>
        a.slotId !== app.slotId ? a : a.id === applicationId ? { ...a, status: "selected" } : a.status === "pending" ? { ...a, status: "rejected" } : a,
      ),
    });
  },

  /** Le coach décline : la salle peut retenir un autre candidat. */
  decline(applicationId: string) {
    set({ applications: state.applications.map((a) => (a.id === applicationId ? { ...a, status: "declined" } : a)) });
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

  /** La salle valide que la séance a eu lieu (ou signale un problème) : les factures sont émises. */
  complete(slotId: string, issue?: string) {
    set({ slots: state.slots.map((s) => (s.id === slotId ? { ...s, status: "done", issue } : s)) });
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

export const SLOT_STEPS = ["Publié", "Candidats", "Retenu", "Confirmé", "Réalisé", "Facturé"];

/** Étape courante d'un créneau dans le processus de validation. */
export function slotStep(s: State, slot: Slot) {
  if (slot.status === "done") return 5;
  if (slot.status === "filled") return 4;
  const apps = s.applications.filter((a) => a.slotId === slot.id);
  if (apps.some((a) => a.status === "offered")) return 2;
  return apps.some((a) => a.status === "pending") ? 1 : 0;
}
