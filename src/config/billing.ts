// Paramètres de facturation et de fiscalité (France). Valeurs 2026, à faire valider
// par un expert-comptable avant tout usage réel.
export const BILLING = {
  platform: { name: "Zubio SAS", siren: "000 000 000", address: "Adresse de démonstration", vat: "FR00 000000000" },
  /** Commission de la plateforme, facturée à la salle. */
  commissionRate: 0.15,
  vatRate: 0.2,
  /** Franchise en base de TVA (art. 293 B du CGI), prestations de services. */
  franchise: { base: 37_500, majore: 41_250 },
  /** Plafond du régime micro-entreprise, prestations de services. */
  microCeiling: 83_600,
  /** Taux indicatif de cotisations sociales d'un micro-entrepreneur (réglable par le coach). */
  socialRate: 0.246,
  /** Délai de paiement affiché sur les factures (jours). */
  paymentDays: 30,
};
