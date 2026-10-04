// Identités légales de démonstration : numéros fictifs, jamais ceux des vraies entreprises.

export type VatRegime = "franchise" | "assujetti";

/** Statut fiscal des coachs (micro-entrepreneurs) et chiffre d'affaires déjà réalisé dans l'année. */
export const COACH_LEGAL: Record<string, { regime: VatRegime; ytd: number }> = {
  maialen: { regime: "franchise", ytd: 21_480 },
  yann: { regime: "assujetti", ytd: 39_900 },
  antton: { regime: "franchise", ytd: 33_150 },
  oihana: { regime: "franchise", ytd: 26_300 },
};

export const coachLegal = (id: string) => COACH_LEGAL[id] ?? { regime: "franchise" as VatRegime, ytd: 12_000 };

/** SIREN fictif et stable, dérivé de l'identifiant (préfixe 999 : hors plage réelle de démo). */
export function demoSiren(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 1_000_000;
  const n = `999${String(h).padStart(6, "0")}`;
  return `${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`;
}
