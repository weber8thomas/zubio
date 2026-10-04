import { BILLING } from "@/config/billing";
import { coachById } from "@/data/coaches";
import { coachLegal } from "@/data/legal";
import { today } from "./date";
import type { State } from "./store";

// Fiscalité d'un coach micro-entrepreneur : chiffre d'affaires, franchise de TVA,
// cotisations estimées, récapitulatif annuel transmis par la plateforme (DAC7).

export function coachYear(s: State, coachId: string) {
  const year = today().slice(0, 4);
  const legal = coachLegal(coachId);
  const mine = s.slots.filter((x) => x.coachId === coachId && x.date.startsWith(year));
  const done = mine.filter((x) => x.status === "done");
  const viaZubio = legal.ytd + done.reduce((t, x) => t + x.price, 0);
  const upcoming = mine.filter((x) => x.status === "filled").reduce((t, x) => t + x.price, 0);
  const ratio = viaZubio / BILLING.franchise.base;
  return {
    year,
    regime: legal.regime,
    revenue: viaZubio,
    upcoming,
    sessions: Math.round(legal.ytd / 38) + done.length,
    ratio,
    franchise: ratio >= 1 ? ("depasse" as const) : ratio >= 0.85 ? ("proche" as const) : ("ok" as const),
  };
}

/** Récapitulatif annuel DAC7 : montants bruts par trimestre, commissions, transactions. */
export function dac7(s: State, coachId: string) {
  const y = coachYear(s, coachId);
  const weights = [0.22, 0.27, 0.21, 0.3];
  const quarters = weights.map((w) => Math.round(y.revenue * w));
  quarters[3] = y.revenue - quarters[0] - quarters[1] - quarters[2];
  return { ...y, coach: coachById(coachId), quarters, fees: 0 };
}

/** Texte du récapitulatif annuel envoyé au coach (téléchargeable). */
export function dac7Text(s: State, coachId: string) {
  const r = dac7(s, coachId);
  const e = (n: number) => `${n.toLocaleString("fr-FR")} €`;
  return [
    `RÉCAPITULATIF ANNUEL DES TRANSACTIONS ${r.year} (document de démonstration)`,
    `Opérateur de plateforme : ${BILLING.platform.name}, SIREN ${BILLING.platform.siren}`,
    `Prestataire : ${r.coach.name}`,
    "",
    `Montant brut perçu via la plateforme : ${e(r.revenue)}`,
    ...r.quarters.map((q, i) => `  Trimestre ${i + 1} : ${e(q)}`),
    `Nombre de prestations : ${r.sessions}`,
    `Commissions et frais retenus : ${e(r.fees)}`,
    "",
    "Ces montants sont également déclarés à l'administration fiscale (directive DAC7, art. 1649 ter A et suivants du CGI).",
    "Pensez à les reporter dans votre déclaration de revenus et à les déclarer à l'Urssaf. Informations : impots.gouv.fr, autoentrepreneur.urssaf.fr.",
  ].join("\n");
}
