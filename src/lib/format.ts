import { brand } from "@/config/brand";

const euro = new Intl.NumberFormat(brand.locale, { style: "currency", currency: "EUR" });
const euroRound = new Intl.NumberFormat(brand.locale, {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

/** Montant en centimes → « 45 € » (ou « 45,50 € » si nécessaire). */
export function formatMoney(cents: number, exact = false) {
  return (exact || cents % 100 !== 0 ? euro : euroRound).format(cents / 100);
}

const dayFormat = new Intl.DateTimeFormat(brand.locale, {
  timeZone: brand.timeZone,
  weekday: "long",
  day: "numeric",
  month: "long",
});
const shortDayFormat = new Intl.DateTimeFormat(brand.locale, {
  timeZone: brand.timeZone,
  weekday: "short",
  day: "numeric",
  month: "short",
});
const timeFormat = new Intl.DateTimeFormat(brand.locale, {
  timeZone: brand.timeZone,
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDay(iso: string, short = false) {
  const text = (short ? shortDayFormat : dayFormat).format(new Date(iso));
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** « 18 h 30 », ou « 19 h » pour une heure pleine. */
export function formatTime(iso: string) {
  const [h, m] = timeFormat.format(new Date(iso)).split(":");
  return m === "00" ? `${Number(h)} h` : `${Number(h)} h ${m}`;
}

/** « Mardi 7 octobre · 18 h 30 – 19 h 30 » */
export function formatSlotWhen(startsAt: string, endsAt: string, short = false) {
  return `${formatDay(startsAt, short)} · ${formatTime(startsAt)} – ${formatTime(endsAt)}`;
}

/** Date du jour dans le fuseau de la marque, au format AAAA-MM-JJ. */
export function todayIso() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: brand.timeZone }).format(new Date());
}

/** Convertit une date et une heure locales (Europe/Paris) en instant ISO UTC. */
export function localToIso(date: string, time: string) {
  const naive = new Date(`${date}T${time}:00Z`);
  const offsetFormat = new Intl.DateTimeFormat("en-US", {
    timeZone: brand.timeZone,
    timeZoneName: "longOffset",
  });
  const offset = (when: Date) => {
    const name = offsetFormat.formatToParts(when).find((p) => p.type === "timeZoneName")?.value ?? "GMT";
    const match = /GMT([+-])(\d{2}):(\d{2})/.exec(name);
    return match ? (match[1] === "-" ? -1 : 1) * (Number(match[2]) * 60 + Number(match[3])) : 0;
  };
  const first = new Date(naive.getTime() - offset(naive) * 60_000);
  return new Date(naive.getTime() - offset(first) * 60_000).toISOString();
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m ? `${h} h ${String(m).padStart(2, "0")}` : `${h} h`;
}
