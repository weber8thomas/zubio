import { AnimatePresence, motion } from "motion/react";
import { BadgeCheck, CalendarDays, Check, Inbox, MapPin, Radar, Star, UserRound, Wallet, X } from "lucide-react";
import { toast } from "sonner";
import { Avatar, Section, SkillChip, SkillTile, Status } from "@/components/kit";
import { dayLabel, hours } from "@/lib/format";
import { Shell } from "@/components/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ME, skillLabel, venueById } from "@/data/demo";
import { go } from "@/lib/router";
import { actions, useStore } from "@/lib/store";

export function CoachSpace({ route }: { route: string[] }) {
  const [page] = route;
  const tabs = [
    { href: "#/coach", label: "Offres", icon: Inbox, active: !page },
    { href: "#/coach/planning", label: "Planning", icon: CalendarDays, active: page === "planning" },
    { href: "#/coach/profil", label: "Profil", icon: UserRound, active: page === "profil" },
  ];
  return <Shell space="coach" tabs={tabs}>{page === "planning" ? <Planning /> : page === "profil" ? <Profile /> : <Offers />}</Shell>;
}

function Offers() {
  const { slots, offers } = useStore();
  const pending = offers
    .filter((o) => o.coachId === ME.id && o.status === "pending")
    .map((o) => ({ offer: o, slot: slots.find((s) => s.id === o.slotId)! }))
    .filter(({ slot }) => slot.status === "open")
    .reverse(); // les plus récentes en premier

  function accept(offerId: string, venue: string) {
    if (actions.accept(offerId)) {
      toast.success(`Mission confirmée chez ${venue}`, { description: "La salle est prévenue à l'instant." });
      go("/coach/planning");
    } else toast.error("Trop tard, un autre coach a accepté juste avant.");
  }

  return (
    <>
      <p className="text-sm font-medium text-muted-foreground">Bonjour</p>
      <h1 className="font-heading text-[26px] leading-tight font-extrabold sm:text-[32px]">{ME.name.split(" ")[0]}</h1>
      <p className="mt-1 text-muted-foreground">
        {pending.length ? `${pending.length} offre${pending.length > 1 ? "s" : ""} pour vous.` : "Aucune offre en attente."}
      </p>

      <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <AnimatePresence initial={false}>
          {pending.map(({ offer, slot }) => {
            const venue = venueById(slot.venueId);
            return (
              <motion.li
                key={offer.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-[28px] bg-card p-4 shadow-soft ring-1 ring-border/60 sm:p-5"
              >
                <div className="flex items-start gap-3">
                  <SkillTile skill={slot.skill} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold">{skillLabel(slot.skill)}</p>
                    <p className="text-sm font-medium">
                      {dayLabel(slot.day)} · {hours(slot.start, slot.end)}
                    </p>
                  </div>
                  <p className="font-heading text-2xl font-extrabold tabular-nums">{slot.price} €</p>
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-sm">
                  <MapPin className="size-4 text-muted-foreground" aria-hidden />
                  {venue.name}, {venue.town}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Radar className="size-4" aria-hidden />
                  {offer.reason}
                </p>
                <div className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-2">
                  <Button size="lg" variant="secondary" aria-label="Refuser" onClick={() => actions.decline(offer.id)}>
                    <X />
                  </Button>
                  <Button size="lg" onClick={() => accept(offer.id, venue.name)}>
                    <Check /> Accepter
                  </Button>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
      {!pending.length && (
        <p className="mt-6 rounded-3xl border border-dashed border-border p-6 text-center text-muted-foreground">
          Les salles vous sollicitent automatiquement selon vos disponibilités.
        </p>
      )}
    </>
  );
}

function Planning() {
  const { slots } = useStore();
  const mine = slots.filter((s) => s.coachId === ME.id).sort((a, b) => a.day - b.day);
  const upcoming = mine.filter((s) => s.status === "filled");
  const earned = mine.filter((s) => s.status === "done").reduce((t, s) => t + s.price, 0);
  const planned = upcoming.reduce((t, s) => t + s.price, 0);

  return (
    <>
      <h1 className="font-heading text-[26px] leading-tight font-extrabold sm:text-[32px]">Planning</h1>
      <div className="mt-6 rounded-[28px] bg-foreground p-5 text-background sm:p-6">
        <div className="flex items-center gap-2 text-sm text-background/70">
          <Wallet className="size-4" aria-hidden /> Revenus du mois
          <Badge variant="outline" className="ml-auto border-background/30 text-background/80">Démo</Badge>
        </div>
        <p className="mt-2 font-heading text-[40px] leading-none font-extrabold tabular-nums">{earned + planned} €</p>
        <p className="mt-1 text-sm text-background/70">
          {earned} € réalisés · {planned} € à venir
        </p>
      </div>

      <Section title="Missions à venir">
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {upcoming.map((s) => {
            const venue = venueById(s.venueId);
            return (
              <li key={s.id} className="flex items-center gap-3 rounded-3xl bg-card p-3 pr-4 shadow-soft ring-1 ring-border/60">
                <SkillTile skill={s.skill} />
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{dayLabel(s.day)} · {s.start}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {skillLabel(s.skill)} · {venue.name}
                  </p>
                </div>
                <Status status={s.status} />
              </li>
            );
          })}
        </ul>
      </Section>
    </>
  );
}

const WEEK = ["L", "M", "M", "J", "V", "S", "D"];

function Profile() {
  return (
    <>
      <div className="flex items-center gap-4">
        <Avatar name={ME.name} id={ME.id} size="lg" />
        <div>
          <h1 className="font-heading text-[22px] leading-tight font-extrabold sm:text-[28px]">{ME.name}</h1>
          <p className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Star className="size-4 fill-current" aria-hidden />{ME.rating.toFixed(1)}</span>
            <span>{ME.missions} missions</span>
            <span className="flex items-center gap-1"><MapPin className="size-4" aria-hidden />{ME.town}</span>
          </p>
        </div>
      </div>

      <Section title="Disciplines">
        <div className="flex flex-wrap gap-2">
          {ME.skills.map((s) => (
            <SkillChip key={s} skill={s} />
          ))}
        </div>
      </Section>

      <Section title="Diplôme">
        <div className="flex items-center gap-3 rounded-3xl bg-card p-4 shadow-soft ring-1 ring-border/60">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-success-soft text-success-ink">
            <BadgeCheck className="size-5" aria-hidden />
          </span>
          <div className="flex-1">
            <p className="font-semibold">{ME.diploma.label}</p>
            <p className="text-sm text-muted-foreground">Vérifié par l&apos;équipe Zubio</p>
          </div>
        </div>
      </Section>

      <Section title="Disponibilités">
        <div className="grid grid-cols-7 gap-1.5">
          {WEEK.map((d, i) => {
            const on = ME.days.includes(i + 1);
            return (
              <div key={i} className={on ? "rounded-2xl bg-primary-soft p-2 text-center text-primary-ink" : "rounded-2xl bg-muted p-2 text-center text-muted-foreground"}>
                <p className="font-bold">{d}</p>
                <p className="text-[10px] leading-tight">{on ? ME.hours[0] : "—"}</p>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          De {ME.hours[0]} à {ME.hours[1]} · jusqu&apos;à {ME.radiusKm} km · dès {ME.minHourly} €/h
        </p>
      </Section>
    </>
  );
}
