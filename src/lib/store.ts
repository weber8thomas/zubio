import { useSyncExternalStore } from "react";
import { COACHES, INITIAL_OFFERS, INITIAL_SLOTS, MY_VENUE, type Offer, type Slot, venueById } from "@/data/demo";
import { match } from "./matching";

// État de la démo, gardé dans le navigateur (localStorage). Aucun serveur.
type State = { slots: Slot[]; offers: Offer[]; verified: string[] };

const KEY = "zubio-demo-v1";
const initial = (): State => ({ slots: INITIAL_SLOTS, offers: INITIAL_OFFERS, verified: [] });

let state: State = (() => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "") as State;
  } catch {
    return initial();
  }
})();
const listeners = new Set<() => void>();

function set(next: State) {
  state = next;
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

/** Coachs avec les diplômes validés par l'admin pendant la démo. */
export const coachesNow = (s: State = state) =>
  COACHES.map((c) => (s.verified.includes(c.id) ? { ...c, diploma: { ...c.diploma, verified: true } } : c));

const uid = () => Math.random().toString(36).slice(2, 9);

/** Offres pour les meilleurs coachs compatibles pas encore sollicités (5 max). */
function sendOffers(slot: Slot, s: State) {
  const asked = new Set(s.offers.filter((o) => o.slotId === slot.id).map((o) => o.coachId));
  return match(slot, venueById(slot.venueId), coachesNow(s))
    .matches.filter((m) => !asked.has(m.coach.id))
    .slice(0, 5)
    .map((m): Offer => ({ id: uid(), slotId: slot.id, coachId: m.coach.id, reason: m.reason, status: "pending" }));
}

export const actions = {
  publish(input: Pick<Slot, "skill" | "day" | "start" | "end" | "price">) {
    const slot: Slot = { ...input, id: uid(), venueId: MY_VENUE.id, radiusKm: 6, status: "open" };
    const offers = sendOffers(slot, state);
    set({ ...state, slots: [...state.slots, slot], offers: [...state.offers, ...offers] });
    return slot.id;
  },

  /** Démo : 10 minutes sans réponse, le rayon de recherche s'élargit de 6 km. */
  widen(slotId: string) {
    const slot = { ...state.slots.find((s) => s.id === slotId)! };
    slot.radiusKm = Math.min(slot.radiusKm + 6, 24);
    const offers = sendOffers(slot, state);
    set({ ...state, slots: state.slots.map((s) => (s.id === slotId ? slot : s)), offers: [...state.offers, ...offers] });
    return offers.length;
  },

  /** Le premier coach qui accepte est confirmé ; les autres offres expirent. */
  accept(offerId: string) {
    const offer = state.offers.find((o) => o.id === offerId)!;
    const slot = state.slots.find((s) => s.id === offer.slotId)!;
    if (slot.status !== "open") return false;
    set({
      ...state,
      slots: state.slots.map((s) => (s.id === slot.id ? { ...s, status: "filled", coachId: offer.coachId, filledInMin: 3 } : s)),
      offers: state.offers.map((o) =>
        o.slotId !== slot.id ? o : { ...o, status: o.id === offerId ? "accepted" : o.status === "pending" ? "expired" : o.status },
      ),
    });
    return true;
  },

  decline(offerId: string) {
    set({ ...state, offers: state.offers.map((o) => (o.id === offerId ? { ...o, status: "declined" } : o)) });
  },

  verify(coachId: string) {
    set({ ...state, verified: [...state.verified, coachId] });
  },

  reset() {
    set(initial());
  },
};
