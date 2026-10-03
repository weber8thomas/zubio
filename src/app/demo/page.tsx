import { ArrowRight, Building2, ShieldCheck, UserRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { signInAsDemo } from "@/app/actions/auth";
import { Logo } from "@/components/ui/logo";
import { publicEnv } from "@/lib/env";

export const metadata: Metadata = { title: "Démo" };

const ENTRIES = [
  {
    role: "salle",
    icon: Building2,
    title: "Entrer comme salle",
    text: "Atrium Fitness Bayonne : publiez un créneau et suivez les réponses en direct.",
  },
  {
    role: "coach",
    icon: UserRound,
    title: "Entrer comme coach",
    text: "Maialen Etcheverry, coach pilates : acceptez une offre en un geste.",
  },
  {
    role: "admin",
    icon: ShieldCheck,
    title: "Entrer comme admin",
    text: "Chiffres clés, validation des diplômes, changement de verticale.",
  },
] as const;

const ERRORS: Record<string, string> = {
  connexion: "Connexion impossible : la base de démo a-t-elle bien été initialisée (seed) ?",
  config: "La variable DEMO_PASSWORD n'est pas configurée sur le serveur.",
};

export default async function DemoPage({ searchParams }: PageProps<"/demo">) {
  if (!publicEnv.demoMode) notFound();
  const { erreur } = await searchParams;
  const error = typeof erreur === "string" ? ERRORS[erreur] : undefined;

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 py-6 sm:px-6">
      <Link href="/" className="inline-flex min-h-11 items-center self-start">
        <Logo height={30} />
      </Link>
      <main className="flex flex-1 flex-col justify-center py-8">
        <h1 className="text-[32px] sm:text-[40px]">Accès démo</h1>
        <p className="mt-2 text-muted">
          Trois comptes fictifs, déjà remplis. Ouvrez la salle et le coach dans deux fenêtres pour voir la
          confirmation arriver en direct.
        </p>

        {error && (
          <p role="alert" className="mt-6 rounded-[12px] border border-red bg-red-light p-4 font-bold text-red-hover">
            {error}
          </p>
        )}

        <ul className="mt-8 flex flex-col gap-3">
          {ENTRIES.map(({ role, icon: Icon, title, text }) => (
            <li key={role}>
              <form action={signInAsDemo}>
                <input type="hidden" name="role" value={role} />
                <button
                  type="submit"
                  className="group flex w-full items-center gap-4 rounded-[12px] border border-line bg-white p-4 text-left transition-colors hover:border-accent sm:p-5"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-[10px] bg-accent-light text-accent-hover">
                    <Icon size={24} strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-lg font-extrabold">{title}</span>
                    <span className="block text-[15px] leading-snug text-muted">{text}</span>
                  </span>
                  <ArrowRight
                    size={20}
                    strokeWidth={1.75}
                    aria-hidden
                    className="shrink-0 text-muted group-hover:text-accent"
                  />
                </button>
              </form>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-sm text-muted">
          Vous avez un vrai compte ?{" "}
          <Link href="/connexion" className="font-bold text-ink underline underline-offset-4">
            Connexion par lien magique
          </Link>
        </p>
      </main>
    </div>
  );
}
