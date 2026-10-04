import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { type ReactNode, useState } from "react";
import { CATEGORIES, classById } from "@/data/classes";
import { COACHES } from "@/data/coaches";
import type { ApplicationStatus, ClassId, SlotStatus } from "@/data/types";
import { routeLabel } from "@/lib/nav";
import { back, previous } from "@/lib/router";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

// Composants partagés par les trois espaces.

const tone = (id: ClassId) => ({ background: `var(--cat-${classById(id).category}-bg)`, color: `var(--cat-${classById(id).category}-fg)` });

/** Pastille du cours : icône de catégorie sur fond teinté. */
export function ClassTile({ id, size = "md" }: { id: ClassId; size?: "sm" | "md" | "lg" }) {
  const Icon = CATEGORIES[classById(id).category].icon;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        size === "sm" && "size-9 rounded-[11px]",
        size === "md" && "size-12 rounded-[14px]",
        size === "lg" && "size-14 rounded-[16px]",
      )}
      style={tone(id)}
    >
      <Icon className={size === "lg" ? "size-7" : size === "md" ? "size-[22px]" : "size-[18px]"} strokeWidth={2} aria-hidden />
    </span>
  );
}

export function ClassChip({ id }: { id: ClassId }) {
  const c = classById(id);
  return (
    <span className="inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-semibold whitespace-nowrap" style={tone(id)}>
      {c.category === "lesmills" && <span className="text-[10px] font-bold tracking-wide uppercase opacity-80">LM</span>}
      {c.label}
    </span>
  );
}

/** Portrait du coach (photos de démo randomuser.me), initiales si l'image manque. */
export function Avatar({ id, size = "md", className }: { id: string; size?: "xs" | "sm" | "md" | "lg" | "xl"; className?: string }) {
  const [broken, setBroken] = useState<string | null>(null);
  const cls = cn(
    "shrink-0 rounded-full bg-muted ring-2 ring-card",
    size === "xs" && "size-6 text-[9px]",
    size === "sm" && "size-8 text-xs",
    size === "md" && "size-11 text-sm",
    size === "lg" && "size-16 text-lg",
    size === "xl" && "size-24 text-2xl",
    className,
  );
  if (broken === id) {
    const name = COACHES.find((c) => c.id === id)?.name ?? id;
    const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    return (
      <span aria-hidden className={cn("inline-flex items-center justify-center font-heading font-semibold text-ink-soft", cls)}>
        {initials}
      </span>
    );
  }
  return <img src={`${import.meta.env.BASE_URL}avatars/${id}.jpg`} alt="" loading="lazy" onError={() => setBroken(id)} className={cn("object-cover", cls)} />;
}

export function AvatarStack({ ids, max = 4 }: { ids: string[]; max?: number }) {
  return (
    <span className="flex -space-x-2">
      {ids.slice(0, max).map((id) => (
        <Avatar key={id} id={id} size="sm" />
      ))}
      {ids.length > max && (
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold ring-2 ring-card">+{ids.length - max}</span>
      )}
    </span>
  );
}

// Statuts « Ligne Z » : anneau ○ = ouvert, point ● = confirmé.
type AnyStatus = SlotStatus | ApplicationStatus | "candidates";
const STATUS: Record<AnyStatus, { label: string; tone: "open" | "done" | "off" | "wait" }> = {
  open: { label: "Ouvert", tone: "open" },
  candidates: { label: "Candidatures", tone: "wait" },
  filled: { label: "Confirmé", tone: "done" },
  done: { label: "Terminé", tone: "off" },
  pending: { label: "Envoyée", tone: "wait" },
  selected: { label: "Confirmé", tone: "done" },
  rejected: { label: "Non retenu", tone: "off" },
  withdrawn: { label: "Retirée", tone: "off" },
};

export function Status({ status, label }: { status: AnyStatus; label?: string }) {
  const s = STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-semibold whitespace-nowrap",
        s.tone === "open" && "bg-primary-soft text-primary-ink",
        s.tone === "wait" && "bg-warning-soft text-warning-ink",
        s.tone === "done" && "bg-success-soft text-success-ink",
        s.tone === "off" && "bg-muted text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "size-2 rounded-full",
          s.tone === "open" && "ring-2 ring-primary ring-inset",
          s.tone === "wait" && "bg-warning",
          s.tone === "done" && "bg-success",
          s.tone === "off" && "bg-muted-foreground/40",
        )}
      />
      {label ?? s.label}
    </span>
  );
}

export function Stat({ label, value, icon: Icon, href }: { label: string; value: ReactNode; icon: LucideIcon; href?: string }) {
  const body = (
    <>
      <span className="hidden size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-ink-soft sm:flex">
        <Icon className="size-5" strokeWidth={2} aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block font-heading text-[26px] leading-none font-extrabold tabular-nums">{value}</span>
        <span className="mt-1 block text-sm leading-tight text-muted-foreground">{label}</span>
      </span>
    </>
  );
  const cls = "flex flex-col gap-3 rounded-3xl bg-card p-4 ring-1 ring-border/70 sm:flex-row sm:items-center";
  return href ? (
    <Tap href={href} className={cls}>
      {body}
    </Tap>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function Section({ title, action, children, className }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("mt-8", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-heading text-[17px] font-semibold text-balance">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export const Empty = ({ children }: { children: ReactNode }) => (
  <div className="rounded-3xl border border-dashed border-border-strong p-6 text-center text-muted-foreground">{children}</div>
);

/** Lien-carte avec retour tactile et léger soulèvement au survol. */
export function Tap({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return (
    <motion.a
      href={href}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn("block transition-shadow hover:shadow-lift", className)}
    >
      {children}
    </motion.a>
  );
}

/**
 * Carte créneau commune (tableau de bord salle, Explorer coach).
 * Avec `times`, la date passe en surtitre et une frise début ○──● fin remplace la pastille du cours.
 */
export function SlotCard({ href, classId, title, when, sub, price, footer, times }: { href: string; classId: ClassId; title: ReactNode; when: ReactNode; sub?: ReactNode; price: number; footer: ReactNode; times?: [string, string] }) {
  return (
    <Tap href={href} className="flex h-full flex-col rounded-3xl bg-card p-4 shadow-soft ring-1 ring-border/70">
      {times && <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{when}</p>}
      <div className="flex flex-1 gap-3">
        {times ? (
          <>
            <div className="flex w-12 shrink-0 flex-col items-end justify-between py-0.5 text-sm font-bold tabular-nums">
              <span>{times[0]}</span>
              <span className="text-muted-foreground">{times[1]}</span>
            </div>
            <div className="flex flex-col items-center py-1.5" aria-hidden>
              <span className="size-3 rounded-full border-[3px] border-primary bg-card" />
              <span className="w-[3px] flex-1 rounded-full bg-primary/30" />
              <span className="size-3 rounded-full bg-primary" />
            </div>
          </>
        ) : (
          <ClassTile id={classId} />
        )}
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[17px] leading-snug font-bold">{title}</p>
          {!times && <p className="text-sm text-muted-foreground">{when}</p>}
          {sub && <div className="text-sm text-muted-foreground">{sub}</div>}
        </div>
        <p className="shrink-0 font-heading text-lg font-extrabold whitespace-nowrap tabular-nums">{price} €</p>
      </div>
      <div className="mt-3 border-t border-border/70 pt-3">
        <div className="flex min-h-8 items-center justify-between gap-2">{footer}</div>
      </div>
    </Tap>
  );
}

/** Liste dont les éléments apparaissent en cascade. */
export const stagger = (i: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.32, delay: Math.min(i, 8) * 0.04, ease: [0.2, 0.8, 0.2, 1] as const },
});

/** Retour à la page d'où l'on vient (avec sa position), sinon à la page parente. */
export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  const state = useStore();
  const prev = previous();
  return (
    <a
      href={prev ?? href}
      onClick={(e) => (e.preventDefault(), back(href))}
      className="group inline-flex h-10 max-w-full items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
    >
      <span className="transition group-hover:-translate-x-0.5" aria-hidden>
        ←
      </span>
      <span className="truncate">{prev ? routeLabel(prev, state) : children}</span>
    </a>
  );
}

export const PageTitle = ({ children, sub }: { children: ReactNode; sub?: ReactNode }) => (
  <header className="mb-6">
    <h1 className="font-heading text-[26px] leading-tight font-extrabold text-balance sm:text-[32px]">{children}</h1>
    {sub && <p className="mt-1 text-muted-foreground">{sub}</p>}
  </header>
);

/** Déroulé « Ligne Z » : étapes passées ●, étape courante ○, à venir grisées. */
export function Steps({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="grid" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
      {steps.map((s, i) => (
        <li key={s} className="relative flex flex-col items-center gap-1.5 text-center text-[11px] leading-tight font-medium text-muted-foreground sm:text-xs">
          {i > 0 && (
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: i * 0.08 }}
              className={cn("absolute top-1.5 right-1/2 h-1 w-full origin-left", i <= current ? "bg-success" : "bg-border")}
            />
          )}
          <motion.span
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className={cn("relative z-10 size-4 rounded-full", i < current ? "bg-success" : i === current ? "border-[3px] border-primary bg-card" : "border-[3px] border-border-strong bg-card")}
          />
          <span className={cn("max-w-full px-0.5 break-words hyphens-auto", i <= current && "text-foreground")}>{s}</span>
        </li>
      ))}
    </ol>
  );
}
