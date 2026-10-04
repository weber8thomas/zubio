// Identité visuelle des salles : couleurs relevées sur leurs sites officiels (oct. 2026),
// accroche factuelle, monogramme. Le logo officiel n'est pas reproduit sans l'accord de la salle :
// déposer le fichier dans public/venues/<id>-logo.svg et renseigner `logo` pour l'afficher.
// Photos de couverture : Unsplash (licence Unsplash), illustratives.

export type Brand = { primary: string; accent: string; ink: string; tagline: string; mono: string; logo?: string };

export const BRANDS: Record<string, Brand> = {
  "oceania-bayonne": { primary: "#e34100", accent: "#0c4da2", ink: "#ffffff", tagline: "Salle de sport avec piscine, aquagym et fitness", mono: "OC" },
  "clark-powell-bayonne": { primary: "#020f47", accent: "#ca7eed", ink: "#ffffff", tagline: "Salle de sport immersive et cours collectifs", mono: "CP" },
  "baiona-training": { primary: "#b84452", accent: "#721a35", ink: "#ffffff", tagline: "Fitness, musculation et coaching 7j/7", mono: "BT" },
  "club-abdo-bayonne": { primary: "#eb353e", accent: "#1a1a1a", ink: "#ffffff", tagline: "Salle de sport et séances en groupe thématiques", mono: "CA" },
  "snb-fitness": { primary: "#27a12d", accent: "#212934", ink: "#ffffff", tagline: "Section fitness du club d'aviron de Bayonne", mono: "SNB" },
  "gochoa-anglet": { primary: "#2d8e59", accent: "#324353", ink: "#ffffff", tagline: "Salle de sport à taille humaine", mono: "GO" },
  "lagon-fitness-anglet": { primary: "#00a2a7", accent: "#016074", ink: "#ffffff", tagline: "Fitness et lagon d'eau de mer chauffé", mono: "LF" },
  "keepcool-anglet": { primary: "#66cc99", accent: "#171f2b", ink: "#171f2b", tagline: "Salle de sport 7j/7 et small groups", mono: "KC" },
  "maison-sportive-biarritz": { primary: "#103a31", accent: "#ea491e", ink: "#faf8e2", tagline: "Social club : pilates, reformer, hot, bike", mono: "MS" },
  "bestraining-biarritz": { primary: "#2b2f36", accent: "#d63b27", ink: "#ffffff", tagline: "Club de fitness et cours collectifs", mono: "BS" },
  "orange-bleue-biarritz": { primary: "#10113c", accent: "#1941ff", ink: "#ffffff", tagline: "Salle de sport, cours collectifs et coachs", mono: "OB" },
};

const FALLBACK: Brand = { primary: "#2b2f36", accent: "#d63b27", ink: "#ffffff", tagline: "Salle de sport", mono: "Z" };

export const brandOf = (venueId: string): Brand => BRANDS[venueId] ?? { ...FALLBACK, mono: venueId.slice(0, 2).toUpperCase() };
