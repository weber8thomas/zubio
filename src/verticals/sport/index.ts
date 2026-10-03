import type { VerticalConfig } from "@/core/vertical";

/** Verticale par défaut : salles de sport et coachs. */
export const sport: VerticalConfig = {
  id: "sport",
  name: "Sport",
  accent: { base: "#D7263D", hover: "#B51E31", light: "#FDECEE" },
  labels: {
    venue: "Salle",
    venues: "Salles",
    provider: "Coach",
    providers: "Coachs",
    slot: "Créneau",
    slots: "Créneaux",
    skill: "Discipline",
    skills: "Disciplines",
    credential: "Diplôme",
    credentials: "Diplômes",
  },
  credentials: [
    { id: "bpjeps_af", label: "BPJEPS Activités de la forme" },
    { id: "bpjeps_aan", label: "BPJEPS Activités aquatiques et de la natation" },
    { id: "cqp_als", label: "CQP Animateur de loisir sportif" },
    { id: "staps", label: "Licence STAPS Entraînement sportif" },
    { id: "pilates_cert", label: "Certification Pilates Matwork" },
    { id: "yoga_cert", label: "Certification Yoga 200 h" },
    { id: "bnssa", label: "BNSSA" },
  ],
  skills: [
    { id: "pilates", label: "Pilates", requires: [["pilates_cert", "bpjeps_af"]] },
    { id: "yoga", label: "Yoga", requires: [["yoga_cert"]] },
    { id: "cross_training", label: "Cross-training", requires: [["bpjeps_af", "staps"]] },
    { id: "cours_collectifs", label: "Cours collectifs", requires: [["cqp_als", "bpjeps_af"]] },
    { id: "musculation", label: "Musculation", requires: [["bpjeps_af", "staps"]] },
    { id: "aquagym", label: "Aquagym", requires: [["bpjeps_aan", "bnssa"]] },
  ],
  defaults: { durationMinutes: 60, rateCents: 4500, searchRadiusKm: 10 },
};
