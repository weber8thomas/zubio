import { ArrowRight, BellRing, Building2, CalendarPlus, ChevronRight, Handshake, Loader2, RotateCcw, Search, ShieldCheck, UserRound } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/brand";
import { AvatarStack } from "@/components/kit";
import { MapView } from "@/components/map";
import { MARKET } from "@/config/market";
import { COACHES } from "@/data/coaches";
import { VENUES } from "@/data/venues";
import { distanceKm, inMarket, type Place, searchPlaces } from "@/lib/geo";
import { actions } from "@/lib/store";

const ROLES = [
  { href: "#/salle", icon: Building2, title: "Je gère une salle", text: "Publiez un créneau, comparez les candidats, choisissez." },
  { href: "#/coach", icon: UserRound, title: "Je suis coach", text: "Trouvez des créneaux près de chez vous et postulez." },
  { href: "#/admin", icon: ShieldCheck, title: "Équipe Zubio", text: "Chiffres clés et vérification des certifications." },
];

const STEPS = [
  { icon: CalendarPlus, title: "La salle publie", text: "Cours, jour, horaire, tarif, rayon. Une minute." },
  { icon: BellRing, title: "Les coachs certifiés postulent", text: "Seuls ceux qui ont la bonne certification, à distance, et disponibles." },
  { icon: Handshake, title: "La salle choisit", text: "C'est confirmé des deux côtés, en direct." },
];

const SEARCH_KM = 10;

export function HomePage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [place, setPlace] = useState<Place>({ ...MARKET.center, label: MARKET.name });

  useEffect(() => {
    const ctrl = new AbortController();
    const t = window.setTimeout(() => {
      if (q.trim().length < 3) return setResults([]);
      setLoading(true);
      searchPlaces(q, ctrl.signal)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => (ctrl.abort(), window.clearTimeout(t));
  }, [q]);

  const near = COACHES.filter((c) => distanceKm(place, c) <= SEARCH_KM);
  const gyms = VENUES.filter((v) => distanceKm(place, v) <= SEARCH_KM);
  const covered = inMarket(place);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      <header className="flex h-16 items-center justify-between">
        <Logo className="h-8" />
        <button type="button" onClick={() => (actions.reset(), toast("Démo réinitialisée"))} className="flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">
          <RotateCcw className="size-4" aria-hidden /> Réinitialiser
        </button>
      </header>

      <section className="grid grid-cols-1 items-center gap-8 pt-6 pb-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:pt-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-heading text-[32px] leading-[1.05] font-extrabold sm:text-[48px] lg:text-[46px]">
            Le bon coach,
            <br />
            <span className="whitespace-nowrap text-primary-ink">au bon créneau.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-ink-soft">Un coach absent ce soir ? Publiez le créneau, les coachs certifiés du coin postulent, vous choisissez.</p>

          <div className="relative mt-7 max-w-md">
            <label htmlFor="where" className="mb-2 block text-sm font-semibold">
              Où est votre salle ?
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                id="where"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Adresse, ville…"
                autoComplete="off"
                className="h-14 w-full rounded-full bg-card pr-12 pl-12 text-base shadow-soft ring-1 ring-border/70 outline-none focus:ring-2 focus:ring-primary"
              />
              {loading && <Loader2 className="absolute top-1/2 right-4 size-5 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden />}
            </div>
            <AnimatePresence>
              {results.length > 0 && (
                <motion.ul initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-3xl bg-card p-1.5 shadow-lift ring-1 ring-border/70">
                  {results.map((r) => (
                    <li key={r.label}>
                      <button type="button" onClick={() => (setPlace(r), setResults([]), setQ(r.label))} className="w-full rounded-2xl px-4 py-3 text-left text-sm hover:bg-muted">
                        {r.label}
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={place.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 flex items-center gap-3">
              {covered && near.length ? (
                <>
                  <AvatarStack ids={near.map((c) => c.id)} max={5} />
                  <p className="text-sm">
                    <b>{near.length} coachs</b> et <b>{gyms.length} salles</b> à moins de {SEARCH_KM} km
                  </p>
                </>
              ) : (
                <p className="text-sm text-ink-soft">
                  <b>Zubio arrive bientôt ici.</b> Lancement à {MARKET.name}, puis dans d'autres villes.
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="overflow-hidden rounded-[30px] shadow-lift ring-1 ring-border/70">
          <MapView
            className="h-80 sm:h-[420px]"
            center={place}
            zoomKm={SEARCH_KM}
            radiusKm={SEARCH_KM}
            markers={[
              { id: "here", kind: "venue", lat: place.lat, lng: place.lng },
              ...near.map((c) => ({ id: c.id, kind: "coach" as const, lat: c.lat, lng: c.lng, label: c.id, state: "active" as const, onClick: () => (window.location.hash = "#/salle/coach/" + c.id) })),
            ]}
          />
        </motion.div>
      </section>

      <section aria-label="Entrer dans la démo" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {ROLES.map(({ href, icon: Icon, title, text }, i) => (
          <motion.a
            key={href}
            href={href}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.06 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="group flex items-center gap-4 rounded-[26px] bg-card p-4 shadow-soft ring-1 ring-border/70 transition-shadow hover:shadow-lift sm:flex-col sm:items-start sm:p-5"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-primary-soft text-primary-ink">
              <Icon className="size-6" strokeWidth={2} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-bold">{title}</span>
              <span className="mt-1 block text-sm text-muted-foreground">{text}</span>
            </span>
            <span className="hidden items-center gap-1 text-sm font-semibold text-primary-ink sm:flex">
              Entrer <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden />
            </span>
            <ChevronRight className="size-5 shrink-0 text-muted-foreground sm:hidden" aria-hidden />
          </motion.a>
        ))}
      </section>

      <section className="py-16">
        <h2 className="font-heading text-[26px] leading-tight font-extrabold text-balance sm:text-[32px]">Comment ça marche</h2>
        <ol className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title}>
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-full bg-foreground text-background">
                  <Icon className="size-5" strokeWidth={2} aria-hidden />
                </span>
                <span className="font-heading text-sm font-extrabold text-muted-foreground">0{i + 1}</span>
              </div>
              <p className="mt-3 text-lg font-bold">{title}</p>
              <p className="mt-1 text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="border-t border-border/60 py-6 text-sm text-muted-foreground">
        Vitrine de démonstration. Les salles citées existent mais ne sont pas partenaires ; créneaux, coachs et avis sont fictifs.
      </footer>
    </div>
  );
}
