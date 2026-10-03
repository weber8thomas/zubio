import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, BadgeCheck, CalendarCheck, ChevronRight, Clock, Heart, LayoutGrid, MapPin, Minus, Plus, PlusCircle, Radar, Search, Star, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BabMap } from "@/components/bab-map";
import { Avatar, dayLabel, Section, SkillChip, SkillTile, Stat, Status, time } from "@/components/kit";
import { Shell } from "@/components/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { COACHES, coachById, FAVORITES, MY_VENUE, SKILLS, type SkillId, type Slot, skillLabel } from "@/data/demo";
import { match } from "@/lib/matching";
import { go } from "@/lib/router";
import { actions, coachesNow, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function SalleSpace({ route }: { route: string[] }) {
  const [page, id] = route;
  const tabs = [
    { href: "#/salle", label: "Accueil", icon: LayoutGrid, active: !page || page === "creneau" },
    { href: "#/salle/publier", label: "Publier", icon: PlusCircle, active: page === "publier" },
    { href: "#/salle/coachs", label: "Coachs", icon: Users, active: page === "coachs" },
  ];
  return (
    <Shell space="salle" tabs={tabs}>
      {page === "publier" ? <Publish /> : page === "coachs" ? <Catalog /> : page === "creneau" && id ? <SlotDetail id={id} /> : <Home />}
    </Shell>
  );
}

function SlotCard({ slot, asked }: { slot: Slot; asked: number }) {
  const coach = slot.coachId ? coachById(slot.coachId) : null;
  return (
    <a
      href={`#/salle/creneau/${slot.id}`}
      className="group flex items-center gap-3 rounded-3xl bg-card p-3 pr-4 shadow-soft ring-1 ring-border/60 transition hover:-translate-y-0.5 hover:shadow-lift"
    >
      <SkillTile skill={slot.skill} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-heading font-bold">{skillLabel(slot.skill)}</p>
          <span className="ml-auto font-heading font-bold tabular-nums">{slot.price} €</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {dayLabel(slot.day)} · {time(slot.start)} – {time(slot.end)}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <Status status={slot.status} />
          <span className="truncate text-xs text-muted-foreground">
            {coach ? coach.name : `${asked} coach${asked > 1 ? "s" : ""} sollicité${asked > 1 ? "s" : ""}`}
          </span>
        </div>
      </div>
      <ChevronRight className="size-5 text-muted-foreground transition group-hover:translate-x-0.5" aria-hidden />
    </a>
  );
}

function Home() {
  const { slots, offers } = useStore();
  const mine = slots.filter((s) => s.venueId === MY_VENUE.id);
  const open = mine.filter((s) => s.status === "open");
  const filled = mine.filter((s) => s.status === "filled");
  const asked = (id: string) => offers.filter((o) => o.slotId === id).length;

  return (
    <>
      <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <MapPin className="size-4" aria-hidden /> {MY_VENUE.town}
      </p>
      <h1 className="mt-1 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">{MY_VENUE.name}</h1>

      <div className="mt-6 overflow-hidden rounded-[28px] bg-primary p-5 text-primary-foreground sm:flex sm:items-center sm:justify-between sm:p-7">
        <div>
          <p className="font-heading text-xl font-bold sm:text-2xl">Un coach absent ce soir ?</p>
          <p className="mt-1 text-primary-foreground/80">Publiez le créneau, les coachs compatibles sont prévenus aussitôt.</p>
        </div>
        <Button size="lg" variant="secondary" className="mt-4 w-full bg-card text-foreground hover:bg-card/90 sm:mt-0 sm:w-auto" onClick={() => go("/salle/publier")}>
          <Plus /> Publier un créneau
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="À venir" value={open.length + filled.length} icon={CalendarCheck} />
        <Stat label="Confirmés" value={filled.length} icon={BadgeCheck} />
        <Stat label="En recherche" value={open.length} icon={Search} />
      </div>

      <Section title="En recherche">
        <div className="grid gap-3 md:grid-cols-2">
          {open.length ? open.map((s) => <SlotCard key={s.id} slot={s} asked={asked(s.id)} />) : <Empty text="Tous vos créneaux ont un coach." />}
        </div>
      </Section>
      <Section title="Confirmés">
        <div className="grid gap-3 md:grid-cols-2">
          {filled.map((s) => (
            <SlotCard key={s.id} slot={s} asked={asked(s.id)} />
          ))}
        </div>
      </Section>
    </>
  );
}

const Empty = ({ text }: { text: string }) => (
  <p className="rounded-3xl border border-dashed border-border p-6 text-center text-muted-foreground md:col-span-2">{text}</p>
);

const DURATIONS = [45, 60, 90];

function Publish() {
  const [skill, setSkill] = useState<SkillId>("pilates");
  const [day, setDay] = useState(1);
  const [start, setStart] = useState("18:30");
  const [duration, setDuration] = useState(60);
  const [price, setPrice] = useState(45);

  function submit() {
    const [h, m] = start.split(":").map(Number);
    const endMin = h * 60 + m + duration;
    const end = `${String(Math.floor(endMin / 60) % 24).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}`;
    const id = actions.publish({ skill, day, start, end, price });
    go(`/salle/creneau/${id}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-heading text-3xl font-extrabold tracking-tight">Publier un créneau</h1>
      <p className="mt-1 text-muted-foreground">Quatre choix, et c&apos;est parti.</p>

      <Field label="Discipline">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {SKILLS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSkill(s.id)}
              aria-pressed={skill === s.id}
              className={cn(
                "flex flex-col items-center gap-2 rounded-3xl bg-card p-3 text-xs font-semibold ring-1 ring-border/60 transition",
                skill === s.id ? "ring-2 ring-primary" : "hover:ring-border",
              )}
            >
              <SkillTile skill={s.id} />
              {s.label}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Jour">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          {[0, 1, 2, 3, 4, 5, 6].map((d) => (
            <Chip key={d} active={day === d} onClick={() => setDay(d)}>
              {dayLabel(d)}
            </Chip>
          ))}
        </div>
      </Field>

      <div className="grid gap-x-4 sm:grid-cols-2">
        <Field label="Début" htmlFor="start">
          <input
            id="start"
            type="time"
            step={900}
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="h-12 w-full rounded-2xl bg-card px-4 text-base font-semibold ring-1 ring-border/60 outline-none focus:ring-2 focus:ring-primary"
          />
        </Field>
        <Field label="Durée">
          <div className="flex gap-2">
            {DURATIONS.map((d) => (
              <Chip key={d} active={duration === d} onClick={() => setDuration(d)}>
                {d === 90 ? "1 h 30" : d === 60 ? "1 h" : "45 min"}
              </Chip>
            ))}
          </div>
        </Field>
      </div>

      <Field label="Tarif de la séance">
        <div className="flex items-center gap-3 rounded-3xl bg-card p-2 ring-1 ring-border/60">
          <Button size="icon-lg" variant="secondary" aria-label="Baisser le tarif" onClick={() => setPrice((p) => Math.max(20, p - 5))}>
            <Minus />
          </Button>
          <p className="flex-1 text-center font-heading text-3xl font-extrabold tabular-nums">{price} €</p>
          <Button size="icon-lg" variant="secondary" aria-label="Augmenter le tarif" onClick={() => setPrice((p) => Math.min(200, p + 5))}>
            <Plus />
          </Button>
        </div>
      </Field>

      <Button size="lg" className="mt-8 w-full" onClick={submit}>
        <Radar /> Trouver un coach
      </Button>
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold">
        {label}
      </label>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-11 shrink-0 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition",
        active ? "bg-foreground text-background" : "bg-card ring-1 ring-border/60 hover:ring-border",
      )}
    >
      {children}
    </button>
  );
}

function SlotDetail({ id }: { id: string }) {
  const state = useStore();
  const slot = state.slots.find((s) => s.id === id);
  if (!slot) return <Empty text="Créneau introuvable." />;
  const offers = state.offers.filter((o) => o.slotId === id);
  const coach = slot.coachId ? coachById(slot.coachId) : null;
  const misses = slot.status === "open" ? match(slot, MY_VENUE, coachesNow(state)).misses : null;

  function widen() {
    const n = actions.widen(slot!.id);
    toast(n ? `${n} nouveau${n > 1 ? "x" : ""} coach${n > 1 ? "s" : ""} sollicité${n > 1 ? "s" : ""}` : "Aucun nouveau coach dans ce rayon");
  }

  return (
    <>
      <a href="#/salle" className="inline-flex h-10 items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Tableau de bord
      </a>
      <div className="mt-2 flex items-start gap-4">
        <SkillTile skill={slot.skill} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">{skillLabel(slot.skill)}</h1>
          <p className="text-muted-foreground">
            {dayLabel(slot.day)} · {time(slot.start)} – {time(slot.end)} · <span className="font-semibold text-foreground">{slot.price} €</span>
          </p>
        </div>
        <Status status={slot.status} />
      </div>

      <AnimatePresence>
        {coach && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="mt-6 flex items-center gap-4 rounded-[28px] bg-success-soft p-4 sm:p-5"
          >
            <Avatar name={coach.name} size="lg" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-success-ink">C&apos;est confirmé</p>
              <p className="font-heading text-xl font-bold">{coach.name}</p>
              <p className="text-sm text-muted-foreground">
                Pourvu en {slot.filledInMin} min · {coach.rating.toFixed(1)} ★ · {coach.missions} missions
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="overflow-hidden rounded-[28px] ring-1 ring-border/60">
          <BabMap
            venue={MY_VENUE}
            radiusKm={slot.status === "open" ? slot.radiusKm : undefined}
            pins={COACHES.map((c) => ({ ...c, active: offers.some((o) => o.coachId === c.id && o.status !== "declined") }))}
          />
          <p className="flex items-center gap-2 bg-card px-4 py-3 text-sm text-muted-foreground">
            <Radar className="size-4 text-primary" aria-hidden /> Rayon de recherche : {slot.radiusKm} km autour de {MY_VENUE.name}
          </p>
        </div>

        <div>
          <h2 className="font-heading text-lg font-bold">Coachs sollicités</h2>
          <ul className="mt-3 flex flex-col gap-2">
            <AnimatePresence initial>
              {offers.map((o, i) => {
                const c = coachById(o.coachId);
                return (
                  <motion.li
                    key={o.id}
                    layout
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.12 }}
                    className="flex items-center gap-3 rounded-3xl bg-card p-3 shadow-soft ring-1 ring-border/60"
                  >
                    <Avatar name={c.name} />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 truncate font-semibold">
                        {c.name}
                        {FAVORITES.includes(c.id) && <Heart className="size-3.5 fill-primary text-primary" aria-label="Favori" />}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{o.reason}</p>
                    </div>
                    <Status status={o.status} />
                  </motion.li>
                );
              })}
            </AnimatePresence>
            {!offers.length && <Empty text="Aucun coach compatible dans ce rayon." />}
          </ul>

          {slot.status === "open" && (
            <div className="mt-4 rounded-3xl bg-muted/60 p-4">
              <div className="flex items-center gap-2">
                <Clock className="size-4" aria-hidden />
                <p className="font-semibold">Personne ne répond ?</p>
                <Badge variant="outline" className="ml-auto">Démo</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Simule 10 minutes d&apos;attente : le rayon s&apos;élargit de 6 km.</p>
              <Button variant="outline" className="mt-3 w-full" onClick={widen} disabled={slot.radiusKm >= 24}>
                <Radar /> Simuler 10 min sans réponse
              </Button>
              {misses && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Écartés :{" "}
                  {Object.entries(misses)
                    .filter(([, n]) => n)
                    .map(([k, n]) => `${k.toLowerCase()} ${n}`)
                    .join(" · ")}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Catalog() {
  const [skill, setSkill] = useState<SkillId | null>(null);
  const state = useStore();
  const list = coachesNow(state).filter((c) => !skill || c.skills.includes(skill));

  return (
    <>
      <h1 className="font-heading text-3xl font-extrabold tracking-tight">Coachs du coin</h1>
      <p className="mt-1 text-muted-foreground">{list.length} coachs entre Bayonne, Anglet et Biarritz.</p>
      <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        <Chip active={!skill} onClick={() => setSkill(null)}>Tous</Chip>
        {SKILLS.map((s) => (
          <Chip key={s.id} active={skill === s.id} onClick={() => setSkill(s.id)}>
            {s.label}
          </Chip>
        ))}
      </div>
      <ul className="mt-5 grid gap-3 md:grid-cols-2">
        {list.map((c) => (
          <li key={c.id} className="rounded-3xl bg-card p-4 shadow-soft ring-1 ring-border/60">
            <div className="flex items-center gap-3">
              <Avatar name={c.name} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate font-heading font-bold">
                  {c.name}
                  {FAVORITES.includes(c.id) && <Heart className="size-3.5 fill-primary text-primary" aria-label="Favori" />}
                </p>
                <p className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="size-3.5" aria-hidden />{c.town}</span>
                  <span className="flex items-center gap-1"><Star className="size-3.5 fill-current" aria-hidden />{c.rating.toFixed(1)}</span>
                </p>
              </div>
              <p className="text-right font-heading font-bold">
                {c.minHourly} €<span className="text-xs font-medium text-muted-foreground">/h</span>
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {c.skills.map((s) => (
                <SkillChip key={s} skill={s} />
              ))}
            </div>
            <p className={cn("mt-3 flex items-center gap-1.5 text-xs font-semibold", c.diploma.verified ? "text-success-ink" : "text-warning-ink")}>
              <BadgeCheck className="size-4" aria-hidden />
              {c.diploma.label} · {c.diploma.verified ? "vérifié" : "en attente"}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
