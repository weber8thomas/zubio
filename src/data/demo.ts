// Données fictives de la vitrine (Bayonne · Anglet · Biarritz). Aucune base de données.

export type SkillId = "pilates" | "yoga" | "cross" | "collectifs" | "muscu" | "aquagym";

export const SKILLS: { id: SkillId; label: string }[] = [
  { id: "pilates", label: "Pilates" },
  { id: "yoga", label: "Yoga" },
  { id: "cross", label: "Cross-training" },
  { id: "collectifs", label: "Cours collectifs" },
  { id: "muscu", label: "Musculation" },
  { id: "aquagym", label: "Aquagym" },
];

export const skillLabel = (id: SkillId) => SKILLS.find((s) => s.id === id)!.label;

export type Point = { lat: number; lng: number };

export type Venue = Point & { id: string; name: string; town: string };

export type Coach = Point & {
  id: string;
  name: string;
  town: string;
  skills: SkillId[];
  diploma: { label: string; verified: boolean };
  /** Jours ISO (1 = lundi) et plage horaire habituelle. */
  days: number[];
  hours: [string, string];
  radiusKm: number;
  minHourly: number;
  rating: number;
  missions: number;
};

export const VENUES: Venue[] = [
  { id: "atrium", name: "Atrium Fitness", town: "Bayonne", lat: 43.4905, lng: -1.4786 },
  { id: "ocean", name: "Studio Océan Pilates", town: "Anglet", lat: 43.5025, lng: -1.5345 },
  { id: "phare", name: "Le Phare Training", town: "Biarritz", lat: 43.4908, lng: -1.5551 },
  { id: "hangar", name: "Le Hangar", town: "Bayonne", lat: 43.5021, lng: -1.4655 },
  { id: "milady", name: "Milady Studio", town: "Biarritz", lat: 43.4655, lng: -1.5702 },
];

/** Salle connectée dans la démo. */
export const MY_VENUE = VENUES[0];

const week = [1, 2, 3, 4, 5, 6];

export const COACHES: Coach[] = [
  { id: "maialen", name: "Maialen Etcheverry", town: "Bayonne", lat: 43.5035, lng: -1.4615, skills: ["pilates", "yoga", "collectifs"], diploma: { label: "Certification Pilates Matwork", verified: true }, days: [1, 2, 3, 4, 5, 6, 7], hours: ["07:00", "21:30"], radiusKm: 15, minHourly: 30, rating: 4.8, missions: 42 },
  { id: "garazi", name: "Garazi Ospital", town: "Anglet", lat: 43.4805, lng: -1.5005, skills: ["pilates", "collectifs"], diploma: { label: "CQP ALS", verified: true }, days: week, hours: ["16:30", "21:30"], radiusKm: 12, minHourly: 30, rating: 4.7, missions: 31 },
  { id: "julen", name: "Julen Iriarte", town: "Bayonne", lat: 43.484, lng: -1.48, skills: ["cross", "muscu"], diploma: { label: "BPJEPS AF", verified: true }, days: week, hours: ["16:30", "21:30"], radiusKm: 12, minHourly: 35, rating: 4.7, missions: 27 },
  { id: "camille", name: "Camille Durand", town: "Anglet", lat: 43.485, lng: -1.516, skills: ["yoga"], diploma: { label: "Yoga Alliance 200 h", verified: true }, days: [1, 2, 3, 4, 5], hours: ["06:30", "13:00"], radiusKm: 10, minHourly: 32, rating: 4.9, missions: 55 },
  { id: "oihana", name: "Oihana Elissalde", town: "Biarritz", lat: 43.479, lng: -1.565, skills: ["yoga", "pilates"], diploma: { label: "Certification Pilates", verified: true }, days: week, hours: ["16:30", "21:30"], radiusKm: 10, minHourly: 38, rating: 4.9, missions: 48 },
  { id: "peio", name: "Peio Etchegaray", town: "Biarritz", lat: 43.4832, lng: -1.5586, skills: ["cross", "collectifs"], diploma: { label: "BPJEPS AF", verified: true }, days: week, hours: ["07:00", "21:00"], radiusKm: 15, minHourly: 30, rating: 4.5, missions: 19 },
  { id: "laura", name: "Laura Bergeron", town: "Bayonne", lat: 43.503, lng: -1.459, skills: ["pilates"], diploma: { label: "Certification Pilates", verified: true }, days: [1, 2, 3, 4, 5], hours: ["11:30", "14:30"], radiusKm: 8, minHourly: 35, rating: 4.6, missions: 23 },
  { id: "nicolas", name: "Nicolas Hiriart", town: "Bayonne", lat: 43.486, lng: -1.488, skills: ["aquagym"], diploma: { label: "BPJEPS AAN", verified: true }, days: week, hours: ["07:00", "21:30"], radiusKm: 20, minHourly: 30, rating: 4.4, missions: 36 },
  { id: "antton", name: "Antton Mendiboure", town: "Anglet", lat: 43.515, lng: -1.517, skills: ["muscu", "cross"], diploma: { label: "BPJEPS AF", verified: true }, days: week, hours: ["07:00", "21:30"], radiusKm: 15, minHourly: 40, rating: 4.8, missions: 39 },
  { id: "manon", name: "Manon Lafitte", town: "Anglet", lat: 43.493, lng: -1.53, skills: ["pilates", "yoga"], diploma: { label: "Certification Pilates", verified: true }, days: week, hours: ["17:00", "21:00"], radiusKm: 10, minHourly: 36, rating: 4.8, missions: 29 },
  { id: "chloe", name: "Chloé Bordenave", town: "Anglet", lat: 43.48, lng: -1.515, skills: ["yoga"], diploma: { label: "Yoga Alliance 200 h", verified: false }, days: week, hours: ["07:00", "21:30"], radiusKm: 12, minHourly: 30, rating: 4.2, missions: 8 },
  { id: "leire", name: "Leire Salaberry", town: "Anglet", lat: 43.477, lng: -1.5, skills: ["aquagym"], diploma: { label: "BNSSA", verified: true }, days: [6, 7], hours: ["08:00", "13:00"], radiusKm: 15, minHourly: 25, rating: 4.6, missions: 21 },
  { id: "xabi", name: "Xabi Arrieta", town: "Biarritz", lat: 43.465, lng: -1.57, skills: ["cross"], diploma: { label: "Licence STAPS", verified: false }, days: week, hours: ["06:30", "13:00"], radiusKm: 10, minHourly: 30, rating: 4.2, missions: 5 },
  { id: "amaia", name: "Amaia Larrouy", town: "Biarritz", lat: 43.461, lng: -1.545, skills: ["pilates"], diploma: { label: "Certification Pilates", verified: true }, days: week, hours: ["16:30", "21:30"], radiusKm: 10, minHourly: 37, rating: 4.7, missions: 33 },
];

/** Coach connecté dans la démo. */
export const ME = COACHES[0];

export const coachById = (id: string) => COACHES.find((c) => c.id === id)!;
export const venueById = (id: string) => VENUES.find((v) => v.id === id)!;

export type SlotStatus = "open" | "filled" | "done";
export type OfferStatus = "pending" | "accepted" | "declined" | "expired";

export type Slot = {
  id: string;
  venueId: string;
  skill: SkillId;
  /** Jours après aujourd'hui, et horaire local. */
  day: number;
  start: string;
  end: string;
  price: number;
  radiusKm: number;
  status: SlotStatus;
  coachId?: string;
  filledInMin?: number;
};

export type Offer = { id: string; slotId: string; coachId: string; reason: string; status: OfferStatus };

export const INITIAL_SLOTS: Slot[] = [
  { id: "s1", venueId: "atrium", skill: "collectifs", day: 2, start: "19:00", end: "20:00", price: 45, radiusKm: 6, status: "open" },
  { id: "s2", venueId: "atrium", skill: "muscu", day: 3, start: "10:00", end: "12:00", price: 70, radiusKm: 6, status: "open" },
  { id: "s3", venueId: "atrium", skill: "yoga", day: 1, start: "07:30", end: "08:30", price: 40, radiusKm: 6, status: "filled", coachId: "camille", filledInMin: 12 },
  { id: "s4", venueId: "atrium", skill: "pilates", day: 4, start: "18:30", end: "19:30", price: 42, radiusKm: 6, status: "filled", coachId: "maialen", filledInMin: 6 },
  { id: "s5", venueId: "atrium", skill: "collectifs", day: -2, start: "18:00", end: "19:00", price: 45, radiusKm: 6, status: "done", coachId: "maialen", filledInMin: 9 },
  { id: "s6", venueId: "ocean", skill: "pilates", day: 2, start: "12:30", end: "13:30", price: 40, radiusKm: 6, status: "open" },
  { id: "s7", venueId: "milady", skill: "pilates", day: 3, start: "18:00", end: "19:00", price: 42, radiusKm: 12, status: "open" },
  { id: "s8", venueId: "phare", skill: "collectifs", day: 6, start: "18:00", end: "19:00", price: 42, radiusKm: 6, status: "filled", coachId: "maialen", filledInMin: 4 },
];

export const INITIAL_OFFERS: Offer[] = [
  { id: "o1", slotId: "s1", coachId: "maialen", reason: "Favori · Diplôme ✓ · 2 km", status: "pending" },
  { id: "o2", slotId: "s1", coachId: "garazi", reason: "Favori · Diplôme ✓ · 2 km", status: "pending" },
  { id: "o4", slotId: "s2", coachId: "julen", reason: "Diplôme ✓ · 1 km", status: "pending" },
  { id: "o5", slotId: "s2", coachId: "antton", reason: "Diplôme ✓ · 5 km", status: "declined" },
  { id: "o6", slotId: "s6", coachId: "maialen", reason: "Diplôme ✓ · 6 km", status: "pending" },
  { id: "o7", slotId: "s7", coachId: "maialen", reason: "Diplôme ✓ · 10 km", status: "pending" },
];

/** Favoris de la salle connectée : passent en tête du matching. */
export const FAVORITES = ["maialen", "garazi"];
