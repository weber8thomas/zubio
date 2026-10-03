import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { publicEnv } from "@/lib/env";
import { MagicLinkForm } from "./magic-link-form";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage({ searchParams }: PageProps<"/connexion">) {
  const { erreur } = await searchParams;
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-4 py-6 sm:px-6">
      <Link href="/" className="inline-flex min-h-11 items-center self-start">
        <Logo height={30} />
      </Link>
      <main className="flex flex-1 flex-col justify-center py-8">
        <h1 className="text-[32px]">Connexion</h1>
        <p className="mb-6 mt-2 text-muted">
          Recevez un lien de connexion par e-mail. Les comptes sont ouverts par l&apos;équipe Zubio.
        </p>
        {erreur === "lien" && (
          <p role="alert" className="mb-4 font-bold text-red">
            Ce lien a expiré ou a déjà servi. Demandez-en un nouveau.
          </p>
        )}
        <MagicLinkForm />
        {publicEnv.demoMode && (
          <p className="mt-8 text-sm text-muted">
            Simple visite ?{" "}
            <Link href="/demo" className="font-bold text-ink underline underline-offset-4">
              Utiliser les comptes de démo
            </Link>
          </p>
        )}
      </main>
    </div>
  );
}
