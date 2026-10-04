// Zone de lancement : le seul endroit qui connaît la géographie de la démo.
// Pour ouvrir une autre ville, changer ce fichier et les données (src/data).
export const MARKET = {
  name: "Bayonne · Anglet · Biarritz",
  center: { lat: 43.488, lng: -1.505 },
  /** Au-delà, on considère que Zubio n'est pas encore disponible. */
  coverageKm: 25,
  defaultRadiusKm: 10,
  /** Géocodage gratuit sans clé (France). */
  geocoder: "https://api-adresse.data.gouv.fr/search/",
};

/** Mois maximum entre aujourd'hui et la date d'un créneau. */
export const MAX_MONTHS_AHEAD = 3;
