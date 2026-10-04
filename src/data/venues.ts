import type { Venue } from "./types";

// Sources (consultées le 04/10/2026) :
// - Océania Bayonne : https://www.oceania-club.fr/club/bayonne/
//   (https://www.oceania-club.fr/salle-de-sport-anglet/ n'est qu'une page SEO : « nous ne sommes pas sur Anglet » → remplacé par Clark Powell)
// - Clark Powell Bayonne : https://clarkpowell.fr/club/bayonne/
// - Baiona Training : https://www.baiona-training.fr , https://www.baiona-training.fr/le-planning-des-cours-de-la-salle-de-musculation/
//   + planning https://www.baiona-training.fr/wp-content/uploads/2026/04/Nouveau-planning-2026.jpg
// - Club Abdo : https://www.club-abdo-bayonne.fr/cours-collectifs.php , https://www.club-abdo-bayonne.fr/planning-tarifs.php
// - SN Bayonne fitness : https://www.snbayonne.fr/fitness-horaires-tarifs/
// - Gochoa : https://gochoa.fr/plan/ , planning 2026-27 https://gochoa.fr/wp-content/uploads/2026/08/2-grand-format.jpg
// - Lagon Fitness (Atlanthal) : https://www.atlanthal.com/en/lagon-fitness-gym-anglet/
// - Keepcool Anglet : https://www.keepcool.fr/clubs/salle-de-sport-anglet
// - L'Orange Bleue Biarritz : https://www.lorangebleue.fr/clubs/biarritz/
//   + planning https://www.lorangebleue.fr/wp-content/uploads/2022/12/318-planning-biarritz-202404-scaled.jpg
// - Bestraining : pas de site officiel trouvé → https://www.masalledesport.com/salle/8373,bestraining,club-de-fitness,biarritz,64200,fr
//   (entreprise active au registre : https://recherche-entreprises.api.gouv.fr)
// - Maison Sportive Biarritz : https://www.maisonsportive.fr/ , https://www.maisonsportive.fr/sallesdecoursmaisonsportive
//   (remplace Carré Fitness, logé dans la thalasso Thalmar, fermée — cf. https://www.thalmar.com/)
// - Géocodage : https://api-adresse.data.gouv.fr/search/ (toutes les adresses résolues au numéro, score ≥ 0.96)
export const VENUES: Venue[] = [
  // Bayonne
  { id: "oceania-bayonne", name: "Océania Club Bayonne", address: "85 avenue de la Légion Tchèque, Galerie des Arènes, 64100 Bayonne", town: "Bayonne", lat: 43.49349, lng: -1.49296, classes: ["bodypump", "rpm", "aquabike", "aquagym", "bodycombat", "bodyattack", "bodybalance", "core", "bodystep", "pilates", "yoga", "crosstraining"], pool: true },
  // Ouverte en janvier 2026, zone du Forum. Cours Les Mills coachés + virtuels ; « Hyrox » → crosstraining.
  { id: "clark-powell-bayonne", name: "Clark Powell Bayonne", address: "6 rue du Marais de l'Estunard, 64100 Bayonne", town: "Bayonne", lat: 43.49252, lng: -1.49452, classes: ["bodypump", "rpm", "bodycombat", "bodyattack", "hiit", "crosstraining", "pilates", "yoga", "stretching", "dance"] },
  // « Renfo Pump » (non Les Mills) → totalbody ; « Boxe Fitness » → cardioboxe.
  { id: "baiona-training", name: "Baiona Training", address: "9 avenue de la Division Leclerc, 64100 Bayonne", town: "Bayonne", lat: 43.49047, lng: -1.45885, classes: ["rpm", "crosstraining", "caf", "pilates", "totalbody", "stretching", "trx", "cardioboxe", "yoga"] },
  // Planning mensuel à thème : Pilates (postural/stretch), Renforcement Full Body, CAF, Cardio (→ hiit), Cross-training.
  { id: "club-abdo-bayonne", name: "Club Abdo", address: "4 rue Albert Thomas, 64100 Bayonne", town: "Bayonne", lat: 43.49416, lng: -1.46087, classes: ["pilates", "caf", "crosstraining", "totalbody", "hiit", "stretching"] },
  // Section fitness EPGV du club d'aviron : Circuit training, Renfo, Total Body, Zumba, Stretching, Body Zen (yoga/pilates).
  { id: "snb-fitness", name: "Société Nautique de Bayonne – Fitness", address: "8 avenue Capitaine Resplandy, 64100 Bayonne", town: "Bayonne", lat: 43.48949, lng: -1.46664, classes: ["circuit", "totalbody", "zumba", "stretching", "yoga", "pilates"] },

  // Anglet
  // Planning 31/08/26 → 27/06/27 : Body Pump, RPM, Body Balance, Body Combat, Body Attack, Body Jam/C'Dance (→ dance),
  // Body Sculpt (→ totalbody), Full Body HIIT, CFA, Step Freestyle, Pilates, Stretching, Gym douce.
  { id: "gochoa-anglet", name: "Gym Gochoa", address: "15 rue du Bois Belin, 64600 Anglet", town: "Anglet", lat: 43.49288, lng: -1.52395, classes: ["bodypump", "rpm", "bodybalance", "pilates", "bodycombat", "caf", "stretching", "bodyattack", "step", "dance", "hiit", "totalbody"] },
  // Lagon d'eau de mer chauffé + club fitness. Aussi Sprint Les Mills, Power Bar, Booty Training, Aquacaf, Aquapalmes…
  { id: "lagon-fitness-anglet", name: "Lagon Fitness – Atlanthal", address: "153 boulevard des Plages, 64600 Anglet", town: "Anglet", lat: 43.52095, lng: -1.52221, classes: ["aquagym", "aquabike", "aquatraining", "rpm", "shapes", "pilates", "caf", "crosstraining", "trx", "yoga", "stretching", "totalbody"], pool: true },
  // Concept « small groups » (Abdos, Cardio Boxe, Cardio, Cross Training, CAF, Cuisses Fessiers, Etirements, Full Body, HIIT, Mobilité, Run).
  { id: "keepcool-anglet", name: "Keepcool Anglet", address: "18 rue des Barthes, 64600 Anglet", town: "Anglet", lat: 43.48394, lng: -1.50706, classes: ["smallgroup", "hiit", "crosstraining", "cardioboxe", "caf", "totalbody", "stretching"] },

  // Biarritz
  // Social club 900 m² : salles Sportive, Reformer, Hot (infrarouge), Bike, Musclée.
  { id: "maison-sportive-biarritz", name: "Maison Sportive Biarritz", address: "44 rue Luis Mariano, 64200 Biarritz", town: "Biarritz", lat: 43.4594, lng: -1.54095, classes: ["reformer", "pilates", "yoga", "cycling", "hiit", "cardioboxe", "totalbody", "crosstraining", "yin", "stretching", "dance", "step"] },
  // Infos issues de masalledesport.com (pas de site officiel) : Body Combat, Body Pump, Body Balance, RPM, RIP Trainer,
  // CAF, étirements, Zumba ; concept « BT Session » (→ circuit). Halle Occa, village d'Iraty.
  { id: "bestraining-biarritz", name: "Bestraining", address: "18 rue des Mésanges, 64200 Biarritz", town: "Biarritz", lat: 43.46143, lng: -1.53916, classes: ["bodypump", "bodycombat", "rpm", "bodybalance", "caf", "zumba", "stretching", "circuit"] },
  // Cours Yako : Pump/Intégral (→ totalbody), Biking (→ cycling), Training (→ hiit), Combat (→ cardioboxe), Baila (→ dance),
  // Détente/Gym douce (→ stretching), Attitude, Pilates, Yoga, Abdos-fessiers, Step.
  { id: "orange-bleue-biarritz", name: "L'Orange Bleue Biarritz", address: "28 rue Chapelet, 64200 Biarritz", town: "Biarritz", lat: 43.46441, lng: -1.54224, classes: ["totalbody", "cycling", "pilates", "yoga", "caf", "hiit", "cardioboxe", "step", "dance", "stretching"] },
];
