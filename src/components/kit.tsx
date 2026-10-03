import { Dumbbell, Flame, Flower, PersonStanding, UsersRound, Waves, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { type OfferStatus, type SkillId, type SlotStatus, skillLabel } from "@/data/demo";
import { cn } from "@/lib/utils";

// Petits composants partagés par les trois espaces.

const SKILL_ICONS: Record<SkillId, LucideIcon> = {
  pilates: PersonStanding,
  yoga: Flower,
  cross: Flame,
  collectifs: UsersRound,
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
        size === "sm" && "size-9 rounded-[11px]",
        size === "md" && "size-12 rounded-[14px]",
        size === "lg" && "size-14 rounded-[16px]",
      )}
      style={{ background: `var(--skill-${skill}-bg)`, color: `var(--skill-${skill}-fg)` }}
    >
      <Icon className={size === "lg" ? "size-7" : size === "md" ? "size-[22px]" : "size-[18px]"} strokeWidth={2} aria-hidden />
    </span>
  );
}

export function SkillChip({ skill }: { skill: SkillId }) {
  const Icon = SKILL_ICONS[skill];
  return (
    <span
      className="inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-semibold"
      style={{ background: `var(--skill-${skill}-bg)`, color: `var(--skill-${skill}-fg)` }}
    >
      <Icon className="size-3.5" strokeWidth={2.25} aria-hidden />
      {skillLabel(skill)}
    </span>
  );
}

const AVATAR_TONES = ["pilates", "yoga", "cross", "collectifs", "muscu", "aquagym"] as const;

/** Portrait du coach (photos de démo randomuser.me), initiales à défaut. */
export function Avatar({ name, id, size = "md" }: { name: string; id?: string; size?: "sm" | "md" | "lg" }) {
  const box = cn(
    "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold ring-2 ring-card",
    size === "sm" && "size-8 text-xs",
    size === "md" && "size-11 text-sm",
    size === "lg" && "size-16 text-xl",
  );
  if (id) return <img src={`${import.meta.env.BASE_URL}avatars/${id}.jpg`} alt="" className={cn(box, "object-cover")} loading="lazy" />;
  const tone = AVATAR_TONES[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_TONES.length];
  return (
    <span className={box} style={{ background: `var(--skill-${tone}-bg)`, color: `var(--skill-${tone}-fg)` }} aria-hidden>
      {name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
    </span>
  );
}

// Statuts « Ligne Z » : anneau ○ = ouvert, point ● = confirmé.
const STATUS: Record<SlotStatus | OfferStatus, { label: string; tone: "open" | "done" | "off" }> = {
  open: { label: "Ouvert", tone: "open" },
  filled: { label: "Confirmé", tone: "done" },
  done: { label: "Terminé", tone: "off" },
  pending: { label: "Proposé", tone: "open" },
  accepted: { label: "Accepté", tone: "done" },
  declined: { label: "Refusé", tone: "off" },
  expired: { label: "Expiré", tone: "off" },
};

export function Status({ status }: { status: SlotStatus | OfferStatus }) {
  const { label, tone } = STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-semibold whitespace-nowrap",
        tone === "open" && "bg-primary-soft text-primary-ink",
        tone === "done" && "bg-success-soft text-success-ink",
        tone === "off" && "bg-muted text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "size-2 rounded-full",
          tone === "open" && "ring-2 ring-primary ring-inset",
          tone === "done" && "bg-success",
          tone === "off" && "bg-muted-foreground/40",
        )}
      />
      {label}
    </span>
  );
}

export function Stat({ label, value, icon: Icon, hint }: { label: string; value: ReactNode; icon: LucideIcon; hint?: string }) {
  return (
    <div className="flex flex-col rounded-3xl bg-card p-4 shadow-soft ring-1 ring-border/60">
      <span className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="size-[18px]" strokeWidth={2} aria-hidden />
      </span>
      <p className="mt-auto pt-4 font-heading text-[26px] leading-none font-extrabold tabular-nums">{value}</p>
      <p className="mt-1.5 truncate text-sm text-muted-foreground">{label}</p>
      {hint && <p className="truncate text-xs text-muted-foreground/80">{hint}</p>}
    </div>
  );
}

/** Pile de portraits (coachs sollicités). */
export function AvatarStack({ people, max = 4 }: { people: { id: string; name: string }[]; max?: number }) {
  return (
    <span className="flex -space-x-2">
      {people.slice(0, max).map((p) => (
        <Avatar key={p.id} name={p.name} id={p.id} size="sm" />
      ))}
      {people.length > max && (
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold ring-2 ring-card">+{people.length - max}</span>
      )}
    </span>
  );
}

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-heading text-[17px] font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
