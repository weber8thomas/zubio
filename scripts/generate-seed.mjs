// Génère supabase/seed.sql : comptes de démo, 15 salles, 40 coachs, ~20 créneaux,
// plus quelques données pour la verticale immobilier.
// Les dates sont relatives au moment du seed, pour que la démo reste « à jour ».
// Usage : npm run seed:generate   (puis `supabase db reset` en local)
import { writeFile } from "node:fs/promises";

const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "zubio-demo-2026";

const id = (prefix, n) => `${prefix}-0000-4000-8000-${String(n).padStart(12, "0")}`;
const q = (v) => (v === null || v === undefined ? "null" : `'${String(v).replaceAll("'", "''")}'`);
/** Horodatage local Europe/Paris, `days` jours après aujourd'hui, à l'heure `hm`. */
const at = (days, hm) =>
  `((date_trunc('day', now() at time zone 'Europe/Paris') + interval '${days} days' + time '${hm}') at time zone 'Europe/Paris')`;

function km(a, b) {
  const r = (d) => (d * Math.PI) / 180;
  const h =
    Math.sin(r(b.lat - a.lat) / 2) ** 2 +
    Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

// ---------------------------------------------------------------- comptes
const USERS = {
  admin: { id: id("10000000", 1), email: "admin@zubio.demo", role: "admin", name: "Claire Dufau" },
  salle: { id: id("10000000", 2), email: "salle@zubio.demo", role: "salle", name: "Thomas Larre" },
  coach: { id: id("10000000", 3), email: "coach@zubio.demo", role: "coach", name: "Maialen Etcheverry" },
};

// ---------------------------------------------------------------- salles
const VENUES = [
  ["Atrium Fitness Bayonne", "Bayonne", "18 avenue du Maréchal Foch", 43.4905, -1.4786, "05 59 25 41 10"],
  ["Studio Adour Pilates", "Bayonne", "7 quai Amiral Jauréguiberry", 43.4912, -1.4735, "05 59 59 12 84"],
  ["Le Hangar Training", "Bayonne", "42 avenue de l'Adour", 43.5021, -1.4655, "05 59 31 76 02"],
  ["Nive Forme", "Bayonne", "3 rue Pannecau", 43.4893, -1.4719, "05 59 46 20 37"],
  ["Petit Bayonne Yoga", "Bayonne", "21 rue des Tonneliers", 43.4898, -1.4728, "06 12 40 88 15"],
  ["Chiberta Fitness Club", "Anglet", "104 boulevard des Plages", 43.5134, -1.5182, "05 59 03 18 66"],
  ["Anglet Cross Box", "Anglet", "12 rue de Hirigogne", 43.4812, -1.4985, "06 70 22 41 93"],
  ["Studio Océan Pilates", "Anglet", "5 avenue de la Chambre d'Amour", 43.5025, -1.5345, "05 59 15 63 20"],
  ["Blancpignon Gym", "Anglet", "33 avenue de Montbrun", 43.4776, -1.5032, "05 59 52 09 71"],
  ["Aquaforme Anglet", "Anglet", "2 allée du Cadran", 43.4851, -1.5196, "05 59 58 34 40"],
  ["Côte des Basques Yoga", "Biarritz", "9 rue Gambetta", 43.4808, -1.5612, "06 81 14 52 07"],
  ["Biarritz Athletic Club", "Biarritz", "58 avenue du Président Kennedy", 43.4702, -1.5498, "05 59 23 87 12"],
  ["Le Phare Training", "Biarritz", "14 avenue de l'Impératrice", 43.4908, -1.5551, "05 59 41 60 95"],
  ["Milady Studio", "Biarritz", "77 avenue de Milady", 43.4655, -1.5702, "06 45 30 17 84"],
  ["Aqua Biarritz Santé", "Biarritz", "1 rue Larreguy", 43.4795, -1.5539, "05 59 22 48 03"],
].map(([name, commune, address, lat, lng, phone], i) => ({
  id: id("20000000", i + 1),
  owner: i === 0 ? USERS.salle.id : null,
  name, commune, address, lat, lng, phone,
}));
const ATRIUM = VENUES[0];

// ---------------------------------------------------------------- coachs
const SPOTS = {
  Bayonne: [[43.4960, -1.4690], [43.4840, -1.4800], [43.5030, -1.4590], [43.4860, -1.4880], [43.4925, -1.4752]],
  Anglet: [[43.4850, -1.5160], [43.5150, -1.5170], [43.4930, -1.5300], [43.4800, -1.5150], [43.4770, -1.5000]],
  Biarritz: [[43.4832, -1.5586], [43.4790, -1.5650], [43.4650, -1.5700], [43.4790, -1.5530], [43.4610, -1.5450]],
};

// Plages hebdomadaires types (jour ISO 1 = lundi).
const PATTERNS = {
  matin: [1, 2, 3, 4, 5].map((d) => [d, "06:30", "13:00"]),
  soir: [1, 2, 3, 4, 5].map((d) => [d, "16:30", "21:30"]),
  midi: [1, 2, 3, 4, 5].map((d) => [d, "11:30", "14:30"]),
  weekend: [[6, "08:00", "13:00"], [7, "09:00", "12:30"]],
  large: [1, 2, 3, 4, 5, 6].map((d) => [d, "07:00", "21:30"]),
  mixte: [[1, "07:00", "12:00"], [2, "17:00", "21:00"], [3, "07:00", "12:00"], [4, "17:00", "21:00"], [5, "07:00", "21:00"], [6, "08:30", "12:30"]],
};

const BIOS = {
  pilates: "Je travaille le centre, la posture et la respiration, avec des séances accessibles aux débutants comme aux sportifs.",
  yoga: "Vinyasa et hatha doux : des séances rythmées par le souffle, pour délier le corps et calmer la tête.",
  cross_training: "Ancien rugbyman reconverti, j'encadre des WOD exigeants avec un vrai souci de la technique.",
  cours_collectifs: "Body pump, step, LIA : j'aime les salles pleines et les playlists qui donnent envie de se dépasser.",
  musculation: "Programmes de renforcement et accompagnement sur plateau, de la reprise à la préparation physique.",
  aquagym: "Maître-nageur de formation, j'anime aquagym, aquabike et aquatraining pour tous les âges.",
};

// [nom, commune, compétences, justificatifs ([kind, statut, expiration?]), motif dispo, rayon, €/h min, note]
const COACHES = [
  [USERS.coach.name, "Bayonne", ["pilates", "yoga", "cours_collectifs"], [["pilates_cert", "verified"], ["cqp_als", "verified"], ["yoga_cert", "pending"]], "large", 15, 30, 4.8],
  ["Julen Iriarte", "Bayonne", ["cross_training", "musculation"], [["bpjeps_af", "verified"]], "soir", 12, 35, 4.7],
  ["Camille Durand", "Anglet", ["yoga"], [["yoga_cert", "verified"]], "matin", 10, 32, 4.9],
  ["Peio Etchegaray", "Biarritz", ["cross_training", "cours_collectifs"], [["bpjeps_af", "verified"]], "mixte", 15, 30, 4.5],
  ["Laura Bergeron", "Bayonne", ["pilates"], [["pilates_cert", "verified"]], "midi", 8, 35, 4.6],
  ["Mathis Lacoste", "Anglet", ["musculation"], [["staps", "verified"]], "soir", 10, 28, 4.3],
  ["Ane Garat", "Biarritz", ["yoga", "pilates"], [["yoga_cert", "verified"], ["pilates_cert", "pending"]], "matin", 12, 38, 4.9],
  ["Nicolas Hiriart", "Bayonne", ["aquagym"], [["bpjeps_aan", "verified"]], "large", 20, 30, 4.4],
  ["Sophie Lamarque", "Anglet", ["cours_collectifs"], [["cqp_als", "verified"]], "soir", 12, 26, 4.6],
  ["Xabi Arrieta", "Biarritz", ["cross_training"], [["staps", "pending"]], "matin", 10, 30, 4.2],
  ["Émilie Castaing", "Bayonne", ["yoga"], [["yoga_cert", "verified", "2025-12-31"]], "soir", 10, 30, 4.5],
  ["Antton Mendiboure", "Anglet", ["musculation", "cross_training"], [["bpjeps_af", "verified"]], "large", 15, 40, 4.8],
  ["Clara Fontaine", "Biarritz", ["pilates"], [["bpjeps_af", "verified"]], "mixte", 8, 35, 4.7],
  ["Hugo Dubarry", "Bayonne", ["cours_collectifs", "musculation"], [["bpjeps_af", "verified"]], "midi", 12, 28, 4.4],
  ["Leire Salaberry", "Anglet", ["aquagym"], [["bnssa", "verified"]], "weekend", 15, 25, 4.6],
  ["Maxime Pétrissans", "Biarritz", ["musculation"], [["staps", "verified"]], "soir", 10, 32, 4.1],
  ["Garazi Ospital", "Bayonne", ["pilates", "cours_collectifs"], [["cqp_als", "verified"], ["pilates_cert", "verified"]], "soir", 12, 30, 4.7],
  ["Bastien Loustau", "Anglet", ["cross_training"], [["bpjeps_af", "verified"]], "matin", 18, 33, 4.5],
  ["Inès Haramburu", "Biarritz", ["yoga"], [["yoga_cert", "verified"]], "weekend", 10, 40, 4.9],
  ["Thibault Sallaberry", "Bayonne", ["musculation"], [["bpjeps_af", "pending"]], "large", 10, 27, 4.0],
  ["Manon Lafitte", "Anglet", ["pilates", "yoga"], [["pilates_cert", "verified"], ["yoga_cert", "verified"]], "midi", 10, 36, 4.8],
  ["Ekaitz Bidegain", "Biarritz", ["aquagym"], [["bpjeps_aan", "verified"]], "mixte", 12, 30, 4.5],
  ["Pauline Darrigrand", "Bayonne", ["cours_collectifs"], [["cqp_als", "verified"]], "matin", 10, 25, 4.3],
  ["Kevin Uhalde", "Anglet", ["cross_training", "musculation"], [["staps", "verified"]], "soir", 15, 34, 4.6],
  ["Amaia Larrouy", "Biarritz", ["pilates"], [["pilates_cert", "verified"]], "soir", 10, 37, 4.7],
  ["Romain Ithurralde", "Bayonne", ["cross_training"], [["bpjeps_af", "verified"]], "weekend", 20, 30, 4.4],
  ["Chloé Bordenave", "Anglet", ["yoga"], [["yoga_cert", "pending"]], "large", 12, 30, 4.2],
  ["Iban Goyhenetche", "Biarritz", ["musculation", "cours_collectifs"], [["bpjeps_af", "verified"]], "midi", 10, 32, 4.6],
  ["Lucie Marsan", "Bayonne", ["aquagym"], [["bnssa", "verified"]], "soir", 12, 26, 4.5],
  ["Florian Cazaubon", "Anglet", ["musculation"], [["bpjeps_af", "verified"]], "matin", 10, 30, 4.3],
  ["Oihana Elissalde", "Biarritz", ["yoga", "pilates"], [["yoga_cert", "verified"], ["pilates_cert", "verified"]], "soir", 8, 42, 4.9],
  ["Alexandre Pémartin", "Bayonne", ["cours_collectifs", "cross_training"], [["bpjeps_af", "verified"]], "mixte", 15, 30, 4.5],
  ["Julie Harriague", "Anglet", ["pilates"], [["bpjeps_af", "pending"]], "midi", 10, 33, 4.4],
  ["Unai Recalde", "Biarritz", ["cross_training"], [["staps", "verified"]], "soir", 12, 31, 4.6],
  ["Marion Daguerre", "Bayonne", ["yoga"], [["yoga_cert", "verified"]], "midi", 10, 34, 4.7],
  ["Damien Lartigue", "Anglet", ["aquagym", "cours_collectifs"], [["bpjeps_aan", "verified"], ["cqp_als", "verified"]], "large", 15, 28, 4.5],
  ["Nahia Irigoyen", "Biarritz", ["cours_collectifs"], [["cqp_als", "verified"]], "soir", 10, 27, 4.6],
  ["Yann Courrèges", "Bayonne", ["musculation", "cross_training"], [["staps", "verified"], ["bpjeps_af", "verified"]], "matin", 12, 38, 4.8],
  ["Elorri Aguerre", "Anglet", ["pilates", "cours_collectifs"], [["cqp_als", "verified"]], "soir", 12, 29, 4.4],
  ["Gaëlle Mourguy", "Biarritz", ["aquagym"], [["bnssa", "pending"]], "weekend", 10, 25, 4.2],
].map(([name, commune, skills, creds, pattern, radius, rate, rating], i) => {
  const [lat, lng] = SPOTS[commune][i % 5];
  return {
    id: id("30000000", i + 1),
    user: i === 0 ? USERS.coach.id : null,
    name, commune, skills, creds, pattern, radius, rate, rating, lat, lng,
    bio: i === 0
      ? "Coach pilates et cours collectifs à Bayonne depuis 9 ans. Formée à Biarritz, j'aime les petits groupes où chacun progresse à son rythme."
      : BIOS[skills[0]],
  };
});
const DEMO_COACH = COACHES[0];
const FAVORITES = [COACHES[0], COACHES[4], COACHES[13], COACHES[16]];

// ---------------------------------------------------------------- créneaux
const REQUIRES = {
  pilates: ["pilates_cert", "bpjeps_af"],
  yoga: ["yoga_cert"],
  cross_training: ["bpjeps_af", "staps"],
  cours_collectifs: ["cqp_als", "bpjeps_af"],
  musculation: ["bpjeps_af", "staps"],
  aquagym: ["bpjeps_aan", "bnssa"],
};
const eligible = (coach, skill) =>
  coach.skills.includes(skill) &&
  coach.creds.some(([kind, status, exp]) => REQUIRES[skill].includes(kind) && status === "verified" && !exp);

// [salle, discipline, jour relatif, début, fin, € , statut, coach imposé, délai de pourvoi (min)]
const SLOTS = [
  [0, "cours_collectifs", 2, "19:00", "20:00", 45, "open", DEMO_COACH],
  [0, "musculation", 3, "10:00", "12:00", 70, "open"],
  [0, "yoga", 1, "07:30", "08:30", 40, "filled", null, 12],
  [0, "pilates", 4, "18:30", "19:30", 42, "filled", DEMO_COACH, 6],
  [0, "cours_collectifs", -2, "18:00", "19:00", 45, "done", DEMO_COACH, 9],
  [0, "pilates", -5, "12:15", "13:00", 38, "done", DEMO_COACH, 21],
  [0, "cross_training", 5, "07:00", "08:00", 45, "cancelled"],
  [7, "pilates", 2, "12:30", "13:30", 40, "open", DEMO_COACH],
  [9, "aquagym", 2, "10:00", "11:00", 35, "open"],
  [6, "cross_training", 1, "18:30", "19:30", 40, "open"],
  [11, "musculation", 3, "17:00", "19:00", 70, "filled", null, 34],
  [5, "cours_collectifs", 6, "18:00", "19:00", 42, "filled", DEMO_COACH, 4],
  [4, "yoga", -3, "09:00", "10:15", 50, "done", null, 15],
  [14, "aquagym", -6, "10:30", "11:30", 35, "done", null, 27],
  [13, "pilates", 3, "18:00", "19:00", 42, "open", DEMO_COACH],
  [12, "pilates", 2, "08:00", "09:00", 40, "filled", null, 8],
  [3, "cours_collectifs", 4, "12:30", "13:15", 35, "open"],
  [10, "yoga", 2, "19:00", "20:15", 50, "cancelled"],
  [2, "cross_training", -1, "07:00", "08:00", 40, "done", null, 18],
  [8, "musculation", 5, "09:00", "11:00", 65, "open"],
  [10, "yoga", 1, "18:00", "19:15", 50, "filled", null, 41],
  [1, "pilates", -4, "12:30", "13:30", 40, "done", DEMO_COACH, 11],
];

// ---------------------------------------------------------------- immobilier
const AGENCIES = [
  ["Agence Côte Basque Immobilier", "Biarritz", "22 avenue Édouard VII", 43.4840, -1.5595],
  ["Adour Habitat Gestion", "Bayonne", "6 rue Thiers", 43.4920, -1.4760],
  ["Chiberta Immobilier", "Anglet", "40 avenue de Biarritz", 43.4835, -1.5250],
].map(([name, commune, address, lat, lng], i) => ({ id: id("21000000", i + 1), name, commune, address, lat, lng }));

const ARTISANS = [
  ["Plomberie Etxeberri", "Bayonne", ["plomberie"], [["kbis", "verified"], ["decennale", "verified"]], 43.4950, -1.4700],
  ["Elec'Adour", "Anglet", ["electricite"], [["kbis", "verified"], ["qualifelec", "verified"]], 43.4880, -1.5100],
  ["Atelier Peinture Larralde", "Biarritz", ["peinture"], [["kbis", "verified"], ["decennale", "pending"]], 43.4780, -1.5580],
  ["Serrurerie du Port", "Bayonne", ["serrurerie"], [["kbis", "verified"], ["rc_pro", "verified"]], 43.4930, -1.4720],
  ["Diag Pays Basque", "Biarritz", ["diagnostic"], [["diagnostiqueur", "verified"], ["rc_pro", "verified"]], 43.4700, -1.5520],
  ["Multiservices Ostalamendi", "Anglet", ["plomberie", "peinture"], [["kbis", "verified"], ["decennale", "verified"]], 43.4800, -1.5180],
].map(([name, commune, skills, creds, lat, lng], i) => ({ id: id("31000000", i + 1), name, commune, skills, creds, lat, lng }));

const INTERVENTIONS = [
  [0, "diagnostic", 2, "09:00", "11:00", 180, "open", 4],
  [1, "plomberie", 1, "14:00", "16:00", 140, "filled", 0],
  [2, "electricite", 3, "08:30", "12:30", 260, "open", 1],
  [1, "serrurerie", -2, "10:00", "11:00", 90, "done", 3],
];

// ---------------------------------------------------------------- SQL
const out = [];
const sql = (s) => out.push(s);

sql(`-- Fichier généré par scripts/generate-seed.mjs — ne pas modifier à la main.
-- Données fictives de démonstration (Bayonne, Anglet, Biarritz).
set session timezone to 'Europe/Paris';
`);

sql("-- Comptes de démo (mot de passe commun, voir DEMO.md)");
for (const u of Object.values(USERS)) {
  sql(`insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new)
values ('00000000-0000-0000-0000-000000000000', ${q(u.id)}, 'authenticated', 'authenticated', ${q(u.email)},
  extensions.crypt(${q(DEMO_PASSWORD)}, extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', ${q(JSON.stringify({ full_name: u.name }))}, now(), now(), '', '', '', '');
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), ${q(u.id)}, ${q(u.id)},
  ${q(JSON.stringify({ sub: u.id, email: u.email, email_verified: true }))}, 'email', now(), now(), now());
insert into public.profiles (id, role, full_name) values (${q(u.id)}, ${q(u.role)}, ${q(u.name)});
`);
}

sql("-- Salles");
sql(`insert into public.venues (id, owner_id, vertical, name, commune, address, lat, lng, phone) values
${VENUES.map((v) => `  (${q(v.id)}, ${q(v.owner)}, 'sport', ${q(v.name)}, ${q(v.commune)}, ${q(v.address)}, ${v.lat}, ${v.lng}, ${q(v.phone)})`).join(",\n")};
`);

sql("-- Coachs");
sql(`insert into public.providers (id, user_id, vertical, display_name, bio, commune, lat, lng, radius_km, min_hourly_rate_cents, rating, missions_count) values
${COACHES.map((c, i) => `  (${q(c.id)}, ${q(c.user)}, 'sport', ${q(c.name)}, ${q(c.bio)}, ${q(c.commune)}, ${c.lat}, ${c.lng}, ${c.radius}, ${c.rate * 100}, ${c.rating}, ${8 + ((i * 7) % 40)})`).join(",\n")};
`);
sql(`insert into public.provider_skills (provider_id, skill) values
${COACHES.flatMap((c) => c.skills.map((s) => `  (${q(c.id)}, ${q(s)})`)).join(",\n")};
`);
let credN = 0;
const insertCredentials = (providers) =>
  sql(`insert into public.credentials (id, provider_id, kind, status, expires_on, verified_at) values
${providers
  .flatMap((c) =>
    c.creds.map(([kind, status, exp]) => {
      credN += 1;
      const expires = exp ?? (status === "verified" ? "2029-06-30" : null);
      return `  (${q(id("60000000", credN))}, ${q(c.id)}, ${q(kind)}, ${q(status)}, ${q(expires)}, ${status === "verified" ? "now() - interval '40 days'" : "null"})`;
    }),
  )
  .join(",\n")};
`);
insertCredentials(COACHES);
sql(`insert into public.availabilities (provider_id, weekday, start_time, end_time) values
${COACHES.flatMap((c) => PATTERNS[c.pattern].map(([d, s, e]) => `  (${q(c.id)}, ${d}, ${q(s)}, ${q(e)})`)).join(",\n")};
`);
sql(`insert into public.favorites (venue_id, provider_id) values
${FAVORITES.map((c) => `  (${q(ATRIUM.id)}, ${q(c.id)})`).join(",\n")};
`);

sql("-- Créneaux et offres");
let offerN = 0;
const offerRows = [];
const slotRows = SLOTS.map(([vIdx, skill, day, start, end, euros, status, forced, delay], i) => {
  const venue = VENUES[vIdx];
  const slotId = id("40000000", i + 1);
  const ranked = COACHES.filter((c) => eligible(c, skill))
    .map((c) => ({ c, d: km(venue, c) }))
    .filter(({ c, d }) => d <= c.radius)
    .sort((a, b) => a.d - b.d);
  let picks = ranked.slice(0, 3);
  if (forced && !picks.some((p) => p.c === forced)) {
    picks = [{ c: forced, d: km(venue, forced) }, ...picks.slice(0, 2)];
  }
  const assigned = ["filled", "done"].includes(status) ? (forced ?? picks[0]?.c ?? null) : null;
  const published = status === "done" ? `${at(day, start)} - interval '3 days'` : `now() - interval '${(i % 5) + 1} hours'`;
  if (status !== "cancelled") {
    picks.forEach(({ c, d }, k) => {
      offerN += 1;
      const favorite = vIdx === 0 && FAVORITES.includes(c);
      const reason = [favorite ? "Favori" : null, "Diplôme ✓", d < 1 ? "< 1 km" : `${Math.round(d)} km`, "disponible"]
        .filter(Boolean)
        .join(" · ");
      let offerStatus = "pending";
      if (assigned) offerStatus = c === assigned ? "accepted" : "expired";
      else if (status === "open" && skill === "musculation" && k === 2) offerStatus = "declined";
      const score = Math.round((favorite ? 40 : 0) + (c.rating / 5) * 40 + Math.max(0, 1 - d / 10) * 20);
      offerRows.push(
        `  (${q(id("50000000", offerN))}, ${q(slotId)}, ${q(c.id)}, ${score}, ${Math.round(d * 10) / 10}, ${q(reason)}, ${q(offerStatus)}, ${published} + interval '1 minute', ${offerStatus === "pending" ? "null" : `${published} + interval '${delay ?? 20} minutes'`})`,
      );
    });
  }
  const filledAt = assigned ? `${published} + interval '${delay} minutes'` : "null";
  return `  (${q(slotId)}, ${q(venue.id)}, ${q(skill)}, ${at(day, start)}, ${at(day, end)}, ${euros * 100}, ${q(status)}, 10, ${q(assigned?.id)}, ${published}, ${filledAt})`;
});
sql(`insert into public.slots (id, venue_id, skill, starts_at, ends_at, rate_cents, status, search_radius_km, assigned_provider_id, published_at, filled_at) values
${slotRows.join(",\n")};
`);
sql(`insert into public.offers (id, slot_id, provider_id, score, distance_km, reason, status, created_at, responded_at) values
${offerRows.join(",\n")};
`);

sql("-- Verticale immobilier (configuration de démonstration)");
sql(`insert into public.venues (id, vertical, name, commune, address, lat, lng) values
${AGENCIES.map((a) => `  (${q(a.id)}, 'immobilier', ${q(a.name)}, ${q(a.commune)}, ${q(a.address)}, ${a.lat}, ${a.lng})`).join(",\n")};
`);
sql(`insert into public.providers (id, vertical, display_name, bio, commune, lat, lng, radius_km, min_hourly_rate_cents, rating) values
${ARTISANS.map((a, i) => `  (${q(a.id)}, 'immobilier', ${q(a.name)}, 'Entreprise artisanale du Pays basque, interventions sous 48 h.', ${q(a.commune)}, ${a.lat}, ${a.lng}, 20, ${4500 + i * 500}, ${(4.3 + (i % 3) * 0.2).toFixed(1)})`).join(",\n")};
`);
sql(`insert into public.provider_skills (provider_id, skill) values
${ARTISANS.flatMap((a) => a.skills.map((s) => `  (${q(a.id)}, ${q(s)})`)).join(",\n")};
`);
insertCredentials(ARTISANS);
sql(`insert into public.slots (id, venue_id, skill, starts_at, ends_at, rate_cents, status, search_radius_km, assigned_provider_id, published_at, filled_at) values
${INTERVENTIONS.map(([aIdx, skill, day, start, end, euros, status, artisan], i) => {
  const assigned = ["filled", "done"].includes(status) ? ARTISANS[artisan].id : null;
  return `  (${q(id("41000000", i + 1))}, ${q(AGENCIES[aIdx].id)}, ${q(skill)}, ${at(day, start)}, ${at(day, end)}, ${euros * 100}, ${q(status)}, 15, ${q(assigned)}, now() - interval '1 day', ${assigned ? "now() - interval '1 day' + interval '25 minutes'" : "null"})`;
}).join(",\n")};
`);

await writeFile(new URL("../supabase/seed.sql", import.meta.url), out.join("\n"));
console.log(`✓ supabase/seed.sql — ${VENUES.length} salles, ${COACHES.length} coachs, ${SLOTS.length} créneaux, ${offerN} offres`);
