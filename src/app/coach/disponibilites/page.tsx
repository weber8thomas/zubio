import { Trash2 } from "lucide-react";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { PageHeader, SectionTitle } from "@/components/ui/page-header";
import { WEEKDAYS } from "@/config/area";
import { requireProvider } from "@/lib/data/coach";
import { removeAvailability } from "../actions";
import { AddAvailabilityForm } from "./add-availability-form";

export const metadata: Metadata = { title: "Disponibilités" };

const hm = (t: string) => {
  const [h, m] = t.split(":");
  return m === "00" ? `${Number(h)} h` : `${Number(h)} h ${m}`;
};

export default async function AvailabilityPage() {
  const { supabase, provider } = await requireProvider();
  const { data } = await supabase
    .from("availabilities")
    .select("id, weekday, start_time, end_time")
    .eq("provider_id", provider.id)
    .order("weekday")
    .order("start_time");
  const ranges = data ?? [];

  return (
    <>
      <PageHeader
        title="Disponibilités"
        subtitle="Vos plages habituelles chaque semaine. Seuls les créneaux qui y tiennent entièrement vous sont proposés."
      />

      <ul className="flex flex-col divide-y divide-line rounded-[12px] border border-line bg-white">
        {WEEKDAYS.map((day, i) => {
          const dayRanges = ranges.filter((r) => r.weekday === i + 1);
          return (
            <li key={day} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
              <span className="w-24 shrink-0 font-bold">{day}</span>
              {dayRanges.length ? (
                <ul className="flex flex-1 flex-wrap gap-2">
                  {dayRanges.map((r) => (
                    <li
                      key={r.id}
                      className="inline-flex items-center rounded-[10px] border border-line bg-surface pl-3"
                    >
                      <span className="text-[15px]">
                        {hm(r.start_time)} – {hm(r.end_time)}
                      </span>
                      <form action={removeAvailability}>
                        <input type="hidden" name="id" value={r.id} />
                        <button
                          type="submit"
                          aria-label={`Supprimer ${day} ${hm(r.start_time)} – ${hm(r.end_time)}`}
                          className="flex size-11 items-center justify-center text-muted hover:text-red"
                        >
                          <Trash2 size={18} strokeWidth={1.75} aria-hidden />
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="flex-1 text-muted">Indisponible</span>
              )}
            </li>
          );
        })}
      </ul>

      <SectionTitle>Ajouter une plage</SectionTitle>
      <Card>
        <AddAvailabilityForm />
      </Card>
    </>
  );
}
