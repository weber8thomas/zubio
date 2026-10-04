import { BadgeCheck, CalendarRange, ChevronRight, FileText, Gauge, Timer, Users, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, BackLink, ClassTile, Empty, PageTitle, Section, Stat, Status, Tap, stagger } from "@/components/kit";
import { Chip } from "@/components/pickers";
import { CoachProfile, SlotFacts, SlotHeader } from "@/components/profiles";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { certLabel, classById } from "@/data/classes";
import { COACHES, coachById } from "@/data/coaches";
import { dayLabel } from "@/lib/date";
import { certStatus } from "@/lib/matching";
import { go } from "@/lib/router";
import { actions, slotById, useStore, venueById } from "@/lib/store";

export function AdminSpace({ route }: { route: string[] }) {
  const [page, a, b] = route;
  return (
    <Shell space="admin" tabs={[]} page={route.join("/")}>
      {page === "diplome" && a && b ? <Credential coachId={a} certId={b} /> : page === "coach" && a ? <CoachPage id={a} /> : page === "creneau" && a ? <SlotPage id={a} /> : <Overview />}
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
                  <Tap href={`#/admin/diplome/${c.id}/${cert.id}`} className="flex items-center gap-3 rounded-3xl bg-card p-3 pr-4 shadow-soft ring-1 ring-border/70">
                    <Avatar id={c.id} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{c.name}</p>
                      <p className="truncate text-sm text-muted-foreground">{certLabel(cert.id)}</p>
                    </div>
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
          <ul className="flex flex-col gap-2">
            {[...slots].reverse().map((s, i) => (
              <motion.li key={s.id} {...stagger(i)}>
                <Tap href={`#/admin/creneau/${s.id}`} className="flex items-center gap-3 rounded-3xl bg-card p-3 ring-1 ring-border/70">
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
                </Tap>
              </motion.li>
            ))}
          </ul>
        </Section>
      </div>
    </>
  );
}

const REASONS = ["Document illisible", "Certification expirée", "Nom différent du profil"];

function Credential({ coachId, certId }: { coachId: string; certId: string }) {
  const state = useStore();
  const [reason, setReason] = useState(REASONS[0]);
  const coach = COACHES.find((c) => c.id === coachId);
  if (!coach) return <Empty>Coach introuvable.</Empty>;
  const status = certStatus(coach, certId, state.certs);
  const decide = (s: "verified" | "rejected") => {
    actions.decideCert(coachId, certId, s);
    toast[s === "verified" ? "success" : "info"](s === "verified" ? `Certification de ${coach.name} validée` : "Certification refusée", {
      description: s === "verified" ? "Le coach peut postuler aux cours concernés." : `Motif envoyé : ${reason.toLowerCase()}.`,
    });
    go("/admin");
  };

  return (
    <div className="mx-auto max-w-2xl">
      <BackLink href="#/admin">Vue d'ensemble</BackLink>
      <div className="mt-3 flex items-center gap-4">
        <a href={`#/admin/coach/${coach.id}`} className="transition hover:scale-105">
          <Avatar id={coach.id} size="lg" />
        </a>
        <div>
          <p className="text-sm text-muted-foreground">Certification à vérifier</p>
          <h1 className="font-heading text-[22px] leading-tight font-extrabold">{certLabel(certId)}</h1>
          <a href={`#/admin/coach/${coach.id}`} className="font-semibold hover:underline">
            {coach.name}
          </a>
        </div>
      </div>

      <motion.figure initial={{ rotate: -1.5, y: 12, opacity: 0 }} animate={{ rotate: -0.6, y: 0, opacity: 1 }} className="mt-6 rounded-3xl bg-white p-6 shadow-lift ring-1 ring-border/70">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <FileText className="size-4" aria-hidden /> justificatif.pdf · document fictif
        </div>
        <p className="mt-6 text-center font-heading text-lg font-extrabold uppercase">Attestation de certification</p>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">Titulaire</dt>
            <dd className="font-semibold">{coach.name}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Certification</dt>
            <dd className="font-semibold">{certLabel(certId)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Numéro</dt>
            <dd className="font-mono font-semibold">ZB-{coach.id.slice(0, 3).toUpperCase()}-{certId.length * 731}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Délivrée</dt>
            <dd className="font-semibold">il y a moins d'un mois</dd>
          </div>
        </dl>
      </motion.figure>

      {status === "pending" ? (
        <div className="mt-6 space-y-4">
          <Button size="lg" className="w-full" onClick={() => decide("verified")}>
            <BadgeCheck /> Valider la certification
          </Button>
          <div className="rounded-3xl bg-card p-4 ring-1 ring-border/70">
            <p className="text-sm font-semibold">Ou refuser, avec un motif</p>
            <div className="scroll-row -mx-1 mt-2 flex gap-1.5 overflow-x-auto px-1 pb-1">
              {REASONS.map((r) => (
                <Chip key={r} small active={r === reason} onClick={() => setReason(r)}>
                  {r}
                </Chip>
              ))}
            </div>
            <Button variant="outline" className="mt-3 w-full" onClick={() => decide("rejected")}>
              <X /> Refuser
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-6 text-center font-semibold">{status === "verified" ? "Certification validée." : "Certification refusée."}</p>
      )}
    </div>
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
        <SlotHeader slot={slot} status={<Status status={slot.status} />} />
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
