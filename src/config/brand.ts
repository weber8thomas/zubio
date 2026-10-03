/**
 * Identité de marque, centralisée ici : changer le nom, le slogan,
 * les couleurs ou le logo se fait à cet unique endroit.
 */
export const brand = {
  name: "Zubio",
  /** Forme utilisée dans le logotype (toujours en minuscules). */
  wordmark: "zubio",
  slogan: "Le bon coach, au bon créneau.",
  description:
    "Zubio relie les salles de sport du Pays basque aux coachs disponibles : une salle publie un créneau, les coachs compatibles le reçoivent, le premier qui accepte est confirmé.",
  locale: "fr-FR",
  timeZone: "Europe/Paris",
  colors: {
    red: "#D7263D",
    redHover: "#B51E31",
    redLight: "#FDECEE",
    white: "#FFFFFF",
    surface: "#FAFAFA",
    text: "#111111",
    textSecondary: "#5F6368",
    border: "#E8E8E8",
    success: "#1E8E3E",
    warning: "#C77700",
  },
  logo: {
    full: "/brand/logo-full.svg",
    symbol: "/brand/logo-symbol.svg",
    whiteOnRed: "/brand/logo-white-on-red.svg",
    monoBlack: "/brand/logo-mono-black.svg",
  },
  /** Commission prélevée sur chaque mission (facture d'exemple). */
  commissionRate: 0.15,
} as const;
