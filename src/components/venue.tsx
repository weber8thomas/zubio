import { BadgeCheck, CalendarClock, Check, CircleCheckBig, Clock, MapPin, Navigation, Timer, Undo2, Wallet, X } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { Avatar, ClassChip, Section, SlotCard, Status, stagger } from "@/components/kit";
import { MapView } from "@/components/map";
import { Stars, since } from "@/components/reviews";
import { CATEGORIES, classById } from "@/data/classes";
import { coachById } from "@/data/coaches";
import type { CategoryId, Point } from "@/data/types";
import { venueProfile } from "@/data/venueProfile";
import { dayLabel } from "@/lib/date";
import { distanceKm, km } from "@/lib/geo";
import { useStore, venueById } from "@/lib/store";

/** Fiche d'une salle : ce qu'un coach veut savoir avant de postuler. */
export function VenueProfile({ venueId, from, slotHref, actions }: { venueId: string; from?: Point; slotHref?: (id: string) => string; actions?: ReactNode }) {
  const state = useStore();
  const v = venueById(venueId);
  const p = venueProfile(v);
  const open = state.slots.filter((s) => s.venueId === v.id && s.status === "open").sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  const regulars = [...new Set(state.slots.filter((s) => s.venueId === v.id && s.coachId).map((s) => s.coachId!))];
  const byCat = Object.keys(CATEGORIES)
    .map((c) => [c as CategoryId, v.classes.filter((id) => classById(id).category === c)] as const)
    .filter(([, list]) => list.length);
  const figures: [typeof Wallet, string, string, string][] = [
    [Wallet, "Paiement", `${p.paymentDays} j`, "délai moyen après la séance"],
    [Timer, "Réponse", `${p.responseMin} min`, "pour choisir un coach"],
    [Undo2, "Annulations", `${p.cancel} %`, "des créneaux publiés"],
    [CircleCheckBig, "Missions", String(18 + p.reviewCount * 2), `depuis ${p.since}`],
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
        {actions && <div className="mb-4 lg:hidden">{actions}</div>}
        <motion.header initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-3xl bg-card ring-1 ring-border/70">
          <div className="relative h-28 overflow-hidden bg-foreground sm:h-36" aria-hidden>
            <div className="absolute inset-0 grid grid-cols-6 gap-2 p-3 opacity-90 sm:grid-cols-9">
              {[...v.classes, ...v.classes, ...v.classes].slice(0, 18).map((id, i) => {
                const Icon = CATEGORIES[classById(id).category].icon;
                const cat = classById(id).category;
                return (
                  <motion.span key={i} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }} className="flex items-center justify-center rounded-2xl" style={{ background: `var(--cat-${cat}-bg)`, color: `var(--cat-${cat}-fg)` }}>
                    <Icon className="size-5" />
                  </motion.span>
                );
              })}
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <h1 className="font-heading text-[24px] leading-tight font-extrabold sm:text-[30px]">{v.name}</h1>
            <p className="mt-1.5 flex items-start gap-1.5 text-[15px] text-ink-soft">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                {v.address}
                {from && ` · à ${km(distanceKm(from, v))}`}
              </span>
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[15px]">
              <Stars value={p.rating} />
              <b className="tabular-nums">{p.rating.toFixed(1)}</b>
              <span className="text-muted-foreground">· {p.reviewCount} avis de coachs</span>
            </p>
            <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-success-ink">
              <BadgeCheck className="size-4" aria-hidden /> Salle vérifiée · SIREN contrôlé · paiements garantis par Zubio
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-px border-t border-border/70 bg-border/70 sm:grid-cols-4">
            {figures.map(([Icon, k, val, hint], i) => (
              <motion.div key={k} {...stagger(i + 1)} className="bg-card px-4 py-3.5 sm:px-6">
                <dt className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground">
                  <Icon className="size-3.5" aria-hidden /> {k}
                </dt>
                <dd className="mt-1">
                  <span className="block font-heading text-[22px] leading-none font-extrabold tabular-nums">{val}</span>
                  <span className="mt-1 block text-[13px] leading-snug text-muted-foreground">{hint}</span>
                </dd>
              </motion.div>
            ))}
          </dl>
        </motion.header>

        <Section title="À propos">
          <p className="text-[17px] leading-relaxed text-ink-soft">{p.about}</p>
          <p className="mt-2 text-xs text-muted-foreground">Fiche de démonstration : la salle existe, les informations de cette fiche sont fictives.</p>
        </Section>

        <Section title={`Cours au planning · ${v.classes.length}`}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {byCat.map(([cat, list], i) => {
              const Icon = CATEGORIES[cat].icon;
              return (
                <motion.div key={cat} {...stagger(i)} className="rounded-3xl bg-card p-4 ring-1 ring-border/70">
                  <p className="flex items-center gap-2 font-semibold">
                    <span className="flex size-8 items-center justify-center rounded-[10px]" style={{ background: `var(--cat-${cat}-bg)`, color: `var(--cat-${cat}-fg)` }}>
                      <Icon className="size-4" aria-hidden />
                    </span>
                    {CATEGORIES[cat].label}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {list.map((id) => (
                      <ClassChip key={id} id={id} />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Section>

        {slotHref && (
          <Section title={`Créneaux à pourvoir · ${open.length}`}>
            {open.length ? (
              <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {open.map((s, i) => (
                  <motion.li key={s.id} {...stagger(i)}>
                    <SlotCard href={slotHref(s.id)} classId={s.classId} title={classById(s.classId).label} when={`${dayLabel(s.date)} · ${s.start}`} price={s.price} footer={<Status status="open" />} />
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Aucun créneau ouvert en ce moment.</p>
            )}
          </Section>
        )}

        <Section title="Avis des coachs">
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {p.reviews.map((r, i) => {
              const c = coachById(r.coachId);
              return (
                <motion.li key={i} {...stagger(i)} className="rounded-3xl bg-card p-4 ring-1 ring-border/70">
                  <div className="flex items-center gap-3">
                    <Avatar id={c.id} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{c.name}</p>
                      <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
                        <Stars value={r.rating} /> {since(r.daysAgo)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-[16px] leading-relaxed">{r.text}</p>
                  {r.strengths.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {r.strengths.map((s) => (
                        <li key={s} className="rounded-full bg-muted px-2.5 py-1 text-[13px] font-medium">
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.li>
              );
            })}
          </ul>
        </Section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-36 lg:self-start">
        {actions && <div className="hidden lg:block">{actions}</div>}
        <div className="overflow-hidden rounded-3xl ring-1 ring-border/70">
          <MapView className="h-48" center={v} zoomKm={1.2} markers={[{ id: "venue", kind: "venue", lat: v.lat, lng: v.lng }]} />
          <a href={`https://www.openstreetmap.org/directions?to=${v.lat},${v.lng}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-card px-4 py-3 text-sm font-semibold hover:bg-muted/50">
            <Navigation className="size-4 text-primary" aria-hidden /> Itinéraire
          </a>
        </div>
        <div className="rounded-3xl bg-card p-4 ring-1 ring-border/70">
          <p className="font-semibold">Sur place</p>
          <ul className="mt-2 space-y-2 text-sm">
            {p.studios.map((s) => (
              <li key={s} className="flex items-center gap-2">
                <Check className="size-4 text-success" aria-hidden /> {s}
              </li>
            ))}
            {p.onSite.map(([s, ok]) => (
              <li key={s} className={ok ? "flex items-center gap-2" : "flex items-center gap-2 text-muted-foreground line-through"}>
                {ok ? <Check className="size-4 text-success" aria-hidden /> : <X className="size-4" aria-hidden />} {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl bg-card p-4 text-sm ring-1 ring-border/70">
          <p className="font-semibold">Infos pratiques</p>
          <p className="mt-2 flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" aria-hidden /> Arrivée {p.arrive} min avant le cours
          </p>
          <p className="mt-1.5 flex items-center gap-2">
            <CalendarClock className="size-4 text-muted-foreground" aria-hidden /> Brief envoyé la veille
          </p>
          <p className="mt-1.5 text-muted-foreground">Contact : {p.contact}</p>
        </div>
        {regulars.length > 0 && (
          <div className="rounded-3xl bg-card p-4 ring-1 ring-border/70">
            <p className="font-semibold">Coachs déjà venus</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {regulars.map((id) => (
                <span key={id} title={coachById(id).name}>
                  <Avatar id={id} size="sm" />
                </span>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
