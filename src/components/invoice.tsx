import { FileCode2, Printer } from "lucide-react";
import { motion } from "motion/react";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { BILLING } from "@/config/billing";
import { dayLabel } from "@/lib/date";
import { download, euro, type Invoice, type InvoiceStatus, LIFECYCLE, STATUS_LABEL, toCII } from "@/lib/invoicing";
import { cn } from "@/lib/utils";

const TONE: Record<InvoiceStatus, string> = {
  deposee: "bg-muted text-muted-foreground",
  recue: "bg-warning-soft text-warning-ink",
  acceptee: "bg-primary-soft text-primary-ink",
  refusee: "bg-primary-soft text-primary-ink",
  encaissee: "bg-success-soft text-success-ink",
};

export function InvoiceStatusPill({ status }: { status: InvoiceStatus }) {
  return <span className={cn("inline-flex h-7 shrink-0 items-center rounded-full px-2.5 text-[13px] font-semibold whitespace-nowrap", TONE[status])}>{STATUS_LABEL[status]}</span>;
}

/** Ligne de liste : numéro, émetteur, montant, statut. */
export function InvoiceRow({ inv, href, who }: { inv: Invoice; href: string; who: string }) {
  return (
    <a href={href} className="flex items-center gap-3 px-4 py-3 transition hover:bg-muted/50">
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-[12px] text-xs font-extrabold", inv.kind === "prestation" ? "bg-muted text-ink-soft" : "bg-primary-soft text-primary-ink")}>
        {inv.kind === "prestation" ? "M" : "ZB"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold">{who}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {inv.number} · {dayLabel(inv.date)}
        </span>
      </span>
      <span className="text-right">
        <span className="block font-heading font-extrabold tabular-nums">{euro(inv.ttc)}</span>
        <InvoiceStatusPill status={inv.status} />
      </span>
    </a>
  );
}

/** Parcours sur la plateforme agréée : ○ déposée → ● encaissée. */
export function InvoiceTimeline({ status }: { status: InvoiceStatus }) {
  const refused = status === "refusee";
  const reached = refused ? 1 : LIFECYCLE.indexOf(status);
  return (
    <ol className="grid grid-cols-4">
      {LIFECYCLE.map((step, i) => {
        const done = i <= reached;
        const label = refused && i === 2 ? "Refusée" : STATUS_LABEL[step];
        return (
          <li key={step} className="relative flex flex-col items-center gap-1.5 text-center text-xs font-medium text-muted-foreground">
            {i > 0 && <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: i * 0.12 }} className={cn("absolute top-1.5 right-1/2 h-1 w-full origin-left", i <= reached ? "bg-success" : "bg-border")} />}
            <motion.span
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.12 }}
              className={cn("relative size-4 rounded-full", refused && i === 2 ? "bg-primary" : done ? "bg-success" : "border-[3px] border-border-strong bg-card")}
            />
            <span className={cn(done && "text-foreground")}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

/** Facture imprimable avec ses mentions obligatoires. */
export function InvoiceDocument({ inv }: { inv: Invoice }) {
  const fmt = (d: string) => d.split("-").reverse().join("/");
  const party = (title: string, p: Invoice["seller"]) => (
    <div>
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{title}</p>
      <p className="mt-1 font-semibold">{p.name}</p>
      <p className="text-sm">{p.address}</p>
      <p className="text-sm text-muted-foreground tabular-nums">SIREN {p.siren} (démo)</p>
      {p.vat && <p className="text-sm text-muted-foreground">TVA {p.vat}</p>}
    </div>
  );
  return (
    <article className="rounded-3xl bg-card p-5 shadow-soft ring-1 ring-border/70 sm:p-8 print:shadow-none print:ring-0">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Logo className="h-7" />
        <div className="text-right">
          <p className="font-heading text-xl font-extrabold">{inv.kind === "prestation" ? "Facture" : "Facture de commission"}</p>
          <p className="text-sm text-muted-foreground tabular-nums">N° {inv.number}</p>
          <p className="text-sm text-muted-foreground">
            Émise le {fmt(inv.date)} · échéance {fmt(inv.due)}
          </p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {party("Émetteur", inv.seller)}
        {party("Client", inv.buyer)}
      </div>
      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-border-strong text-left text-xs text-muted-foreground">
            <th className="py-2 font-semibold">Désignation</th>
            <th className="py-2 text-right font-semibold">HT</th>
            <th className="py-2 text-right font-semibold">TVA</th>
          </tr>
        </thead>
        <tbody>
          {inv.lines.map((l) => (
            <tr key={l.label} className="border-b border-border/70 align-top">
              <td className="py-3 pr-3">{l.label}</td>
              <td className="py-3 text-right whitespace-nowrap tabular-nums">{euro(l.qty * l.unit)}</td>
              <td className="py-3 pl-3 text-right whitespace-nowrap tabular-nums">{l.vatRate ? `${l.vatRate * 100} %` : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl className="mt-4 ml-auto w-full max-w-60 space-y-1 text-sm tabular-nums">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Total HT</dt>
          <dd>{euro(inv.ht)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">TVA</dt>
          <dd>{euro(inv.vat)}</dd>
        </div>
        <div className="flex justify-between border-t border-border-strong pt-1 font-heading text-lg font-extrabold">
          <dt>Total TTC</dt>
          <dd>{euro(inv.ttc)}</dd>
        </div>
      </dl>
      <ul className="mt-6 space-y-1 text-xs text-muted-foreground">
        {inv.mentions.map((m) => (
          <li key={m}>{m}</li>
        ))}
        <li>Facture de démonstration : identités et numéros fictifs, aucun paiement réel.</li>
      </ul>
    </article>
  );
}

/** Actions communes : télécharger le XML structuré, imprimer. */
export function InvoiceExports({ inv }: { inv: Invoice }) {
  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <Button variant="outline" onClick={() => download(`${inv.number}.xml`, toCII(inv), "application/xml")}>
        <FileCode2 /> XML (Factur-X / CII)
      </Button>
      <Button variant="outline" onClick={() => window.print()}>
        <Printer /> Imprimer · PDF
      </Button>
    </div>
  );
}

export const PLATFORM_NOTE = `Transmise via une plateforme agréée (simulée) : réforme de la facture électronique, réception obligatoire depuis le 1er septembre 2026. ${BILLING.platform.name} émet la facture du coach par mandat.`;
