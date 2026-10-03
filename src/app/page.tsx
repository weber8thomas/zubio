import { ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { brand } from "@/config/brand";
import { getSession, ROLE_HOME } from "@/lib/auth";
import { publicEnv } from "@/lib/env";

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
