"use client";

import {
  Building2,
  CalendarClock,
  CalendarDays,
  Inbox,
  LayoutDashboard,
  PlusCircle,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const ICONS = {
  dashboard: LayoutDashboard,
  plus: PlusCircle,
  users: Users,
  building: Building2,
  inbox: Inbox,
  calendar: CalendarDays,
  clock: CalendarClock,
  user: UserRound,
  wallet: Wallet,
};

export type NavItem = { href: string; label: string; icon: keyof typeof ICONS; exact?: boolean };

function useIsActive() {
  const pathname = usePathname();
  return (item: NavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** Barre d'onglets fixée en bas de l'écran, sur mobile uniquement. */
export function BottomTabs({ items }: { items: NavItem[] }) {
  const isActive = useIsActive();
  return (
    <nav
      aria-label="Navigation principale"
      className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] shadow-float md:hidden"
    >
      <ul className="mx-auto grid max-w-md" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          const active = isActive(item);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 text-[12px] font-bold",
                  active ? "text-accent" : "text-muted",
                )}
              >
                <Icon size={22} strokeWidth={1.75} aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Navigation latérale à partir de 768 px. */
export function SideNav({ items }: { items: NavItem[] }) {
  const isActive = useIsActive();
  return (
    <nav aria-label="Navigation principale">
      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          const active = isActive(item);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-[10px] px-3 font-bold",
                  active ? "bg-accent-light text-accent-hover" : "text-ink hover:bg-surface",
                )}
              >
                <Icon size={20} strokeWidth={1.75} aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Menu horizontal simple (espace admin). */
export function TopNav({ items }: { items: NavItem[] }) {
  const isActive = useIsActive();
  return (
    <nav aria-label="Navigation admin" className="-mx-4 overflow-x-auto px-4">
      <ul className="flex gap-1">
        {items.map((item) => {
          const active = isActive(item);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center whitespace-nowrap rounded-[10px] px-3 font-bold",
                  active ? "bg-accent-light text-accent-hover" : "text-muted hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
