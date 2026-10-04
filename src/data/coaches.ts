import type { Coach } from "./types";

// Coachs fictifs (portraits de démo randomuser.me). `since` = mois depuis l'obtention.

const v = (id: string, since = 24) => ({ id, status: "verified" as const, since });
const p = (id: string) => ({ id, status: "pending" as const, since: 1 });
const week = [1, 2, 3, 4, 5];
const soir = { days: week, from: "17:00", to: "21:30" };
const matin = { days: week, from: "06:30", to: "13:00" };
const midi = { days: week, from: "11:30", to: "14:30" };
const weekend = { days: [6, 7], from: "08:00", to: "13:00" };
const large = { days: [1, 2, 3, 4, 5, 6], from: "07:00", to: "21:30" };

export const COACHES: Coach[] = [
  {
    id: "maialen", name: "Maialen Etcheverry", town: "Bayonne", lat: 43.5035, lng: -1.4615,
    bio: "Coach depuis 9 ans. Pilates et BodyBalance pour délier le corps, BodyPump pour le tonus. J'aime les groupes où chacun progresse à son rythme.",
    certs: [v("pilates", 60), v("lm-bodypump", 36), v("lm-bodybalance", 30), v("cqp-als", 96), p("yoga200")],
    languages: ["Français", "Basque", "Espagnol"], rating: 4.8, reviews: 63, missions: 42, minHourly: 30, radiusKm: 15,
    availability: [large, { days: [7], from: "09:00", to: "20:00" }],
  },
  {
    id: "garazi", name: "Garazi Ospital", town: "Anglet", lat: 43.4805, lng: -1.5005,
    bio: "Cuisses-abdos-fessiers, step et Total body. Énergie garantie, playlists maison.",
    certs: [v("cqp-als", 48), v("bpjeps-af", 30)], languages: ["Français", "Basque"], rating: 4.7, reviews: 41, missions: 31, minHourly: 30, radiusKm: 12,
    availability: [soir, weekend],
  },
  {
    id: "julen", name: "Julen Iriarte", town: "Bayonne", lat: 43.484, lng: -1.48,
    bio: "Ancien rugbyman. Cross-training, GRIT et small group : la technique avant la charge.",
    certs: [v("bpjeps-af", 72), v("lm-grit", 18), v("staps", 90)], languages: ["Français", "Anglais"], rating: 4.7, reviews: 38, missions: 27, minHourly: 35, radiusKm: 12,
    availability: [soir, matin],
  },
  {
    id: "camille", name: "Camille Durand", town: "Anglet", lat: 43.485, lng: -1.516,
    bio: "Professeure de vinyasa et de yin. Des séances rythmées par le souffle.",
    certs: [v("yoga200", 50)], languages: ["Français", "Anglais"], rating: 4.9, reviews: 77, missions: 55, minHourly: 32, radiusKm: 10,
    availability: [matin, weekend],
  },
  {
    id: "oihana", name: "Oihana Elissalde", town: "Biarritz", lat: 43.479, lng: -1.565,
    bio: "Pilates mat et Reformer, yoga doux. Douze ans d'enseignement entre Biarritz et Madrid.",
    certs: [v("pilates", 80), v("reformer", 40), v("yoga200", 70)], languages: ["Français", "Espagnol"], rating: 4.9, reviews: 92, missions: 48, minHourly: 38, radiusKm: 10,
    availability: [soir, midi],
  },
  {
    id: "peio", name: "Peio Etchegaray", town: "Biarritz", lat: 43.4832, lng: -1.5586,
    bio: "BodyCombat et cardio-boxe : on se défoule, proprement.",
    certs: [v("bpjeps-af", 40), v("lm-bodycombat", 28), v("lm-bodyattack", 20)], languages: ["Français", "Basque"], rating: 4.5, reviews: 22, missions: 19, minHourly: 30, radiusKm: 15,
    availability: [large],
  },
  {
    id: "laura", name: "Laura Bergeron", town: "Bayonne", lat: 43.503, lng: -1.459,
    bio: "Pilates et stretching à l'heure du déjeuner, pour les bureaux du centre-ville.",
    certs: [v("pilates", 30)], languages: ["Français"], rating: 4.6, reviews: 29, missions: 23, minHourly: 35, radiusKm: 8,
    availability: [midi],
  },
  {
    id: "nicolas", name: "Nicolas Hiriart", town: "Bayonne", lat: 43.486, lng: -1.488,
    bio: "Maître-nageur. Aquagym, aquabike et aquatraining pour tous les âges.",
    certs: [v("bpjeps-aan", 70), v("bnssa", 100)], languages: ["Français"], rating: 4.4, reviews: 34, missions: 36, minHourly: 30, radiusKm: 20,
    availability: [large],
  },
  {
    id: "antton", name: "Antton Mendiboure", town: "Anglet", lat: 43.515, lng: -1.517,
    bio: "BodyPump, RPM et préparation physique. Formateur Les Mills.",
    certs: [v("bpjeps-af", 84), v("lm-bodypump", 70), v("lm-rpm", 60), v("lm-core", 40)], languages: ["Français", "Anglais"], rating: 4.8, reviews: 58, missions: 39, minHourly: 40, radiusKm: 15,
    availability: [large],
  },
  {
    id: "manon", name: "Manon Lafitte", town: "Anglet", lat: 43.493, lng: -1.53,
    bio: "Pilates et BodyBalance. Spécialisée femmes enceintes et post-natal.",
    certs: [v("pilates", 36), v("lm-bodybalance", 20)], languages: ["Français"], rating: 4.8, reviews: 31, missions: 29, minHourly: 36, radiusKm: 10,
    availability: [soir],
  },
  {
    id: "chloe", name: "Chloé Bordenave", town: "Anglet", lat: 43.48, lng: -1.515,
    bio: "Fraîchement certifiée en yoga, déjà en cours régulier au Club Abdo.",
    certs: [p("yoga200")], languages: ["Français", "Anglais"], rating: 4.2, reviews: 6, missions: 8, minHourly: 30, radiusKm: 12,
    availability: [large],
  },
  {
    id: "leire", name: "Leire Salaberry", town: "Anglet", lat: 43.477, lng: -1.5,
    bio: "Aquagym et aquabike le week-end, sauveteuse en mer l'été.",
    certs: [v("bnssa", 50)], languages: ["Français", "Basque", "Espagnol"], rating: 4.6, reviews: 25, missions: 21, minHourly: 25, radiusKm: 15,
    availability: [weekend, soir],
  },
  {
    id: "xabi", name: "Xabi Arrieta", town: "Biarritz", lat: 43.465, lng: -1.57,
    bio: "Cross-training et HIIT au lever du soleil, face à l'océan.",
    certs: [p("staps"), p("lm-grit")], languages: ["Français", "Anglais"], rating: 4.2, reviews: 4, missions: 5, minHourly: 30, radiusKm: 10,
    availability: [matin],
  },
  {
    id: "amaia", name: "Amaia Larrouy", town: "Biarritz", lat: 43.461, lng: -1.545,
    bio: "Pilates Reformer et mat. Petits groupes, beaucoup d'attention au placement.",
    certs: [v("pilates", 44), v("reformer", 20)], languages: ["Français", "Espagnol"], rating: 4.7, reviews: 37, missions: 33, minHourly: 37, radiusKm: 10,
    availability: [soir, midi],
  },
  {
    id: "ane", name: "Ane Garat", town: "Bidart", lat: 43.437, lng: -1.59,
    bio: "Zumba et dance fitness. Licence ZIN, dix ans de scène.",
    certs: [v("zumba", 60), v("cqp-als", 60)], languages: ["Français", "Basque", "Espagnol"], rating: 4.8, reviews: 46, missions: 40, minHourly: 32, radiusKm: 18,
    availability: [soir, weekend],
  },
  {
    id: "ines", name: "Inès Haramburu", town: "Biarritz", lat: 43.474, lng: -1.552,
    bio: "BodyAttack, SH'BAM et BodyStep : le cardio en musique.",
    certs: [v("lm-bodyattack", 30), v("lm-shbam", 26), v("lm-bodystep", 22), v("cqp-als", 50)], languages: ["Français", "Anglais"], rating: 4.9, reviews: 54, missions: 44, minHourly: 34, radiusKm: 12,
    availability: [soir, weekend],
  },
  {
    id: "lucie", name: "Lucie Marsan", town: "Boucau", lat: 43.525, lng: -1.485,
    bio: "Aquabike et aquatraining. Ancienne nageuse de haut niveau.",
    certs: [v("bpjeps-aan", 40), v("bnssa", 60)], languages: ["Français"], rating: 4.5, reviews: 19, missions: 18, minHourly: 30, radiusKm: 15,
    availability: [matin, soir],
  },
  {
    id: "nahia", name: "Nahia Irigoyen", town: "Anglet", lat: 43.505, lng: -1.525,
    bio: "Shapes, CORE et CAF. Pédagogie claire, corrections précises.",
    certs: [v("lm-shapes", 14), v("lm-core", 30), v("cqp-als", 40)], languages: ["Français", "Basque"], rating: 4.6, reviews: 28, missions: 26, minHourly: 30, radiusKm: 12,
    availability: [midi, soir],
  },
  {
    id: "elorri", name: "Elorri Aguerre", town: "Bayonne", lat: 43.478, lng: -1.468,
    bio: "Stretching, mobilité et yin yoga pour sportifs.",
    certs: [v("yoga200", 30), p("pilates")], languages: ["Français", "Basque"], rating: 4.4, reviews: 14, missions: 12, minHourly: 30, radiusKm: 10,
    availability: [matin, weekend],
  },
  {
    id: "hugo", name: "Hugo Dubarry", town: "Bayonne", lat: 43.496, lng: -1.472,
    bio: "Cycling et RPM. Préparateur physique de clubs de pelote.",
    certs: [v("bpjeps-af", 50), v("lm-rpm", 36)], languages: ["Français", "Espagnol"], rating: 4.5, reviews: 21, missions: 22, minHourly: 32, radiusKm: 12,
    availability: [matin, soir],
  },
  {
    id: "bastien", name: "Bastien Loustau", town: "Anglet", lat: 43.497, lng: -1.508,
    bio: "Cross-training et TRX. Coach de small group depuis 6 ans.",
    certs: [v("bpjeps-af", 72), v("staps", 80)], languages: ["Français", "Anglais"], rating: 4.6, reviews: 33, missions: 30, minHourly: 38, radiusKm: 15,
    availability: [matin, soir],
  },
  {
    id: "yann", name: "Yann Courrèges", town: "Tarnos", lat: 43.54, lng: -1.46,
    bio: "BodyPump et BodyCombat. Disponible en dépannage, même au dernier moment.",
    certs: [v("lm-bodypump", 50), v("lm-bodycombat", 50), v("bpjeps-af", 60)], languages: ["Français"], rating: 4.7, reviews: 40, missions: 51, minHourly: 34, radiusKm: 25,
    availability: [large],
  },
  {
    id: "kevin", name: "Kevin Uhalde", town: "Biarritz", lat: 43.476, lng: -1.538,
    bio: "HIIT, circuit et cardio-boxe. Ancien boxeur amateur.",
    certs: [v("bpjeps-af", 36)], languages: ["Français", "Anglais"], rating: 4.5, reviews: 17, missions: 15, minHourly: 32, radiusKm: 10,
    availability: [soir],
  },
  {
    id: "romain", name: "Romain Ithurralde", town: "Bayonne", lat: 43.51, lng: -1.47,
    bio: "Fraîchement licencié BodyPump, en attente de validation.",
    certs: [p("lm-bodypump"), v("cqp-als", 20)], languages: ["Français"], rating: 4.3, reviews: 3, missions: 2, minHourly: 30, radiusKm: 15,
    availability: [large],
  },
];

export const coachById = (id: string) => COACHES.find((c) => c.id === id)!;

/** Compte coach de la démo. */
export const ME = COACHES[0];
