import { type Coach, type Point, type Slot, FAVORITES } from "@/data/demo";

export function distanceKm(a: Point, b: Point) {
  const r = (d: number) => (d * Math.PI) / 180;
  const h = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

/** Jour ISO (1 = lundi … 7 = dimanche) dans `offset` jours. */
export function isoWeekday(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.getDay() || 7;
}

const hours = (s: Slot) => (+s.end.slice(0, 2) * 60 + +s.end.slice(3) - (+s.start.slice(0, 2) * 60 + +s.start.slice(3))) / 60;

export type Match = { coach: Coach; km: number; favorite: boolean; reason: string };
export type Miss = "Discipline" | "Diplôme" | "Distance" | "Disponibilité" | "Tarif";

/**
 * Filtres éliminatoires (discipline, diplôme vérifié, distance, disponibilité, tarif),
 * puis classement : favoris, note, distance.
 */
export function match(slot: Slot, venue: Point, coaches: Coach[]) {
  const matches: Match[] = [];
  const misses: Record<Miss, number> = { Discipline: 0, Diplôme: 0, Distance: 0, Disponibilité: 0, Tarif: 0 };
  const weekday = isoWeekday(slot.day);

  for (const coach of coaches) {
    const km = distanceKm(venue, coach);
    const miss: Miss | null = !coach.skills.includes(slot.skill)
      ? "Discipline"
      : !coach.diploma.verified
        ? "Diplôme"
        : km > Math.min(coach.radiusKm, slot.radiusKm)
          ? "Distance"
          : !coach.days.includes(weekday) || slot.start < coach.hours[0] || slot.end > coach.hours[1]
            ? "Disponibilité"
            : slot.price / hours(slot) < coach.minHourly
              ? "Tarif"
              : null;
    if (miss) {
      misses[miss]++;
      continue;
    }
    const favorite = FAVORITES.includes(coach.id);
    const dist = km < 1 ? "< 1 km" : `${Math.round(km)} km`;
    matches.push({ coach, km, favorite, reason: [favorite && "Favori", "Diplôme ✓", dist].filter(Boolean).join(" · ") });
  }

  matches.sort((a, b) => +b.favorite - +a.favorite || b.coach.rating - a.coach.rating || a.km - b.km);
  return { matches, misses };
}
