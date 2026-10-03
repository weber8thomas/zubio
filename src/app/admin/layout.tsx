import { LogOut } from "lucide-react";
import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { TopNav, type NavItem } from "@/components/layout/nav-links";
import { SupportChat } from "@/components/support-chat";
import { Logo } from "@/components/ui/logo";
import { requireAdmin } from "@/lib/data/admin";
import { accentStyle } from "@/verticals";
import { VerticalSwitch } from "./vertical-switch";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const { profile, vertical } = await requireAdmin();
  const nav: NavItem[] = [
    { href: "/admin", label: "Vue d'ensemble", icon: "dashboard", exact: true },
    { href: "/admin/structures", label: vertical.labels.venues, icon: "building" },
    { href: "/admin/prestataires", label: vertical.labels.providers, icon: "users" },
  ];

  return (
    <div style={accentStyle(vertical)} className="min-h-dvh">
      <header className="no-print border-b border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-10">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-2">
            <Link href="/admin" className="inline-flex min-h-11 items-center">
              <Logo height={26} />
            </Link>
            <span className="text-[13px] font-bold uppercase tracking-wide text-muted">Espace admin</span>
            <VerticalSwitch current={vertical.id} className="order-last w-full md:order-none md:ml-auto md:w-auto" />
            <div className="ml-auto flex min-w-0 items-center gap-1 md:ml-0">
              <span className="truncate text-sm text-muted">{profile.full_name}</span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-[10px] px-2 text-muted hover:bg-surface hover:text-ink"
                >
                  <LogOut size={20} strokeWidth={1.75} aria-hidden />
                  <span className="sr-only lg:not-sr-only">Se déconnecter</span>
                </button>
              </form>
            </div>
          </div>
          <div className="pb-2">
            <TopNav items={nav} />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 md:px-10 md:pt-10">{children}</main>
      <SupportChat aiEnabled={Boolean(process.env.MISTRAL_API_KEY)} />
    </div>
  );
}
