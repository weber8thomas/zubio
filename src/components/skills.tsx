import { Check, Eye, Lock } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { A4Page, CertificateDoc, DocViewer } from "@/components/docs";
import { stagger } from "@/components/kit";
import { CATEGORIES, CLASSES, certLabel } from "@/data/classes";
import { coachById } from "@/data/coaches";
import type { CategoryId, CertStatus, ClassId, Coach } from "@/data/types";
import { type CertOverrides, certStatus } from "@/lib/matching";
import { cn } from "@/lib/utils";

// Compétences d'un coach, rangées par famille de cours, et justificatifs de certification.

type State = "ok" | "pending" | "locked";
type Skill = { id: ClassId; label: string; duration: number; state: State; via: string[]; requires: string[] };

const SHORT: Record<string, string> = {
  "bpjeps-af": "BPJEPS AF",
  "cqp-als": "CQP ALS",
  staps: "Licence STAPS",
  "bpjeps-aan": "BPJEPS AAN",
  bnssa: "BNSSA",
  pilates: "Pilates mat",
  reformer: "Pilates Reformer",
  yoga200: "RYT 200",
  zumba: "Licence ZIN",
};
const short = (id: string) => (id.startsWith("lm-") ? `Licence ${CLASSES.find((c) => c.id === id.slice(3))?.label ?? id}` : (SHORT[id] ?? id));

/** « A », « A ou B », « A, B ou C ». */
const either = (ids: string[]) => {
  const l = ids.map(short);
  return l.length < 2 ? (l[0] ?? "") : `${l.slice(0, -1).join(", ")} ou ${l.at(-1)}`;
};

const tone = (cat: CategoryId) => ({ background: `var(--cat-${cat}-bg)`, color: `var(--cat-${cat}-fg)` });

/** Ancienneté d'une certification (en mois) en toutes lettres. */
export const ago = (months: number) => (months < 12 ? `${Math.max(1, months)} mois` : `${Math.floor(months / 12)} an${months >= 24 ? "s" : ""}`);

const RANK: Record<State, number> = { ok: 0, pending: 1, locked: 2 };
const GENERIC = ["bpjeps-af", "cqp-als", "staps"];

/** Toutes les familles, avec l'état de chaque cours pour ce coach. */
export function skillMap(coach: Coach, overrides: CertOverrides) {
  const st = (cert: string) => certStatus(coach, cert, overrides);
  const skills: Skill[] = CLASSES.map((c) => {
    const via = c.requires.filter((r) => st(r) === "verified");
    const pending = c.requires.filter((r) => st(r) === "pending");
    return { id: c.id, label: c.label, duration: c.duration, requires: c.requires, state: via.length ? "ok" : pending.length ? "pending" : "locked", via: via.length ? via : pending };
  });
  return (Object.keys(CATEGORIES) as CategoryId[]).map((cat) => {
    const items = skills.filter((s) => CLASSES.find((c) => c.id === s.id)!.category === cat).sort((a, b) => RANK[a.state] - RANK[b.state]);
    const ok = items.filter((s) => s.state === "ok").length;
    const pending = items.filter((s) => s.state === "pending").length;
    // Une spécialité = un cours ouvert par une certification dédiée, pas par un diplôme généraliste.
    const special = items.some((s) => s.state !== "locked" && s.via.some((v) => !GENERIC.includes(v)));
    return { cat, items, ok, pending, special };
  });
}

/** Marqueur d'état « Ligne Z » : ● débloqué, ○ en vérification, cadenas sinon. */
function Mark({ state, cat }: { state: State; cat: CategoryId }) {
  if (state === "ok")
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full text-white" style={{ background: `var(--cat-${cat}-fg)` }}>
        <Check className="size-3.5" strokeWidth={3} aria-hidden />
      </span>
    );
  if (state === "pending") return <span className="size-6 shrink-0 rounded-full border-[3px] border-warning bg-card" aria-hidden />;
  return (
    <span className="flex size-6 shrink-0 items-center justify-center text-muted-foreground">
      <Lock className="size-4" aria-hidden />
    </span>
  );
}

const STATE_SR: Record<State, string> = { ok: "Débloqué", pending: "En vérification", locked: "Non débloqué" };

function Meter({ items, cat }: { items: Skill[]; cat: CategoryId }) {
  return (
    <span className="flex gap-1" aria-hidden>
      {items.map((s) => (
        <span key={s.id} className={cn("h-1.5 flex-1 rounded-full", s.state === "pending" ? "bg-warning" : s.state === "locked" && "bg-border")} style={s.state === "ok" ? { background: `var(--cat-${cat}-fg)` } : undefined} />
      ))}
    </span>
  );
}

function FamilyHead({ cat, sub, count, special }: { cat: CategoryId; sub: string; count: string; special?: boolean }) {
  const { label, icon: Icon } = CATEGORIES[cat];
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px]" style={tone(cat)}>
        <Icon className="size-[22px]" strokeWidth={2} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="flex flex-wrap items-center gap-x-2 gap-y-1 font-heading text-[15px] leading-tight font-semibold">
          {label}
          {special && (
            <span className="inline-flex h-6 items-center rounded-full px-2 font-sans text-xs font-semibold" style={tone(cat)}>
              Spécialité
            </span>
          )}
        </h3>
        <p className="mt-0.5 text-[13px] text-muted-foreground">{sub}</p>
      </div>
      <p className="shrink-0 font-heading text-lg font-extrabold tabular-nums" style={{ color: `var(--cat-${cat}-fg)` }}>
        {count}
        <span className="sr-only"> cours débloqués</span>
      </p>
    </div>
  );
}

/** Une famille de cours : chaque cours, la certification qui l'ouvre, ou celle qu'il faudrait. */
function Family({ cat, items, ok, special, i }: { cat: CategoryId; items: Skill[]; ok: number; special: boolean; i: number }) {
  const open = items.filter((s) => s.state === "ok");
  const key = (s: Skill) => s.via.join("+");
  // Même certification pour tous les cours ouverts : on la dit une fois, en tête de carte.
  const shared = open.length > 0 && open.every((s) => key(s) === key(open[0]));
  const sub = open.length ? `via ${[...new Set(open.flatMap((s) => s.via))].map(short).join(", ")}` : "En cours de vérification";
  return (
    <motion.article {...stagger(i)} className="flex flex-col rounded-3xl bg-card ring-1 ring-border/70">
      <div className="p-4 pb-3">
        <FamilyHead cat={cat} sub={sub} count={`${ok}/${items.length}`} special={special} />
        <div className="mt-3">
          <Meter items={items} cat={cat} />
        </div>
      </div>
      <ul className="flex-1 divide-y divide-border/70 border-t border-border/70">
        {items.map((s) => {
          const note = s.state === "ok" ? (shared ? null : `via ${s.via.map(short).join(", ")}`) : s.state === "pending" ? `${either(s.via)} en vérification` : `Requiert ${either(s.requires)}`;
          return (
            <li key={s.id} className="flex min-h-12 items-center gap-3 px-4 py-2.5">
              <Mark state={s.state} cat={cat} />
              <div className="min-w-0 flex-1">
                <p className={cn("text-[15px] leading-snug", s.state === "locked" ? "font-medium text-muted-foreground" : "font-semibold")}>
                  {s.label}
                  <span className="sr-only"> : {STATE_SR[s.state]}</span>
                </p>
                {note && <p className={cn("text-[13px] leading-snug", s.state === "pending" ? "text-warning-ink" : "text-muted-foreground")}>{note}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </motion.article>
  );
}

/** Les Mills : une licence nominative par programme, présentée comme telle. */
function LesMills({ coach, items, i }: { coach: Coach; items: Skill[]; i: number }) {
  const held = items.filter((s) => s.state !== "locked");
  const rest = items.filter((s) => s.state === "locked");
  const ok = held.filter((s) => s.state === "ok").length;
  return (
    <motion.article {...stagger(i)} className="rounded-3xl bg-card p-4 ring-1 ring-border/70 @xl:col-span-2">
      <FamilyHead cat="lesmills" sub="Une licence nominative par programme" count={`${ok}/${items.length}`} />
      <ul className="mt-4 grid grid-cols-2 gap-2 @lg:grid-cols-3 @3xl:grid-cols-4">
        {held.map((s) => {
          const since = coach.certs.find((x) => x.id === `lm-${s.id}`)?.since ?? 1;
          return (
            <li
              key={s.id}
              className={cn("flex min-h-[112px] flex-col rounded-2xl p-3", s.state === "pending" && "border-2 border-dashed border-warning bg-warning-soft/40")}
              style={s.state === "ok" ? tone("lesmills") : undefined}
            >
              <p className="font-heading text-[14px] leading-tight font-extrabold tracking-tight break-words">{s.label}</p>
              <p className={cn("mt-0.5 text-[13px]", s.state === "pending" && "text-muted-foreground")}>{s.duration} min</p>
              <p className={cn("mt-auto flex items-center gap-1.5 pt-3 text-[13px] leading-tight font-semibold", s.state === "pending" && "text-warning-ink")}>
                {s.state === "ok" ? <span className="size-2.5 shrink-0 rounded-full bg-current" aria-hidden /> : <span className="size-2.5 shrink-0 rounded-full border-2 border-current" aria-hidden />}
                {s.state === "ok" ? `Licence · ${ago(since)}` : "En vérification"}
              </p>
            </li>
          );
        })}
      </ul>
      {rest.length > 0 && (
        <p className="mt-3 flex gap-2 rounded-2xl bg-muted/60 px-3 py-2.5 text-[13px] leading-relaxed text-muted-foreground">
          <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            <b className="font-semibold text-ink-soft">Sans licence :</b> {rest.map((s) => s.label).join(" · ")}
          </span>
        </p>
      )}
    </motion.article>
  );
}

/** Cours que le coach peut donner, par famille. */
export function Skills({ coachId, overrides }: { coachId: string; overrides: CertOverrides }) {
  const coach = coachById(coachId);
  const map = skillMap(coach, overrides);
  const covered = map.filter((f) => f.ok + f.pending > 0).sort((a, b) => Number(b.cat === "lesmills") - Number(a.cat === "lesmills") || Number(b.special) - Number(a.special) || b.ok - a.ok);
  const missing = map.filter((f) => f.ok + f.pending === 0);
  const total = map.reduce((n, f) => n + f.ok, 0);
  const pending = map.reduce((n, f) => n + f.pending, 0);
  const families = map.filter((f) => f.ok > 0).length;

  return (
    <>
      <p className="text-[15px] leading-relaxed text-ink-soft">
        {total ? (
          <>
            <b className="font-semibold text-foreground">{total} cours</b> débloqués dans {families} famille{families > 1 ? "s" : ""}
          </>
        ) : (
          "Aucun cours débloqué pour l'instant"
        )}
        {pending > 0 && <span className="text-warning-ink"> · {pending} en attente de vérification</span>}
      </p>
      <ul className="mt-2 mb-4 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted-foreground" aria-label="Légende">
        <li className="flex items-center gap-1.5">
          <span className="flex size-4 items-center justify-center rounded-full bg-foreground text-background" aria-hidden>
            <Check className="size-2.5" strokeWidth={3.5} />
          </span>
          Débloqué par une certification vérifiée
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-4 rounded-full border-[3px] border-warning" aria-hidden /> En vérification
        </li>
        <li className="flex items-center gap-1.5">
          <Lock className="size-3.5" aria-hidden /> Certification requise
        </li>
      </ul>
      <div className="grid gap-3 @xl:grid-cols-2">
        {covered.map((f, i) => (f.cat === "lesmills" ? <LesMills key={f.cat} coach={coach} items={f.items} i={i} /> : <Family key={f.cat} cat={f.cat} items={f.items} ok={f.ok} special={f.special} i={i} />))}
        {missing.length > 0 && (
          <motion.article {...stagger(covered.length)} className="rounded-3xl border border-dashed border-border-strong p-4 @xl:col-span-2">
            <h3 className="text-sm font-semibold text-ink-soft">Pas encore couvert</h3>
            <ul className="mt-3 grid gap-3 @xl:grid-cols-2">
              {missing.map((f) => {
                const { label, icon: Icon } = CATEGORIES[f.cat];
                const certs = [...new Set(f.items.flatMap((s) => s.requires))];
                return (
                  <li key={f.cat} className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-muted text-muted-foreground">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[15px] font-semibold text-ink-soft">{label}</span>
                      <span className="block text-[13px] leading-snug text-muted-foreground">{f.cat === "lesmills" ? "Une licence par programme" : `Requiert ${either(certs)}`}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </motion.article>
        )}
      </div>
    </>
  );
}

const PILL: Record<CertStatus, { label: string; cls: string; dot: string }> = {
  verified: { label: "Vérifiée", cls: "bg-success-soft text-success-ink", dot: "bg-success" },
  pending: { label: "En vérification", cls: "bg-warning-soft text-warning-ink", dot: "border-2 border-warning-ink" },
  rejected: { label: "Refusée", cls: "bg-primary-soft text-primary-ink", dot: "bg-primary-ink" },
};

export function CertPill({ status }: { status: CertStatus }) {
  const p = PILL[status];
  return (
    <span className={cn("inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-semibold whitespace-nowrap", p.cls)}>
      <span className={cn("size-2 rounded-full", p.dot)} aria-hidden />
      {p.label}
    </span>
  );
}

function CertCard({ coach, cert, status, i }: { coach: Coach; cert: Coach["certs"][number]; status: CertStatus; i: number }) {
  const [open, setOpen] = useState(false);
  const label = certLabel(cert.id);
  const unlocks = CLASSES.filter((c) => c.requires.includes(cert.id)).length;
  const when = status === "verified" ? `Obtenue il y a ${ago(cert.since)}` : status === "pending" ? "Déposée récemment" : "Justificatif non conforme";
  return (
    <motion.li {...stagger(i)}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${label}, ${PILL[status].label}. Ouvrir le justificatif`}
        className="group flex w-full items-center gap-4 rounded-3xl bg-card p-3 pr-4 text-left ring-1 ring-border/70 transition hover:shadow-lift hover:ring-primary/50"
      >
        <span className="shrink-0 overflow-hidden rounded-lg shadow-soft ring-1 ring-border/70 transition group-hover:-translate-y-0.5">
          <A4Page width={64}>
            <CertificateDoc coachId={coach.id} certId={cert.id} />
          </A4Page>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] leading-snug font-semibold">{label}</span>
          <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">
            {when} · {status === "pending" ? "débloquera" : "ouvre"} {unlocks} cours
          </span>
          <span className="mt-2 flex items-center justify-between gap-2">
            <CertPill status={status} />
            <span className="flex items-center gap-1 text-[13px] font-semibold text-primary-ink">
              <Eye className="size-4" aria-hidden /> Voir
            </span>
          </span>
        </span>
      </button>
      <DocViewer open={open} onOpenChange={setOpen} title={label}>
        <CertificateDoc coachId={coach.id} certId={cert.id} />
      </DocViewer>
    </motion.li>
  );
}

const ORDER: Record<CertStatus, number> = { verified: 0, pending: 1, rejected: 2 };

/** Certifications avec leur justificatif A4 en miniature (s'ouvre en grand). */
export function Certifications({ coachId, overrides }: { coachId: string; overrides: CertOverrides }) {
  const coach = coachById(coachId);
  const list = coach.certs.map((cert) => ({ cert, status: certStatus(coach, cert.id, overrides) ?? cert.status })).sort((a, b) => ORDER[a.status] - ORDER[b.status]);
  return (
    <ul className="grid gap-3 @2xl:grid-cols-2">
      {list.map(({ cert, status }, i) => (
        <CertCard key={cert.id} coach={coach} cert={cert} status={status} i={i} />
      ))}
    </ul>
  );
}
