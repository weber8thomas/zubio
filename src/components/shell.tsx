import { Building2, ShieldCheck, UserRound, type LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand";
import { cn } from "@/lib/utils";

export type Tab = { href: string; label: string; icon: LucideIcon; active: boolean };

const SPACES = [
  { id: "salle", label: "Salle", icon: Building2 },
  { id: "coach", label: "Coach", icon: UserRound },
  { id: "admin", label: "Admin", icon: ShieldCheck },
];

/** Coque commune : en-tête avec sélecteur d'espace, onglets flottants en bas sur mobile, en haut sur ordinateur. */
export function Shell({ space, tabs, page, immersive = false, children }: { space: string; tabs: Tab[]; page: string; immersive?: boolean; children: ReactNode }) {
  return (
    <div className="min-h-dvh pb-32 md:pb-16">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <a href="#/" aria-label="Accueil Zubio" className="shrink-0 transition-transform active:scale-95">
            <Logo className="h-7" />
          </a>
          <nav aria-label="Espaces de démo" className="relative flex rounded-full bg-muted p-1">
            {SPACES.map(({ id, label, icon: Icon }) => (
              <a
                key={id}
                href={`#/${id}`}
                aria-current={space === id ? "page" : undefined}
                className={cn(
                  "relative flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors",
                  space === id ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {space === id && <motion.span layoutId="space-pill" className="absolute inset-0 rounded-full bg-card shadow-soft" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <Icon className="relative size-4" strokeWidth={2} aria-hidden />
                <span className="relative max-sm:sr-only">{label}</span>
              </a>
            ))}
          </nav>
        </div>
        {tabs.length > 0 && (
          <nav aria-label="Navigation" className="mx-auto hidden max-w-5xl gap-1 px-6 pb-3 md:flex">
            {tabs.map(({ href, label, icon: Icon, active }) => (
              <a
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn("relative flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors", active ? "text-primary-ink" : "text-muted-foreground hover:text-foreground")}
              >
                {active && <motion.span layoutId="tab-pill-desktop" className="absolute inset-0 rounded-full bg-primary-soft" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <Icon className="relative size-4" strokeWidth={2} aria-hidden />
                <span className="relative">{label}</span>
              </a>
            ))}
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 md:pt-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {tabs.length > 0 && !immersive && (
        <nav
          aria-label="Navigation"
          className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 mx-auto grid max-w-md auto-cols-fr grid-flow-col gap-0.5 rounded-full bg-foreground p-1.5 shadow-float md:hidden"
        >
          {tabs.map(({ href, label, icon: Icon, active }) => (
            <a
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn("relative flex h-14 min-w-0 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] leading-none font-semibold", active ? "text-foreground" : "text-background/70")}
            >
              {active && <motion.span layoutId="tab-pill-mobile" className="absolute inset-0 rounded-full bg-background" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <Icon className="relative size-5" strokeWidth={2} aria-hidden />
              <span className="relative max-w-full truncate px-1">{label}</span>
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}
