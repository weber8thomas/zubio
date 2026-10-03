"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { COMMUNES } from "@/config/area";
import { updateProfile, type FormState } from "../actions";

export function ProfileForm({
  profile,
}: {
  profile: { bio: string; commune: string; radiusKm: number; minRate: number };
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateProfile, {});
  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Commune" htmlFor="commune">
          <Select id="commune" name="commune" defaultValue={profile.commune}>
            {COMMUNES.map((c) => (
              <option key={c.name}>{c.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Rayon d'intervention (km)" htmlFor="radiusKm">
          <Input id="radiusKm" name="radiusKm" type="number" inputMode="numeric" min={1} max={50} defaultValue={profile.radiusKm} required />
        </Field>
        <Field label="Tarif minimum (€/h)" htmlFor="minRate">
          <Input id="minRate" name="minRate" type="number" inputMode="decimal" min={0} max={200} defaultValue={profile.minRate} required />
        </Field>
      </div>
      <Field label="Présentation" htmlFor="bio" hint="Visible par les salles dans le catalogue.">
        <Textarea id="bio" name="bio" rows={3} maxLength={400} defaultValue={profile.bio} />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          Enregistrer
        </Button>
        {state.ok && (
          <p role="status" className="text-muted">
            Profil enregistré.
          </p>
        )}
        {state.error && (
          <p role="alert" className="font-bold text-red">
            {state.error}
          </p>
        )}
      </div>
    </form>
  );
}
