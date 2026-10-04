import { classById } from "@/data/classes";
import { COACHES } from "@/data/coaches";
import { VENUES } from "@/data/venues";
import { dayLabel } from "./date";
import { type State, slotById } from "./store";

const PAGES: Record<string, string> = {
  salle: "Tableau de bord",
  "salle/coachs": "Coachs du coin",
  "salle/factures": "Factures",
  "salle/profil": "Profil de la salle",
  "salle/publier": "Publier",
  coach: "Explorer",
  "coach/planning": "Planning",
  "coach/profil": "Profil",
  admin: "Vue d'ensemble",
};

/** Nom lisible d'une page, pour les liens « retour ». */
export function routeLabel(hash: string, s: State) {
  const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  const [space, page, id] = parts;
  if (!space) return "Accueil";
  if (PAGES[parts.join("/")]) return PAGES[parts.join("/")];
  if ((page === "creneau" || page === "mission") && id) {
    const slot = slotById(s, id);
    return slot ? `${classById(slot.classId).label} · ${dayLabel(slot.date)} ${slot.start}` : "Créneau";
  }
  if (page === "coach" && id) return COACHES.find((c) => c.id === id)?.name ?? "Coach";
  if (page === "salle" && id) return VENUES.find((v) => v.id === id)?.name ?? "Salle";
  if (page === "facture") return "Facture";
  if (page === "diplome") return "Certification";
  return "Retour";
}
