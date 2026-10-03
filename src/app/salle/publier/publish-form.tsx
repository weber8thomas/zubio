"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { publishSlot, type PublishState } from "../actions";

const DURATIONS = [45, 60, 75, 90, 120];

export function PublishForm({
  skills,
  defaults,
}: {
  skills: { id: string; label: string }[];
  defaults: { date: string; minDate: string; start: string; duration: number; rate: number };
}) {
  const [state, action, pending] = useActionState<PublishState, FormData>(publishSlot, {});
  const e = state.errors ?? {};

  return (
    <form action={action} className="flex flex-col gap-6">
      <fieldset>
        <legend className="mb-2 text-[15px] font-bold">Discipline</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {skills.map((s, i) => (
            <label key={s.id} className="relative">
              <input
                type="radio"
                name="skill"
                value={s.id}
                defaultChecked={i === 0}
                className="peer sr-only"
              />
              <span className="flex min-h-12 cursor-pointer items-center justify-center rounded-[10px] border border-line px-3 text-center font-bold transition-colors peer-checked:border-accent peer-checked:bg-accent-light peer-checked:text-accent-hover peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
                {s.label}
              </span>
            </label>
          ))}
        </div>
        {e.skill && <p className="mt-1 text-sm font-bold text-red">{e.skill}</p>}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Date" htmlFor="date" error={e.date}>
          <Input id="date" name="date" type="date" required min={defaults.minDate} defaultValue={defaults.date} />
        </Field>
        <Field label="Début" htmlFor="start" error={e.start}>
          <Input id="start" name="start" type="time" required step={900} defaultValue={defaults.start} />
        </Field>
        <Field label="Durée" htmlFor="duration" error={e.duration}>
          <Select id="duration" name="duration" defaultValue={defaults.duration}>
            {DURATIONS.map((d) => (
              <option key={d} value={d}>
                {d < 60 ? `${d} min` : `${Math.floor(d / 60)} h${d % 60 ? ` ${d % 60}` : ""}`}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Tarif de la séance (€)" htmlFor="rate" hint="Montant versé au coach pour la séance." error={e.rate}>
        <Input
          id="rate"
          name="rate"
          type="number"
          inputMode="decimal"
          min={10}
          max={500}
          step={1}
          required
          defaultValue={defaults.rate}
          className="sm:max-w-48"
        />
      </Field>

      <Field label="Précisions (facultatif)" htmlFor="notes" hint="Niveau du groupe, matériel, accès…">
        <Textarea id="notes" name="notes" rows={2} maxLength={280} />
      </Field>

      {state.message && (
        <p role="alert" className="font-bold text-red">
          {state.message}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto sm:self-start">
        {pending ? "Recherche des coachs…" : "Publier et trouver un coach"}
      </Button>
    </form>
  );
}
