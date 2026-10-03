import { LogOut } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { signOut } from "@/app/actions/auth";
import { Logo } from "@/components/ui/logo";
import { BottomTabs, SideNav, type NavItem } from "./nav-links";

function SignOutButton({ compact = false }: { compact?: boolean }) {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-[10px] px-2 text-muted hover:bg-surface hover:text-ink"
      >
        <LogOut size={20} strokeWidth={1.75} aria-hidden />
        <span className={compact ? "sr-only" : undefined}>Se déconnecter</span>
      </button>
    </form>
  );
}

/** Coque des espaces salle et coach : onglets en bas sur mobile, barre latérale sur ordinateur. */
export function AppShell({
  nav,
  userLabel,
  spaceLabel,
  children,
  floating,
}: {
  nav: NavItem[];
  userLabel: string;
  spaceLabel: string;
  children: ReactNode;
  floating?: ReactNode;
}) {
  return (
    <div className="min-h-dvh md:flex">
      <aside className="no-print hidden w-64 shrink-0 flex-col border-r border-line bg-white p-5 md:flex md:sticky md:top-0 md:h-dvh">
        <Link href={nav[0].href} className="mb-8 inline-flex min-h-11 items-center">
          <Logo height={30} />
        </Link>
        <p className="mb-2 px-3 text-[13px] font-bold uppercase tracking-wide text-muted">{spaceLabel}</p>
        <SideNav items={nav} />
        <div className="mt-auto border-t border-line pt-4">
          <p className="truncate px-2 text-sm font-bold">{userLabel}</p>
          <SignOutButton />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="no-print flex items-center justify-between border-b border-line px-4 py-2 md:hidden">
          <Link href={nav[0].href} className="inline-flex min-h-11 items-center">
            <Logo height={26} />
          </Link>
          <div className="flex min-w-0 items-center gap-1">
            <span className="truncate text-sm text-muted">{userLabel}</span>
            <SignOutButton compact />
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 sm:px-6 md:px-10 md:pb-16 md:pt-10">
          {children}
        </main>
      </div>

      <BottomTabs items={nav} />
      {floating}
    </div>
  );
}
