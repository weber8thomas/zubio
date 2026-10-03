/** Questions fréquentes de l'assistant. Les mots-clés sont comparés sans accents ni majuscules. */
export interface FaqEntry {
  id: string;
  question: string;
  keywords: string[];
  answer: string;
}

export const FAQ: FaqEntry[] = [
  {
    id: "publier",
    question: "Comment publier un créneau ?",
    keywords: ["publier", "creer un creneau", "nouveau creneau", "ajouter un creneau"],
    answer:
      "Onglet « Publier » : choisissez la discipline, la date, l'heure de début, la durée et le tarif, puis « Publier et trouver un coach ». Les coachs compatibles reçoivent l'offre immédiatement.",
  },
  {
    id: "matching",
    question: "Comment les coachs sont-ils choisis ?",
    keywords: ["matching", "choisi", "selection", "compatible", "pourquoi ce coach", "classement"],
    answer:
      "Un coach n'est proposé que s'il a la discipline, un diplôme vérifié et valide, s'il est dans le rayon, disponible sur tout le créneau et si le tarif atteint son minimum. Ensuite : vos favoris d'abord, puis la note, puis la distance. La raison est affichée sous chaque coach.",
  },
  {
    id: "diplome",
    question: "Comment faire vérifier un diplôme ?",
    keywords: ["diplome", "verifie", "verification", "certification", "valider", "en attente"],
    answer:
      "Déclarez-le dans « Profil » : il passe « En attente ». L'équipe Zubio le contrôle puis le marque « Vérifié ». Tant qu'il est en attente, il ne compte pas pour le matching.",
  },
  {
    id: "commission",
    question: "Combien coûte Zubio ?",
    keywords: ["commission", "prix", "cout", "frais", "tarif zubio", "combien"],
    answer:
      "Le coach perçoit le tarif affiché. La salle paie en plus 15 % de frais de service, détaillés sur chaque facture. Dans cette démo, aucun paiement n'est effectué.",
  },
  {
    id: "facture",
    question: "Où trouver mes factures ?",
    keywords: ["facture", "paiement", "payer", "reglement", "imprimer"],
    answer:
      "Onglet « Factures » de l'espace salle : une facture par mission confirmée, imprimable. Ce sont des factures d'exemple, sans paiement réel.",
  },
  {
    id: "sans-reponse",
    question: "Personne ne répond à mon créneau, que faire ?",
    keywords: ["personne", "pas de reponse", "aucun coach", "elargir", "rayon", "urgent"],
    answer:
      "Sur la page du créneau, « Simuler 10 min sans réponse » élargit le rayon de 10 km et sollicite de nouveaux coachs. Vous pouvez aussi augmenter le tarif lors de la prochaine publication.",
  },
  {
    id: "dispos",
    question: "Comment modifier mes disponibilités ?",
    keywords: ["disponibilite", "dispo", "horaire", "planning", "semaine"],
    answer:
      "Onglet « Dispos » : ajoutez ou supprimez des plages par jour. Seuls les créneaux qui tiennent entièrement dans une plage vous sont proposés.",
  },
  {
    id: "refuser",
    question: "Que se passe-t-il si je refuse une offre ?",
    keywords: ["refuser", "decliner", "refus", "pas dispo"],
    answer:
      "Rien de grave : l'offre disparaît de votre liste et la salle le voit aussitôt. Refuser n'affecte pas votre note.",
  },
  {
    id: "premier",
    question: "Deux coachs acceptent en même temps ?",
    keywords: ["premier", "en meme temps", "deja pris", "trop tard", "deux coachs"],
    answer:
      "Le premier qui accepte est confirmé. La base traite l'acceptation en une seule opération : les autres offres du créneau expirent automatiquement.",
  },
  {
    id: "donnees",
    question: "Qui voit mes données ?",
    keywords: ["donnees", "confidentialite", "rgpd", "securite", "qui voit"],
    answer:
      "Une salle ne voit que ses créneaux et le profil public des coachs. Un coach ne voit que ses offres et missions. Ces règles sont appliquées par la base elle-même. Les données sont hébergées dans l'Union européenne.",
  },
  {
    id: "contact",
    question: "Parler à quelqu'un",
    keywords: ["humain", "contact", "telephone", "appeler", "conseiller", "aide"],
    answer: "L'équipe Zubio répond du lundi au vendredi, de 9 h à 18 h, à bonjour@zubio.demo (adresse de démonstration).",
  },
];

export const STATUS_KEYWORDS = [
  "ou en est",
  "mon creneau",
  "mes creneaux",
  "statut",
  "etat",
  "mes offres",
  "ma mission",
  "mes missions",
  "prochaine",
];

export function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function findFaq(message: string): FaqEntry | undefined {
  const text = normalize(message);
  let best: { entry: FaqEntry; hits: number } | undefined;
  for (const entry of FAQ) {
    const hits = entry.keywords.filter((k) => text.includes(k)).length;
    if (hits > 0 && (!best || hits > best.hits)) best = { entry, hits };
  }
  return best?.entry;
}

export function isStatusQuestion(message: string) {
  const text = normalize(message);
  return STATUS_KEYWORDS.some((k) => text.includes(k));
}
