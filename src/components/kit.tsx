import { Activity, Dumbbell, Flame, Flower2, Music, Waves, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { type OfferStatus, type SkillId, type SlotStatus, skillLabel } from "@/data/demo";
import { cn } from "@/lib/utils";

// Petits composants partagés par les trois espaces.

export const SKILL_ICONS: Record<SkillId, LucideIcon> = {
  pilates: Activity,
  yoga: Flower2,
  cross: Flame,
  collectifs: Music,
  muscu: Dumbbell,
  aquagym: Waves,
};

/** Pastille de discipline : icône sur fond teinté (couleurs dans index.css). */
export function SkillTile({ skill, size = "md" }: { skill: SkillId; size?: "sm" | "md" | "lg" }) {
  const Icon = SKILL_ICONS[skill];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        size === "sm" && "size-8 rounded-xl",
        size === "md" && "size-11 rounded-2xl",
        size === "lg" && "size-14 rounded-[20px]",
      )}
      style={{ background: `var(--skill-${skill}-bg)`, color: `var(--skill-${skill}-fg)` }}
    >
      <Icon className={size === "lg" ? "size-7" : size === "md" ? "size-5" : "size-4"} strokeWidth={2} aria-hidden />
    </span>
  );
}

export function SkillChip({ skill }: { skill: SkillId }) {
  const Icon = SKILL_ICONS[skill];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ background: `var(--skill-${skill}-bg)`, color: `var(--skill-${skill}-fg)` }}
    >
      <Icon className="size-3.5" strokeWidth={2.25} aria-hidden />
      {skillLabel(skill)}
    </span>
  );
}

const AVATAR_TONES = ["pilates", "yoga", "cross", "collectifs", "muscu", "aquagym"] as const;

/** Avatar à initiales, teinte stable dérivée du nom. */
export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const tone = AVATAR_TONES[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_TONES.length];
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-heading font-bold",
        size === "sm" && "size-8 text-xs",
        size === "md" && "size-11 text-sm",
        size === "lg" && "size-16 text-xl",
      )}
      style={{ background: `var(--skill-${tone}-bg)`, color: `var(--skill-${tone}-fg)` }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

const STATUS: Record<SlotStatus | OfferStatus, { label: string; tone: string }> = {
  open: { label: "En recherche", tone: "warning" },
  filled: { label: "Confirmé", tone: "success" },
  done: { label: "Terminé", tone: "muted" },
  pending: { label: "Proposé", tone: "warning" },
  accepted: { label: "Accepté", tone: "success" },
  declined: { label: "Refusé", tone: "muted" },
  expired: { label: "Expiré", tone: "muted" },
};

export function Status({ status }: { status: SlotStatus | OfferStatus }) {
  const { label, tone } = STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        tone === "warning" && "bg-warning-soft text-warning-ink",
        tone === "success" && "bg-success-soft text-success-ink",
        tone === "muted" && "bg-muted text-muted-foreground",
      )}
    >
      <span className={cn("size-1.5 rounded-full", tone === "warning" ? "bg-warning animate-pulse" : tone === "success" ? "bg-success" : "bg-muted-foreground/50")} />
      {label}
    </span>
  );
}

export function Stat({ label, value, icon: Icon, hint }: { label: string; value: ReactNode; icon: LucideIcon; hint?: string }) {
  return (
    <div className="rounded-3xl bg-card p-4 shadow-soft ring-1 ring-border/60">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4" strokeWidth={2} aria-hidden />
        {label}
      </div>
      <p className="mt-2 font-heading text-3xl font-bold tracking-tight">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-bold tracking-tight">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

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

export const time = (hm: string) => (hm.endsWith(":00") ? `${+hm.slice(0, 2)} h` : `${+hm.slice(0, 2)} h ${hm.slice(3)}`);
