import { AppShell } from "@/components/layout/app-shell";
import type { NavItem } from "@/components/layout/nav-links";
import { requireProvider } from "@/lib/data/coach";

const NAV: NavItem[] = [
  { href: "/coach", label: "Offres", icon: "inbox", exact: true },
  { href: "/coach/missions", label: "Missions", icon: "calendar" },
  { href: "/coach/disponibilites", label: "Dispos", icon: "clock" },
  { href: "/coach/profil", label: "Profil", icon: "user" },
];

export default async function CoachLayout({ children }: LayoutProps<"/coach">) {
  const { provider } = await requireProvider();
  return (
    <AppShell nav={NAV} userLabel={provider.display_name} spaceLabel="Espace coach">
      {children}
    </AppShell>
  );
}
