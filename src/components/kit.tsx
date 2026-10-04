import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { CATEGORIES, classById } from "@/data/classes";
import type { ApplicationStatus, ClassId, SlotStatus } from "@/data/types";
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

/** Portrait du coach (photos de démo randomuser.me). */
export function Avatar({ id, size = "md", className }: { id: string; size?: "xs" | "sm" | "md" | "lg" | "xl"; className?: string }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}avatars/${id}.jpg`}
      alt=""
      loading="lazy"
      className={cn(
        "shrink-0 rounded-full bg-muted object-cover ring-2 ring-card",
        size === "xs" && "size-6",
        size === "sm" && "size-8",
        size === "md" && "size-11",
        size === "lg" && "size-16",
        size === "xl" && "size-24",
        className,
      )}
    />
  );
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
  selected: { label: "Retenu", tone: "done" },
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
      <span className="flex size-9 items-center justify-center rounded-xl bg-muted text-ink-soft">
        <Icon className="size-[18px]" strokeWidth={2} aria-hidden />
      </span>
      <p className="mt-auto pt-4 font-heading text-[26px] leading-none font-extrabold tabular-nums">{value}</p>
      <p className="mt-1.5 truncate text-sm text-muted-foreground">{label}</p>
    </>
  );
  const cls = "flex flex-col rounded-3xl bg-card p-4 shadow-soft ring-1 ring-border/70";
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
        <h2 className="font-heading text-[17px] font-semibold">{title}</h2>
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

/** Liste dont les éléments apparaissent en cascade. */
export const stagger = (i: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.32, delay: Math.min(i, 8) * 0.04, ease: [0.2, 0.8, 0.2, 1] as const },
});

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="group inline-flex h-10 items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
      <span className="transition group-hover:-translate-x-0.5" aria-hidden>
        ←
      </span>
      {children}
    </a>
  );
}

export const PageTitle = ({ children, sub }: { children: ReactNode; sub?: ReactNode }) => (
  <header className="mb-6">
    <h1 className="font-heading text-[26px] leading-tight font-extrabold sm:text-[32px]">{children}</h1>
    {sub && <p className="mt-1 text-muted-foreground">{sub}</p>}
  </header>
);
