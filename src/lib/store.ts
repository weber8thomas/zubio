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
  /** Créneau que la salle est en train de pourvoir (rappel pendant qu'elle parcourt les coachs). */
  focus?: string;
  /** Instruction des justificatifs : points contrôlés, journal, compléments demandés (clé « coach:certif »). */
  review?: Record<string, CertReview>;
};

export type CertReview = { checks: string[]; log: { at: number; text: string }[]; request?: string };
const noReview: CertReview = { checks: [], log: [] };
export const reviewOf = (s: State, key: string) => s.review?.[key] ?? noReview;

const KEY = "zubio-demo-v6";
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

  /** La salle confirme un candidat : le créneau est pourvu, les autres candidatures sont closes. */
  confirm(applicationId: string) {
    const app = state.applications.find((a) => a.id === applicationId)!;
    set({
      slots: state.slots.map((s) => (s.id === app.slotId ? { ...s, status: "filled", coachId: app.coachId, filledAt: Date.now() } : s)),
      applications: state.applications.map((a) =>
        a.slotId !== app.slotId ? a : a.id === applicationId ? { ...a, status: "selected" } : a.status === "pending" ? { ...a, status: "rejected" } : a,
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

  setFocus(slotId?: string) {
    if (state.focus !== slotId) set({ focus: slotId });
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

  /** Coche ou décoche un point de contrôle, en le consignant au journal. */
  check(key: string, item: string, label: string, done: boolean) {
    const r = reviewOf(state, key);
    const checks = done ? [...new Set([...r.checks, item])] : r.checks.filter((c) => c !== item);
    set({ review: { ...state.review, [key]: { ...r, checks, log: [...r.log, { at: Date.now(), text: `${done ? "Contrôlé" : "Annulé"} : ${label}` }] } } });
  },

  /** Demande un complément au coach : le dossier reste en attente. */
  requestInfo(key: string, message: string) {
    const r = reviewOf(state, key);
    set({ review: { ...state.review, [key]: { ...r, request: message, log: [...r.log, { at: Date.now(), text: `Complément demandé : ${message}` }] } } });
  },

  decideCert(coachId: string, certId: string, status: CertStatus, note?: string) {
    const key = `${coachId}:${certId}`;
    const r = reviewOf(state, key);
    const text = status === "verified" ? "Certification validée" : status === "rejected" ? `Refusée${note ? ` : ${note}` : ""}` : "Dossier rouvert";
    set({ certs: { ...state.certs, [key]: status }, review: { ...state.review, [key]: { ...r, request: undefined, log: [...r.log, { at: Date.now(), text }] } } });
  },

  reset() {
    set(initial());
  },
};

/** Nom du coach, pour les messages. */
export const coachName = (id: string) => coachById(id).name;

export const SLOT_STEPS = ["Publié", "Candidats", "Confirmé", "Réalisé", "Facturé"];

/** Étape courante d'un créneau dans le processus de validation. */
/** Étape courante (les précédentes sont faites) ; une séance facturée a tout franchi. */
export function slotStep(slot: Slot) {
  return slot.status === "done" ? 5 : slot.status === "filled" ? 3 : 1;
}
