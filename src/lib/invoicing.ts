import { BILLING } from "@/config/billing";
import { classById } from "@/data/classes";
import { coachById } from "@/data/coaches";
import { coachLegal, demoSiren } from "@/data/legal";
import { addDays, parse, today } from "./date";
import { type State, venueById } from "./store";

// Factures électroniques générées après chaque séance réalisée :
// - la prestation du coach, émise par Zubio en son nom (mandat de facturation) ;
// - la commission de Zubio. Les deux transitent par une plateforme agréée (simulée).

export type InvoiceStatus = "deposee" | "recue" | "acceptee" | "refusee" | "encaissee";
export const STATUS_LABEL: Record<InvoiceStatus, string> = {
  deposee: "Déposée",
  recue: "Reçue",
  acceptee: "Acceptée",
  refusee: "Refusée",
  encaissee: "Encaissée",
};
export const LIFECYCLE: InvoiceStatus[] = ["deposee", "recue", "acceptee", "encaissee"];

export type Party = { name: string; siren: string; address: string; vat?: string };
export type Line = { label: string; qty: number; unit: number; vatRate: number };
export type Invoice = {
  id: string;
  number: string;
  kind: "prestation" | "commission";
  slotId: string;
  coachId: string;
  venueId: string;
  date: string;
  due: string;
  seller: Party;
  buyer: Party;
  lines: Line[];
  ht: number;
  vat: number;
  ttc: number;
  mentions: string[];
  status: InvoiceStatus;
};

const round = (n: number) => Math.round(n * 100) / 100;
export const euro = (n: number) => n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

function totals(lines: Line[]) {
  const ht = round(lines.reduce((t, l) => t + l.qty * l.unit, 0));
  const vat = round(lines.reduce((t, l) => t + l.qty * l.unit * l.vatRate, 0));
  return { ht, vat, ttc: round(ht + vat) };
}

/** Statut sur la plateforme agréée : décision de la salle, sinon cycle simulé selon l'ancienneté. */
function statusOf(s: State, id: string, date: string, issue?: string): InvoiceStatus {
  const override = s.invoices?.[id];
  if (override) return override;
  if (issue) return "refusee";
  const age = (parse(today()).getTime() - parse(date).getTime()) / 86_400_000;
  return age >= 10 ? "encaissee" : age >= 1 ? "acceptee" : "recue";
}

const LATE = "Paiement à 30 jours. Pénalités de retard : trois fois le taux d'intérêt légal ; indemnité forfaitaire pour frais de recouvrement : 40 €.";

export function invoicesFrom(s: State): Invoice[] {
  return s.slots
    .filter((slot) => slot.status === "done" && slot.coachId)
    .flatMap((slot): Invoice[] => {
      const coach = coachById(slot.coachId!);
      const venue = venueById(slot.venueId);
      const legal = coachLegal(coach.id);
      const label = `${classById(slot.classId).label} · ${slot.date.split("-").reverse().join("/")} ${slot.start}`;
      const year = slot.date.slice(0, 4);
      const buyer: Party = { name: venue.name, siren: demoSiren(venue.id), address: venue.address };
      const base = { slotId: slot.id, coachId: coach.id, venueId: venue.id, date: slot.date, due: addDays(slot.date, BILLING.paymentDays), buyer };

      const presta: Line[] = [{ label: `Animation du cours ${label}`, qty: 1, unit: slot.price, vatRate: legal.regime === "franchise" ? 0 : BILLING.vatRate }];
      const fee: Line[] = [{ label: `Frais de service Zubio (${BILLING.commissionRate * 100} %) · ${label}`, qty: 1, unit: round(slot.price * BILLING.commissionRate), vatRate: BILLING.vatRate }];
      const pid = `M-${slot.id}`;
      const cid = `C-${slot.id}`;
      return [
        {
          ...base,
          id: pid,
          number: `${coach.id.slice(0, 3).toUpperCase()}-${year}-${slot.id.toUpperCase()}`,
          kind: "prestation",
          seller: { name: `${coach.name} (EI)`, siren: demoSiren(coach.id), address: coach.town },
          lines: presta,
          ...totals(presta),
          mentions: [
            `Facture émise par ${BILLING.platform.name} au nom et pour le compte de ${coach.name} (mandat de facturation).`,
            legal.regime === "franchise" ? "TVA non applicable, art. 293 B du CGI." : "TVA sur les encaissements.",
            "Catégorie d'opération : prestation de services.",
            LATE,
          ],
          status: statusOf(s, pid, slot.date, slot.issue),
        },
        {
          ...base,
          id: cid,
          number: `ZB-${year}-${slot.id.toUpperCase()}`,
          kind: "commission",
          seller: { name: BILLING.platform.name, siren: BILLING.platform.siren, address: BILLING.platform.address, vat: BILLING.platform.vat },
          lines: fee,
          ...totals(fee),
          mentions: ["Catégorie d'opération : prestation de services.", LATE],
          status: statusOf(s, cid, slot.date, slot.issue),
        },
      ];
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");

/** Facture au format UN/CEFACT CII (profil EN 16931), comme dans un Factur-X. */
export function toCII(inv: Invoice) {
  const d = inv.date.replaceAll("-", "");
  const party = (p: Party, tag: string) =>
    `<ram:${tag}><ram:Name>${esc(p.name)}</ram:Name><ram:SpecifiedLegalOrganization><ram:ID schemeID="0002">${p.siren.replaceAll(" ", "")}</ram:ID></ram:SpecifiedLegalOrganization><ram:PostalTradeAddress><ram:LineOne>${esc(p.address)}</ram:LineOne><ram:CountryID>FR</ram:CountryID></ram:PostalTradeAddress>${p.vat ? `<ram:SpecifiedTaxRegistration><ram:ID schemeID="VA">${p.vat.replaceAll(" ", "")}</ram:ID></ram:SpecifiedTaxRegistration>` : ""}</ram:${tag}>`;
  const lines = inv.lines
    .map(
      (l, i) =>
        `<ram:IncludedSupplyChainTradeLineItem><ram:AssociatedDocumentLineDocument><ram:LineID>${i + 1}</ram:LineID></ram:AssociatedDocumentLineDocument><ram:SpecifiedTradeProduct><ram:Name>${esc(l.label)}</ram:Name></ram:SpecifiedTradeProduct><ram:SpecifiedLineTradeAgreement><ram:NetPriceProductTradePrice><ram:ChargeAmount>${l.unit.toFixed(2)}</ram:ChargeAmount></ram:NetPriceProductTradePrice></ram:SpecifiedLineTradeAgreement><ram:SpecifiedLineTradeDelivery><ram:BilledQuantity unitCode="C62">${l.qty}</ram:BilledQuantity></ram:SpecifiedLineTradeDelivery><ram:SpecifiedLineTradeSettlement><ram:ApplicableTradeTax><ram:TypeCode>VAT</ram:TypeCode><ram:CategoryCode>${l.vatRate ? "S" : "E"}</ram:CategoryCode><ram:RateApplicablePercent>${l.vatRate * 100}</ram:RateApplicablePercent></ram:ApplicableTradeTax><ram:SpecifiedTradeSettlementLineMonetarySummation><ram:LineTotalAmount>${(l.qty * l.unit).toFixed(2)}</ram:LineTotalAmount></ram:SpecifiedTradeSettlementLineMonetarySummation></ram:SpecifiedLineTradeSettlement></ram:IncludedSupplyChainTradeLineItem>`,
    )
    .join("");
  const exempt = inv.vat === 0;
  return `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100" xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100" xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">
<rsm:ExchangedDocumentContext><ram:GuidelineSpecifiedDocumentContextParameter><ram:ID>urn:cen.eu:en16931:2017</ram:ID></ram:GuidelineSpecifiedDocumentContextParameter></rsm:ExchangedDocumentContext>
<rsm:ExchangedDocument><ram:ID>${inv.number}</ram:ID><ram:TypeCode>${inv.kind === "prestation" ? "389" : "380"}</ram:TypeCode><ram:IssueDateTime><udt:DateTimeString format="102">${d}</udt:DateTimeString></ram:IssueDateTime>${inv.mentions.map((m) => `<ram:IncludedNote><ram:Content>${esc(m)}</ram:Content></ram:IncludedNote>`).join("")}</rsm:ExchangedDocument>
<rsm:SupplyChainTradeTransaction>${lines}<ram:ApplicableHeaderTradeAgreement>${party(inv.seller, "SellerTradeParty")}${party(inv.buyer, "BuyerTradeParty")}</ram:ApplicableHeaderTradeAgreement><ram:ApplicableHeaderTradeDelivery/><ram:ApplicableHeaderTradeSettlement><ram:InvoiceCurrencyCode>EUR</ram:InvoiceCurrencyCode><ram:ApplicableTradeTax><ram:CalculatedAmount>${inv.vat.toFixed(2)}</ram:CalculatedAmount><ram:TypeCode>VAT</ram:TypeCode>${exempt ? "<ram:ExemptionReason>TVA non applicable, art. 293 B du CGI</ram:ExemptionReason>" : ""}<ram:BasisAmount>${inv.ht.toFixed(2)}</ram:BasisAmount><ram:CategoryCode>${exempt ? "E" : "S"}</ram:CategoryCode><ram:RateApplicablePercent>${exempt ? 0 : BILLING.vatRate * 100}</ram:RateApplicablePercent></ram:ApplicableTradeTax><ram:SpecifiedTradePaymentTerms><ram:DueDateDateTime><udt:DateTimeString format="102">${inv.due.replaceAll("-", "")}</udt:DateTimeString></ram:DueDateDateTime></ram:SpecifiedTradePaymentTerms><ram:SpecifiedTradeSettlementHeaderMonetarySummation><ram:LineTotalAmount>${inv.ht.toFixed(2)}</ram:LineTotalAmount><ram:TaxBasisTotalAmount>${inv.ht.toFixed(2)}</ram:TaxBasisTotalAmount><ram:TaxTotalAmount currencyID="EUR">${inv.vat.toFixed(2)}</ram:TaxTotalAmount><ram:GrandTotalAmount>${inv.ttc.toFixed(2)}</ram:GrandTotalAmount><ram:DuePayableAmount>${inv.ttc.toFixed(2)}</ram:DuePayableAmount></ram:SpecifiedTradeSettlementHeaderMonetarySummation></ram:ApplicableHeaderTradeSettlement></rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>`;
}

/** Export comptable (CSV, séparateur « ; » pour Excel en français). */
export function toCSV(list: Invoice[]) {
  const rows = [["Date", "Numéro", "Type", "Émetteur", "SIREN émetteur", "HT", "TVA", "TTC", "Statut"]];
  for (const i of list) rows.push([i.date, i.number, i.kind === "prestation" ? "Prestation coach (mandat)" : "Commission Zubio", i.seller.name, i.seller.siren, i.ht.toFixed(2), i.vat.toFixed(2), i.ttc.toFixed(2), STATUS_LABEL[i.status]]);
  return rows.map((r) => r.map((c) => `"${c.replaceAll('"', '""')}"`).join(";")).join("\r\n");
}

/** Téléchargement d'un fichier généré dans le navigateur. */
export function download(name: string, content: string, type: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}
