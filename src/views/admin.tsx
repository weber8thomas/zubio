import { BadgeCheck, CalendarRange, Check, ChevronRight, FileText, Gauge, History, Loader2, MessageSquare, Search, Timer, Users, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, BackLink, ClassTile, Empty, PageTitle, Section, Stat, Status, Steps, Tap, stagger } from "@/components/kit";
import { CertificateDoc, DocPreview } from "@/components/docs";
import { Chip } from "@/components/pickers";
import { CoachProfile, SlotFacts, SlotHeader } from "@/components/profiles";
import { Shell } from "@/components/shell";
import { VenueProfile } from "@/components/venue";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { certLabel, classById } from "@/data/classes";
import { COACHES, coachById } from "@/data/coaches";
import { dayLabel } from "@/lib/date";
import { certStatus } from "@/lib/matching";
import { actions, reviewOf, slotById, useStore, venueById } from "@/lib/store";
import { cn } from "@/lib/utils";
import { AdminBilling, InvoicePage } from "./billing";

export function AdminSpace({ route }: { route: string[] }) {
  const [page, a, b] = route;
  return (
    <Shell space="admin" tabs={[]} page={route.join("/")}>
      {page === "diplome" && a && b ? <Credential coachId={a} certId={b} /> : page === "coach" && a ? <CoachPage id={a} /> : page === "creneau" && a ? <SlotPage id={a} /> : page === "salle" && a ? <VenueProfile venueId={a} /> : page === "facture" && a ? <InvoicePage id={a} back="#/admin" backLabel="Vue d'ensemble" canDecide={false} /> : <Overview />}
    </Shell>
  );
}

function Overview() {
  const state = useStore();
  const { slots } = state;
  const decided = slots.filter((s) => s.status !== "open");
  const rate = Math.round((decided.length / slots.length) * 100);
  const delays = decided.filter((s) => s.filledAt).map((s) => (s.filledAt! - s.publishedAt) / 60_000);
  const delay = Math.round(delays.reduce((t, d) => t + d, 0) / Math.max(delays.length, 1));
  const toVerify = COACHES.flatMap((c) => c.certs.filter((cert) => certStatus(c, cert.id, state.certs) === "pending").map((cert) => ({ c, cert })));

  return (
    <>
      <PageTitle sub="Toutes les salles et tous les coachs de la plateforme.">Vue d'ensemble</PageTitle>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Créneaux publiés" value={slots.length} icon={CalendarRange} />
        <Stat label="Taux de remplissage" value={`${rate} %`} icon={Gauge} />
        <Stat label="Délai moyen de pourvoi" value={`${delay} min`} icon={Timer} />
        <Stat label="Coachs inscrits" value={COACHES.length} icon={Users} />
      </div>

      <div className="grid grid-cols-1 gap-x-6 lg:grid-cols-2">
        <Section title={`Certifications à vérifier · ${toVerify.length}`}>
          {toVerify.length ? (
            <ul className="flex flex-col gap-2">
              {toVerify.map(({ c, cert }, i) => (
                <motion.li key={`${c.id}:${cert.id}`} {...stagger(i)}>
                  <Tap href={`#/admin/diplome/${c.id}/${cert.id}`} className="flex items-center gap-3 rounded-3xl bg-card p-3 shadow-soft ring-1 ring-border/70">
                    <Avatar id={c.id} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{c.name}</p>
                      <p className="truncate text-sm text-muted-foreground">{certLabel(cert.id)}</p>
                    </div>
                    {(() => {
                      const r = reviewOf(state, `${c.id}:${cert.id}`);
                      const total = stagesFor(cert.id, c.name).flatMap((st) => st.checks).length;
                      return r.request ? (
                        <span className="shrink-0 rounded-full bg-warning-soft px-2.5 py-1 text-xs font-semibold text-warning-ink">Complément</span>
                      ) : (
                        <span className="shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
                          {r.checks.length}/{total}
                        </span>
                      );
                    })()}
                    <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
                  </Tap>
                </motion.li>
              ))}
            </ul>
          ) : (
            <Empty>Tout est à jour.</Empty>
          )}

          <h2 className="mt-8 mb-3 font-heading text-[17px] font-semibold">Coachs</h2>
          <ul className="grid grid-cols-4 gap-3 sm:grid-cols-6">
            {COACHES.map((c) => (
              <li key={c.id}>
                <a href={`#/admin/coach/${c.id}`} className="group flex flex-col items-center gap-1 text-center">
                  <Avatar id={c.id} size="lg" className="transition group-hover:scale-105" />
                  <span className="w-full truncate text-xs font-medium">{c.name.split(" ")[0]}</span>
                </a>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Activité">
          <ul className="divide-y divide-border/70 overflow-hidden rounded-3xl bg-card ring-1 ring-border/70">
            {[...slots].sort((a, b) => (b.date + b.start).localeCompare(a.date + a.start)).map((s, i) => (
              <motion.li key={s.id} {...stagger(i)}>
                <a href={`#/admin/creneau/${s.id}`} className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/50">
                  <ClassTile id={s.classId} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {classById(s.classId).label} · {venueById(s.venueId).name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {dayLabel(s.date)} · {s.start}
                      {s.coachId && ` · ${coachById(s.coachId).name}`}
                    </p>
                  </div>
                  <Status status={s.status} />
                </a>
              </motion.li>
            ))}
          </ul>
        </Section>
      </div>
      <AdminBilling />
    </>
  );
}

const REASONS = ["Document illisible", "Certification expirée", "Nom différent du profil", "Organisme non reconnu", "Document modifié"];
const DIPLOMAS = ["bpjeps-af", "bpjeps-aan", "cqp-als", "staps"];

type Check = { id: string; label: string; hint?: string };
type Stage = { id: string; title: string; checks: Check[]; registry?: boolean };

/** Étapes d'instruction d'un justificatif : chaque point doit être contrôlé avant de valider. */
function stagesFor(certId: string, name: string): Stage[] {
  const lm = certId.startsWith("lm-");
  const diploma = DIPLOMAS.includes(certId);
  return [
    {
      id: "doc",
      title: "Pièce",
      checks: [
        { id: "doc-lisible", label: "Lisible et complet", hint: "Toutes les pages, aucune zone masquée" },
        { id: "doc-integre", label: "Aucune retouche apparente", hint: "Polices, cachet et signature cohérents" },
      ],
    },
    {
      id: "id",
      title: "Identité",
      checks: [
        { id: "id-nom", label: `Le nom correspond : ${name}`, hint: "Profil Zubio et document" },
        { id: "id-kyc", label: "Pièce d'identité vérifiée à l'inscription" },
      ],
    },
    {
      id: "auth",
      title: "Registre",
      registry: true,
      checks: [{ id: "auth-registre", label: lm ? "Licence active sur le portail instructeur" : diploma ? "Diplôme trouvé au registre national" : "Certification confirmée par l'organisme" }],
    },
    {
      id: "valid",
      title: "Validité",
      checks: [
        { id: "valid-date", label: lm ? "Licence à jour (formation continue suivie)" : "En cours de validité" },
        ...(diploma ? [{ id: "valid-carte", label: "Carte professionnelle d'éducateur sportif", hint: "Obligatoire pour enseigner contre rémunération" }] : []),
      ],
    },
  ];
}

const fmtTime = (t: number) => new Date(t).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function Credential({ coachId, certId }: { coachId: string; certId: string }) {
  const state = useStore();
  const [reason, setReason] = useState<string | null>(null);
  const [mode, setMode] = useState<"none" | "refuse" | "info">("none");
  const [note, setNote] = useState("");
  const [lookup, setLookup] = useState<"idle" | "running">("idle");
  const coach = COACHES.find((c) => c.id === coachId);
  if (!coach) return <Empty>Coach introuvable.</Empty>;
  const key = `${coachId}:${certId}`;
  const status = certStatus(coach, certId, state.certs);
  const review = reviewOf(state, key);
  const stages = stagesFor(certId, coach.name);
  const all = stages.flatMap((s) => s.checks);
  const done = (id: string) => review.checks.includes(id);
  const stageDone = (s: Stage) => s.checks.every((c) => done(c.id));
  const current = stages.findIndex((s) => !stageDone(s));
  const ready = current === -1;
  const pending = status === "pending";
  const cert = coach.certs.find((c) => c.id === certId);

  function runLookup(c: Check) {
    setLookup("running");
    setTimeout(() => {
      setLookup("idle");
      actions.check(key, c.id, c.label, true);
      toast.success("Trouvé au registre", { description: `N° SPEC-${coach!.id.slice(0, 3).toUpperCase()}-${(certId.length * 731) % 10000} · vérification simulée` });
    }, 1400);
  }

  function decide(s: "verified" | "rejected") {
    actions.decideCert(coachId, certId, s, s === "rejected" ? [reason, note].filter(Boolean).join(". ") : undefined);
    toast[s === "verified" ? "success" : "info"](s === "verified" ? `Certification de ${coach!.name} validée` : "Certification refusée", {
      description: s === "verified" ? "Le coach est prévenu et peut postuler aux cours concernés." : `Motif envoyé au coach : ${reason?.toLowerCase()}.`,
    });
  }

  return (
    <>
      <BackLink href="#/admin">Vue d'ensemble</BackLink>
      <div className="mt-3 flex items-center gap-4">
        <a href={`#/admin/coach/${coach.id}`} className="transition hover:scale-105">
          <Avatar id={coach.id} size="lg" />
        </a>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Instruction d'un justificatif · déposé il y a {Math.max(1, cert?.since ?? 1)} mois</p>
          <h1 className="font-heading text-[22px] leading-tight font-extrabold">{certLabel(certId)}</h1>
          <a href={`#/admin/coach/${coach.id}`} className="font-semibold hover:underline">
            {coach.name}
          </a>
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-card px-3 py-4 ring-1 ring-border/70">
        <Steps steps={[...stages.map((s) => s.title), "Décision"]} current={!pending ? stages.length + 1 : ready ? stages.length : current} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="lg:sticky lg:top-36 lg:self-start">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <FileText className="size-4" aria-hidden /> Justificatif déposé · document fictif
          </p>
          <DocPreview title={`${certLabel(certId)} · ${coach.name}`}>
            <CertificateDoc coachId={coach.id} certId={certId} />
          </DocPreview>
        </motion.div>

        <div className="space-y-3">
          {review.request && pending && (
            <p className="rounded-3xl bg-warning-soft p-4 text-sm text-warning-ink">
              <b>Complément demandé au coach :</b> {review.request}
            </p>
          )}
          {stages.map((st, si) => {
            const ok = stageDone(st);
            const locked = pending && current !== -1 && si > current;
            return (
              <motion.section key={st.id} {...stagger(si)} className={cn("rounded-3xl bg-card p-4 ring-1 ring-border/70", si === current && pending && "ring-2 ring-primary", locked && "opacity-55")}>
                <h2 className="flex items-center gap-2 font-semibold">
                  <span className={cn("flex size-6 items-center justify-center rounded-full text-xs font-bold", ok ? "bg-success text-white" : "bg-muted")}>{ok ? <Check className="size-3.5" /> : si + 1}</span>
                  {st.title}
                </h2>
                <ul className="mt-3 space-y-2">
                  {st.checks.map((c) =>
                    st.registry && !done(c.id) ? (
                      <li key={c.id}>
                        <Button variant="outline" className="w-full justify-start" disabled={!pending || locked || lookup === "running"} onClick={() => runLookup(c)}>
                          {lookup === "running" ? <Loader2 className="animate-spin" /> : <Search />}
                          {lookup === "running" ? "Interrogation du registre…" : `Vérifier : ${c.label.toLowerCase()}`}
                        </Button>
                      </li>
                    ) : (
                      <li key={c.id}>
                        <label className={cn("flex min-h-11 cursor-pointer items-start gap-3 rounded-2xl px-2 py-2 hover:bg-muted/60", (!pending || locked) && "pointer-events-none")}>
                          <input
                            type="checkbox"
                            className="mt-0.5 size-5 shrink-0 accent-[var(--success)]"
                            checked={done(c.id)}
                            disabled={!pending || locked}
                            onChange={(e) => actions.check(key, c.id, c.label, e.target.checked)}
                          />
                          <span>
                            <span className="block text-[15px] font-medium">{c.label}</span>
                            {c.hint && <span className="block text-[13px] text-muted-foreground">{c.hint}</span>}
                          </span>
                        </label>
                      </li>
                    ),
                  )}
                </ul>
              </motion.section>
            );
          })}

          {pending ? (
            <section className="rounded-3xl bg-card p-4 ring-1 ring-border/70">
              <h2 className="font-semibold">Décision</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {ready ? "Tous les points sont contrôlés." : `${all.filter((c) => done(c.id)).length}/${all.length} points contrôlés : la validation se débloque à la fin.`}
              </p>
              <Button size="lg" className="mt-3 w-full" disabled={!ready} onClick={() => decide("verified")}>
                <BadgeCheck /> Valider la certification
              </Button>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Button variant="outline" onClick={() => setMode(mode === "info" ? "none" : "info")}>
                  <MessageSquare /> Demander un complément
                </Button>
                <Button variant="outline" onClick={() => setMode(mode === "refuse" ? "none" : "refuse")}>
                  <X /> Refuser
                </Button>
              </div>
              {mode === "refuse" && (
                <div className="mt-3">
                  <div className="flex flex-wrap gap-1.5">
                    {REASONS.map((r) => (
                      <Chip key={r} small active={r === reason} onClick={() => setReason(r)}>
                        {r}
                      </Chip>
                    ))}
                  </div>
                  <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Message au coach (facultatif)" className="mt-2 min-h-20" />
                  <Button variant="destructive" className="mt-2 w-full" disabled={!reason} onClick={() => decide("rejected")}>
                    Confirmer le refus
                  </Button>
                </div>
              )}
              {mode === "info" && (
                <div className="mt-3">
                  <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex. : merci d'ajouter le verso du diplôme" className="min-h-20" />
                  <Button className="mt-2 w-full" disabled={note.trim().length < 5} onClick={() => (actions.requestInfo(key, note.trim()), setNote(""), setMode("none"), toast("Complément demandé", { description: "Le coach reçoit votre message, le dossier reste en attente." }))}>
                    Envoyer la demande
                  </Button>
                </div>
              )}
            </section>
          ) : (
            <section className={cn("rounded-3xl p-4", status === "verified" ? "bg-success-soft text-success-ink" : "bg-primary-soft text-primary-ink")}>
              <p className="font-semibold">{status === "verified" ? "Certification validée" : "Certification refusée"}</p>
              <Button variant="outline" size="sm" className="mt-2 bg-card text-foreground" onClick={() => actions.decideCert(coachId, certId, "pending")}>
                Rouvrir le dossier
              </Button>
            </section>
          )}

          <section className="rounded-3xl bg-card p-4 ring-1 ring-border/70">
            <h2 className="flex items-center gap-2 font-semibold">
              <History className="size-4" aria-hidden /> Journal
            </h2>
            <ol className="mt-2 space-y-1.5 text-sm">
              <li className="flex gap-3 text-muted-foreground">
                <span className="w-28 shrink-0">Dépôt</span>
                <span>Justificatif déposé par {coach.name}</span>
              </li>
              {review.log.map((l, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-28 shrink-0 text-muted-foreground tabular-nums">{fmtTime(l.at)}</span>
                  <span className="min-w-0">{l.text}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </>
  );
}

function CoachPage({ id }: { id: string }) {
  const state = useStore();
  if (!COACHES.some((c) => c.id === id)) return <Empty>Coach introuvable.</Empty>;
  return (
    <>
      <BackLink href="#/admin">Vue d'ensemble</BackLink>
      <div className="mt-4">
        <CoachProfile coachId={id} overrides={state.certs} />
      </div>
    </>
  );
}

function SlotPage({ id }: { id: string }) {
  const state = useStore();
  const slot = slotById(state, id);
  if (!slot) return <Empty>Créneau introuvable.</Empty>;
  const apps = state.applications.filter((a) => a.slotId === id);
  return (
    <>
      <BackLink href="#/admin">Vue d'ensemble</BackLink>
      <div className="mt-2">
        <SlotHeader slot={slot} venueHref={`#/admin/salle/${slot.venueId}`} status={<Status status={slot.status} />} />
      </div>
      <Section title={`Candidatures · ${apps.length}`}>
        {apps.length ? (
          <ul className="flex flex-col gap-2">
            {apps.map((a) => (
              <li key={a.id}>
                <Tap href={`#/admin/coach/${a.coachId}`} className="flex items-center gap-3 rounded-3xl bg-card p-3 ring-1 ring-border/70">
                  <Avatar id={a.coachId} />
                  <span className="flex-1 font-semibold">{coachById(a.coachId).name}</span>
                  <Status status={a.status} />
                </Tap>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>Aucune candidature.</Empty>
        )}
      </Section>
      <Section title="Détails">
        <SlotFacts slot={slot} />
      </Section>
    </>
  );
}
