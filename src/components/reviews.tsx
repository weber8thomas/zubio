import { Check, ChevronDown, Star } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ClassChip, stagger } from "@/components/kit";
import { coachById } from "@/data/coaches";
import { type Review, STRENGTHS, ratingBreakdown, reviewsOf } from "@/data/reviews";
import { venueById } from "@/lib/store";
import { cn } from "@/lib/utils";

// Avis laissés par les salles : synthèse lisible, points forts, puis avis détaillés.

const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });

/** « il y a 5 jours », « il y a 2 semaines », « le mois dernier ». */
export const since = (days: number) => (days < 7 ? rtf.format(-days, "day") : days < 30 ? rtf.format(-Math.round(days / 7), "week") : rtf.format(-Math.round(days / 30), "month"));

/** Étoiles avec remplissage partiel (4,8 → quatre étoiles et presque une cinquième). */
export function Stars({ value, size = "sm", className }: { value: number; size?: "sm" | "md"; className?: string }) {
  const s = size === "md" ? "size-[18px]" : "size-3.5";
  const row = (cls: string) => Array.from({ length: 5 }, (_, i) => <Star key={i} className={cn(s, "shrink-0", cls)} strokeWidth={0} aria-hidden />);
  return (
    <span role="img" aria-label={`${String(value).replace(".", ",")} sur 5`} className={cn("relative inline-flex shrink-0 gap-0.5", className)}>
      {row("fill-border-strong")}
      <span className="absolute inset-y-0 left-0 flex gap-0.5 overflow-hidden" style={{ width: `${(value / 5) * 100}%` }}>
        {row("fill-warning")}
      </span>
    </span>
  );
}

const initials = (name: string) =>
  name
    .split(/[\s–-]+/)
    .filter((w) => /^[A-ZÀ-Ý]/.test(w))
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

function ReviewCard({ r, i }: { r: Review; i: number }) {
  const v = venueById(r.venueId);
  return (
    <motion.article {...stagger(i)} className="flex flex-col rounded-3xl bg-card p-4 ring-1 ring-border/70 sm:p-5">
      <header className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-muted font-heading text-sm font-extrabold text-ink-soft" aria-hidden>
          {initials(v.name)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="leading-snug font-semibold">{v.name}</h3>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] text-muted-foreground">
            <Stars value={r.rating} />
            <span>
              {v.town} · {since(r.daysAgo)}
            </span>
          </p>
        </div>
      </header>
      <p className="mt-3 flex-1 text-base leading-relaxed text-pretty">{r.text}</p>
      <footer className="mt-4 flex flex-wrap items-center gap-1.5">
        <ClassChip id={r.classId} />
        {r.strengths.map((s) => (
          <span key={s} className="inline-flex h-7 items-center gap-1 rounded-full bg-muted px-2.5 text-[13px] font-medium text-ink-soft">
            <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
            {s}
          </span>
        ))}
      </footer>
    </motion.article>
  );
}

/** Note globale, répartition 5 → 1, points forts et avis des salles. */
export function Reviews({ coachId }: { coachId: string }) {
  const c = coachById(coachId);
  const list = [...reviewsOf(coachId)].sort((a, b) => a.daysAgo - b.daysAgo);
  const bars = ratingBreakdown(coachId);
  const total = Math.max(1, bars.reduce((a, b) => a + b, 0));
  const strengths = STRENGTHS.map((s) => [s, list.filter((r) => r.strengths.includes(s)).length] as const)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);
  const [all, setAll] = useState(false);
  const shown = all ? list : list.slice(0, 4);

  return (
    <>
      <motion.div {...stagger(0)} className="grid gap-5 rounded-3xl bg-card p-4 ring-1 ring-border/70 sm:p-5 @2xl:grid-cols-2 @2xl:gap-6">
        <div className="flex items-center gap-5">
          <div className="shrink-0 text-center">
            <p className="font-heading text-[44px] leading-none font-extrabold tabular-nums">{c.rating.toFixed(1)}</p>
            <Stars value={c.rating} size="md" className="mt-2" />
            <p className="mt-1.5 text-[13px] text-muted-foreground">{c.reviews} avis</p>
          </div>
          <ol className="min-w-0 flex-1 space-y-1.5" aria-label="Répartition des notes">
            {bars.map((n, i) => (
              <li key={i} className="flex items-center gap-2 text-[13px]">
                <span className="w-2.5 text-right font-semibold tabular-nums">{5 - i}</span>
                <Star className="size-3 shrink-0 fill-warning" strokeWidth={0} aria-hidden />
                <span className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                  <motion.span className="block h-full rounded-full bg-warning" initial={{ width: 0 }} animate={{ width: `${(n / total) * 100}%` }} transition={{ duration: 0.6, delay: 0.1 + i * 0.05, ease: [0.2, 0.8, 0.2, 1] }} />
                </span>
                <span className="w-7 text-right text-muted-foreground tabular-nums">
                  {n}
                  <span className="sr-only"> avis à {5 - i} étoiles</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        {strengths.length > 0 && (
          <div className="border-t border-border/70 pt-4 @2xl:border-t-0 @2xl:border-l @2xl:pt-0 @2xl:pl-6">
            <p className="text-sm font-semibold">Ce que les salles soulignent</p>
            <ul className="mt-2.5 flex flex-wrap gap-2">
              {strengths.map(([s, n]) => (
                <li key={s} className="inline-flex h-9 items-center gap-2 rounded-full bg-muted pr-1.5 pl-3 text-sm font-medium">
                  {s}
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-card px-1.5 text-xs font-bold tabular-nums">
                    {n}
                    <span className="sr-only"> avis</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>

      {list.length > 0 ? (
        <>
          <div className="mt-3 grid gap-3 @2xl:grid-cols-2">
            <AnimatePresence initial={false}>
              {shown.map((r, i) => (
                <ReviewCard key={`${r.venueId}-${r.daysAgo}`} r={r} i={i} />
              ))}
            </AnimatePresence>
          </div>
          {list.length > 4 && (
            <button
              type="button"
              onClick={() => setAll(!all)}
              aria-expanded={all}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-card text-sm font-semibold ring-1 ring-border/70 transition hover:ring-border-strong sm:w-auto sm:px-5"
            >
              {all ? "Voir moins d'avis" : `Voir les ${list.length} avis détaillés`}
              <ChevronDown className={cn("size-4 transition-transform", all && "rotate-180")} aria-hidden />
            </button>
          )}
        </>
      ) : (
        <p className="mt-3 rounded-3xl border border-dashed border-border-strong p-4 text-center text-sm text-muted-foreground">Les avis détaillés apparaîtront après ses prochaines missions.</p>
      )}
    </>
  );
}
