const dayFormat = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short" });

/** « Aujourd'hui », « Demain », ou « jeu. 8 oct. ». */
export function dayLabel(offset: number) {
  if (offset === 0) return "Aujourd'hui";
  if (offset === 1) return "Demain";
  if (offset === -1) return "Hier";
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return dayFormat.format(d).replace(/^./, (c) => c.toUpperCase());
}

/** « 18:30–19:30 » */
export const hours = (start: string, end: string) => `${start}–${end}`;
