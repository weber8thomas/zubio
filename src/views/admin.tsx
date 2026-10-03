import { BadgeCheck, CalendarRange, Gauge, Timer, Users } from "lucide-react";
import { toast } from "sonner";
import { BabMap } from "@/components/bab-map";
import { Avatar, dayLabel, Section, SkillTile, Stat, Status, time } from "@/components/kit";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { coachById, skillLabel, venueById } from "@/data/demo";
import { actions, coachesNow, useStore } from "@/lib/store";

export function AdminSpace() {
  const state = useStore();
  const coaches = coachesNow(state);
  const { slots } = state;
  const filled = slots.filter((s) => s.status !== "open");
  const rate = Math.round((filled.length / slots.length) * 100);
  const delay = Math.round(filled.reduce((t, s) => t + (s.filledInMin ?? 0), 0) / filled.length);
  const toVerify = coaches.filter((c) => !c.diploma.verified);

  return (
    <Shell space="admin" tabs={[]}>
      <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">Vue d&apos;ensemble</h1>
      <p className="mt-1 text-muted-foreground">Bayonne · Anglet · Biarritz</p>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Créneaux publiés" value={slots.length} icon={CalendarRange} />
        <Stat label="Taux de remplissage" value={`${rate} %`} icon={Gauge} />
        <Stat label="Délai moyen" value={`${delay} min`} icon={Timer} hint="De la publication au coach" />
        <Stat label="Coachs actifs" value={coaches.length} icon={Users} />
      </div>

      <div className="mt-2 grid gap-x-6 lg:grid-cols-2">
        <Section title={`Diplômes à valider · ${toVerify.length}`}>
          <ul className="flex flex-col gap-2">
            {toVerify.map((c) => (
              <li key={c.id} className="flex items-center gap-3 rounded-3xl bg-card p-3 shadow-soft ring-1 ring-border/60">
                <Avatar name={c.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{c.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{c.diploma.label}</p>
                </div>
                <Button
                  onClick={() => {
                    actions.verify(c.id);
                    toast.success(`Diplôme de ${c.name} validé`, { description: "Le coach peut désormais recevoir des offres." });
                  }}
                >
                  <BadgeCheck /> Valider
                </Button>
              </li>
            ))}
            {!toVerify.length && (
              <p className="rounded-3xl border border-dashed border-border p-6 text-center text-muted-foreground">Tout est à jour.</p>
            )}
          </ul>

          <div className="mt-6 overflow-hidden rounded-[28px] ring-1 ring-border/60">
            <BabMap pins={coaches.map((c) => ({ ...c }))} />
          </div>
        </Section>

        <Section title="Activité">
          <ul className="flex flex-col gap-2">
            {[...slots].reverse().map((s) => (
              <li key={s.id} className="flex items-center gap-3 rounded-3xl bg-card p-3 shadow-soft ring-1 ring-border/60">
                <SkillTile skill={s.skill} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {skillLabel(s.skill)} · {venueById(s.venueId).name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {dayLabel(s.day)} · {time(s.start)}
                    {s.coachId && ` · ${coachById(s.coachId).name}`}
                  </p>
                </div>
                <Status status={s.status} />
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </Shell>
  );
}
