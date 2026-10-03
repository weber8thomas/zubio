/**
 * Types génériques de la place de marché : une structure (« venue ») publie
 * des créneaux, des prestataires (« providers ») les reçoivent sous forme d'offres.
 * Aucun vocabulaire métier ici : il vient de la verticale (src/verticals).
 */

export type SlotStatus = "open" | "filled" | "cancelled" | "done";
export type OfferStatus = "pending" | "accepted" | "declined" | "expired";
export type CredentialStatus = "verified" | "pending";

export interface GeoPoint {
  lat: number;
  lng: number;
}

/** Plage hebdomadaire. `weekday` suit la norme ISO : 1 = lundi … 7 = dimanche. */
export interface WeeklyAvailability {
  weekday: number;
  start: string; // « HH:MM »
  end: string; // « HH:MM »
}

export interface ProviderCredential {
  kind: string;
  status: CredentialStatus;
  expiresOn: string | null; // date ISO « AAAA-MM-JJ »
}

export interface TimeRange {
  startsAt: string; // ISO 8601
  endsAt: string; // ISO 8601
}

export interface ProviderCandidate {
  id: string;
  name: string;
  location: GeoPoint;
  radiusKm: number;
  /** Taux horaire minimum accepté, en centimes. */
  minHourlyRateCents: number;
  rating: number;
  skills: string[];
  credentials: ProviderCredential[];
  availabilities: WeeklyAvailability[];
  /** Missions déjà confirmées, pour éviter les doubles réservations. */
  busy: TimeRange[];
}

export interface SlotRequest extends TimeRange {
  skill: string;
  /** Rémunération totale du créneau, en centimes. */
  rateCents: number;
  searchRadiusKm: number;
  location: GeoPoint;
}

export const SLOT_STATUS_LABELS: Record<SlotStatus, string> = {
  open: "En attente",
  filled: "Pourvu",
  cancelled: "Annulé",
  done: "Terminé",
};

export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  pending: "Proposé",
  accepted: "Accepté",
  declined: "Refusé",
  expired: "Expiré",
};
