// Modèle de la vitrine. Générique : aucune ville en dur, tout est coordonnées + rayon.

export type Point = { lat: number; lng: number };

export type CategoryId = "lesmills" | "cardio" | "renfo" | "douceur" | "aqua" | "danse";

export type ClassId =
  | "bodypump" | "bodycombat" | "bodyattack" | "bodybalance" | "rpm" | "core" | "shbam" | "grit" | "bodystep" | "shapes"
  | "hiit" | "circuit" | "step" | "cycling" | "cardioboxe" | "crosstraining"
  | "caf" | "totalbody" | "trx" | "smallgroup"
  | "pilates" | "reformer" | "yoga" | "yin" | "stretching"
  | "aquagym" | "aquabike" | "aquatraining"
  | "zumba" | "dance";

export type Venue = Point & { id: string; name: string; address: string; town: string; classes: ClassId[]; pool?: boolean };

export type CertStatus = "verified" | "pending" | "rejected";

export type Coach = Point & {
  id: string;
  name: string;
  town: string;
  bio: string;
  certs: { id: string; status: CertStatus; since: number }[];
  languages: string[];
  rating: number;
  reviews: number;
  missions: number;
  minHourly: number;
  radiusKm: number;
  /** Plages hebdomadaires : jours ISO (1 = lundi) et horaires. */
  availability: { days: number[]; from: string; to: string }[];
};

export type Level = "tous" | "debutant" | "intermediaire" | "avance";
export type Kind = "remplacement" | "regulier" | "evenement";
export type SlotStatus = "open" | "filled" | "done";

export type Slot = {
  id: string;
  venueId: string;
  classId: ClassId;
  date: string; // AAAA-MM-JJ
  start: string; // HH:MM
  duration: number; // minutes
  price: number; // euros
  capacity: number;
  level: Level;
  audience: string;
  language: string;
  kind: Kind;
  urgent: boolean;
  equipment: boolean;
  weeks: number; // 1 = séance unique, sinon nombre de semaines
  /** Réservation instantanée : le premier coach compatible qui réserve est confirmé. */
  instant: boolean;
  notes: string;
  status: SlotStatus;
  coachId?: string;
  publishedAt: number;
  filledAt?: number;
  /** Problème signalé par la salle après la séance. */
  issue?: string;
};

/** pending → offered (retenu par la salle) → selected (confirmé par le coach) ; ou declined / rejected / withdrawn. */
export type ApplicationStatus = "pending" | "selected" | "rejected" | "withdrawn";
export type Application = { id: string; slotId: string; coachId: string; message: string; status: ApplicationStatus; at: number };
export type Invite = { slotId: string; coachId: string };
