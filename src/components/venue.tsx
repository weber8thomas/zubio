import { BadgeCheck, CalendarClock, Check, CircleCheckBig, Clock, MapPin, Navigation, Timer, Undo2, Wallet, X } from "lucide-react";
import { motion } from "motion/react";
import { type CSSProperties, type ReactNode, useState } from "react";
import { Avatar, ClassTile, Section, SlotCard, Status, stagger } from "@/components/kit";
import { MapView } from "@/components/map";
import { Stars, since } from "@/components/reviews";
import { brandOf } from "@/data/brands";
import { CATEGORIES, classById } from "@/data/classes";
import { coachById } from "@/data/coaches";
import type { CategoryId, Point } from "@/data/types";
import { venueProfile, weekPlan } from "@/data/venueProfile";
import { addDays, dayLabel, parse, today } from "@/lib/date";
import { distanceKm, km } from "@/lib/geo";
import { useStore, venueById } from "@/lib/store";
import { cn } from "@/lib/utils";

const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;

/** Logo de la salle : logo complet en grand, emblème (ou monogramme à ses couleurs) en petit. */
export function VenueLogo({ venueId, size = "md", className }: { venueId: string; size?: "xs" | "sm" | "md" | "xl"; className?: string }) {
  const b = brandOf(venueId);
  const bg = b.logoOnBrand ? b.primary : "#ffffff";
  if (size === "xl" && b.logo)
    return (
      <span className={cn("inline-flex h-20 min-w-20 shrink-0 items-center justify-center rounded-[22px] px-3 py-2.5 sm:h-24 sm:min-w-24", className)} style={{ background: bg }}>
        <img src={asset(b.logo)} alt={`Logo ${venueById(venueId).name}`} className="max-h-full max-w-[150px] object-contain sm:max-w-[220px]" />
      </span>
    );
  const box = { xs: "size-5 rounded-[6px] text-[8px]", sm: "size-9 rounded-[10px] text-[11px]", md: "size-12 rounded-[14px] text-sm", xl: "size-20 rounded-[22px] text-[22px] sm:size-24 sm:text-[26px]" }[size];
  if (b.mark)
    return (
      <span className={cn(box, "inline-flex shrink-0 items-center justify-center overflow-hidden ring-1 ring-border/70", size === "xs" ? "p-px" : "p-[10%]", className)} style={{ background: bg }}>
        <img src={asset(b.mark)} alt="" className="max-h-full max-w-full object-contain" />
      </span>
    );
  return (
    <span className={cn(box, "relative inline-flex shrink-0 items-center justify-center overflow-hidden font-heading font-extrabold tracking-tight", className)} style={{ background: b.primary, color: b.ink }} aria-hidden>
      {b.mono}
      <span className="absolute right-[12%] bottom-[12%] size-[14%] rounded-full" style={{ background: b.accent }} />
    </span>
  );
}

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

/** Fiche d'une salle, à ses couleurs : ce qu'un coach veut savoir avant de postuler. */
export function VenueProfile({ venueId, from, slotHref, actions }: { venueId: string; from?: Point; slotHref?: (id: string) => string; actions?: ReactNode }) {
  const state = useStore();
  const v = venueById(venueId);
  const b = brandOf(v.id);
  const p = venueProfile(v);
  const plan = weekPlan(v);
  const open = state.slots.filter((s) => s.venueId === v.id && s.status === "open").sort((a, c) => (a.date + a.start).localeCompare(c.date + c.start));
  const regulars = [...new Set(state.slots.filter((s) => s.venueId === v.id && s.coachId).map((s) => s.coachId!))];
  const perWeek = (id: string) => plan.reduce((t, d) => t + d.classes.filter((c) => c.classId === id).length, 0);
  const byCat = (Object.keys(CATEGORIES) as CategoryId[]).map((c) => [c, v.classes.filter((id) => classById(id).category === c)] as const).filter(([, list]) => list.length);
  const figures: [typeof Wallet, string, string, string][] = [
    [Wallet, "Paiement", `${p.paymentDays} j`, "délai moyen après la séance"],
    [Timer, "Réponse", `${p.responseMin} min`, "pour confirmer un coach"],
    [Undo2, "Annulations", `${p.cancel} %`, "des créneaux publiés"],
    [CircleCheckBig, "Missions", String(18 + p.reviewCount * 2), `sur Zubio depuis ${p.since}`],
  ];
  const nav = [
    ["apercu", "Aperçu"],
    ["planning", "Planning"],
    ["cours", "Cours"],
    ...(slotHref ? [["pourvoir", `À pourvoir · ${open.length}`]] : []),
    ["avis", "Avis"],
  ];

  return (
    <div style={{ "--brand": b.primary, "--brand-ink": b.ink } as CSSProperties}>
      <motion.header initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-3xl bg-card ring-1 ring-border/70">
        <div className="relative h-36 sm:h-64">
          <img src={asset(`venues/${v.id}.jpg`)} alt="" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 30%, ${b.primary}e6 100%)` }} />
          <span className="absolute top-3 right-3 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">Photo d'illustration</span>
          <div className="absolute inset-x-0 bottom-0 hidden items-end gap-4 p-6 sm:flex">
            <VenueLogo venueId={v.id} size="xl" className="ring-4 ring-card shadow-lift" />
            <div className="min-w-0 pb-1" style={{ color: b.ink === "#171f2b" ? "#fff" : b.ink }}>
              <p className="font-heading text-[34px] leading-tight font-extrabold text-balance drop-shadow">{v.name}</p>
              <p className="mt-0.5 text-[15px] opacity-90">{b.tagline}</p>
            </div>
          </div>
        </div>
        <div className="relative z-10 flex flex-col items-start gap-2 px-4 sm:hidden">
          <VenueLogo venueId={v.id} size="xl" className="-mt-10 shadow-lift ring-4 ring-card" />
          <div className="min-w-0">
            <h1 className="font-heading text-[22px] leading-tight font-extrabold text-balance">{v.name}</h1>
            <p className="text-sm text-muted-foreground">{b.tagline}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3.5 text-[15px] sm:px-6">
          <span className="flex items-center gap-1.5 text-ink-soft">
            <MapPin className="size-4 shrink-0" aria-hidden />
            {v.address}
            {from && ` · à ${km(distanceKm(from, v))}`}
          </span>
          <span className="flex items-center gap-2">
            <Stars value={p.rating} />
            <b className="tabular-nums">{p.rating.toFixed(1)}</b>
            <span className="text-muted-foreground">· {p.reviewCount} avis de coachs</span>
          </span>
          <span className="flex items-center gap-1.5 text-sm font-medium text-success-ink">
            <BadgeCheck className="size-4" aria-hidden /> Salle vérifiée · paiements garantis
          </span>
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

      <nav className="scroll-row sticky top-16 z-20 -mx-4 mt-4 flex gap-1.5 overflow-x-auto bg-background/90 px-4 py-2 backdrop-blur-md md:top-[7.25rem] sm:mx-0 sm:px-0" aria-label="Sections de la fiche">
        {nav.map(([id, label]) => (
          <a key={id} href={`#${id}`} onClick={(e) => (e.preventDefault(), document.getElementById(`v-${id}`)?.scrollIntoView({ behavior: "smooth" }))} className="h-9 shrink-0 rounded-full bg-card px-3.5 text-[13px] leading-9 font-semibold ring-1 ring-border/70 hover:ring-[var(--brand)]">
            {label}
          </a>
        ))}
      </nav>

      <div className="mt-2 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          {actions && <div className="mt-4 lg:hidden">{actions}</div>}
          <Anchor id="apercu" />
          <Section title="À propos">
            <p className="text-[17px] leading-relaxed text-ink-soft">{p.about}</p>
            <p className="mt-2 text-xs text-muted-foreground">Démo, salle non partenaire de Zubio : nom, logo et couleurs repris de son site ; planning, chiffres et avis fictifs.</p>
          </Section>

          <Anchor id="planning" />
          <Section title="Planning de la semaine">
            <Planning venueId={v.id} plan={plan} />
          </Section>

          <Anchor id="cours" />
          <Section title={`Cours donnés · ${v.classes.length}`}>
            <div className="space-y-4">
              {byCat.map(([cat, list]) => (
                <div key={cat}>
                  <p className="mb-2 text-sm font-semibold text-muted-foreground">{CATEGORIES[cat].label}</p>
                  <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {list.map((id, i) => (
                      <motion.li key={id} {...stagger(i)} className="flex items-center gap-3 rounded-3xl bg-card p-3 ring-1 ring-border/70">
                        <ClassTile id={id} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold">{classById(id).label}</span>
                          <span className="block text-[13px] text-muted-foreground">
                            {classById(id).duration} min · {perWeek(id) || 1}× par semaine
                          </span>
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>

          {slotHref && (
            <>
              <Anchor id="pourvoir" />
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
            </>
          )}

          <Anchor id="avis" />
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

        <aside className="space-y-4 lg:sticky lg:top-44 lg:mt-10 lg:self-start">
          {actions && <div className="hidden lg:block">{actions}</div>}
          <div className="overflow-hidden rounded-3xl ring-1 ring-border/70">
            <MapView className="h-48" center={v} zoomKm={1.2} markers={[{ id: "venue", kind: "venue", lat: v.lat, lng: v.lng }]} />
            <a href={`https://www.openstreetmap.org/directions?to=${v.lat},${v.lng}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-card px-4 py-3 text-sm font-semibold hover:bg-muted/50">
              <Navigation className="size-4" style={{ color: b.primary }} aria-hidden /> Itinéraire
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
    </div>
  );
}

const Anchor = ({ id }: { id: string }) => <span id={`v-${id}`} className="block scroll-mt-36 md:scroll-mt-48" />;

/** Semaine type, et les remplacements en cours sur les 7 prochains jours. */
function Planning({ venueId, plan }: { venueId: string; plan: ReturnType<typeof weekPlan> }) {
  const state = useStore();
  const todayDow = ((parse(today()).getDay() + 6) % 7) + 1;
  const [day, setDay] = useState(todayDow);
  const dateOf = (d: number) => addDays(today(), (d - todayDow + 7) % 7);
  const items = (d: number) => {
    const date = dateOf(d);
    const zubio = state.slots.filter((s) => s.venueId === venueId && s.date === date && s.status !== "done");
    const regular = plan[d - 1].classes.filter((c) => !zubio.some((z) => z.start === c.start));
    return [...regular.map((c) => ({ ...c, slot: undefined })), ...zubio.map((s) => ({ start: s.start, classId: s.classId, slot: s }))].sort((a, b) => a.start.localeCompare(b.start));
  };
  const Item = ({ it }: { it: ReturnType<typeof items>[number] }) => {
    const cat = classById(it.classId).category;
    return (
      <li
        className={cn("rounded-2xl px-3 py-2 text-left", it.slot?.status === "open" && "ring-2 ring-primary ring-inset")}
        style={{ background: `var(--cat-${cat}-bg)`, color: `var(--cat-${cat}-fg)` }}
      >
        <span className="block text-xs font-bold tabular-nums">{it.start}</span>
        <span className="block text-[13px] leading-tight font-semibold break-words">{classById(it.classId).label}</span>
        {it.slot && <span className="mt-0.5 block text-[11px] font-semibold text-foreground">{it.slot.status === "open" ? "Remplaçant recherché" : "Remplaçant confirmé"}</span>}
      </li>
    );
  };
  return (
    <>
      <div className="grid grid-cols-7 gap-1 md:hidden">
        {DAYS.map((d, i) => (
          <button
            key={d}
            type="button"
            onClick={() => setDay(i + 1)}
            aria-pressed={day === i + 1}
            className={cn("flex h-14 flex-col items-center justify-center rounded-2xl text-xs font-semibold", day === i + 1 ? "text-[var(--brand-ink)]" : "bg-card ring-1 ring-border/70")}
            style={day === i + 1 ? { background: "var(--brand)" } : undefined}
          >
            {d}
            <span className="text-[15px] font-bold tabular-nums">{parse(dateOf(i + 1)).getDate()}</span>
          </button>
        ))}
      </div>
      <ul className="mt-3 space-y-2 md:hidden">
        {items(day).map((it) => (
          <Item key={it.start + it.classId} it={it} />
        ))}
      </ul>
      <div className="hidden grid-cols-7 gap-1.5 md:grid">
        {DAYS.map((d, i) => (
          <div key={d} className="min-w-0">
            <p className={cn("mb-1.5 rounded-xl py-1.5 text-center text-xs font-semibold", i + 1 === todayDow ? "text-[var(--brand-ink)]" : "bg-muted")} style={i + 1 === todayDow ? { background: "var(--brand)" } : undefined}>
              {d} {parse(dateOf(i + 1)).getDate()}
            </p>
            <ul className="space-y-1.5">
              {items(i + 1).map((it) => (
                <Item key={it.start + it.classId} it={it} />
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Encadré rouge : cours dont le coach habituel est absent, remplacement publié sur Zubio.</p>
    </>
  );
}
