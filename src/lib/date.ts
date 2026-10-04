// Dates locales au format AAAA-MM-JJ (pas de fuseau : la démo vit dans le navigateur).

export const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const parse = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (s: string, n: number) => {
  const d = parse(s);
  d.setDate(d.getDate() + n);
  return iso(d);
};

export const today = () => iso(new Date());

/** Jour ISO : 1 = lundi … 7 = dimanche. */
export const weekday = (s: string) => parse(s).getDay() || 7;

export const toMin = (hm: string) => +hm.slice(0, 2) * 60 + +hm.slice(3, 5);
export const toHm = (min: number) => `${String(Math.floor(min / 60) % 24).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
export const endOf = (start: string, duration: number) => toHm(toMin(start) + duration);

const long = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const short = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short" });

/** « Aujourd'hui », « Demain », « jeu. 8 oct. » (ou forme longue). */
export function dayLabel(s: string, format: "short" | "long" = "short") {
  const diff = Math.round((parse(s).getTime() - parse(today()).getTime()) / 86_400_000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Demain";
  if (diff === -1) return "Hier";
  const text = (format === "long" ? long : short).format(parse(s));
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export const duration = (min: number) => (min < 60 ? `${min} min` : `${Math.floor(min / 60)} h${min % 60 ? ` ${String(min % 60).padStart(2, "0")}` : ""}`);
