"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { WEEKDAYS } from "@/config/area";
import { addAvailability, type FormState } from "../actions";

export function AddAvailabilityForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(addAvailability, {});
  return (
    <form action={action} className="grid grid-cols-2 items-end gap-3 sm:grid-cols-4">
      <Field label="Jour" htmlFor="weekday" className="col-span-2 sm:col-span-1">
        <Select id="weekday" name="weekday" defaultValue="1">
          {WEEKDAYS.map((d, i) => (
            <option key={d} value={i + 1}>
              {d}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="De" htmlFor="start">
        <Input id="start" name="start" type="time" step={900} defaultValue="09:00" required />
      </Field>
      <Field label="À" htmlFor="end">
        <Input id="end" name="end" type="time" step={900} defaultValue="12:00" required />
      </Field>
      <Button type="submit" disabled={pending} className="col-span-2 sm:col-span-1">
        Ajouter la plage
      </Button>
      {state.error && (
        <p role="alert" className="col-span-2 text-sm font-bold text-red sm:col-span-4">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p role="status" className="col-span-2 text-sm text-muted sm:col-span-4">
          Plage ajoutée.
        </p>
      )}
    </form>
  );
}
