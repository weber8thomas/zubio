import { COACHES } from "./coaches";
import type { ClassId } from "./types";

// Avis fictifs laissés par les salles après une mission, et indicateurs de fiabilité.

export const STRENGTHS = ["Ponctuel·le", "Énergique", "Pédagogue", "Adhérents ravis", "Autonome", "Sécurité au top", "Bonne musique", "Prépare bien"];

export type Review = { coachId: string; venueId: string; classId: ClassId; rating: number; daysAgo: number; text: string; strengths: string[] };

const TEXTS = [
  "Arrivé·e en avance, la salle était prête avant le premier adhérent. Cours très dynamique, plusieurs membres ont demandé quand elle ou il revenait.",
  "Remplacement au pied levé un vendredi soir : séance impeccable, consignes claires pour les débutants.",
  "Très bon niveau technique, corrections individuelles précises sans ralentir le groupe.",
  "Bonne énergie et playlist soignée. Un petit retard de cinq minutes, prévenu à l'avance.",
  "Nos habitués ont adoré. On l'a recontacté·e pour un créneau régulier le mardi.",
  "Séance bien construite, échauffement et retour au calme soignés. Rien à redire.",
  "Excellente gestion d'un groupe complet, 28 personnes, sans perdre personne.",
  "Coach fiable et souriant·e, communication fluide avant la séance.",
];

const VENUE_IDS = ["oceania-bayonne", "baiona-training", "clark-powell-bayonne", "club-abdo-bayonne", "gochoa-anglet", "keepcool-anglet", "lagon-fitness-anglet", "bestraining-biarritz", "orange-bleue-biarritz", "maison-sportive-biarritz", "snb-fitness"];

/** Générateur déterministe : mêmes avis à chaque chargement. */
function seeded(seed: number) {
  let x = seed || 1;
  return () => ((x = (x * 16807) % 2147483647), x / 2147483647);
}

const CLASS_HINT: Record<string, ClassId> = {
  pilates: "pilates", "lm-bodypump": "bodypump", "lm-bodybalance": "bodybalance", "lm-bodycombat": "bodycombat", "lm-rpm": "rpm", "lm-grit": "grit",
  "lm-bodyattack": "bodyattack", "lm-shbam": "shbam", "lm-bodystep": "bodystep", "lm-shapes": "shapes", "lm-core": "core", yoga200: "yoga", reformer: "reformer",
  bnssa: "aquagym", "bpjeps-aan": "aquabike", zumba: "zumba", "bpjeps-af": "crosstraining", "cqp-als": "caf", staps: "smallgroup",
};

export const REVIEWS: Review[] = COACHES.flatMap((c, ci) => {
  const rnd = seeded(ci * 97 + 13);
  const classes = c.certs.filter((x) => x.status === "verified").map((x) => CLASS_HINT[x.id]).filter(Boolean);
  const n = Math.min(6, Math.max(2, Math.round(c.reviews / 12)));
  return Array.from({ length: classes.length ? n : 0 }, (_, i) => {
    const r = rnd();
    return {
      coachId: c.id,
      venueId: VENUE_IDS[Math.floor(rnd() * VENUE_IDS.length)],
      classId: classes[i % classes.length],
      rating: c.rating >= 4.7 ? (r < 0.8 ? 5 : 4) : r < 0.5 ? 5 : r < 0.9 ? 4 : 3,
      daysAgo: 3 + i * 9 + Math.floor(r * 6),
      text: TEXTS[Math.floor(rnd() * TEXTS.length)],
      strengths: STRENGTHS.filter(() => rnd() < 0.3).slice(0, 3),
    };
  });
});

export const reviewsOf = (coachId: string) => REVIEWS.filter((r) => r.coachId === coachId);

/** Répartition des notes (5 → 1), extrapolée sur le nombre total d'avis du coach. */
export function ratingBreakdown(coachId: string) {
  const c = COACHES.find((x) => x.id === coachId)!;
  const five = Math.min(0.95, Math.max(0.2, (c.rating - 3.6) / 1.4));
  const shares = [five, (1 - five) * 0.7, (1 - five) * 0.2, (1 - five) * 0.07, (1 - five) * 0.03];
  return shares.map((s) => Math.round(s * c.reviews));
}

/** Indicateurs de fiabilité, dérivés du profil (démo). */
export function reliability(coachId: string) {
  const c = COACHES.find((x) => x.id === coachId)!;
  const rnd = seeded(c.name.length * 31 + c.missions);
  return {
    presence: c.missions < 5 ? 100 : Math.round(96 + rnd() * 4),
    responseMin: Math.round(4 + rnd() * 40),
    rehire: Math.round(35 + (c.rating - 4) * 40 + rnd() * 10),
    since: 2020 + Math.floor(rnd() * 5),
  };
}
