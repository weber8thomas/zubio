import { AlertCircle, CalendarDays, CalendarPlus, Check, Compass, List, LocateFixed, Map as MapIcon, MapPin, Phone, Route, SlidersHorizontal, UserRound, X, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { BackLink, ClassTile, Empty, PageTitle, Section, SlotCard, Status, Steps, Tap, stagger } from "@/components/kit";
import { MapView } from "@/components/map";
import { Chip } from "@/components/pickers";
import { CoachProfile, Confirmed, SlotFacts, SlotHeader } from "@/components/profiles";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { MARKET } from "@/config/market";
import { CATEGORIES, classById } from "@/data/classes";
import { ME } from "@/data/coaches";
import type { CategoryId, Point, Slot } from "@/data/types";
import { addDays, dayLabel, endOf, today } from "@/lib/date";
import { distanceKm, inMarket, km } from "@/lib/geo";
import { fit } from "@/lib/matching";
import { go } from "@/lib/router";
import { actions, live, slotById, slotStep, SLOT_STEPS, type State, useStore, venueById } from "@/lib/store";
import { CoachTax, InvoicePage } from "./billing";
import { cn } from "@/lib/utils";

export function CoachSpace({ route }: { route: string[] }) {
  const [page, id] = route;
  const tabs = [
    { href: "#/coach", label: "Explorer", icon: Compass, active: !page || page === "creneau" },
    { href: "#/coach/planning", label: "Planning", icon: CalendarDays, active: page === "planning" || page === "mission" },
    { href: "#/coach/profil", label: "Profil", icon: UserRound, active: page === "profil" || page === "facture" },
  ];
  return (
    <Shell space="coach" tabs={tabs} page={route.join("/")}>
      {page === "creneau" && id ? <SlotPage id={id} /> : page === "planning" ? <Planning /> : page === "mission" && id ? <Mission id={id} /> : page === "profil" ? <Profile /> : page === "facture" && id ? <InvoicePage id={id} back="#/coach/profil" backLabel="Profil" canDecide={false} /> : <Explore />}
    </Shell>
  );
}

const myApp = (s: State, slotId: string) => s.applications.find((a) => a.slotId === slotId && a.coachId === ME.id && a.status !== "withdrawn");
const invitedTo = (s: State, slotId: string) => s.invites.some((i) => i.slotId === slotId && i.coachId === ME.id);

type Sort = "date" | "distance" | "prix";
const SORTS: Record<Sort, string> = { date: "Plus tôt", distance: "Plus proche", prix: "Mieux payé" };
const WHEN = { all: "Toutes dates", today: "Aujourd'hui", tomorrow: "Demain", week: "7 jours" } as const;
type When = keyof typeof WHEN;

function Explore() {
  const state = useStore();
  const [origin, setOrigin] = useState<Point & { label: string }>({ ...ME, label: `Chez moi · ${ME.town}` });
  const me = live(state, ME);
  const [maxKm, setMaxKm] = useState(me.radiusKm);
  const [cat, setCat] = useState<CategoryId | null>(null);
  const [onlyFit, setOnlyFit] = useState(true);
  const [when, setWhen] = useState<When>("all");
  const [sort, setSort] = useState<Sort>("date");
  const [view, setView] = useState<"list" | "map">("list");
  const [filters, setFilters] = useState(false);

  const t = today();
  const limit = when === "today" ? t : when === "tomorrow" ? addDays(t, 1) : when === "week" ? addDays(t, 7) : "9999";
  const open = state.slots
    .filter((s) => s.status === "open" && s.date >= (when === "tomorrow" ? addDays(t, 1) : t) && s.date <= limit)
    .map((s) => ({ s, v: venueById(s.venueId), f: fit(me, s, venueById(s.venueId), state.certs) }))
    .map((x) => ({ ...x, d: distanceKm(origin, x.v) }))
    .filter((x) => x.d <= maxKm && (!cat || classById(x.s.classId).category === cat) && (!onlyFit || x.f.ok || invitedTo(state, x.s.id)))
    .sort(
      (a, b) =>
        +invitedTo(state, b.s.id) - +invitedTo(state, a.s.id) ||
        (sort === "distance" ? a.d - b.d : sort === "prix" ? b.s.price - a.s.price : (a.s.date + a.s.start).localeCompare(b.s.date + b.s.start)),
    );
  const covered = inMarket(origin);
  const active = [cat, !onlyFit, maxKm !== me.radiusKm].filter(Boolean).length;

  function locate() {
    if (!navigator.geolocation) return toast.error("Géolocalisation indisponible");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const here = { lat: p.coords.latitude, lng: p.coords.longitude, label: "Ma position" };
        setOrigin(here);
        toast(inMarket(here) ? "Créneaux autour de vous" : "Zubio n'est pas encore ouvert ici");
      },
      () => toast.error("Position refusée : on reste autour de chez vous"),
    );
  }

  return (
    <>
      <h1 className="font-heading text-[26px] leading-tight font-extrabold text-balance sm:text-[32px]">Trouver un créneau</h1>

      <div className="mt-5 overflow-hidden rounded-3xl bg-card shadow-soft ring-1 ring-border/70">
        <button type="button" onClick={locate} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/50">
          <span className="size-3.5 shrink-0 rounded-full border-[3px] border-primary" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block text-xs text-muted-foreground">Autour de</span>
            <span className="block truncate font-semibold">{origin.label}</span>
          </span>
          <LocateFixed className="size-5 text-muted-foreground" aria-label="Me localiser" />
        </button>
        <div className="border-t border-border/70 px-4 py-3">
          <span className="block text-xs text-muted-foreground">Quand</span>
          <div className="scroll-row -mx-1 mt-1.5 flex gap-1.5 overflow-x-auto px-1 pb-1">
            {(Object.keys(WHEN) as When[]).map((k) => (
              <Chip key={k} small active={when === k} onClick={() => setWhen(k)}>
                {WHEN[k]}
              </Chip>
            ))}
          </div>
        </div>
        <button type="button" onClick={() => setFilters(true)} className="flex w-full items-center gap-3 border-t border-border/70 px-4 py-3.5 text-left hover:bg-muted/50">
          <SlidersHorizontal className="size-5 text-muted-foreground" aria-hidden />
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold">
              {cat ? CATEGORIES[cat].label : "Tous les cours"} · {maxKm} km
            </span>
            {onlyFit && <FitPill>Compatibles</FitPill>}
          </span>
          {active > 0 && <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{active}</span>}
        </button>
      </div>

      <div className="mt-6 mb-3 flex items-center justify-between gap-3">
        <div className="scroll-row -mx-1 flex min-w-0 gap-1 overflow-x-auto px-1">
          {(Object.keys(SORTS) as Sort[]).map((k) => (
            <button key={k} type="button" onClick={() => setSort(k)} aria-pressed={sort === k} className={cn("relative h-9 shrink-0 rounded-full px-3 text-sm font-semibold", sort === k ? "text-foreground" : "text-muted-foreground")}>
              {sort === k && <motion.span layoutId="sort-pill" className="absolute inset-0 rounded-full bg-muted" />}
              <span className="relative">{SORTS[k]}</span>
            </button>
          ))}
        </div>
        <div className="flex shrink-0 rounded-full bg-muted p-1">
          {(["list", "map"] as const).map((v) => (
            <button key={v} type="button" onClick={() => setView(v)} aria-label={v === "list" ? "Liste" : "Carte"} aria-pressed={view === v} className={cn("relative flex size-9 items-center justify-center rounded-full", view === v ? "text-foreground" : "text-muted-foreground")}>
              {view === v && <motion.span layoutId="view-pill" className="absolute inset-0 rounded-full bg-card shadow-soft" />}
              {v === "list" ? <List className="relative size-4" /> : <MapIcon className="relative size-4" />}
            </button>
          ))}
        </div>
      </div>

      {!covered ? (
        <Empty>
          <p className="font-semibold text-foreground">Zubio arrive bientôt ici.</p>
          <p className="mt-1">Nous démarrons à {MARKET.name}. Laissez votre profil : on vous prévient à l'ouverture.</p>
        </Empty>
      ) : view === "map" ? (
        <div className="overflow-hidden rounded-3xl ring-1 ring-border/70">
          <MapView
            className="h-[60dvh] max-h-[560px]"
            center={origin}
            zoomKm={maxKm}
            radiusKm={maxKm}
            markers={[
              { id: "me", kind: "venue", lat: origin.lat, lng: origin.lng },
              ...open.map(({ s, v }, i) => ({ id: s.id, kind: "slot" as const, lat: v.lat + i * 0.0006, lng: v.lng, label: `${s.price} €`, state: s.urgent ? ("active" as const) : ("idle" as const), onClick: () => go(`/coach/creneau/${s.id}`) })),
            ]}
          />
        </div>
      ) : open.length ? (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {open.map(({ s, v, f, d }, i) => (
            <motion.li key={s.id} layout {...stagger(i)}>
              <SlotTile slot={s} venueName={v.name} where={`${v.town} · ${km(d)}`} fitOk={f.ok} reason={f.reason} applied={!!myApp(state, s.id)} invited={invitedTo(state, s.id)} showFit={!onlyFit || !f.ok} />
            </motion.li>
          ))}
        </ul>
      ) : (
        <Empty>Rien pour ces critères. Élargissez la distance ou les dates.</Empty>
      )}

      <Dialog open={filters} onOpenChange={setFilters}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="font-heading text-xl">Filtres</DialogTitle>
          <div className="space-y-6">
            <div>
              <div className="mb-2 flex items-baseline justify-between text-sm">
                <span className="font-semibold">Distance maximale</span>
                <span className="font-heading font-extrabold tabular-nums">{maxKm} km</span>
              </div>
              <Slider value={[maxKm]} min={1} max={30} step={1} onValueChange={([v]) => setMaxKm(v)} aria-label="Distance maximale" />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold">Cours</p>
              <div className="flex flex-wrap gap-1.5">
                <Chip small active={!cat} onClick={() => setCat(null)}>
                  Tous
                </Chip>
                {(Object.keys(CATEGORIES) as CategoryId[]).map((k) => (
                  <Chip key={k} small active={cat === k} onClick={() => setCat(k)}>
                    {CATEGORIES[k].label}
                  </Chip>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-[11px] bg-success-soft text-success-ink">
                <Check className="size-[18px]" aria-hidden />
              </span>
              <span className="flex-1">
                <span className="block font-semibold">Compatibles uniquement</span>
                <span className="block text-sm text-muted-foreground">Certification, disponibilité et tarif minimum.</span>
              </span>
              <Switch checked={onlyFit} onCheckedChange={setOnlyFit} />
            </label>
            <Button size="lg" className="w-full" onClick={() => setFilters(false)}>
              Voir {open.length} créneau{open.length > 1 ? "x" : ""}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Pastille « compatible » : distincte des filtres de cours. */
const FitPill = ({ children = "Compatible" }: { children?: string }) => (
  <span className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-success-soft px-2.5 text-[13px] font-semibold whitespace-nowrap text-success-ink">
    <Check className="size-3.5" aria-hidden />
    {children}
  </span>
);

/** Carte résultat façon frise : début ○ ── fin ●, cours et salle, prix. */
function SlotTile({ slot, venueName, where, fitOk, reason, applied, invited, showFit }: { slot: Slot; venueName: string; where: string; fitOk: boolean; reason: string; applied: boolean; invited: boolean; showFit: boolean }) {
  return (
    <SlotCard
      href={`#/coach/creneau/${slot.id}`}
      classId={slot.classId}
      title={classById(slot.classId).label}
      when={dayLabel(slot.date)}
      times={[slot.start, endOf(slot.start, slot.duration)]}
      price={slot.price}
      sub={
        <>
          <p className="truncate font-medium text-foreground">{venueName}</p>
          <p className="truncate">{where}</p>
        </>
      }
      footer={
        <div className="flex flex-wrap items-center gap-1.5">
          <ClassTile id={slot.classId} size="sm" />
          {applied ? (
            <Status status="pending" label="Candidature envoyée" />
          ) : fitOk ? (
            showFit && <FitPill />
          ) : (
            <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-muted px-2.5 text-[13px] font-semibold text-muted-foreground">
              <AlertCircle className="size-3.5" aria-hidden />
              {reason}
            </span>
          )}
          {slot.instant && (
            <span className="inline-flex h-7 items-center gap-1 rounded-full bg-primary-soft px-2.5 text-[13px] font-semibold text-primary-ink">
              <Zap className="size-3.5" aria-hidden /> Instantané
            </span>
          )}
          {invited && <span className="inline-flex h-7 items-center rounded-full bg-primary-soft px-2.5 text-[13px] font-semibold text-primary-ink">Invité·e</span>}
          {slot.urgent && <span className="inline-flex h-7 items-center rounded-full bg-warning-soft px-2.5 text-[13px] font-semibold text-warning-ink">Urgent</span>}
        </div>
      }
    />
  );
}

function SlotPage({ id }: { id: string }) {
  const state = useStore();
  const slot = slotById(state, id);
  const [message, setMessage] = useState("");
  if (!slot) return <Empty>Créneau introuvable.</Empty>;
  const venue = venueById(slot.venueId);
  const f = fit(live(state, ME), slot, venue, state.certs);
  const app = myApp(state, id);
  const mine = slot.coachId === ME.id;

  return (
    <>
      <BackLink href="#/coach">Explorer</BackLink>
      <div className="mt-2">
        <SlotHeader slot={slot} status={app ? <Status status={app.status} label={app.status === "pending" ? "Candidature envoyée" : undefined} /> : <Status status={slot.status} />} />
      </div>
      {app && (
        <div className="mt-6 rounded-3xl bg-card px-3 py-4 ring-1 ring-border/70">
          <Steps steps={["Candidature", "Retenu·e", "Confirmé", "Réalisé", "Payé"]} current={slot.status === "done" ? 4 : mine ? 3 : app.status === "offered" ? 1 : 0} />
        </div>
      )}

      {mine && (
        <div className="mt-6">
          <Confirmed coachId={ME.id} title="Vous êtes retenu·e" subtitle={`${venue.name} vous attend.`} />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-3xl ring-1 ring-border/70">
            <MapView
              className="h-64"
              center={venue}
              zoomKm={Math.max(distanceKm(ME, venue) * 1.2, 2)}
              markers={[
                { id: "venue", kind: "venue", lat: venue.lat, lng: venue.lng },
                { id: "me", kind: "coach", lat: ME.lat, lng: ME.lng, label: ME.id, state: "active" },
              ]}
            />
            <p className="flex items-center gap-2 bg-card px-4 py-3 text-sm">
              <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
              <span className="line-clamp-2 min-w-0 flex-1">{venue.address}</span>
              <span className="shrink-0 font-semibold">{km(f.km)}</span>
            </p>
          </div>
          <SlotFacts slot={slot} />
        </div>

        {slot.status === "open" && (
          <div className="order-first lg:sticky lg:top-36 lg:order-none lg:self-start">
            <AnimatePresence mode="wait" initial={false}>
              {app?.status === "offered" ? (
                <motion.div key="offered" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl bg-card p-5 shadow-lift ring-2 ring-primary">
                  <p className="font-heading text-lg font-semibold">{venue.name} vous a retenu·e</p>
                  <p className="mt-1 text-sm text-ink-soft">Confirmez votre venue sous 12 h. Une fois confirmé, c'est un engagement : en cas d'imprévu, prévenez la salle au plus vite.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="lg" className="flex-1" onClick={() => (actions.confirm(app.id), toast.success("C'est confirmé, des deux côtés", { description: `${venue.name} est prévenu·e.` }), go(`/coach/mission/${slot.id}`))}>
                      <Check /> Je confirme
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => (actions.decline(app.id), toast("Mission déclinée", { description: "La salle peut retenir un autre coach." }))}>
                      Décliner
                    </Button>
                  </div>
                </motion.div>
              ) : app?.status === "declined" ? (
                <motion.div key="declined" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl bg-muted p-5 text-sm text-muted-foreground">
                  Vous avez décliné cette mission.
                </motion.div>
              ) : app ? (
                <motion.div key="applied" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl bg-warning-soft p-5">
                  <p className="font-heading text-lg font-semibold">En attente de la salle</p>
                  <p className="mt-1 text-sm text-ink-soft">La salle compare les profils et vous répond vite. Vous êtes prévenu·e dès qu'elle choisit.</p>
                  <Button variant="outline" className="mt-4" onClick={() => (actions.withdraw(app.id), toast("Candidature retirée"))}>
                    <X /> Retirer ma candidature
                  </Button>
                </motion.div>
              ) : (
                <motion.div key="apply" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-card p-5 ring-1 ring-border/70">
                  <p className="font-heading text-lg font-semibold">{slot.instant ? "Réservation instantanée" : "Postuler"}</p>
                  <p className={cn("mt-2 flex items-center gap-1.5 text-sm font-semibold", f.ok ? "text-success-ink" : "text-warning-ink")}>
                    {f.ok ? <Check className="size-4" /> : <AlertCircle className="size-4" />}
                    {f.ok ? "Votre profil correspond à ce créneau." : `À vérifier : ${f.reason.toLowerCase()}`}
                  </p>
                  <Textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={240} placeholder="Un mot pour la salle (facultatif)" className="mt-4 min-h-20" />
                  {slot.instant ? (
                    <Button
                      size="lg"
                      className="mt-4 w-full"
                      disabled={!f.ok}
                      onClick={() => {
                        actions.book(slot.id);
                        toast.success("Réservé, c'est confirmé", { description: `${venue.name} est prévenu·e.` });
                        go(`/coach/mission/${slot.id}`);
                      }}
                    >
                      <Zap /> Réserver pour {slot.price} €
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      className="mt-4 w-full"
                      disabled={!f.ok}
                      onClick={() => {
                        actions.apply(slot.id, message);
                        toast.success("Candidature envoyée", { description: `${venue.name} va comparer les profils.` });
                      }}
                    >
                      Postuler pour {slot.price} €
                    </Button>
                  )}
                  {!f.ok && <p className="mt-2 text-center text-xs text-muted-foreground">Complétez votre profil ou vos disponibilités pour postuler.</p>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </>
  );
}

function Planning() {
  const state = useStore();
  const missions = state.slots.filter((s) => s.coachId === ME.id && s.status === "filled" && s.date >= today()).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  const apps = state.applications.filter((a) => a.coachId === ME.id && a.status !== "selected" && a.status !== "offered").reverse();
  const offers = state.applications.filter((a) => a.coachId === ME.id && a.status === "offered");

  return (
    <>
      <PageTitle>Planning</PageTitle>
      {offers.length > 0 && (
        <Section title="À confirmer" className="mt-0">
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {offers.map((a, i) => {
              const s = slotById(state, a.slotId)!;
              return (
                <motion.li key={a.id} {...stagger(i)}>
                  <Tap href={`#/coach/creneau/${s.id}`} className="flex h-full items-center gap-3 rounded-3xl bg-card p-3 shadow-lift ring-2 ring-primary">
                    <ClassTile id={s.classId} />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">
                        {dayLabel(s.date)} · {s.start}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {venueById(s.venueId).name} vous a retenu·e
                      </p>
                    </div>
                    <span className="rounded-full bg-primary px-3 py-1.5 text-[13px] font-semibold text-primary-foreground">Confirmer</span>
                  </Tap>
                </motion.li>
              );
            })}
          </ul>
        </Section>
      )}
      <Section title="Missions à venir" className={offers.length ? undefined : "mt-0"}>
        {missions.length ? (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {missions.map((s, i) => {
              const v = venueById(s.venueId);
              return (
                <motion.li key={s.id} {...stagger(i)}>
                  <Tap href={`#/coach/mission/${s.id}`} className="flex h-full items-center gap-3 rounded-3xl bg-card p-3 shadow-soft ring-1 ring-border/70">
                    <ClassTile id={s.classId} />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">
                        {dayLabel(s.date)} · {s.start}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {classById(s.classId).label} · {v.name}
                      </p>
                    </div>
                  </Tap>
                </motion.li>
              );
            })}
          </ul>
        ) : (
          <Empty>Aucune mission confirmée pour l'instant.</Empty>
        )}
      </Section>

      <Section title="Mes candidatures">
        {apps.length ? (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {apps.map((a, i) => {
              const s = slotById(state, a.slotId)!;
              return (
                <motion.li key={a.id} {...stagger(i)}>
                  <Tap href={`#/coach/creneau/${s.id}`} className="flex h-full items-center gap-3 rounded-3xl bg-card p-3 shadow-soft ring-1 ring-border/70">
                    <ClassTile id={s.classId} />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">
                        {dayLabel(s.date)} · {s.start}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {classById(s.classId).label} · {venueById(s.venueId).name}
                      </p>
                    </div>
                    <Status status={a.status} />
                  </Tap>
                </motion.li>
              );
            })}
          </ul>
        ) : (
          <Empty>Vous n'avez pas encore postulé.</Empty>
        )}
      </Section>
    </>
  );
}

/** Fichier calendrier (.ics) pour une mission. */
function downloadIcs(slot: Slot) {
  const v = venueById(slot.venueId);
  const dt = (date: string, hm: string) => `${date.replaceAll("-", "")}T${hm.replace(":", "")}00`;
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Zubio//Demo//FR", "BEGIN:VEVENT",
    `UID:${slot.id}@zubio.demo`, `DTSTART:${dt(slot.date, slot.start)}`, `DTEND:${dt(slot.date, endOf(slot.start, slot.duration))}`,
    `SUMMARY:${classById(slot.classId).label} · ${v.name}`, `LOCATION:${v.address}`, "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  a.download = `zubio-${slot.date}.ics`;
  a.click();
}

function Mission({ id }: { id: string }) {
  const state = useStore();
  const slot = slotById(state, id);
  if (!slot) return <Empty>Mission introuvable.</Empty>;
  const v = venueById(slot.venueId);
  return (
    <>
      <BackLink href="#/coach/planning">Planning</BackLink>
      <div className="mt-2">
        <SlotHeader slot={slot} status={<Status status={slot.status} />} />
      </div>

      <div className="mt-6 rounded-3xl bg-card px-3 py-4 ring-1 ring-border/70">
        <Steps steps={SLOT_STEPS.slice(1)} current={slotStep(state, slot) - 1} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl ring-1 ring-border/70">
          <MapView className="h-64" center={v} zoomKm={1.2} markers={[{ id: "venue", kind: "venue", lat: v.lat, lng: v.lng }]} />
          <div className="flex items-center gap-2 bg-card px-4 py-3 text-sm">
            <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
            <span className="line-clamp-2 min-w-0 flex-1">{v.address}</span>
          </div>
        </div>
        <div className="space-y-3">
          <Button size="lg" className="w-full" onClick={() => downloadIcs(slot)}>
            <CalendarPlus /> Ajouter à mon calendrier
          </Button>
          <Button size="lg" variant="outline" className="w-full" onClick={() => toast("Appel simulé", { description: "Dans la vraie app, on appelle l'accueil de la salle." })}>
            <Phone /> Contacter {v.name}
          </Button>
          <SlotFacts slot={slot} />
        </div>
      </div>
    </>
  );
}

function Profile() {
  const state = useStore();
  const me = live(state, ME);
  const reach = [...new Set(state.slots.map((s) => s.venueId))].map(venueById).filter((v) => distanceKm(ME, v) <= me.radiusKm);

  return (
    <>
      <CoachProfile coachId={ME.id} overrides={state.certs} />
      <Section title="Zone d'intervention" className="max-w-3xl">
        <div className="overflow-hidden rounded-3xl ring-1 ring-border/70">
          <MapView
            className="h-64"
            center={ME}
            radiusKm={me.radiusKm}
            zoomKm={Math.max(me.radiusKm, 4)}
            markers={[
              { id: "me", kind: "coach", lat: ME.lat, lng: ME.lng, label: ME.id, state: "active" },
              ...reach.map((v) => ({ id: v.id, kind: "venue" as const, lat: v.lat, lng: v.lng })),
            ]}
          />
          <div className="bg-card px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <Route className="size-4 text-primary" aria-hidden />
              <span className="flex-1">Je me déplace jusqu'à</span>
              <span className="font-heading font-extrabold tabular-nums">{me.radiusKm} km</span>
            </div>
            <Slider className="mt-3" value={[me.radiusKm]} min={2} max={40} step={1} onValueChange={([v]) => actions.setCoachRadius(ME.id, v)} aria-label="Distance maximale de déplacement" />
            <p className="mt-2 text-xs text-muted-foreground">
              {reach.length} salle{reach.length > 1 ? "s" : ""} dans votre zone. Vous n'êtes prévenu·e que des créneaux à cette distance de chez vous.
            </p>
          </div>
        </div>
      </Section>
      <CoachTax coachId={ME.id} />
    </>
  );
}
