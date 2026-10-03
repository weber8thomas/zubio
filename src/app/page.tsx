import { ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";
import { OfferStatusBadge, SlotStatusBadge } from "@/components/status-badge";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { brand } from "@/config/brand";
import { getSession, ROLE_HOME } from "@/lib/auth";
import { publicEnv } from "@/lib/env";

/** Aperçu statique du produit (données d'exemple, pas d'illustration). */
const PREVIEW_OFFERS = [
  { name: "Maialen Etcheverry", reason: "Favori · Diplôme ✓ · < 1 km · disponible", status: "accepted" },
  { name: "Garazi Ospital", reason: "Favori · Diplôme ✓ · 2 km · disponible", status: "expired" },
  { name: "Oihana Elissalde", reason: "Diplôme ✓ · 7 km · disponible", status: "expired" },
] as const;

function ProductPreview() {
  return (
    <figure className="rounded-[12px] border border-line bg-white p-5" aria-label="Exemple de créneau pourvu">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-display text-xl font-extrabold">Pilates</span>
        <SlotStatusBadge status="filled" />
      </div>
      <p className="mt-0.5">Lundi · 18 h 30 – 19 h 30 · 45 €</p>
      <p className="text-sm text-muted">Atrium Fitness Bayonne · pourvu en 6 min</p>
      <ul className="mt-4 flex flex-col gap-2">
        {PREVIEW_OFFERS.map((o) => (
          <li key={o.name} className="flex items-center gap-3 rounded-[10px] border border-line p-3">
            <div className="min-w-0 flex-1">
              <p className="font-bold">{o.name}</p>
              <p className="text-sm text-muted">{o.reason}</p>
            </div>
            <OfferStatusBadge status={o.status} />
          </li>
        ))}
      </ul>
      <figcaption className="mt-3 text-sm text-muted">Exemple : chaque proposition affiche sa raison.</figcaption>
    </figure>
  );
}

const STEPS = [
  ["1", "La salle publie un créneau", "Discipline, date, horaire, tarif : moins de 30 secondes."],
  ["2", "Les coachs compatibles le reçoivent", "Diplôme valide, distance, disponibilité et tarif sont vérifiés."],
  ["3", "Le premier qui accepte est confirmé", "La salle et le coach voient la mission en direct."],
];

export default async function Home() {
  const session = await getSession();
  if (session) redirect(ROLE_HOME[session.profile.role]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4 sm:px-6">
      <header className="flex items-center justify-between py-4">
        <Logo height={30} />
        <ButtonLink href="/connexion" variant="ghost">
          Se connecter
        </ButtonLink>
      </header>

      <main className="flex flex-1 flex-col justify-center py-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="font-bold text-accent">Bayonne · Anglet · Biarritz</p>
            <h1 className="mt-3 max-w-3xl text-[40px] sm:text-[60px]">{brand.slogan}</h1>
            <p className="mt-4 max-w-2xl text-lg text-muted">{brand.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {publicEnv.demoMode && (
                <ButtonLink href="/demo" size="lg">
                  Essayer la démo
                  <ArrowRight size={20} strokeWidth={1.75} aria-hidden />
                </ButtonLink>
              )}
              <ButtonLink href="/connexion" variant="secondary" size="lg">
                J&apos;ai déjà un compte
              </ButtonLink>
            </div>
          </div>
          <ProductPreview />
        </div>

        <ol className="mt-14 grid gap-4 sm:grid-cols-3">
          {STEPS.map(([n, title, text]) => (
            <li key={n} className="rounded-[12px] border border-line p-5">
              <span className="font-display text-2xl font-extrabold text-accent">{n}</span>
              <h2 className="mt-2 text-lg">{title}</h2>
              <p className="mt-1 text-muted">{text}</p>
            </li>
          ))}
        </ol>
      </main>

      <footer className="border-t border-line py-6 text-sm text-muted">
        {brand.name} — prototype de démonstration, données fictives.
      </footer>
    </div>
  );
}
