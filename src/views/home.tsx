import { ArrowRight, BellRing, Building2, CalendarPlus, Handshake, RotateCcw, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { BabMap } from "@/components/bab-map";
import { Logo } from "@/components/brand";
import { COACHES, MY_VENUE } from "@/data/demo";
import { actions } from "@/lib/store";

const ROLES = [
  { href: "#/salle", icon: Building2, title: "Je suis une salle", text: "Publiez un créneau, suivez les réponses en direct." },
  { href: "#/coach", icon: UserRound, title: "Je suis coach", text: "Recevez les offres près de chez vous, acceptez d'un geste." },
  { href: "#/admin", icon: ShieldCheck, title: "Équipe Zubio", text: "Chiffres clés et validation des diplômes." },
];

const STEPS = [
  { icon: CalendarPlus, title: "La salle publie", text: "Discipline, jour, horaire, tarif. 30 secondes." },
  { icon: BellRing, title: "Les bons coachs sont prévenus", text: "Diplôme vérifié, à distance, disponible, au bon tarif." },
  { icon: Handshake, title: "Le premier qui accepte", text: "C'est confirmé des deux côtés, en direct." },
];

export function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      <header className="flex h-16 items-center justify-between">
        <Logo className="h-8" />
        <button
          type="button"
          onClick={() => (actions.reset(), toast("Démo réinitialisée"))}
          className="flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <RotateCcw className="size-4" aria-hidden /> Réinitialiser
        </button>
      </header>

      <section className="grid items-center gap-8 pt-6 pb-10 lg:grid-cols-[1.1fr_1fr] lg:pt-14">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary-ink">
            Bayonne · Anglet · Biarritz
          </p>
          <h1 className="mt-4 font-heading text-5xl leading-[0.95] font-extrabold tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Le bon coach, au bon créneau.
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">
            Un coach absent ce soir ? La salle publie le créneau, Zubio trouve les coachs du coin qui peuvent venir.
          </p>
        </div>
        <div className="overflow-hidden rounded-[32px] shadow-lift ring-1 ring-border/60">
          <BabMap venue={MY_VENUE} radiusKm={6} pins={COACHES.map((c) => ({ ...c, active: ["maialen", "garazi", "camille", "laura"].includes(c.id) }))} />
        </div>
      </section>

      <section aria-label="Entrer dans la démo" className="grid gap-3 sm:grid-cols-3">
        {ROLES.map(({ href, icon: Icon, title, text }) => (
          <a
            key={href}
            href={href}
            className="group flex flex-col rounded-[28px] bg-card p-5 shadow-soft ring-1 ring-border/60 transition hover:-translate-y-1 hover:shadow-lift"
          >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-ink">
              <Icon className="size-6" strokeWidth={2} aria-hidden />
            </span>
            <span className="mt-4 font-heading text-lg font-bold">{title}</span>
            <span className="mt-1 flex-1 text-sm text-muted-foreground">{text}</span>
            <span className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary">
              Entrer <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden />
            </span>
          </a>
        ))}
      </section>

      <section className="py-16">
        <h2 className="font-heading text-3xl font-extrabold tracking-tight">Comment ça marche</h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title}>
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-foreground text-background">
                  <Icon className="size-5" strokeWidth={2} aria-hidden />
                </span>
                <span className="font-heading text-sm font-bold text-muted-foreground">0{i + 1}</span>
              </div>
              <p className="mt-3 font-heading text-lg font-bold">{title}</p>
              <p className="mt-1 text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="border-t border-border/60 py-6 text-sm text-muted-foreground">
        Vitrine de démonstration · données fictives, rien n&apos;est envoyé.
      </footer>
    </div>
  );
}
