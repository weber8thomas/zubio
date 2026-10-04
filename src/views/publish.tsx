import { ArrowLeft, Check, ChevronRight, Hand, Plus, Send, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useState } from "react";
import { fr } from "react-day-picker/locale";
import { toast } from "sonner";
import { ClassTile } from "@/components/kit";
import { MapView, RadiusControl } from "@/components/map";
import { ClassPicker, DurationField, Label, Segmented, SelectField, Stepper, TimeField, ToggleRow } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { MAX_MONTHS_AHEAD } from "@/config/market";
import { AUDIENCES, CATEGORIES, classById, KINDS, LANGUAGES, LEVELS } from "@/data/classes";
import { COACHES } from "@/data/coaches";
import type { ClassId, Kind, Level, Slot } from "@/data/types";
import { addDays, dayLabel, duration as fmtDuration, endOf, iso, parse, today } from "@/lib/date";
import { go } from "@/lib/router";
import { actions, matchesFor, myVenue, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

// Publication pas à pas, à la manière de BlaBlaCar : une question par écran,
// des valeurs par défaut sensées, les options secondaires à la fin.

const STEPS = ["cours", "quand", "duree", "places", "prix", "zone", "mode", "details", "recap"] as const;
type Step = (typeof STEPS)[number];

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
  const [radiusKm, setRadius] = useState(10);
  const [instant, setInstant] = useState(false);
  const [level, setLevel] = useState<Level>("tous");
  const [kind, setKind] = useState<Kind>("remplacement");
  const [weeks, setWeeks] = useState(1);
  const [urgent, setUrgent] = useState(false);
  const [equipment, setEquipment] = useState(true);
  const [audience, setAudience] = useState(AUDIENCES[0]);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [notes, setNotes] = useState("");

  const input = { classId, date, start, duration, price, radiusKm, capacity, level, audience, language, kind, urgent, equipment, weeks, notes, instant };
  const matches = matchesFor(state, { ...input, id: "draft", venueId: venue.id, status: "open", publishedAt: 0 } as Slot);
  const c = classById(classId);
  const name = STEPS[step];

  const goTo = (n: number) => (setDir(n > step ? 1 : -1), setStep(n), window.scrollTo({ top: 0 }));
  const next = () => (step < STEPS.length - 1 ? goTo(step + 1) : publish());
  const chooseClass = (id: ClassId) => (setClassId(id), setDuration(classById(id).duration), setPrice(classById(id).avgPrice), goTo(1));

  function publish() {
    const id = actions.publish(input);
    toast.success("Créneau publié", { description: `${matches.length} coach${matches.length > 1 ? "s" : ""} compatible${matches.length > 1 ? "s" : ""} prévenu${matches.length > 1 ? "s" : ""}.` });
    go(`/salle/creneau/${id}`);
  }

  const screens: Record<Step, { title: string; body: ReactNode; cta?: string }> = {
    cours: {
      title: "Quel cours faut-il assurer ?",
      body: <ClassStep venueClasses={venue.classes} value={classId} onPick={chooseClass} />,
    },
    quand: { title: "Quand ?", body: <WhenStep date={date} setDate={setDate} start={start} setStart={setStart} /> },
    duree: { title: "Combien de temps dure le cours ?", body: <DurationField value={duration} onChange={setDuration} start={start} /> },
    places: {
      title: "Combien de participants attendus ?",
      body: (
        <>
          <Stepper value={capacity} onChange={setCapacity} min={1} max={200} label="le nombre de participants" />
          <p className="mt-3 text-sm text-muted-foreground">Le coach adapte sa séance à la taille du groupe.</p>
        </>
      ),
    },
    prix: { title: "Votre tarif pour la séance", body: <PriceStep price={price} setPrice={setPrice} avg={c.avgPrice} duration={duration} count={matches.length} /> },
    zone: {
      title: "Jusqu'où chercher ?",
      body: (
        <div className="overflow-hidden rounded-3xl ring-1 ring-border/70">
          <MapView
            className="h-72"
            center={venue}
            radiusKm={radiusKm}
            zoomKm={Math.max(radiusKm, 4)}
            markers={[
              { id: "venue", kind: "venue", lat: venue.lat, lng: venue.lng },
              ...COACHES.map((co) => ({ id: co.id, kind: "coach" as const, lat: co.lat, lng: co.lng, label: co.id, state: matches.some((m) => m.coach.id === co.id) ? ("active" as const) : ("idle" as const) })),
            ]}
          />
          <RadiusControl value={radiusKm} onChange={setRadius} count={matches.length} />
        </div>
      ),
    },
    mode: {
      title: "Comment confirmer le coach ?",
      body: (
        <div className="grid grid-cols-1 gap-3">
          <Choice
            active={!instant}
            onClick={() => setInstant(false)}
            icon={Hand}
            title="Je choisis parmi les candidats"
            text="Les coachs postulent, vous comparez profils, avis et distance, puis vous choisissez."
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
      cta: "Continuer",
      body: (
        <div className="space-y-5">
          <div>
            <Label>Niveau</Label>
            <Segmented value={level} onChange={setLevel} options={LEVELS} />
          </div>
          <div>
            <Label>Type</Label>
            <Segmented value={kind} onChange={setKind} options={KINDS} />
          </div>
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
          <details className="group rounded-3xl bg-card p-4 ring-1 ring-border/70">
            <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
              Plus d'options
              <ChevronRight className="size-4 transition group-open:rotate-90" aria-hidden />
            </summary>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <Label>Public</Label>
                <SelectField value={audience} onChange={setAudience} options={AUDIENCES} label="Public" />
              </div>
              <div>
                <Label>Langue</Label>
                <SelectField value={language} onChange={setLanguage} options={LANGUAGES} label="Langue" />
              </div>
            </div>
            <div className="mt-4">
              <Label>Un mot pour le coach</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={280} placeholder="Studio 2, playlist à jour, accès par l'entrée arrière…" className="min-h-20" />
            </div>
          </details>
        </div>
      ),
    },
    recap: {
      title: "On publie ?",
      cta: `Publier · ${matches.length} coach${matches.length > 1 ? "s" : ""} prévenu${matches.length > 1 ? "s" : ""}`,
      body: (
        <ul className="divide-y divide-border/70 overflow-hidden rounded-3xl bg-card ring-1 ring-border/70">
          {(
            [
              [0, "Cours", c.label],
              [1, "Quand", `${dayLabel(date, "long")} · ${start}–${endOf(start, duration)}`],
              [2, "Durée", fmtDuration(duration)],
              [3, "Participants", `${capacity}`],
              [4, "Tarif", `${price} €`],
              [5, "Zone", `${radiusKm} km · ${matches.length} coachs compatibles`],
              [6, "Confirmation", instant ? "Réservation instantanée" : "Je choisis parmi les candidats"],
              [7, "Détails", [LEVELS[level], KINDS[kind], urgent && "Urgent", weeks > 1 && `${weeks} semaines`].filter(Boolean).join(" · ")],
            ] as const
          ).map(([n, k, v]) => (
            <li key={k}>
              <button type="button" onClick={() => goTo(n)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/50">
                <span className="w-28 shrink-0 text-sm text-muted-foreground">{k}</span>
                <span className="min-w-0 flex-1 truncate font-semibold">{v}</span>
                <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ),
    },
  };
  const screen = screens[name];

  return (
    <div className="mx-auto max-w-xl">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => (step ? goTo(step - 1) : go("/salle"))}
          aria-label="Retour"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-card ring-1 ring-border/70 transition hover:ring-border-strong active:scale-95"
        >
          <ArrowLeft className="size-5" aria-hidden />
        </button>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1}>
          <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }} transition={{ type: "spring", stiffness: 160, damping: 24 }} />
        </div>
        <span className="w-10 text-right text-xs font-semibold text-muted-foreground tabular-nums">
          {step + 1}/{STEPS.length}
        </span>
      </div>

      <AnimatePresence mode="wait" custom={dir} initial={false}>
        <motion.section
          key={name}
          custom={dir}
          initial={{ opacity: 0, x: dir * 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: dir * -28 }}
          transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
          className="pt-8 pb-36 md:pb-10"
        >
          <h1 className="mb-6 font-heading text-[26px] leading-tight font-extrabold sm:text-[30px]">{screen.title}</h1>
          {screen.body}
        </motion.section>
      </AnimatePresence>

      {name !== "cours" && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md md:static md:border-0 md:bg-transparent md:p-0">
          <div className="mx-auto max-w-xl">
            <Button size="lg" className="w-full" onClick={next}>
              {name === "recap" ? <Send /> : null}
              {screen.cta ?? "Continuer"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ClassStep({ venueClasses, value, onPick }: { venueClasses: ClassId[]; value: ClassId; onPick: (id: ClassId) => void }) {
  return (
    <>
      <p className="mb-3 text-sm font-semibold text-muted-foreground">Les cours de votre salle</p>
      <ul className="grid grid-cols-2 gap-2.5">
        {venueClasses.map((id, i) => (
          <motion.li key={id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => onPick(id)}
              className={cn("flex w-full items-center gap-3 rounded-3xl bg-card p-3 text-left ring-1 transition hover:shadow-lift", id === value ? "ring-2 ring-primary" : "ring-border/70")}
            >
              <ClassTile id={id} size="sm" />
              <span className="min-w-0">
                <span className="line-clamp-2 block leading-tight font-semibold">{classById(id).label}</span>
                <span className="block text-xs text-muted-foreground">{CATEGORIES[classById(id).category].label}</span>
              </span>
            </motion.button>
          </motion.li>
        ))}
      </ul>
      <p className="mt-6 mb-3 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
        <Plus className="size-4" aria-hidden /> Un autre cours
      </p>
      <ClassPicker value={value} onChange={onPick} featured={[]} />
    </>
  );
}

function WhenStep({ date, setDate, start, setStart }: { date: string; setDate: (d: string) => void; start: string; setStart: (t: string) => void }) {
  const first = parse(today());
  const last = new Date(first);
  last.setMonth(last.getMonth() + MAX_MONTHS_AHEAD);
  return (
    <div className="space-y-5">
      <div className="flex justify-center rounded-3xl bg-card p-2 ring-1 ring-border/70">
        <Calendar mode="single" locale={fr} selected={parse(date)} onSelect={(d) => d && setDate(iso(d))} disabled={{ before: first, after: last }} startMonth={first} endMonth={last} className="w-full max-w-sm" />
      </div>
      <div>
        <Label hint={dayLabel(date, "long")}>Heure de début</Label>
        <TimeField value={start} onChange={setStart} />
      </div>
    </div>
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
    <div className="text-center">
      <div className="flex items-center justify-center gap-6">
        <PriceButton label="Baisser le tarif d'un euro" onClick={() => setPrice(Math.max(10, price - 1))}>
          −
        </PriceButton>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p key={price} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="min-w-36 font-heading text-[52px] leading-none font-extrabold whitespace-nowrap tabular-nums">
            {price} €
          </motion.p>
        </AnimatePresence>
        <PriceButton label="Augmenter le tarif d'un euro" onClick={() => setPrice(Math.min(300, price + 1))}>
          +
        </PriceButton>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">soit {Math.round(price / (duration / 60))} €/h · moyenne constatée {low}–{high} €</p>
      <motion.p key={verdict.text} initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={cn("mx-auto mt-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold", verdict.tone)}>
        <Check className="size-4" aria-hidden /> {verdict.text}
      </motion.p>
      <p className="mt-3 text-sm text-muted-foreground">
        {count} coach{count > 1 ? "s" : ""} compatible{count > 1 ? "s" : ""} à ce tarif
      </p>
    </div>
  );
}

function PriceButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <motion.button type="button" whileTap={{ scale: 0.9 }} aria-label={label} onClick={onClick} className="flex size-14 shrink-0 items-center justify-center rounded-full bg-card font-heading text-3xl font-extrabold ring-1 ring-border-strong hover:bg-muted">
      {children}
    </motion.button>
  );
}

function Choice({ active, onClick, icon: Icon, title, text, badge }: { active: boolean; onClick: () => void; icon: typeof Zap; title: string; text: string; badge?: string }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      aria-pressed={active}
      className={cn("flex items-start gap-4 rounded-3xl bg-card p-4 text-left ring-1 transition", active ? "ring-2 ring-primary" : "ring-border/70 hover:ring-border-strong")}
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
