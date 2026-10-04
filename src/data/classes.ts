import { Dumbbell, Flower, HeartPulse, Music, Waves, Zap, type LucideIcon } from "lucide-react";
import type { CategoryId, ClassId } from "./types";

// Catalogue des cours, établi à partir de l'offre des salles du lancement
// (Les Mills, aquatique, CAF, pilates…). Chaque cours exige une certification.

export const CATEGORIES: Record<CategoryId, { label: string; icon: LucideIcon }> = {
  lesmills: { label: "Les Mills", icon: Zap },
  cardio: { label: "Cardio", icon: HeartPulse },
  renfo: { label: "Renforcement", icon: Dumbbell },
  douceur: { label: "Douceur", icon: Flower },
  aqua: { label: "Aquatique", icon: Waves },
  danse: { label: "Danse", icon: Music },
};

export const CERTS: Record<string, string> = {
  "bpjeps-af": "BPJEPS Activités de la forme",
  "cqp-als": "CQP Animateur loisir sportif",
  staps: "Licence STAPS",
  "bpjeps-aan": "BPJEPS Activités aquatiques",
  bnssa: "BNSSA",
  pilates: "Certification Pilates mat",
  reformer: "Certification Pilates Reformer",
  yoga200: "Yoga Alliance RYT 200",
  zumba: "Licence Zumba (ZIN)",
};

type ClassDef = { id: ClassId; label: string; category: CategoryId; requires: string[]; duration: number; avgPrice: number };

const lm = (id: ClassId, label: string, duration: number): ClassDef => ({
  id,
  label,
  category: "lesmills",
  requires: [`lm-${id}`],
  duration,
  avgPrice: duration >= 55 ? 42 : 34,
});

export const CLASSES: ClassDef[] = [
  lm("bodypump", "BodyPump", 55),
  lm("bodycombat", "BodyCombat", 55),
  lm("bodyattack", "BodyAttack", 55),
  lm("bodybalance", "BodyBalance", 55),
  lm("rpm", "RPM", 45),
  lm("core", "CORE", 30),
  lm("shbam", "SH'BAM", 45),
  lm("grit", "GRIT", 30),
  lm("bodystep", "BodyStep", 55),
  lm("shapes", "Shapes", 45),
  { id: "hiit", label: "HIIT", category: "cardio", requires: ["bpjeps-af", "cqp-als"], duration: 45, avgPrice: 35 },
  { id: "circuit", label: "Circuit training", category: "cardio", requires: ["bpjeps-af", "cqp-als"], duration: 45, avgPrice: 33 },
  { id: "step", label: "Step", category: "cardio", requires: ["bpjeps-af", "cqp-als"], duration: 45, avgPrice: 32 },
  { id: "cycling", label: "Cycling", category: "cardio", requires: ["bpjeps-af", "cqp-als"], duration: 45, avgPrice: 34 },
  { id: "cardioboxe", label: "Cardio-boxe", category: "cardio", requires: ["bpjeps-af"], duration: 45, avgPrice: 36 },
  { id: "crosstraining", label: "Cross-training", category: "cardio", requires: ["bpjeps-af", "staps"], duration: 60, avgPrice: 40 },
  { id: "caf", label: "Cuisses-abdos-fessiers", category: "renfo", requires: ["bpjeps-af", "cqp-als"], duration: 45, avgPrice: 32 },
  { id: "totalbody", label: "Total body", category: "renfo", requires: ["bpjeps-af", "cqp-als"], duration: 45, avgPrice: 33 },
  { id: "trx", label: "TRX", category: "renfo", requires: ["bpjeps-af"], duration: 45, avgPrice: 35 },
  { id: "smallgroup", label: "Small group training", category: "renfo", requires: ["bpjeps-af", "staps"], duration: 60, avgPrice: 45 },
  { id: "pilates", label: "Pilates", category: "douceur", requires: ["pilates", "bpjeps-af"], duration: 60, avgPrice: 40 },
  { id: "reformer", label: "Pilates Reformer", category: "douceur", requires: ["reformer"], duration: 50, avgPrice: 48 },
  { id: "yoga", label: "Yoga vinyasa", category: "douceur", requires: ["yoga200"], duration: 60, avgPrice: 40 },
  { id: "yin", label: "Yin yoga", category: "douceur", requires: ["yoga200"], duration: 75, avgPrice: 42 },
  { id: "stretching", label: "Stretching", category: "douceur", requires: ["bpjeps-af", "cqp-als", "pilates", "yoga200"], duration: 45, avgPrice: 30 },
  { id: "aquagym", label: "Aquagym", category: "aqua", requires: ["bnssa", "bpjeps-aan"], duration: 45, avgPrice: 32 },
  { id: "aquabike", label: "Aquabike", category: "aqua", requires: ["bnssa", "bpjeps-aan"], duration: 45, avgPrice: 34 },
  { id: "aquatraining", label: "Aquatraining", category: "aqua", requires: ["bpjeps-aan"], duration: 45, avgPrice: 35 },
  { id: "zumba", label: "Zumba", category: "danse", requires: ["zumba"], duration: 60, avgPrice: 36 },
  { id: "dance", label: "Dance fitness", category: "danse", requires: ["cqp-als", "bpjeps-af"], duration: 60, avgPrice: 34 },
];

export const classById = (id: ClassId) => CLASSES.find((c) => c.id === id)!;

/** Libellé lisible d'une certification (licences Les Mills comprises). */
export const certLabel = (id: string) =>
  id.startsWith("lm-") ? `Licence Les Mills ${classById(id.slice(3) as ClassId).label}` : (CERTS[id] ?? id);

export const LEVELS = { tous: "Tous niveaux", debutant: "Débutant", intermediaire: "Intermédiaire", avance: "Avancé" } as const;
export const KINDS = { remplacement: "Remplacement", regulier: "Cours régulier", evenement: "Masterclass · événement" } as const;
export const AUDIENCES = ["Adultes", "Seniors", "Ados", "Prénatal", "Tout public"];
export const LANGUAGES = ["Français", "Anglais", "Espagnol", "Basque"];
