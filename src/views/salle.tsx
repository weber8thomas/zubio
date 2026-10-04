import { Building2, CalendarCheck, CheckCheck, ChevronRight, Inbox, LayoutGrid, MapPin, Plus, PlusCircle, ReceiptText, Search, Star, TriangleAlert, Users, UserRoundCheck, X, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarStack, BackLink, ClassTile, Empty, PageTitle, Section, SlotCard, Stat, Status, Steps, Tap, stagger } from "@/components/kit";
import { MapView } from "@/components/map";
import { Chip } from "@/components/pickers";
import { CoachProfile, Confirmed, SlotFacts, SlotHeader, teachable } from "@/components/profiles";
import { Shell } from "@/components/shell";
import { VenueLogo, VenueProfile } from "@/components/venue";
import { SalleInvoices, InvoicePage } from "./billing";
import { PublishWizard } from "./publish";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CATEGORIES, classById } from "@/data/classes";
import { COACHES, coachById } from "@/data/coaches";
import type { CategoryId, Slot } from "@/data/types";
import { dayLabel, endOf, today } from "@/lib/date";
import { distanceKm, km } from "@/lib/geo";
import { fit } from "@/lib/matching";
import { back, go, previous } from "@/lib/router";
import { actions, live, matchesFor, slotStep, SLOT_STEPS, myVenue, slotById, type State, useStore } from "@/lib/store";

export function SalleSpace({ route }: { route: string[] }) {
  const [page, id] = route;
  const tabs = [
    { href: "#/salle", label: "Accueil", icon: LayoutGrid, active: !page || page === "creneau" },
    { href: "#/salle/publier", label: "Publier", icon: PlusCircle, active: page === "publier" },
    { href: "#/salle/coachs", label: "Coachs", icon: Users, active: page === "coachs" || page === "coach" },
    { href: "#/salle/factures", label: "Factures", icon: ReceiptText, active: page === "factures" || page === "facture" },
    { href: "#/salle/profil", label: "Profil", icon: Building2, active: page === "profil" },
  ];
  return (
    <Shell space="salle" tabs={tabs} page={route.join("/")} immersive={page === "publier"}>
      {page === "publier" ? <PublishWizard /> : page === "coachs" ? <Catalog /> : page === "coach" && id ? <CoachPage id={id} /> : page === "creneau" && id ? <SlotPage id={id} /> : page === "profil" ? <MyProfile /> : page === "factures" ? <SalleInvoices /> : page === "facture" && id ? <InvoicePage id={id} back="#/salle/factures" backLabel="Factures" canDecide /> : <Home />}
    </Shell>
  );
}

const pendingFor = (s: State, slotId: string) => s.applications.filter((a) => a.slotId === slotId && a.status === "pending");
const candidatures = (n: number) => `${n} candidature${n > 1 ? "s" : ""}`;

function SlotItem({ slot, i }: { slot: Slot; i: number }) {
  const state = useStore();
  const apps = pendingFor(state, slot.id);
  return (
    <motion.li {...stagger(i)}>
      <SlotCard
        href={`#/salle/creneau/${slot.id}`}
        classId={slot.classId}
        title={classById(slot.classId).label}
        when={`${dayLabel(slot.date)} · ${slot.start}–${endOf(slot.start, slot.duration)}`}
        price={slot.price}
        footer={
          <>
            {slot.status === "open" ? apps.length ? <Status status="candidates" label={candidatures(apps.length)} /> : <Status status="open" /> : <Status status={slot.status} />}
            {slot.coachId ? (
              <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
                <span className="truncate">{coachById(slot.coachId).name}</span>
                <Avatar id={slot.coachId} size="sm" />
              </span>
            ) : (
              <AvatarStack ids={apps.map((a) => a.coachId)} />
            )}
          </>
        }
      />
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
  const firstToReview = open.find((s) => pendingFor(state, s.id).length);

  return (
    <>
      <a href="#/salle/profil" className="group flex items-center gap-4">
        <VenueLogo venueId={venue.id} size="md" className="transition group-hover:scale-105 sm:size-14" />
        <span className="min-w-0">
          <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <MapPin className="size-4 shrink-0" aria-hidden /> <span className="truncate">{venue.address}</span>
          </span>
          <span className="flex items-center gap-1 font-heading text-[26px] leading-tight font-extrabold group-hover:underline group-hover:decoration-border-strong group-hover:underline-offset-4 sm:text-[32px]">
            <h1>{venue.name}</h1>
            <ChevronRight className="size-6 text-muted-foreground transition group-hover:translate-x-0.5" aria-hidden />
          </span>
        </span>
      </a>

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
        <Stat label="À examiner" value={toReview} icon={Inbox} href={firstToReview && `#/salle/creneau/${firstToReview.id}`} />
        <Stat label="Confirmés" value={filled.length} icon={UserRoundCheck} />
      </div>

      <Section title="À pourvoir">
        {open.length ? (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {open.map((s, i) => (
              <SlotItem key={s.id} slot={s} i={i} />
            ))}
          </ul>
        ) : (
          <Empty>Tous vos créneaux à venir ont un coach.</Empty>
        )}
      </Section>
      <Section title="Confirmés">
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filled.map((s, i) => (
            <SlotItem key={s.id} slot={s} i={i} />
          ))}
        </ul>
      </Section>
    </>
  );
}

const ISSUES = ["Coach absent", "Retard important", "Séance écourtée", "Autre problème"];
function SlotPage({ id }: { id: string }) {
  const state = useStore();
  const [issue, setIssue] = useState<string | null>(null);
  const [reporting, setReporting] = useState(false);
  const slot = slotById(state, id);
  const venue = myVenue();
  const isOpen = slot?.status === "open";
  useEffect(() => actions.setFocus(isOpen ? id : undefined), [id, isOpen]);
  if (!slot) return <Empty>Créneau introuvable.</Empty>;
  const apps = state.applications.filter((a) => a.slotId === id && a.status !== "withdrawn");
  const pending = apps.filter((a) => a.status === "pending").length;
  const matches = matchesFor(state, slot);
  const open = slot.status === "open";

  function simulate() {
    const n = actions.simulateApplications(slot!.id);
    toast(n ? `${n} nouvelle${n > 1 ? "s" : ""} candidature${n > 1 ? "s" : ""}` : "Aucun autre coach compatible");
  }

  return (
    <>
      <BackLink href="#/salle">Tableau de bord</BackLink>
      <div className="mt-2">
        <SlotHeader slot={slot} status={open && pending ? <Status status="candidates" label={candidatures(pending)} /> : <Status status={slot.status} />} />
      </div>

      <div className="mt-6 rounded-3xl bg-card px-3 py-4 ring-1 ring-border/70">
        <Steps steps={SLOT_STEPS} current={slotStep(slot)} />
      </div>

      {slot.coachId && (
        <div className="mt-4">
          <Confirmed coachId={slot.coachId} title={slot.status === "done" ? "Séance réalisée" : "C'est confirmé, des deux côtés"} subtitle={`${coachById(slot.coachId).rating.toFixed(1)} ★ · ${coachById(slot.coachId).missions} missions`} />
        </div>
      )}

      {slot.status === "filled" && (
        <div className="mt-4 rounded-3xl bg-card p-4 ring-1 ring-border/70 sm:p-5">
          <p className="font-heading text-[17px] font-semibold">Après la séance</p>
          <p className="mt-1 text-sm text-muted-foreground">Validez que le cours a bien eu lieu : les factures sont alors émises automatiquement.</p>
          {reporting ? (
            <div className="mt-3">
              <div className="flex flex-wrap gap-1.5">
                {ISSUES.map((r) => (
                  <Chip key={r} small active={issue === r} onClick={() => setIssue(r)}>
                    {r}
                  </Chip>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button disabled={!issue} onClick={() => (actions.complete(slot.id, issue!), toast("Problème signalé", { description: "La facture du coach est suspendue, l'équipe Zubio vous recontacte." }))}>
                  Envoyer le signalement
                </Button>
                <Button variant="ghost" onClick={() => setReporting(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button onClick={() => (actions.complete(slot.id), toast.success("Séance validée", { description: "Factures émises et transmises via la plateforme agréée." }))}>
                <CheckCheck /> Valider la séance
              </Button>
              <Button variant="outline" onClick={() => setReporting(true)}>
                <TriangleAlert /> Signaler un problème
              </Button>
            </div>
          )}
        </div>
      )}
      {slot.status === "done" && (
        <a href="#/salle/factures" className="mt-4 flex items-center gap-3 rounded-3xl bg-card p-4 ring-1 ring-border/70 transition hover:shadow-lift">
          <ReceiptText className="size-5 text-primary" aria-hidden />
          <span className="flex-1 text-sm">
            {slot.issue ? (
              <>
                <b>Problème signalé :</b> {slot.issue.toLowerCase()}. Facture du coach suspendue.
              </>
            ) : (
              <>
                <b>Séance validée.</b> Factures émises : voir l'onglet Factures.
              </>
            )}
          </span>
          <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
        </a>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-36 lg:self-start">
          <h2 className="mb-3 font-heading text-[17px] font-semibold">Coachs prévenus</h2>
          <div className="overflow-hidden rounded-3xl ring-1 ring-border/70">
            <MapView
              className="h-72 sm:h-80"
              center={venue}
              zoomKm={9}
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
            <p className="bg-card px-4 py-3 text-sm text-muted-foreground">
              <b className="text-foreground">{matches.length} coachs compatibles</b> ont votre salle dans leur zone d'intervention : ils ont été prévenus.
            </p>
          </div>
        </div>

        <div>
          <h2 className="mb-3 font-heading text-[17px] font-semibold">Candidatures {apps.length > 0 && `· ${apps.length}`}</h2>
          {slot.instant && open && (
            <p className="mb-3 flex items-start gap-2 rounded-3xl bg-primary-soft p-4 text-sm text-primary-ink">
              <Zap className="mt-0.5 size-4 shrink-0" aria-hidden />
              Réservation instantanée : le premier coach compatible qui réserve est confirmé automatiquement.
            </p>
          )}
          <ul className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {apps.map((a, i) => {
                const c = coachById(a.coachId);
                const f = fit(live(state, c), slot, venue, state.certs);
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
                        <ConfirmCoach appId={a.id} />
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
              <p className="flex-1 text-sm text-muted-foreground">Démo : faire postuler des coachs compatibles.</p>
              <Button size="sm" variant="outline" onClick={simulate}>
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
      <Pourvoir />
      <PageTitle sub={`${list.length} coachs autour de votre salle, du plus proche au plus loin.`}>Coachs du coin</PageTitle>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom, cours (BodyPump, aquabike…)" className="h-12 rounded-full pl-10" aria-label="Rechercher un coach" />
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

/** Confirmation d'un candidat : récapitulatif, puis engagement des deux côtés. */
function ConfirmCoach({ appId }: { appId: string }) {
  const state = useStore();
  const [open, setOpen] = useState(false);
  const app = state.applications.find((a) => a.id === appId)!;
  const slot = slotById(state, app.slotId)!;
  const venue = myVenue();
  const c = coachById(app.coachId);
  const f = fit(live(state, c), slot, venue, state.certs);
  const others = state.applications.filter((a) => a.slotId === slot.id && a.status === "pending" && a.id !== appId).length;
  const checks = [
    [`Certification ${classById(slot.classId).label} vérifiée par Zubio`, !f.issues.includes("Certification")],
    [`Disponible ${dayLabel(slot.date).toLowerCase()} de ${slot.start} à ${endOf(slot.start, slot.duration)}`, !f.issues.includes("Disponibilité")],
    [`À ${km(f.km)} de la salle, dans sa zone`, !f.issues.includes("Distance")],
  ] as const;

  function confirm() {
    actions.confirm(appId);
    setOpen(false);
    toast.success(`${c.name} est confirmé·e`, { description: `Le coach est prévenu${others ? `, ${others} autre${others > 1 ? "s" : ""} candidat${others > 1 ? "s" : ""} aussi` : ""}.` });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Confirmer</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md gap-0 p-0 sm:max-w-md">
          <div className="flex items-center gap-4 p-5 pr-12 pb-4">
            <Avatar id={c.id} size="lg" />
            <div className="min-w-0">
              <DialogTitle className="font-heading text-xl leading-tight font-extrabold">Confirmer {c.name.split(" ")[0]} ?</DialogTitle>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="size-3.5 fill-warning text-warning" aria-hidden /> {c.rating.toFixed(1)} · {c.missions} missions
              </p>
            </div>
          </div>
          <div className="mx-5 flex items-center gap-3 rounded-2xl bg-muted/70 p-3">
            <ClassTile id={slot.classId} size="sm" />
            <p className="min-w-0 flex-1 text-sm">
              <b>{classById(slot.classId).label}</b> · {dayLabel(slot.date)} {slot.start}
            </p>
            <p className="font-heading text-lg font-extrabold tabular-nums">{slot.price} €</p>
          </div>
          <ul className="space-y-2 px-5 pt-4 text-sm">
            {checks.map(([label, ok]) => (
              <li key={label} className="flex items-start gap-2">
                {ok ? <CheckCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden /> : <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning-ink" aria-hidden />}
                {label}
              </li>
            ))}
          </ul>
          <p className="px-5 pt-4 text-[13px] text-muted-foreground">
            En confirmant, vous vous engagez à accueillir le coach au tarif indiqué. Sa candidature valait engagement : la mission est confirmée des deux côtés{others === 1 ? " et l'autre candidat est prévenu" : others ? ` et les ${others} autres candidats sont prévenus` : ""}.
          </p>
          <div className="flex gap-2 p-5">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button className="flex-1" onClick={confirm}>
              <CheckCheck /> Confirmer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Rappel du créneau en cours, pendant que la salle parcourt les profils. */
function Pourvoir({ coachId }: { coachId?: string }) {
  const state = useStore();
  const slot = state.focus ? slotById(state, state.focus) : undefined;
  if (!slot || slot.status !== "open") return null;
  const venue = myVenue();
  const app = coachId && state.applications.find((a) => a.slotId === slot.id && a.coachId === coachId && a.status !== "withdrawn");
  const coach = coachId ? COACHES.find((c) => c.id === coachId) : undefined;
  const f = coach && fit(live(state, coach), slot, venue, state.certs);
  const invited = coachId && state.invites.some((i) => i.slotId === slot.id && i.coachId === coachId);
  const href = `#/salle/creneau/${slot.id}`;

  let action: ReactNode = null;
  if (coach && app && app.status === "pending") action = <ConfirmCoach appId={app.id} />;
  else if (coach && app) action = <Status status={app.status} />;
  else if (coach && f?.ok)
    action = (
      <Button variant={invited ? "secondary" : "default"} disabled={!!invited} onClick={() => (actions.invite(slot.id, coach.id), toast.success(`Invitation envoyée à ${coach.name}`))}>
        {invited ? "Invité·e" : "Inviter à postuler"}
      </Button>
    );
  else if (coach && f) action = <span className="text-xs font-semibold text-warning-ink">{f.reason}</span>;

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="sticky top-[4.5rem] z-20 mb-4 flex items-center gap-3 rounded-3xl bg-foreground p-2.5 pl-3 text-background shadow-float md:top-[7.5rem]">
      <a href={href} onClick={(e) => previous() === href && (e.preventDefault(), back(href))} className="flex min-w-0 flex-1 items-center gap-3">
        <ClassTile id={slot.classId} size="sm" />
        <span className="min-w-0">
          <span className="block text-xs text-background/70">Vous pourvoyez</span>
          <span className="block truncate text-sm font-semibold">
            {classById(slot.classId).label} · {dayLabel(slot.date)} {slot.start}
          </span>
        </span>
      </a>
      {action && <span className="shrink-0 [&>span]:rounded-full [&>span]:bg-background [&>span]:px-2.5 [&>span]:py-1.5">{action}</span>}
      <button type="button" onClick={() => actions.setFocus(undefined)} aria-label="Masquer le rappel" className="flex size-9 shrink-0 items-center justify-center rounded-full text-background/70 hover:text-background">
        <X className="size-4" />
      </button>
    </motion.div>
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
      <Pourvoir coachId={id} />
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
                    const label = classById(s.classId).label;
                    return (
                      <li key={s.id} className="flex items-center gap-3">
                        <ClassTile id={s.classId} size="sm" />
                        <span className="min-w-0 flex-1 text-sm">
                          <b>{label}</b> · {dayLabel(s.date)} {s.start}
                          {!f.ok && <span className="block text-xs text-warning-ink">{f.issues.includes("Certification") ? `Certification ${label} manquante` : f.reason}</span>}
                        </span>
                        <Button
                          variant={invited(s.id) ? "secondary" : f.ok ? "default" : "outline"}
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

function MyProfile() {
  const venue = myVenue();
  return (
    <VenueProfile
      venueId={venue.id}
      actions={
        <div className="rounded-3xl bg-primary-soft p-4 text-sm text-primary-ink">
          <p className="font-semibold">Votre fiche, vue par les coachs</p>
          <p className="mt-1">Une fiche complète et des paiements rapides attirent plus de candidatures.</p>
          <Button variant="outline" className="mt-3 bg-card" onClick={() => toast("Édition simulée", { description: "Dans la vraie app : photos, studios, consignes d'accès." })}>
            Modifier la fiche
          </Button>
        </div>
      }
    />
  );
}
