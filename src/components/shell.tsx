import { Building2, ShieldCheck, UserRound, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand";
import { cn } from "@/lib/utils";

export type Tab = { href: string; label: string; icon: LucideIcon; active: boolean };

const SPACES = [
  { id: "salle", label: "Salle", icon: Building2 },
  { id: "coach", label: "Coach", icon: UserRound },
  { id: "admin", label: "Admin", icon: ShieldCheck },
];

/** Coque commune : en-tête avec sélecteur d'espace, onglets en bas sur mobile, en haut sur ordinateur. */
export function Shell({ space, tabs, children }: { space: string; tabs: Tab[]; children: ReactNode }) {
  return (
    <div className="min-h-dvh pb-28 md:pb-16">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <a href="#/" aria-label="Accueil Zubio" className="shrink-0">
            <Logo className="h-7" />
          </a>
          <nav aria-label="Espaces de démo" className="flex rounded-full bg-muted p-1">
            {SPACES.map(({ id, label, icon: Icon }) => (
              <a
                key={id}
                href={`#/${id}`}
                aria-current={space === id ? "page" : undefined}
                className={cn(
                  "flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors",
                  space === id ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-4" strokeWidth={2} aria-hidden />
                <span className="max-sm:sr-only">{label}</span>
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
                className={cn(
                  "flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors",
                  active ? "bg-primary-soft text-primary-ink" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4" strokeWidth={2} aria-hidden />
                {label}
              </a>
            ))}
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 md:pt-10">{children}</main>

      {tabs.length > 0 && (
        <nav
          aria-label="Navigation"
          className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 mx-auto grid max-w-sm auto-cols-fr grid-flow-col gap-1 rounded-full bg-foreground p-1.5 shadow-float md:hidden"
        >
          {tabs.map(({ href, label, icon: Icon, active }) => (
            <a
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-12 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors",
                active ? "bg-background text-foreground" : "text-background/70",
              )}
            >
              <Icon className="size-5" strokeWidth={2} aria-hidden />
              <span className={cn(!active && "sr-only")}>{label}</span>
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}
