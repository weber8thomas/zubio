import { CalendarCheck, Inbox, LayoutGrid, MapPin, Plus, PlusCircle, Search, Star, Users, UserRoundCheck, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarStack, BackLink, ClassTile, Empty, PageTitle, Section, Stat, Status, Tap, stagger } from "@/components/kit";
import { MapView, RadiusControl } from "@/components/map";
import { CoachProfile, Confirmed, SlotFacts, SlotHeader, teachable } from "@/components/profiles";
import { Shell } from "@/components/shell";
import { PublishWizard } from "./publish";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIES, classById } from "@/data/classes";
import { COACHES, coachById } from "@/data/coaches";
import type { CategoryId, Slot } from "@/data/types";
import { dayLabel, endOf, today } from "@/lib/date";
import { distanceKm, km } from "@/lib/geo";
import { fit } from "@/lib/matching";
import { go } from "@/lib/router";
import { actions, matchesFor, myVenue, slotById, type State, useStore } from "@/lib/store";

export function SalleSpace({ route }: { route: string[] }) {
  const [page, id] = route;
  const tabs = [
    { href: "#/salle", label: "Accueil", icon: LayoutGrid, active: !page || page === "creneau" },
    { href: "#/salle/publier", label: "Publier", icon: PlusCircle, active: page === "publier" },
    { href: "#/salle/coachs", label: "Coachs", icon: Users, active: page === "coachs" || page === "coach" },
  ];
  return (
    <Shell space="salle" tabs={tabs} page={route.join("/")} immersive={page === "publier"}>
      {page === "publier" ? <PublishWizard /> : page === "coachs" ? <Catalog /> : page === "coach" && id ? <CoachPage id={id} /> : page === "creneau" && id ? <SlotPage id={id} /> : <Home />}
    </Shell>
  );
}

const pendingFor = (s: State, slotId: string) => s.applications.filter((a) => a.slotId === slotId && a.status === "pending");

function SlotCard({ slot, i }: { slot: Slot; i: number }) {
  const state = useStore();
  const apps = pendingFor(state, slot.id);
  const c = classById(slot.classId);
  return (
    <motion.li {...stagger(i)}>
      <Tap href={`#/salle/creneau/${slot.id}`} className="rounded-3xl bg-card p-3 pr-4 shadow-soft ring-1 ring-border/70">
        <div className="flex items-center gap-3">
          <ClassTile id={slot.classId} />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <p className="truncate font-bold">{c.label}</p>
              <span className="ml-auto font-heading font-extrabold tabular-nums">{slot.price} €</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {dayLabel(slot.date)} · {slot.start}–{endOf(slot.start, slot.duration)}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/70 pt-3">
          {slot.status === "open" ? (
            apps.length ? (
              <Status status="candidates" label={`${apps.length} candidature${apps.length > 1 ? "s" : ""}`} />
            ) : (
              <Status status="open" />
            )
          ) : (
            <Status status={slot.status} />
          )}
          {slot.coachId ? (
            <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
              <span className="truncate">{coachById(slot.coachId).name}</span>
              <Avatar id={slot.coachId} size="sm" />
            </span>
          ) : (
            <AvatarStack ids={apps.map((a) => a.coachId)} />
          )}
        </div>
      </Tap>
    </motion.li>
  );
}

function Home() {
  const state = useStore();
  const venue = myVenue();
  const mine = state.slots.filter((s) => s.venueId === venue.id && s.date >= today()).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  const open = mine.filter((s) => s.status === "open");
  const filled = mine.filter((s) => s.status === "filled");
  const toReview = open.reduce((n, s) => n + pendingFor(state, s.id).length, 0);

  return (
    <>
      <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <MapPin className="size-4" aria-hidden /> {venue.address}
      </p>
      <h1 className="mt-1 font-heading text-[26px] leading-tight font-extrabold sm:text-[32px]">{venue.name}</h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 rounded-[26px] bg-primary p-5 text-primary-foreground sm:flex sm:items-center sm:justify-between sm:p-7"
      >
        <div>
          <p className="font-heading text-lg font-semibold sm:text-xl">Un coach absent ?</p>
          <p className="mt-1 text-primary-foreground/85">Publiez le créneau : les coachs certifiés autour de vous postulent, vous choisissez.</p>
        </div>
        <Button size="lg" variant="secondary" className="mt-4 w-full bg-white text-foreground shadow-none hover:bg-white/90 sm:mt-0 sm:w-auto" onClick={() => go("/salle/publier")}>
          <Plus /> Publier un créneau
        </Button>
      </motion.div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="À venir" value={mine.length} icon={CalendarCheck} />
        <Stat label="À examiner" value={toReview} icon={Inbox} />
        <Stat label="Confirmés" value={filled.length} icon={UserRoundCheck} />
      </div>

      <Section title="À pourvoir">
        {open.length ? (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {open.map((s, i) => (
              <SlotCard key={s.id} slot={s} i={i} />
            ))}
          </ul>
        ) : (
          <Empty>Tous vos créneaux à venir ont un coach.</Empty>
        )}
      </Section>
      <Section title="Confirmés">
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filled.map((s, i) => (
            <SlotCard key={s.id} slot={s} i={i} />
          ))}
        </ul>
      </Section>
    </>
  );
}

function SlotPage({ id }: { id: string }) {
  const state = useStore();
  const slot = slotById(state, id);
  const venue = myVenue();
  if (!slot) return <Empty>Créneau introuvable.</Empty>;
  const apps = state.applications.filter((a) => a.slotId === id && a.status !== "withdrawn");
  const matches = matchesFor(state, slot);
  const open = slot.status === "open";

  function simulate() {
    const n = actions.simulateApplications(slot!.id);
    toast(n ? `${n} nouvelle${n > 1 ? "s" : ""} candidature${n > 1 ? "s" : ""}` : "Aucun autre coach compatible dans ce rayon");
  }

  return (
    <>
      <BackLink href="#/salle">Tableau de bord</BackLink>
      <div className="mt-2">
        <SlotHeader slot={slot} status={<Status status={slot.status === "open" && apps.some((a) => a.status === "pending") ? "candidates" : slot.status} />} />
      </div>

      <AnimatePresence>
        {slot.coachId && (
          <div className="mt-6">
            <Confirmed coachId={slot.coachId} title="C'est confirmé, des deux côtés" subtitle={`${coachById(slot.coachId).rating.toFixed(1)} ★ · ${coachById(slot.coachId).missions} missions`} />
          </div>
        )}
      </AnimatePresence>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-3xl ring-1 ring-border/70 lg:sticky lg:top-36 lg:self-start">
          <MapView
            className="h-72 sm:h-80"
            center={venue}
            radiusKm={open ? slot.radiusKm : undefined}
            zoomKm={Math.max(slot.radiusKm, 4)}
            markers={[
              { id: "venue", kind: "venue", lat: venue.lat, lng: venue.lng },
              ...COACHES.map((c) => ({
                id: c.id,
                kind: "coach" as const,
                lat: c.lat,
                lng: c.lng,
                label: c.id,
                state: slot.coachId === c.id ? ("selected" as const) : apps.some((a) => a.coachId === c.id) || matches.some((m) => m.coach.id === c.id) ? ("active" as const) : ("idle" as const),
                onClick: () => go(`/salle/coach/${c.id}`),
              })),
            ]}
          />
          {open && <RadiusControl value={slot.radiusKm} onChange={(km) => actions.setRadius(slot.id, km)} count={matches.length} />}
        </div>

        <div>
          {slot.instant && open && (
            <p className="mb-4 flex items-start gap-2 rounded-3xl bg-primary-soft p-4 text-sm text-primary-ink">
              <Zap className="mt-0.5 size-4 shrink-0" aria-hidden />
              Réservation instantanée : le premier coach compatible qui réserve est confirmé automatiquement.
            </p>
          )}
          <h2 className="font-heading text-[17px] font-semibold">Candidatures {apps.length > 0 && `· ${apps.length}`}</h2>
          <ul className="mt-3 flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {apps.map((a, i) => {
                const c = coachById(a.coachId);
                const f = fit(c, slot, venue, state.certs);
                return (
                  <motion.li key={a.id} layout {...stagger(i)} className="rounded-3xl bg-card p-3 shadow-soft ring-1 ring-border/70">
                    <div className="flex items-center gap-3">
                      <a href={`#/salle/coach/${c.id}`} className="shrink-0 transition hover:scale-105">
                        <Avatar id={c.id} />
                      </a>
                      <div className="min-w-0 flex-1">
                        <a href={`#/salle/coach/${c.id}`} className="block truncate font-bold hover:underline">
                          {c.name}
                        </a>
                        <p className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            <Star className="size-3.5 fill-warning text-warning" aria-hidden />
                            {c.rating.toFixed(1)}
                          </span>
                          {km(f.km)} · {c.missions} missions
                        </p>
                      </div>
                      {a.status === "pending" && open ? (
                        <Button
                          onClick={() => {
                            actions.select(a.id);
                            toast.success(`${c.name} est confirmé·e`, { description: "Les autres candidats sont prévenus." });
                          }}
                        >
                          Choisir
                        </Button>
                      ) : (
                        <Status status={a.status} />
                      )}
                    </div>
                    {a.message && <p className="mt-2 rounded-2xl bg-muted/70 px-3 py-2 text-sm text-ink-soft">« {a.message} »</p>}
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
          {!apps.length && <Empty>Pas encore de candidature. {matches.length} coach{matches.length > 1 ? "s" : ""} compatible{matches.length > 1 ? "s ont" : " a"} été prévenu{matches.length > 1 ? "s" : ""}.</Empty>}
          {open && (
            <div className="mt-3 flex items-center gap-3 rounded-3xl bg-muted/60 p-3 pl-4">
              <p className="flex-1 text-sm text-muted-foreground">Pour la démo, faites postuler des coachs compatibles.</p>
              <Badge variant="outline">Démo</Badge>
              <Button variant="outline" onClick={simulate}>
                Simuler
              </Button>
            </div>
          )}

          <h2 className="mt-8 mb-3 font-heading text-[17px] font-semibold">Détails</h2>
          <SlotFacts slot={slot} />
        </div>
      </div>
    </>
  );
}

function Catalog() {
  const state = useStore();
  const venue = myVenue();
  const [cat, setCat] = useState<CategoryId | null>(null);
  const [q, setQ] = useState("");
  const list = useMemo(
    () =>
      COACHES.map((c) => ({ c, km: distanceKm(venue, c), classes: teachable(c.id, state.certs) }))
        .filter(({ c, classes }) => (!cat || classes.some((id) => classById(id).category === cat)) && (!q || `${c.name} ${classes.map((id) => classById(id).label).join(" ")}`.toLowerCase().includes(q.toLowerCase())))
        .sort((a, b) => a.km - b.km),
    [cat, q, state.certs, venue],
  );

  return (
    <>
      <PageTitle sub={`${list.length} coachs autour de votre salle, du plus proche au plus loin.`}>Coachs du coin</PageTitle>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom, cours (BodyPump, aquabike…)" className="h-12 rounded-full bg-card pl-10" aria-label="Rechercher un coach" />
      </div>
      <div className="scroll-row -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        <CatChip active={!cat} onClick={() => setCat(null)}>
          Tous
        </CatChip>
        {(Object.keys(CATEGORIES) as CategoryId[]).map((k) => (
          <CatChip key={k} active={cat === k} onClick={() => setCat(k)}>
            {CATEGORIES[k].label}
          </CatChip>
        ))}
      </div>
      <ul className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        {list.map(({ c, km: d, classes }, i) => (
          <motion.li key={c.id} {...stagger(i)}>
            <Tap href={`#/salle/coach/${c.id}`} className="h-full rounded-3xl bg-card p-4 shadow-soft ring-1 ring-border/70">
              <div className="flex items-center gap-3">
                <Avatar id={c.id} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{c.name}</p>
                  <p className="flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="size-3.5 fill-warning text-warning" aria-hidden />
                      {c.rating.toFixed(1)}
                    </span>
                    <span>{c.town} · {km(d)}</span>
                  </p>
                </div>
                <p className="shrink-0 text-right font-heading font-extrabold">
                  {c.minHourly} €<span className="text-xs font-medium text-muted-foreground">/h</span>
                </p>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-ink-soft">{c.bio}</p>
              <p className="mt-2 truncate text-xs font-medium text-muted-foreground">
                {classes.length ? classes.slice(0, 4).map((id) => classById(id).label).join(" · ") : "Certifications en cours de vérification"}
              </p>
            </Tap>
          </motion.li>
        ))}
      </ul>
      {!list.length && <Empty>Aucun coach ne correspond.</Empty>}
    </>
  );
}

function CatChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      aria-pressed={active}
      className={`h-10 shrink-0 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-colors ${active ? "bg-foreground text-background" : "bg-card ring-1 ring-border/70 hover:ring-border-strong"}`}
    >
      {children}
    </motion.button>
  );
}

function CoachPage({ id }: { id: string }) {
  const state = useStore();
  const venue = myVenue();
  const coach = COACHES.find((c) => c.id === id);
  if (!coach) return <Empty>Coach introuvable.</Empty>;
  const open = state.slots.filter((s) => s.venueId === venue.id && s.status === "open");
  const invited = (slotId: string) => state.invites.some((i) => i.slotId === slotId && i.coachId === id);

  return (
    <>
      <BackLink href="#/salle/coachs">Coachs du coin</BackLink>
      <div className="mt-4">
        <CoachProfile
          coachId={id}
          from={venue}
          overrides={state.certs}
          actions={
            open.length > 0 && (
              <div className="rounded-3xl bg-card p-4 ring-1 ring-border/70">
                <p className="text-sm font-semibold">Inviter à postuler</p>
                <ul className="mt-2 flex flex-col gap-2">
                  {open.map((s) => {
                    const f = fit(coach, s, venue, state.certs);
                    return (
                      <li key={s.id} className="flex items-center gap-3">
                        <ClassTile id={s.classId} size="sm" />
                        <span className="min-w-0 flex-1 text-sm">
                          <b>{classById(s.classId).label}</b> · {dayLabel(s.date)} {s.start}
                          {!f.ok && <span className="block text-xs text-warning-ink">{f.reason}</span>}
                        </span>
                        <Button
                          size="sm"
                          variant={invited(s.id) ? "secondary" : "default"}
                          disabled={invited(s.id)}
                          onClick={() => {
                            actions.invite(s.id, id);
                            toast.success(`Invitation envoyée à ${coach.name}`);
                          }}
                        >
                          {invited(s.id) ? "Invité" : "Inviter"}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )
          }
        />
      </div>
    </>
  );
}
