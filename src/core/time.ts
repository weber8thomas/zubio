import type { TimeRange, WeeklyAvailability } from "./types";

const ISO_WEEKDAYS: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

/** Jour ISO et heure locale (« HH:MM ») d'un instant, dans un fuseau donné. */
export function localWeekdayAndTime(iso: string, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { weekday: ISO_WEEKDAYS[get("weekday")], time: `${get("hour")}:${get("minute")}` };
}

export function durationHours(range: TimeRange): number {
  return (new Date(range.endsAt).getTime() - new Date(range.startsAt).getTime()) / 3_600_000;
}

export function rangesOverlap(a: TimeRange, b: TimeRange): boolean {
  return new Date(a.startsAt) < new Date(b.endsAt) && new Date(b.startsAt) < new Date(a.endsAt);
}

/** Le créneau tient-il entièrement dans une des plages hebdomadaires ? */
export function coversRange(
  availabilities: WeeklyAvailability[],
  range: TimeRange,
  timeZone: string,
): boolean {
  const start = localWeekdayAndTime(range.startsAt, timeZone);
  const end = localWeekdayAndTime(range.endsAt, timeZone);
  if (start.weekday !== end.weekday) return false;
  return availabilities.some(
    (a) =>
      a.weekday === start.weekday &&
      a.start.slice(0, 5) <= start.time &&
      a.end.slice(0, 5) >= end.time,
  );
}
