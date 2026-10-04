import { BadgeCheck, Download, FileCheck2, Info, Landmark, ReceiptText, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { InvoiceDocument, InvoiceExports, InvoiceRow, InvoiceTimeline, PLATFORM_NOTE } from "@/components/invoice";
import { BackLink, Empty, PageTitle, Section } from "@/components/kit";
import { Chip } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { BILLING } from "@/config/billing";
import { COACHES } from "@/data/coaches";
import { today } from "@/lib/date";
import { download, euro, invoicesFrom, toCSV } from "@/lib/invoicing";
import { actions, myVenue, useStore } from "@/lib/store";
import { coachYear, dac7, dac7Text } from "@/lib/tax";
import { cn } from "@/lib/utils";

// Facture électronique (salle, coach, admin) et fiscalité du coach.

const card = "overflow-hidden rounded-3xl bg-card ring-1 ring-border/70 divide-y divide-border/70";

/** Onglet « Factures » de la salle : reçues via la plateforme agréée. */
export function SalleInvoices() {
  const state = useStore();
  const venue = myVenue();
  const [filter, setFilter] = useState<"todo" | "all">("todo");
  const all = invoicesFrom(state).filter((i) => i.venueId === venue.id);
  const list = filter === "todo" ? all.filter((i) => i.status === "recue" || i.status === "acceptee") : all;
  const vat = all.filter((i) => i.status !== "refusee").reduce((t, i) => t + i.vat, 0);
  const total = all.filter((i) => i.status !== "refusee").reduce((t, i) => t + i.ttc, 0);

  return (
    <>
      <PageTitle sub="Factures électroniques reçues via la plateforme agréée.">Factures</PageTitle>
      <div className="grid grid-cols-2 gap-3">
        <Figure label="Total facturé" value={euro(total)} />
        <Figure label="TVA déductible" value={euro(vat)} />
      </div>
      <div className="mt-6 mb-3 flex items-center justify-between gap-3">
        <div className="flex gap-1.5">
          <Chip small active={filter === "todo"} onClick={() => setFilter("todo")}>
            À traiter
          </Chip>
          <Chip small active={filter === "all"} onClick={() => setFilter("all")}>
            Toutes
          </Chip>
        </div>
        <Button variant="outline" size="sm" onClick={() => download(`zubio-factures-${venue.id}.csv`, toCSV(all), "text/csv")}>
          <Download /> Export comptable
        </Button>
      </div>
      {list.length ? (
        <ul className={card}>
          {list.map((i) => (
            <li key={i.id}>
              <InvoiceRow inv={i} href={`#/salle/facture/${i.id}`} who={i.kind === "prestation" ? i.seller.name.replace(" (EI)", "") : "Commission Zubio"} />
            </li>
          ))}
        </ul>
      ) : (
        <Empty>Rien à traiter. Les factures arrivent automatiquement après chaque séance réalisée.</Empty>
      )}
      <Note>{PLATFORM_NOTE}</Note>
    </>
  );
}

/** Fiche facture, côté salle (décision et paiement) ou coach (lecture). */
export function InvoicePage({ id, back, backLabel, canDecide }: { id: string; back: string; backLabel: string; canDecide: boolean }) {
  const state = useStore();
  const inv = invoicesFrom(state).find((i) => i.id === id);
  if (!inv) return <Empty>Facture introuvable.</Empty>;
  const decide = (status: "acceptee" | "refusee" | "encaissee", msg: string) => (actions.setInvoiceStatus(inv.id, status), toast.success(msg));

  return (
    <div className="mx-auto max-w-3xl">
      <div className="print:hidden">
        <BackLink href={back}>{backLabel}</BackLink>
        <div className="mt-3 rounded-3xl bg-card p-4 ring-1 ring-border/70 sm:p-5">
          <p className="mb-4 text-sm font-semibold">Suivi sur la plateforme agréée</p>
          <InvoiceTimeline status={inv.status} />
          {canDecide && (inv.status === "recue" || inv.status === "acceptee") && (
            <div className="mt-5 flex flex-wrap gap-2 border-t border-border/70 pt-4">
              {inv.status === "recue" && (
                <>
                  <Button onClick={() => decide("acceptee", "Facture acceptée")}>
                    <BadgeCheck /> Accepter
                  </Button>
                  <Button variant="outline" onClick={() => decide("refusee", "Facture refusée : l'émetteur est prévenu")}>
                    <X /> Refuser
                  </Button>
                </>
              )}
              {inv.status === "acceptee" && (
                <Button onClick={() => decide("encaissee", "Paiement enregistré")}>
                  <FileCheck2 /> Marquer comme payée
                </Button>
              )}
            </div>
          )}
        </div>
        <div className="mt-3 mb-4">
          <InvoiceExports inv={inv} />
        </div>
      </div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <InvoiceDocument inv={inv} />
      </motion.div>
    </div>
  );
}

/** Section « Revenus et impôts » du profil coach. */
export function CoachTax({ coachId }: { coachId: string }) {
  const state = useStore();
  const y = coachYear(state, coachId);
  const [rate, setRate] = useState(BILLING.socialRate * 100);
  const invoices = invoicesFrom(state).filter((i) => i.coachId === coachId && i.kind === "prestation");
  const recap = dac7(state, coachId);
  const pct = Math.min(y.ratio, 1.1) * 100;

  return (
    <Section title="Revenus et impôts">
      <div className="max-w-xl space-y-3">
        <div className="rounded-3xl bg-card p-4 ring-1 ring-border/70 sm:p-5">
          <p className="text-sm text-muted-foreground">Chiffre d'affaires {y.year} via Zubio</p>
          <p className="mt-1 font-heading text-[32px] leading-none font-extrabold tabular-nums">{euro(y.revenue)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {y.sessions} séances · {euro(y.upcoming)} à venir
          </p>

          <div className="mt-5">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-semibold">Franchise de TVA</span>
              <span className="text-muted-foreground tabular-nums">seuil {euro(BILLING.franchise.base)}</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(pct, 100)}%` }}
                transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                className={cn("h-full rounded-full", y.franchise === "ok" ? "bg-success" : y.franchise === "proche" ? "bg-warning" : "bg-primary")}
              />
            </div>
            <p className={cn("mt-2 text-sm", y.franchise === "ok" ? "text-muted-foreground" : "font-semibold text-warning-ink")}>
              {y.regime === "assujetti"
                ? "Vous facturez la TVA à 20 % : elle apparaît sur vos factures."
                : y.franchise === "ok"
                  ? "Vous êtes en franchise : « TVA non applicable, art. 293 B du CGI » figure sur vos factures."
                  : y.franchise === "proche"
                    ? `Attention : au-delà de ${euro(BILLING.franchise.base)} (${euro(BILLING.franchise.majore)} en seuil majoré), vous devrez facturer la TVA.`
                    : "Seuil dépassé : la TVA devient applicable. Contactez votre service des impôts."}
            </p>
          </div>
        </div>

        <div className="rounded-3xl bg-card p-4 ring-1 ring-border/70 sm:p-5">
          <div className="flex items-baseline justify-between">
            <p className="font-semibold">Cotisations sociales estimées</p>
            <p className="font-heading text-xl font-extrabold tabular-nums">{euro(Math.round((y.revenue * rate) / 100))}</p>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Slider value={[rate]} min={10} max={30} step={0.1} onValueChange={([v]) => setRate(v)} aria-label="Taux de cotisations" className="flex-1" />
            <span className="w-14 text-right text-sm font-semibold tabular-nums">{rate.toFixed(1)} %</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Taux indicatif, selon votre activité : vérifiez-le sur autoentrepreneur.urssaf.fr. Vous déclarez vous-même votre chiffre d'affaires à l'Urssaf.</p>
        </div>

        <div className="rounded-3xl bg-card p-4 ring-1 ring-border/70 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-muted text-ink-soft">
              <Landmark className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">Récapitulatif annuel {y.year}</p>
              <p className="text-sm text-muted-foreground">Envoyé en janvier et déclaré à l'administration fiscale (directive DAC7) : {euro(recap.revenue)} bruts.</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-1.5 text-center">
            {recap.quarters.map((q, i) => (
              <div key={i} className="rounded-2xl bg-muted/70 px-1 py-2">
                <p className="text-[11px] text-muted-foreground">T{i + 1}</p>
                <p className="text-sm font-semibold tabular-nums">{Math.round(q / 100) / 10} k€</p>
              </div>
            ))}
          </div>
          <Button variant="outline" className="mt-3 w-full" onClick={() => download(`zubio-recapitulatif-${y.year}.txt`, dac7Text(state, coachId), "text/plain")}>
            <Download /> Télécharger le récapitulatif
          </Button>
        </div>

        <div className={card}>
          <p className="flex items-center gap-2 px-4 py-3 text-sm font-semibold">
            <ReceiptText className="size-4" aria-hidden /> Factures émises en votre nom
          </p>
          {invoices.length ? (
            invoices.map((i) => <InvoiceRow key={i.id} inv={i} href={`#/coach/facture/${i.id}`} who={i.buyer.name} />)
          ) : (
            <p className="px-4 py-3 text-sm text-muted-foreground">Aucune pour l'instant.</p>
          )}
        </div>
        <Note>Zubio émet vos factures par mandat et vous informe de vos obligations fiscales et sociales à chaque mission. Montants de démonstration.</Note>
      </div>
    </Section>
  );
}

/** Bloc « Facturation » de l'admin. */
export function AdminBilling() {
  const state = useStore();
  const all = invoicesFrom(state);
  const commissions = all.filter((i) => i.kind === "commission" && i.status !== "refusee").reduce((t, i) => t + i.ht, 0);
  const refused = all.filter((i) => i.status === "refusee");
  const year = +today().slice(0, 4);
  return (
    <Section title="Facturation et déclarations">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Figure label="Factures émises" value={`${all.length}`} />
        <Figure label="Commissions HT" value={euro(commissions)} />
        <Figure label="Refusées" value={`${refused.length}`} tone={refused.length ? "warn" : undefined} />
        <Figure label="Coachs à déclarer" value={`${COACHES.length}`} />
      </div>
      <div className="mt-3 rounded-3xl bg-card p-4 text-sm ring-1 ring-border/70">
        <p className="font-semibold">Déclaration DAC7 {year}</p>
        <p className="mt-1 text-muted-foreground">
          À déposer avant le 31 janvier {year + 1} : revenus bruts par coach et par trimestre. Récapitulatifs envoyés aux coachs à la même date. Statut : <b className="text-foreground">en préparation</b> (démo).
        </p>
      </div>
    </Section>
  );
}

function Figure({ label, value, tone }: { label: string; value: string; tone?: "warn" }) {
  return (
    <div className="rounded-3xl bg-card p-4 ring-1 ring-border/70">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-heading text-xl font-extrabold tabular-nums", tone === "warn" && "text-warning-ink")}>{value}</p>
    </div>
  );
}

const Note = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
    <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden /> {children}
  </p>
);
