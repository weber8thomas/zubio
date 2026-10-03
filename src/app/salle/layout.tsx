import { AppShell } from "@/components/layout/app-shell";
import type { NavItem } from "@/components/layout/nav-links";
import { SupportChat } from "@/components/support-chat";
import { requireVenue } from "@/lib/data/salle";

const NAV: NavItem[] = [
  { href: "/salle", label: "Accueil", icon: "dashboard", exact: true },
  { href: "/salle/publier", label: "Publier", icon: "plus" },
  { href: "/salle/coachs", label: "Coachs", icon: "users" },
  { href: "/salle/factures", label: "Factures", icon: "wallet" },
];

export default async function SalleLayout({ children }: LayoutProps<"/salle">) {
  const { venue } = await requireVenue();
  return (
    <AppShell nav={NAV} userLabel={venue.name} spaceLabel="Espace salle"
      floating={<SupportChat aiEnabled={Boolean(process.env.MISTRAL_API_KEY)} />}
    >
      {children}
    </AppShell>
  );
}
