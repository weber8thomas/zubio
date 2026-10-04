import { ArrowLeft, CalendarDays, Check, Clock, Hand, Plus, Send, Timer, Users, X, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useState } from "react";
import { fr } from "react-day-picker/locale";
import { toast } from "sonner";
import { AvatarStack, ClassTile } from "@/components/kit";
import { ClassPicker, Chip, Label, Segmented, SelectField, Stepper, ToggleRow } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { MAX_MONTHS_AHEAD } from "@/config/market";
import { AUDIENCES, CATEGORIES, classById, KINDS, LANGUAGES, LEVELS } from "@/data/classes";
import type { ClassId, Kind, Level, Slot } from "@/data/types";
import { addDays, dayLabel, duration as fmtDuration, endOf, iso, parse, today } from "@/lib/date";
import { go } from "@/lib/router";
import { actions, matchesFor, myVenue, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

// Publication pas à pas, à la manière de BlaBlaCar : une question par écran, en grand,
// des valeurs par défaut sensées ; sur ordinateur, le créneau se construit en direct à gauche.

const STEPS = ["cours", "date", "heure", "duree", "places", "prix", "mode", "details", "recap"] as const;
type Step = (typeof STEPS)[number];
const LABELS: Record<Step, string> = { cours: "Cours", date: "Date", heure: "Heure", duree: "Durée", places: "Participants", prix: "Tarif", mode: "Confirmation", details: "Détails", recap: "Récapitulatif" };

export function PublishWizard() {
  const state = useStore();
  const venue = myVenue();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [classId, setClassId] = useState<ClassId>(venue.classes[0]);
  const [date, setDate] = useState(addDays(today(), 1));
  const [start, setStart] = useState("18:30");
  const [duration, setDuration] = useState(classById(venue.classes[0]).duration);
  const [capacity, setCapacity] = useState(20);
  const [price, setPrice] = useState(classById(venue.classes[0]).avgPrice);
  const [instant, setInstant] = useState(false);
  const [level, setLevel] = useState<Level>("tous");
  const [kind, setKind] = useState<Kind>("remplacement");
  const [weeks, setWeeks] = useState(1);
  const [urgent, setUrgent] = useState(false);
  const [equipment, setEquipment] = useState(true);
  const [audience, setAudience] = useState(AUDIENCES[0]);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [notes, setNotes] = useState("");

  const input = { classId, date, start, duration, price, capacity, level, audience, language, kind, urgent, equipment, weeks, notes, instant };
  const matches = matchesFor(state, { ...input, id: "draft", venueId: venue.id, status: "open", publishedAt: 0 } as Slot);
  const c = classById(classId);
  const name = STEPS[step];

  const goTo = (n: number) => (setDir(n > step ? 1 : -1), setStep(n), window.scrollTo({ top: 0 }));
  const next = () => (step < STEPS.length - 1 ? goTo(step + 1) : publish());
  const chooseClass = (id: ClassId) => (setClassId(id), setDuration(classById(id).duration), setPrice(classById(id).avgPrice), goTo(1));
  const notified = `${matches.length} coach${matches.length > 1 ? "s" : ""} compatible${matches.length > 1 ? "s" : ""}`;

  function publish() {
    const id = actions.publish(input);
    toast.success("Créneau publié", { description: `${notified} prévenu${matches.length > 1 ? "s" : ""}.` });
    go(`/salle/creneau/${id}`);
  }

  const screens: Record<Step, { title: string; body: ReactNode; cta?: string; center?: boolean }> = {
    cours: { title: "Quel cours faut-il assurer ?", body: <ClassStep venueClasses={venue.classes} value={classId} onPick={chooseClass} /> },
    date: { title: "Quel jour ?", center: true, body: <DateStep date={date} setDate={(d) => (setDate(d), goTo(2))} /> },
    heure: { title: `${dayLabel(date, "long")}, à quelle heure ?`, center: true, body: <TimeStep value={start} onChange={setStart} /> },
    duree: { title: "Combien de temps dure le cours ?", center: true, body: <DurationStep value={duration} onChange={setDuration} start={start} /> },
    places: {
      title: "Combien de participants attendus ?",
      center: true,
      body: (
        <>
          <Stepper big value={capacity} onChange={setCapacity} min={1} max={200} label="le nombre de participants" />
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {[10, 15, 20, 25, 30, 40].map((n) => (
              <Chip key={n} active={n === capacity} onClick={() => setCapacity(n)}>
                {n}
              </Chip>
            ))}
          </div>
          <p className="mt-6 text-muted-foreground">Le coach adapte sa séance à la taille du groupe.</p>
        </>
      ),
    },
    prix: { title: "Votre tarif pour la séance", center: true, body: <PriceStep price={price} setPrice={setPrice} avg={c.avgPrice} duration={duration} count={matches.length} /> },
    mode: {
      title: "Comment choisir le coach ?",
      body: (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Choice
            active={!instant}
            onClick={() => setInstant(false)}
            icon={Hand}
            title="Je confirme parmi les candidats"
            text="Les coachs postulent (leur candidature les engage), vous comparez profils, avis et distance, puis vous confirmez."
            badge="Recommandé"
          />
          <Choice
            active={instant}
            onClick={() => setInstant(true)}
            icon={Zap}
            title="Réservation instantanée"
            text="Le premier coach compatible qui réserve est confirmé. Idéal pour un remplacement de dernière minute."
          />
        </div>
      ),
    },
    details: {
      title: "Quelques détails",
      body: (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-5">
            <div>
              <Label>Niveau</Label>
              <Segmented value={level} onChange={setLevel} options={LEVELS} />
            </div>
            <div>
              <Label>Type</Label>
              <Segmented value={kind} onChange={setKind} options={KINDS} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Public</Label>
                <SelectField value={audience} onChange={setAudience} options={AUDIENCES} label="Public" />
              </div>
              <div>
                <Label>Langue</Label>
                <SelectField value={language} onChange={setLanguage} options={LANGUAGES} label="Langue" />
              </div>
            </div>
          </div>
          <div className="space-y-5">
            <div className="divide-y divide-border/70 rounded-3xl bg-card px-4 ring-1 ring-border/70">
              <ToggleRow title="Urgent" text="Mis en avant et notification immédiate." checked={urgent} onChange={setUrgent} />
              <ToggleRow title="Chaque semaine" text={weeks > 1 ? `${weeks} semaines, jusqu'au ${dayLabel(addDays(date, (weeks - 1) * 7), "long").toLowerCase()}` : "Même jour, même heure, plusieurs semaines."} checked={weeks > 1} onChange={(v) => setWeeks(v ? 8 : 1)} />
              {weeks > 1 && (
                <div className="py-3">
                  <Stepper value={weeks} onChange={setWeeks} min={2} max={13} label="le nombre de semaines" suffix="sem." />
                </div>
              )}
              <ToggleRow title="Matériel fourni" text="Steps, barres, vélos, son…" checked={equipment} onChange={setEquipment} />
            </div>
            <div>
              <Label>Un mot pour le coach</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={280} placeholder="Studio 2, playlist à jour, accès par l'entrée arrière…" className="min-h-24" />
            </div>
          </div>
        </div>
      ),
    },
    recap: {
      title: "On publie ?",
      cta: `Publier · ${notified} prévenu${matches.length > 1 ? "s" : ""}`,
      body: (
        <>
          <div className="lg:hidden">
            <Ticket input={input} reached={STEPS.length} onEdit={goTo} matches={matches.map((m) => m.coach.id)} />
          </div>
          <div className="hidden rounded-3xl bg-card p-6 ring-1 ring-border/70 lg:block">
            <p className="text-[17px]">
              Votre créneau est prêt. Il sera envoyé à <b>{notified}</b> : leur zone d'intervention couvre votre salle, ils ont la certification et sont disponibles à ce tarif.
            </p>
            <p className="mt-3 text-muted-foreground">Cliquez sur une ligne du récapitulatif pour la modifier.</p>
          </div>
        </>
      ),
    },
  };
  const screen = screens[name];

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 lg:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <div className="sticky top-36">
          <Ticket input={input} reached={step} onEdit={goTo} matches={matches.map((m) => m.coach.id)} />
        </div>
      </aside>

      <div className="flex min-h-[calc(100dvh-9rem)] flex-col md:min-h-[calc(100dvh-12rem)]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => (step ? goTo(step - 1) : go("/salle"))}
            aria-label="Étape précédente"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-card ring-1 ring-border/70 transition hover:ring-border-strong active:scale-95"
          >
            <ArrowLeft className="size-5" aria-hidden />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between text-xs font-semibold text-muted-foreground">
              <span>{LABELS[name]}</span>
              <span className="tabular-nums">
                {step + 1}/{STEPS.length}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1}>
              <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }} transition={{ type: "spring", stiffness: 160, damping: 24 }} />
            </div>
          </div>
          <button type="button" onClick={() => go("/salle")} aria-label="Quitter" className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="size-5" aria-hidden />
          </button>
        </div>
        {step > 0 && (
          <button type="button" onClick={() => goTo(0)} className="mt-3 flex items-center gap-2 self-start rounded-full bg-card py-1 pr-3 pl-1 text-sm ring-1 ring-border/70 lg:hidden">
            <ClassTile id={classId} size="sm" />
            <span className="truncate font-semibold">
              {c.label} · {dayLabel(date)}
              {step > 2 && ` ${start}`}
              {step > 5 && ` · ${price} €`}
            </span>
          </button>
        )}

        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.section
            key={name}
            custom={dir}
            initial={{ opacity: 0, x: dir * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -28 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            className={cn("flex flex-1 flex-col pt-8 pb-36 md:pb-8", screen.center && "items-center justify-center text-center")}
          >
            <h1 className={cn("mb-8 font-heading text-[28px] leading-tight font-extrabold text-balance sm:text-[36px]", screen.center && "max-w-xl")}>{screen.title}</h1>
            <div className={cn("w-full", screen.center && "max-w-xl")}>{screen.body}</div>
          </motion.section>
        </AnimatePresence>

        {name !== "cours" && (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md md:static md:border-0 md:bg-transparent md:p-0 md:pb-4">
            <div className={cn("mx-auto", screen.center ? "max-w-md" : "max-w-none")}>
              <Button size="lg" className="h-14 w-full text-base" onClick={next}>
                {name === "recap" ? <Send /> : null}
                {screen.cta ?? "Continuer"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

type Input = { classId: ClassId; date: string; start: string; duration: number; price: number; capacity: number; instant: boolean; level: Level; kind: Kind; urgent: boolean; weeks: number };

/** Le créneau qui se construit au fil des étapes (cliquable pour revenir sur un choix). */
function Ticket({ input, reached, onEdit, matches }: { input: Input; reached: number; onEdit: (n: number) => void; matches: string[] }) {
  const c = classById(input.classId);
  const rows: [number, typeof Clock, string, string][] = [
    [1, CalendarDays, "Date", dayLabel(input.date, "long")],
    [2, Clock, "Horaire", `${input.start} – ${endOf(input.start, input.duration)}`],
    [3, Timer, "Durée", fmtDuration(input.duration)],
    [4, Users, "Participants", String(input.capacity)],
    [6, Hand, "Confirmation", input.instant ? "Réservation instantanée" : "Parmi les candidats"],
    [7, Check, "Détails", [LEVELS[input.level], KINDS[input.kind], input.urgent && "Urgent", input.weeks > 1 && `${input.weeks} sem.`].filter(Boolean).join(" · ")],
  ];
  return (
    <div className="overflow-hidden rounded-3xl bg-card shadow-lift ring-1 ring-border/70">
      <button type="button" onClick={() => onEdit(0)} className="flex w-full items-center gap-4 p-5 text-left hover:bg-muted/40">
        <ClassTile id={input.classId} size="lg" />
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold tracking-wide text-muted-foreground uppercase">{CATEGORIES[c.category].label}</span>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={c.id} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="block font-heading text-[22px] leading-tight font-extrabold">
              {c.label}
            </motion.span>
          </AnimatePresence>
        </span>
      </button>
      <div className="relative border-y border-dashed border-border-strong">
        <span className="absolute top-1/2 -left-3 size-6 -translate-y-1/2 rounded-full bg-background" />
        <span className="absolute top-1/2 -right-3 size-6 -translate-y-1/2 rounded-full bg-background" />
        <ul className="divide-y divide-border/60 px-5">
          {rows.map(([n, Icon, k, v]) => (
            <li key={k}>
              <button type="button" disabled={n > reached} onClick={() => onEdit(n)} className="flex w-full items-center gap-3 py-3 text-left disabled:cursor-default">
                <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="w-24 shrink-0 text-sm text-muted-foreground">{k}</span>
                <span className={cn("min-w-0 flex-1 truncate text-[15px] font-semibold", n > reached && "text-border-strong")}>{n > reached ? "—" : v}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <button type="button" disabled={5 > reached} onClick={() => onEdit(5)} className="flex w-full items-center justify-between gap-3 p-5 text-left">
        <span className="text-sm text-muted-foreground">Tarif de la séance</span>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={reached >= 5 ? input.price : "x"} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-heading text-[32px] leading-none font-extrabold tabular-nums">
            {reached >= 5 ? `${input.price} €` : "—"}
          </motion.span>
        </AnimatePresence>
      </button>
      <div className="flex items-center gap-3 bg-muted/60 px-5 py-3.5">
        <AvatarStack ids={matches} max={5} />
        <span className="text-sm">
          <b>{matches.length}</b> coach{matches.length > 1 ? "s" : ""} compatible{matches.length > 1 ? "s" : ""} seront prévenus
        </span>
      </div>
    </div>
  );
}

function ClassStep({ venueClasses, value, onPick }: { venueClasses: ClassId[]; value: ClassId; onPick: (id: ClassId) => void }) {
  return (
    <>
      <p className="mb-3 text-sm font-semibold text-muted-foreground">Les cours de votre salle</p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {venueClasses.map((id, i) => (
          <motion.li key={id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              whileHover={{ y: -2 }}
              onClick={() => onPick(id)}
              className={cn("flex h-full w-full flex-col items-start gap-3 rounded-3xl bg-card p-4 text-left ring-1 transition hover:shadow-lift", id === value ? "ring-2 ring-primary" : "ring-border/70")}
            >
              <ClassTile id={id} />
              <span className="min-w-0">
                <span className="line-clamp-2 block text-[16px] leading-tight font-bold">{classById(id).label}</span>
                <span className="mt-0.5 block text-[13px] text-muted-foreground">
                  {CATEGORIES[classById(id).category].label} · {classById(id).duration} min
                </span>
              </span>
            </motion.button>
          </motion.li>
        ))}
      </ul>
      <p className="mt-8 mb-3 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
        <Plus className="size-4" aria-hidden /> Un autre cours
      </p>
      <ClassPicker value={value} onChange={onPick} featured={[]} />
    </>
  );
}

function DateStep({ date, setDate }: { date: string; setDate: (d: string) => void }) {
  const first = parse(today());
  const last = new Date(first);
  last.setMonth(last.getMonth() + MAX_MONTHS_AHEAD);
  const quick = [0, 1, 2].map((n) => addDays(today(), n));
  return (
    <>
      <div className="mb-4 grid grid-cols-3 gap-2">
        {quick.map((d) => (
          <Chip key={d} active={d === date} onClick={() => setDate(d)} className="w-full">
            {dayLabel(d)}
          </Chip>
        ))}
      </div>
      <div className="flex justify-center rounded-3xl bg-card p-2 ring-1 ring-border/70 sm:p-4">
        <Calendar
          mode="single"
          locale={fr}
          selected={parse(date)}
          onSelect={(d) => d && setDate(iso(d))}
          disabled={{ before: first, after: last }}
          startMonth={first}
          endMonth={last}
          className="w-full bg-transparent [--cell-size:--spacing(11)] sm:[--cell-size:--spacing(14)]"
        />
      </div>
    </>
  );
}

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6);
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
const USUAL = ["07:00", "09:30", "12:15", "18:00", "18:30", "19:30"];

/** Heure au format 24 h : grandes touches pour l'heure puis les minutes. */
function TimeStep({ value, onChange }: { value: string; onChange: (t: string) => void }) {
  const [h, m] = value.split(":");
  return (
    <>
      <p className="font-heading text-[64px] leading-none font-extrabold tabular-nums sm:text-[80px]">
        {h}
        <span className="text-primary">:</span>
        {m}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {USUAL.map((t) => (
          <Chip key={t} small active={t === value} onClick={() => onChange(t)}>
            {t}
          </Chip>
        ))}
      </div>
      <p className="mt-8 mb-2 text-left text-sm font-semibold text-muted-foreground">Heure</p>
      <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-9">
        {HOURS.map((n) => {
          const hh = String(n).padStart(2, "0");
          return (
            <Chip key={hh} active={hh === h} onClick={() => onChange(`${hh}:${m}`)} className="w-full px-0 tabular-nums">
              {hh}
            </Chip>
          );
        })}
      </div>
      <p className="mt-5 mb-2 text-left text-sm font-semibold text-muted-foreground">Minutes</p>
      <div className="grid grid-cols-6 gap-1.5">
        {MINUTES.map((mm) => (
          <Chip key={mm} active={mm === m} onClick={() => onChange(`${h}:${mm}`)} className="w-full px-0 tabular-nums">
            {mm}
          </Chip>
        ))}
      </div>
    </>
  );
}

function DurationStep({ value, onChange, start }: { value: number; onChange: (m: number) => void; start: string }) {
  return (
    <>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.p key={value} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-heading text-[64px] leading-none font-extrabold tabular-nums sm:text-[80px]">
          {fmtDuration(value)}
        </motion.p>
      </AnimatePresence>
      <p className="mt-3 text-muted-foreground">
        {start} – <b className="text-foreground tabular-nums">{endOf(start, value)}</b>
      </p>
      <Slider className="mt-10" value={[value]} min={15} max={180} step={5} onValueChange={([v]) => onChange(v)} aria-label="Durée en minutes" />
      <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {[30, 45, 50, 55, 60, 90].map((n) => (
          <Chip key={n} active={n === value} onClick={() => onChange(n)} className="w-full px-0">
            {fmtDuration(n)}
          </Chip>
        ))}
      </div>
    </>
  );
}

function PriceStep({ price, setPrice, avg, duration, count }: { price: number; setPrice: (n: number) => void; avg: number; duration: number; count: number }) {
  const low = Math.round(avg * 0.9);
  const high = Math.round(avg * 1.1);
  const verdict =
    price < low
      ? { tone: "bg-warning-soft text-warning-ink", text: "Un peu bas : moins de coachs postuleront." }
      : price > high
        ? { tone: "bg-success-soft text-success-ink", text: "Au-dessus de la moyenne : candidatures rapides." }
        : { tone: "bg-success-soft text-success-ink", text: "Tarif recommandé : idéal pour trouver vite." };
  return (
    <>
      <Stepper big value={price} onChange={setPrice} min={10} max={300} suffix="€" label="le tarif" />
      <p className="mt-4 text-muted-foreground">
        soit {Math.round(price / (duration / 60))} €/h · moyenne constatée {low}–{high} €
      </p>
      <div className="mx-auto mt-6 h-2 max-w-sm rounded-full bg-muted">
        <motion.div className="h-full rounded-full bg-success" animate={{ width: `${Math.min(100, Math.max(5, ((price - low * 0.7) / (high * 1.3 - low * 0.7)) * 100))}%` }} />
      </div>
      <motion.p key={verdict.text} initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={cn("mt-5 inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-semibold", verdict.tone)}>
        <Check className="size-4" aria-hidden /> {verdict.text}
      </motion.p>
      <p className="mt-3 text-sm text-muted-foreground">
        {count} coach{count > 1 ? "s" : ""} compatible{count > 1 ? "s" : ""} à ce tarif
      </p>
    </>
  );
}

function Choice({ active, onClick, icon: Icon, title, text, badge }: { active: boolean; onClick: () => void; icon: typeof Zap; title: string; text: string; badge?: string }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      aria-pressed={active}
      className={cn("flex h-full items-start gap-4 rounded-3xl bg-card p-5 text-left ring-1 transition", active ? "ring-2 ring-primary" : "ring-border/70 hover:ring-border-strong")}
    >
      <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-[14px]", active ? "bg-primary text-white" : "bg-muted text-ink-soft")}>
        <Icon className="size-6" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2 font-bold">
          {title}
          {badge && <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs text-success-ink">{badge}</span>}
        </span>
        <span className="mt-1 block text-sm text-muted-foreground">{text}</span>
      </span>
      <span className={cn("mt-1 size-5 shrink-0 rounded-full border-2", active ? "border-[6px] border-primary" : "border-border-strong")} />
    </motion.button>
  );
}
