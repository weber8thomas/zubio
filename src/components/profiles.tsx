import { BadgeCheck, Clock, Gauge, Languages, MapPin, Package, Repeat, Star, Users, X, Zap } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { Avatar, ClassChip, ClassTile, Section } from "@/components/kit";
import { CLASSES, certLabel, classById, KINDS, LEVELS } from "@/data/classes";
import { coachById } from "@/data/coaches";
import type { Point, Slot } from "@/data/types";
import { dayLabel, duration, endOf } from "@/lib/date";
import { distanceKm, km } from "@/lib/geo";
import { type CertOverrides, certStatus } from "@/lib/matching";
import { venueById } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Cours qu'un coach peut donner, d'après ses certifications vérifiées. */
export const teachable = (coachId: string, overrides: CertOverrides) => {
  const coach = coachById(coachId);
  return CLASSES.filter((c) => c.requires.some((r) => certStatus(coach, r, overrides) === "verified")).map((c) => c.id);
};

const WEEK = ["L", "M", "M", "J", "V", "S", "D"];

/** Fiche coach complète (photo, certifications, cours, disponibilités). */
export function CoachProfile({ coachId, from, overrides, actions }: { coachId: string; from?: Point; overrides: CertOverrides; actions?: ReactNode }) {
  const c = coachById(coachId);
  const classes = teachable(coachId, overrides);
  return (
    <>
      <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
          <Avatar id={c.id} size="xl" className="ring-4" />
        </motion.div>
        <div className="mt-4 sm:mt-0">
          <h1 className="font-heading text-[24px] leading-tight font-extrabold sm:text-[30px]">{c.name}</h1>
          <p className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground sm:justify-start">
            <span className="flex items-center gap-1">
              <Star className="size-4 fill-warning text-warning" aria-hidden />
              <b className="text-foreground">{c.rating.toFixed(1)}</b> ({c.reviews} avis)
            </span>
            <span>{c.missions} missions</span>
            <span className="flex items-center gap-1">
              <MapPin className="size-4" aria-hidden />
              {c.town}
              {from && ` · ${km(distanceKm(from, c))}`}
            </span>
          </p>
        </div>
      </div>
      {actions && <div className="mt-5">{actions}</div>}

      <p className="mt-6 text-[17px] leading-relaxed text-ink-soft">{c.bio}</p>

      <Section title="Cours qu'elle ou il peut donner">
        <div className="flex flex-wrap gap-1.5">
          {classes.length ? classes.map((id) => <ClassChip key={id} id={id} />) : <p className="text-muted-foreground">Aucun pour l'instant : certifications en attente.</p>}
        </div>
      </Section>

      <Section title="Certifications">
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {c.certs.map((cert) => {
            const status = certStatus(c, cert.id, overrides);
            return (
              <li key={cert.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-border/70">
                <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-[11px]", status === "verified" ? "bg-success-soft text-success-ink" : status === "rejected" ? "bg-primary-soft text-primary-ink" : "bg-warning-soft text-warning-ink")}>
                  {status === "verified" ? <BadgeCheck className="size-[18px]" /> : status === "rejected" ? <X className="size-[18px]" /> : <Clock className="size-[18px]" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{certLabel(cert.id)}</span>
                  <span className="text-xs text-muted-foreground">{status === "verified" ? "Vérifiée" : status === "rejected" ? "Refusée" : "En cours de vérification"}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section title="Disponibilités habituelles">
        <div className="grid grid-cols-7 gap-1.5">
          {WEEK.map((d, i) => {
            const plage = c.availability.filter((a) => a.days.includes(i + 1));
            return (
              <div key={i} className={cn("rounded-2xl p-2 text-center", plage.length ? "bg-primary-soft text-primary-ink" : "bg-muted text-muted-foreground")}>
                <p className="font-heading text-sm font-extrabold">{d}</p>
                <p className="mt-0.5 text-[10px] leading-tight font-medium tabular-nums">{plage.length ? plage.map((a) => a.from.replace(":00", "h")).join(" ") : "—"}</p>
              </div>
            );
          })}
        </div>
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Languages className="size-4" aria-hidden /> {c.languages.join(", ")}
          </span>
          <span>Jusqu'à {c.radiusKm} km</span>
          <span>Dès {c.minHourly} €/h</span>
        </p>
      </Section>
    </>
  );
}

/** En-tête d'un créneau : cours, date, salle. */
export function SlotHeader({ slot, status }: { slot: Slot; status?: ReactNode }) {
  const c = classById(slot.classId);
  const v = venueById(slot.venueId);
  return (
    <div className="flex items-start gap-4">
      <ClassTile id={slot.classId} size="lg" />
      <div className="min-w-0 flex-1">
        <h1 className="font-heading text-[22px] leading-tight font-extrabold sm:text-[28px]">{c.label}</h1>
        <p className="mt-0.5 font-medium">
          {dayLabel(slot.date, "long")} · {slot.start}–{endOf(slot.start, slot.duration)}
        </p>
        <p className="text-sm text-muted-foreground">
          {v.name} · {v.town}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {status}
          <span className="font-heading font-extrabold tabular-nums">{slot.price} €</span>
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
    [Users, "Participants", `${slot.capacity} attendus`],
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
      <p className="mt-2 text-xs text-muted-foreground">Public : {slot.audience}</p>
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

