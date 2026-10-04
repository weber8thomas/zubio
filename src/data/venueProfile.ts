import { CATEGORIES, classById } from "./classes";
import { COACHES } from "./coaches";
import type { CategoryId, Venue } from "./types";

// Fiche publique d'une salle, vue par les coachs. Noms et adresses réels, le reste est fictif (démo).

export const VENUE_STRENGTHS = ["Paie à l'heure", "Accueil chaleureux", "Matériel au top", "Brief clair", "Sono récente", "Parking facile", "Adhérents motivés"];

const TEXTS = [
  "Équipe très accueillante, le brief était envoyé la veille avec la playlist habituelle des adhérents.",
  "Salle bien équipée, studio climatisé. Paiement reçu sous dix jours, rien à redire.",
  "Groupe motivé et bienveillant. Le responsable planning répond vite sur la messagerie.",
  "Très bonne organisation, accès badge prêt à mon arrivée et vestiaire coach dédié.",
  "Matériel complet et rangé. J'y retourne volontiers pour un créneau régulier.",
  "Petit souci de micro au début, réglé en deux minutes par l'accueil. Super ambiance.",
];

function seeded(seed: number) {
  let x = seed || 1;
  return () => ((x = (x * 16807) % 2147483647), x / 2147483647);
}

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 100_000, 7);

export type VenueReview = { coachId: string; rating: number; daysAgo: number; text: string; strengths: string[] };

export function venueProfile(v: Venue) {
  const rnd = seeded(hash(v.id));
  const cats = [...new Set(v.classes.map((c) => classById(c).category))] as CategoryId[];
  const studios = [
    "Studio cours collectifs",
    v.classes.some((c) => c === "rpm" || c === "cycling") && "Studio vélo",
    v.classes.some((c) => c === "crosstraining" || c === "trx" || c === "smallgroup") && "Espace fonctionnel",
    v.classes.includes("reformer") && "Studio Reformer",
    v.pool && "Bassin",
  ].filter(Boolean) as string[];
  const rating = Math.round((4.3 + rnd() * 0.6) * 10) / 10;
  const c0 = Math.floor(rnd() * COACHES.length);
  const t0 = Math.floor(rnd() * TEXTS.length);
  const reviews: VenueReview[] = Array.from({ length: 4 }, (_, i) => ({
    coachId: COACHES[(c0 + i * 5) % COACHES.length].id,
    rating: rnd() < 0.75 ? 5 : 4,
    daysAgo: 4 + i * 11 + Math.floor(rnd() * 8),
    text: TEXTS[(t0 + i) % TEXTS.length],
    strengths: VENUE_STRENGTHS.filter(() => rnd() < 0.3).slice(0, 3),
  }));
  return {
    about: `${v.name} accueille ses adhérents à ${v.town} avec ${v.classes.length} cours collectifs au planning : ${cats.map((c) => (c === "lesmills" ? CATEGORIES[c].label : CATEGORIES[c].label.toLowerCase())).join(", ")}. La salle fait appel à Zubio pour ses remplacements et ses créneaux ponctuels.`,
    studios,
    onSite: [
      ["Sono et micro casque", true],
      ["Matériel fourni", true],
      ["Vestiaire coach", rnd() < 0.8],
      ["Parking", rnd() < 0.6],
      ["Accès badge remis à l'accueil", true],
    ] as [string, boolean][],
    contact: "Responsable planning (démo)",
    arrive: 15,
    rating,
    reviewCount: 6 + Math.floor(rnd() * 30),
    paymentDays: 7 + Math.floor(rnd() * 14),
    responseMin: 10 + Math.floor(rnd() * 50),
    cancel: Math.floor(rnd() * 4),
    since: 2022 + Math.floor(rnd() * 3),
    reviews,
  };
}
