import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { requireVenue } from "@/lib/data/salle";
import { todayIso } from "@/lib/format";
import { sport } from "@/verticals/sport";
import { PublishForm } from "./publish-form";

export const metadata: Metadata = { title: "Publier un créneau" };

/** Lendemain, ou lundi si le lendemain tombe un dimanche (peu de coachs disponibles). */
function nextWorkingDay(isoDate: string) {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  if (d.getUTCDay() === 0) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export default async function PublishPage() {
  await requireVenue();
  const today = todayIso();
  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Publier un créneau"
        subtitle="Les coachs compatibles le reçoivent immédiatement. Le premier qui accepte est confirmé."
      />
      <PublishForm
        skills={sport.skills.map(({ id, label }) => ({ id, label }))}
        defaults={{
          date: nextWorkingDay(today),
          minDate: today,
          start: "18:30",
          duration: sport.defaults.durationMinutes,
          rate: sport.defaults.rateCents / 100,
        }}
      />
    </div>
  );
}
