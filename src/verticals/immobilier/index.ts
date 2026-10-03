import type { VerticalConfig } from "@/core/vertical";

/**
 * Verticale de démonstration : agences immobilières et artisans.
 * Seule la configuration et quelques données de démo existent.
 */
export const immobilier: VerticalConfig = {
  id: "immobilier",
  name: "Immobilier",
  accent: { base: "#1F6F5C", hover: "#17584A", light: "#E7F2EF" },
  labels: {
    venue: "Agence",
    venues: "Agences",
    provider: "Artisan",
    providers: "Artisans",
    slot: "Intervention",
    slots: "Interventions",
    skill: "Corps de métier",
    skills: "Corps de métier",
    credential: "Justificatif",
    credentials: "Justificatifs",
  },
  slotStatusLabels: { open: "En attente", filled: "Pourvue", cancelled: "Annulée", done: "Terminée" },
  credentials: [
    { id: "kbis", label: "Extrait Kbis de moins de 3 mois" },
    { id: "decennale", label: "Attestation d'assurance décennale" },
    { id: "rc_pro", label: "Responsabilité civile professionnelle" },
    { id: "qualifelec", label: "Qualification Qualifelec" },
    { id: "diagnostiqueur", label: "Certification diagnostiqueur immobilier" },
  ],
  skills: [
    { id: "plomberie", label: "Plomberie", requires: [["kbis"], ["decennale"]] },
    { id: "electricite", label: "Électricité", requires: [["kbis"], ["qualifelec", "decennale"]] },
    { id: "peinture", label: "Peinture", requires: [["kbis"], ["decennale"]] },
    { id: "serrurerie", label: "Serrurerie", requires: [["kbis"], ["rc_pro"]] },
    { id: "diagnostic", label: "Diagnostics immobiliers", requires: [["diagnostiqueur"], ["rc_pro"]] },
  ],
  defaults: { durationMinutes: 120, rateCents: 12000, searchRadiusKm: 15 },
};
