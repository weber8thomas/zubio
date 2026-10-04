import { FileCode2, Printer } from "lucide-react";
import { motion } from "motion/react";
import { Logo } from "@/components/brand";
import { DocThumb } from "@/components/docs";
import { Button } from "@/components/ui/button";
import { BILLING } from "@/config/billing";
import { dayLabel } from "@/lib/date";
import { download, euro, type Invoice, type InvoiceStatus, LIFECYCLE, STATUS_LABEL, toCII } from "@/lib/invoicing";
import { cn } from "@/lib/utils";

const TONE: Record<InvoiceStatus, string> = {
  deposee: "bg-muted text-muted-foreground",
  recue: "bg-warning-soft text-warning-ink",
  acceptee: "bg-success-soft/60 text-foreground ring-1 ring-success/40 ring-inset",
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

/** Facture au format A4 (794 × 1123 px), mise en page d'un document comptable. */
export function InvoiceSheet({ inv }: { inv: Invoice }) {
  const fmt = (d: string) => d.split("-").reverse().join("/");
  const presta = inv.kind === "prestation";
  const exempt = inv.vat === 0;
  const rows: [string, string][] = [
    ["Numéro", inv.number],
    ["Date d'émission", fmt(inv.date)],
    ["Date de la prestation", fmt(inv.date)],
    ["Échéance", fmt(inv.due)],
  ];
  return (
    <div className="flex h-full flex-col px-[64px] pt-[56px] pb-[40px] font-sans text-[12.5px] leading-[1.5] text-[#1f1a17]">
      <div className="h-[4px] w-[56px] bg-[#d63b27]" />
      <div className="mt-[28px] flex items-start justify-between gap-[40px]">
        <div className="max-w-[330px]">
          {presta ? <p className="font-heading text-[17px] font-semibold">{inv.seller.name}</p> : <Logo className="h-[26px]" />}
          <p className="mt-[8px] text-[#5b524c]">{inv.seller.address}</p>
          <p className="text-[#5b524c] tabular-nums">SIREN {inv.seller.siren}</p>
          {inv.seller.vat && <p className="text-[#5b524c]">N° TVA {inv.seller.vat}</p>}
        </div>
        <div className="text-right">
          <p className="font-heading text-[26px] leading-none font-extrabold tracking-[0.06em] uppercase">Facture</p>
          <table className="mt-[14px] ml-auto text-[12px]">
            <tbody>
              {rows.map(([k, v]) => (
                <tr key={k}>
                  <td className="pr-[14px] text-left text-[#8a7f77]">{k}</td>
                  <td className="text-right font-semibold tabular-nums">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-[36px] flex justify-end">
        <div className="w-[320px] rounded-[6px] bg-[#f6f2ec] px-[18px] py-[14px]">
          <p className="text-[10.5px] font-semibold tracking-[0.12em] text-[#8a7f77] uppercase">Facturé à</p>
          <p className="mt-[4px] text-[14px] font-semibold">{inv.buyer.name}</p>
          <p className="text-[#5b524c]">{inv.buyer.address}</p>
          <p className="text-[#5b524c] tabular-nums">SIREN {inv.buyer.siren}</p>
        </div>
      </div>

      <p className="mt-[28px] text-[#5b524c]">
        <span className="font-semibold text-[#1f1a17]">Objet :</span> {presta ? "animation d'un cours collectif en remplacement" : "frais de service de la plateforme Zubio"} · réf. mission {inv.slotId.toUpperCase()}
      </p>

      <table className="mt-[14px] w-full border-collapse text-[12.5px]">
        <thead>
          <tr className="border-b-[1.5px] border-[#1f1a17] text-[10.5px] tracking-[0.08em] text-[#5b524c] uppercase">
            <th className="py-[8px] text-left font-semibold">Désignation</th>
            <th className="w-[50px] py-[8px] text-right font-semibold">Qté</th>
            <th className="w-[96px] py-[8px] text-right font-semibold">PU HT</th>
            <th className="w-[64px] py-[8px] text-right font-semibold">TVA</th>
            <th className="w-[104px] py-[8px] text-right font-semibold">Montant HT</th>
          </tr>
        </thead>
        <tbody>
          {inv.lines.map((l) => (
            <tr key={l.label} className="border-b border-[#e4ddd3] align-top">
              <td className="py-[12px] pr-[16px]">{l.label}</td>
              <td className="py-[12px] text-right tabular-nums">{l.qty}</td>
              <td className="py-[12px] text-right tabular-nums">{euro(l.unit)}</td>
              <td className="py-[12px] text-right tabular-nums">{l.vatRate ? `${l.vatRate * 100} %` : "—"}</td>
              <td className="py-[12px] text-right font-semibold tabular-nums">{euro(l.qty * l.unit)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-[18px] flex justify-end">
        <dl className="w-[280px] tabular-nums">
          <div className="flex justify-between py-[3px]">
            <dt className="text-[#5b524c]">Total HT</dt>
            <dd>{euro(inv.ht)}</dd>
          </div>
          <div className="flex justify-between py-[3px]">
            <dt className="text-[#5b524c]">{exempt ? "TVA (non applicable)" : `TVA ${BILLING.vatRate * 100} %`}</dt>
            <dd>{euro(inv.vat)}</dd>
          </div>
          <div className="mt-[6px] flex justify-between border-t-[1.5px] border-[#1f1a17] pt-[8px] text-[15px] font-bold">
            <dt>Net à payer</dt>
            <dd>{euro(inv.ttc)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-[32px] grid grid-cols-2 gap-[32px] border-t border-[#e4ddd3] pt-[18px] text-[11.5px]">
        <div>
          <p className="font-semibold">Règlement</p>
          <p className="mt-[4px] text-[#5b524c]">
            Virement à {BILLING.paymentDays} jours, au plus tard le {fmt(inv.due)}.
            <br />
            IBAN FR76 0000 0000 0000 0000 0000 000 (démo)
            <br />
            Référence à rappeler : {inv.number}
          </p>
        </div>
        <div>
          <p className="font-semibold">Mentions</p>
          <ul className="mt-[4px] space-y-[2px] text-[#5b524c]">
            {inv.mentions.slice(0, -1).map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-auto border-t border-[#e4ddd3] pt-[12px] text-[10px] leading-[1.5] text-[#8a7f77]">
        <p>{inv.mentions.at(-1)}</p>
        <div className="mt-[6px] flex justify-between">
          <span>
            {inv.seller.name} · SIREN {inv.seller.siren} · {inv.seller.address}
          </span>
          <span>Factur-X · EN 16931 · page 1/1</span>
        </div>
        <p className="mt-[4px] font-semibold text-[#d63b27]">Spécimen de démonstration : identités et numéros fictifs, aucun paiement réel.</p>
      </div>
    </div>
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

/** Rangée de miniatures cliquables des dernières factures. */
export function InvoiceThumbs({ list }: { list: Invoice[] }) {
  if (!list.length) return null;
  return (
    <div className="scroll-row -mx-4 flex gap-4 overflow-x-auto px-4 pt-1 pb-3">
      {list.slice(0, 6).map((i) => (
        <DocThumb key={i.id} title={`N° ${i.number}`} subtitle={`${euro(i.ttc)} · ${STATUS_LABEL[i.status]}`} width={120}>
          <InvoiceSheet inv={i} />
        </DocThumb>
      ))}
    </div>
  );
}
