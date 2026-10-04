import { BadgeCheck, Briefcase, CalendarDays, CircleCheckBig, Clock, Euro, Gauge, Languages, MapPin, Navigation, Package, Repeat, Timer, Users, Zap, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { Avatar, ClassTile, FigureValue, Section, stagger } from "@/components/kit";
import { Stars, Reviews } from "@/components/reviews";
import { Certifications, Skills } from "@/components/skills";
import { CLASSES, classById, KINDS, LEVELS } from "@/data/classes";
import { coachById } from "@/data/coaches";
import { reliability } from "@/data/reviews";
import type { Point, Slot } from "@/data/types";
import { dayLabel, duration, endOf, toMin } from "@/lib/date";
import { distanceKm, km } from "@/lib/geo";
import { type CertOverrides, certStatus } from "@/lib/matching";
import { venueById } from "@/lib/store";
import { cn } from "@/lib/utils";
import { VenueLogo } from "@/components/venue";

// Diplômes généralistes : ils ouvrent beaucoup de cours sans dire la spécialité du coach.
const GENERIC = ["bpjeps-af", "cqp-als", "staps"];

/**
 * Cours qu'un coach peut donner, d'après ses certifications vérifiées.
 * Spécialités d'abord (licence dédiée), puis leur famille, puis le reste.
 */
export const teachable = (coachId: string, overrides: CertOverrides) => {
  const coach = coachById(coachId);
  const list = CLASSES.map((c) => ({ c, via: c.requires.filter((r) => certStatus(coach, r, overrides) === "verified") })).filter((x) => x.via.length);
  const special = list.filter((x) => x.via.some((r) => !GENERIC.includes(r)));
  const rank = (x: (typeof list)[number]) => (special.includes(x) ? 0 : special.some((y) => y.c.category === x.c.category) ? 1 : 2);
  return list.sort((a, b) => rank(a) - rank(b)).map((x) => x.c.id);
};

const hour = (t: string) => t.replace(/^0/, "").replace(":00", "h").replace(":", "h");

const WEEK = ["L", "M", "M", "J", "V", "S", "D"];
const DAYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** [1,2,3,4,5] → « Du lundi au vendredi », [6,7] → « Samedi et dimanche ». */
function daysLabel(days: number[]) {
  const d = [...days].sort((a, b) => a - b);
  const run = d.every((x, i) => !i || x === d[i - 1] + 1);
  if (d.length === 1) return cap(DAYS[d[0] - 1]);
  if (run && d.length > 2) return `Du ${DAYS[d[0] - 1]} au ${DAYS[d.at(-1)! - 1]}`;
  return cap(`${d.slice(0, -1).map((x) => DAYS[x - 1]).join(", ")} et ${DAYS[d.at(-1)! - 1]}`);
}

// Frise des disponibilités : de 6 h à 22 h.
const DAY_START = 6 * 60;
const DAY_END = 22 * 60;
const pos = (hm: string) => Math.min(100, Math.max(0, ((toMin(hm) - DAY_START) / (DAY_END - DAY_START)) * 100));

/** Semaine type : une colonne par jour, les plages dessinées à l'échelle. */
function Week({ coachId }: { coachId: string }) {
  const c = coachById(coachId);
  return (
    <div className="rounded-3xl bg-card p-4 ring-1 ring-border/70 sm:p-5">
      <div className="flex gap-2">
        <div className="w-8 shrink-0" aria-hidden />
        <div className="grid flex-1 grid-cols-7 gap-1.5">
          {WEEK.map((d, i) => (
            <p key={i} className="text-center font-heading text-sm font-extrabold" aria-hidden>
              {d}
            </p>
          ))}
        </div>
      </div>
      <div className="mt-2 flex gap-2">
        <div className="relative h-44 w-8 shrink-0 text-[11px] leading-none text-muted-foreground tabular-nums" aria-hidden>
          {["6h", "10h", "14h", "18h", "22h"].map((t, i) => (
            <span key={t} className="absolute right-0 -translate-y-1/2" style={{ top: `${i * 25}%` }}>
              {t}
            </span>
          ))}
        </div>
        <ul className="grid flex-1 grid-cols-7 gap-1.5">
          {DAYS.map((name, i) => {
            const plages = c.availability.filter((a) => a.days.includes(i + 1)).sort((a, b) => a.from.localeCompare(b.from));
            return (
              <li key={name} className="relative h-44 overflow-hidden rounded-xl bg-muted/70">
                <span className="sr-only">
                  {cap(name)} : {plages.length ? plages.map((a) => `${hour(a.from)} à ${hour(a.to)}`).join(", ") : "indisponible"}
                </span>
                {[25, 50, 75].map((t) => (
                  <span key={t} className="absolute inset-x-0 border-t border-dashed border-border-strong/60" style={{ top: `${t}%` }} aria-hidden />
                ))}
                {plages.map((a, j) => (
                  <motion.span
                    key={j}
                    aria-hidden
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.45, delay: 0.1 + i * 0.03, ease: [0.2, 0.8, 0.2, 1] }}
                    className="absolute inset-x-1 origin-top rounded-lg bg-primary-soft ring-1 ring-primary/40 ring-inset"
                    style={{ top: `${pos(a.from)}%`, height: `${pos(a.to) - pos(a.from)}%` }}
                  />
                ))}
              </li>
            );
          })}
        </ul>
      </div>
      <ul className="mt-4 flex flex-col gap-1.5 border-t border-border/70 pt-4 text-[15px]">
        {c.availability.map((a, i) => (
          <li key={i} className="flex flex-wrap items-baseline justify-between gap-x-3">
            <span className="font-semibold">{daysLabel(a.days)}</span>
            <span className="text-ink-soft tabular-nums">
              {hour(a.from)} – {hour(a.to)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Fiche coach complète : identité, fiabilité, cours par famille, certifications, avis, disponibilités. */
export function CoachProfile({ coachId, from, overrides, actions }: { coachId: string; from?: Point; overrides: CertOverrides; actions?: ReactNode }) {
  const c = coachById(coachId);
  const r = reliability(coachId);
  const verified = c.certs.filter((x) => certStatus(c, x.id, overrides) === "verified").length;
  const figures: [LucideIcon, string, string, string][] = [
    [CircleCheckBig, "Présence", `${r.presence} %`, "missions honorées"],
    [Timer, "Réponse", `${r.responseMin} min`, "délai moyen"],
    [Repeat, "Réembauche", `${r.rehire} %`, "des salles reviennent"],
    [Briefcase, "Missions", String(c.missions), `depuis ${r.since}`],
  ];

  return (
    <>
      <motion.header initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }} className="overflow-hidden rounded-3xl bg-card ring-1 ring-border/70">
        <div className="flex items-center gap-4 p-4 sm:gap-6 sm:p-6">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
            <Avatar id={c.id} size="xl" className="size-20 ring-4 ring-background sm:size-28" />
          </motion.div>
          <div className="min-w-0 flex-1">
            <h1 className="font-heading text-[22px] leading-tight font-extrabold text-balance sm:text-[30px]">{c.name}</h1>
            <p className="mt-1.5 flex items-center gap-1.5 text-[15px] text-ink-soft">
              <MapPin className="size-4 shrink-0" aria-hidden />
              <span>
                {c.town}
                {from && ` · à ${km(distanceKm(from, c))}`}
              </span>
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[15px]">
              <Stars value={c.rating} />
              <b className="tabular-nums">{c.rating.toFixed(1)}</b>
              <span className="text-muted-foreground">· {c.reviews} avis</span>
            </p>
          </div>
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 border-t border-border/70 px-4 py-3 text-sm text-ink-soft sm:px-6">
          <li className="flex items-center gap-1.5">
            <Languages className="size-4 shrink-0" aria-hidden /> {c.languages.join(", ")}
          </li>
          <li className="flex items-center gap-1.5">
            <CalendarDays className="size-4 shrink-0" aria-hidden /> Sur Zubio depuis {r.since}
          </li>
          {verified > 0 && (
            <li className="flex items-center gap-1.5 font-medium text-success-ink">
              <BadgeCheck className="size-4 shrink-0" aria-hidden /> {verified} certification{verified > 1 ? "s" : ""} vérifiée{verified > 1 ? "s" : ""}
            </li>
          )}
        </ul>
        <dl className="grid grid-cols-2 gap-px border-t border-border/70 bg-border/70 sm:grid-cols-4">
          {figures.map(([Icon, k, v, hint], i) => (
            <motion.div key={k} {...stagger(i + 1)} className="bg-card px-4 py-3.5 sm:px-6 sm:py-4">
              <dt className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground">
                <Icon className="size-3.5" aria-hidden />
                {k}
              </dt>
              <dd className="mt-1">
                <FigureValue value={v} />
                <span className="mt-1 block text-[13px] leading-snug text-muted-foreground">{hint}</span>
              </dd>
            </motion.div>
          ))}
        </dl>
      </motion.header>

      <div className={cn("flex flex-col", actions && "lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8")}>
        {actions && <aside className="order-first mt-5 lg:sticky lg:top-36 lg:order-none lg:col-start-2 lg:row-start-1 lg:mt-8 lg:self-start">{actions}</aside>}
        <div className="@container min-w-0">
          <Section title="À propos">
            <p className="max-w-prose text-[17px] leading-relaxed text-pretty">{c.bio}</p>
            <dl className="mt-4 flex flex-wrap gap-2">
              {(
                [
                  [Navigation, "Rayon", `${c.radiusKm} km`],
                  [Euro, "Tarif", `dès ${c.minHourly} €/h`],
                ] as const
              ).map(([Icon, k, v]) => (
                <div key={k} className="flex h-11 items-center gap-2 rounded-full bg-card px-4 text-sm ring-1 ring-border/70">
                  <Icon className="size-4 text-muted-foreground" aria-hidden />
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section title="Cours qu'elle ou il peut donner">
            <Skills coachId={coachId} overrides={overrides} />
          </Section>

          <Section title="Certifications et justificatifs">
            <Certifications coachId={coachId} overrides={overrides} />
          </Section>

          <Section title="Avis des salles">
            <Reviews coachId={coachId} />
          </Section>

          <Section title="Disponibilités habituelles">
            <Week coachId={coachId} />
          </Section>
        </div>
      </div>
    </>
  );
}

/** En-tête d'un créneau : cours, date, salle. */
export function SlotHeader({ slot, status, venueHref }: { slot: Slot; status?: ReactNode; venueHref?: string }) {
  const c = classById(slot.classId);
  const v = venueById(slot.venueId);
  return (
    <div className="flex items-start gap-4">
      <ClassTile id={slot.classId} size="lg" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-heading text-[22px] leading-tight font-extrabold sm:text-[28px]">{c.label}</h1>
          <p className="shrink-0 font-heading text-2xl font-extrabold whitespace-nowrap tabular-nums">{slot.price} €</p>
        </div>
        <p className="mt-0.5 font-medium">
          {dayLabel(slot.date, "long")} · {slot.start}–{endOf(slot.start, slot.duration)}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
          <VenueLogo venueId={v.id} size="xs" />
          {venueHref ? (
            <a href={venueHref} className="font-semibold text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-foreground">
              {v.name}
            </a>
          ) : (
            v.name
          )}{" "}
          · {v.town}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {status}
          {slot.urgent && (
            <span className="inline-flex h-7 items-center gap-1 rounded-full bg-warning-soft px-2.5 text-[13px] font-semibold text-warning-ink">
              <Zap className="size-3.5" aria-hidden /> Urgent
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/** Détails pratiques d'un créneau. */
export function SlotFacts({ slot }: { slot: Slot }) {
  const facts: [typeof Users, string, string][] = [
    [Clock, "Durée", duration(slot.duration)],
    [Users, "Public", `${slot.capacity} ${slot.audience.toLowerCase()}`],
    [Gauge, "Niveau", LEVELS[slot.level]],
    [Languages, "Langue", slot.language],
    [Repeat, "Type", slot.weeks > 1 ? `${KINDS[slot.kind]} · ${slot.weeks} semaines` : KINDS[slot.kind]],
    [Package, "Matériel", slot.equipment ? "Fourni par la salle" : "À apporter"],
  ];
  return (
    <div>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {facts.map(([Icon, k, v]) => (
          <div key={k} className="rounded-2xl bg-card p-3 ring-1 ring-border/70">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon className="size-3.5" aria-hidden />
              {k}
            </dt>
            <dd className="mt-1 text-sm font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
      {slot.notes && <p className="mt-3 rounded-2xl bg-muted/70 p-3 text-sm text-ink-soft">« {slot.notes} »</p>}
    </div>
  );
}

/** Moment signature : l'anneau ○ se remplit en ● et le tracé se dessine. */
export function Confirmed({ coachId, title, subtitle }: { coachId: string; title: string; subtitle: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 rounded-[26px] bg-success-soft p-4 sm:p-5">
      <svg viewBox="0 0 64 24" className="h-6 w-12 shrink-0 text-success sm:w-16" aria-hidden>
        <circle cx="6" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="3" />
        <motion.path d="M11 12H52" stroke="currentColor" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, delay: 0.15 }} />
        <motion.circle cx="57" cy="12" r="6" fill="currentColor" initial={{ scale: 0.6 }} animate={{ scale: [0.6, 1.15, 1] }} transition={{ delay: 0.55, duration: 0.5 }} style={{ transformOrigin: "57px 12px" }} />
      </svg>
      <Avatar id={coachId} size="lg" />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-success-ink">{title}</p>
        <p className="truncate text-lg font-bold">{coachById(coachId).name}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </motion.div>
  );
}

