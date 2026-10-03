"use client";

import { useActionState } from "react";
import { sendMagicLink, type MagicLinkState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

export function MagicLinkForm() {
  const [state, action, pending] = useActionState<MagicLinkState, FormData>(sendMagicLink, {
    status: "idle",
  });

  if (state.status === "sent") {
    return (
      <p role="status" className="rounded-[12px] border border-line bg-surface p-4">
        <strong>Lien envoyé.</strong> Ouvrez l&apos;e-mail reçu sur cet appareil pour vous connecter.
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="Adresse e-mail" htmlFor="email" error={state.status === "error" ? state.message : undefined}>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="prenom@exemple.fr"
        />
      </Field>
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Envoi…" : "Recevoir un lien de connexion"}
      </Button>
    </form>
  );
}
