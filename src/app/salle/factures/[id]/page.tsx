import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { brand } from "@/config/brand";
import { skillLabel } from "@/core/vertical";
import { requireVenue } from "@/lib/data/salle";
import { formatDay, formatMoney, formatSlotWhen } from "@/lib/format";
import { uuidSchema } from "@/lib/validation";
import { sport } from "@/verticals/sport";
import { PrintButton } from "./print-button";

export const metadata: Metadata = { title: "Facture d'exemple" };

export default async function InvoicePage({ params }: PageProps<"/salle/factures/[id]">) {
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();
  const { supabase, venue } = await requireVenue();
  const { data: slot } = await supabase
    .from("slots")
    .select("id, skill, starts_at, ends_at, rate_cents, filled_at, providers(display_name, commune)")
    .eq("id", id)
    .eq("venue_id", venue.id)
    .in("status", ["filled", "done"])
    .maybeSingle();
  if (!slot) notFound();

  const commission = Math.round(slot.rate_cents * brand.commissionRate);
  const total = slot.rate_cents + commission;
  const number = `ZB-${slot.starts_at.slice(0, 4)}-${slot.id.slice(-6).toUpperCase()}`;
  const rows = [
    [`Séance de ${skillLabel(sport, slot.skill).toLowerCase()} — ${slot.providers?.display_name}`, slot.rate_cents],
    [`Frais de service ${brand.name} (${Math.round(brand.commissionRate * 100)} %)`, commission],
  ] as const;

  return (
    <div className="max-w-3xl">
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link href="/salle/factures" className="inline-flex min-h-11 items-center gap-2 font-bold text-muted hover:text-ink">
          <ArrowLeft size={20} strokeWidth={1.75} aria-hidden />
          Factures
        </Link>
        <PrintButton />
      </div>

      <article className="rounded-[12px] border border-line bg-white p-5 sm:p-10 print:border-0 print:p-0">
        <p className="mb-6 rounded-[10px] border border-dashed border-muted px-3 py-2 text-sm font-bold text-muted">
          Facture d&apos;exemple — aucun paiement n&apos;a été effectué.
        </p>
        <header className="flex flex-wrap items-start justify-between gap-6">
          <Logo height={32} />
          <div className="text-right">
            <h1 className="text-2xl">Facture</h1>
            <p className="text-muted">N° {number}</p>
            <p className="text-muted">Émise le {formatDay(slot.filled_at ?? slot.starts_at, false, true)}</p>
          </div>
        </header>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-muted">Facturé à</p>
            <p className="font-bold">{venue.name}</p>
            <p>{venue.address}</p>
            <p>{venue.commune}</p>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-muted">Mission</p>
            <p className="font-bold">{skillLabel(sport, slot.skill)}</p>
            <p>{formatSlotWhen(slot.starts_at, slot.ends_at)}</p>
            <p>
              Coach : {slot.providers?.display_name} ({slot.providers?.commune})
            </p>
          </div>
        </div>

        <table className="mt-8 w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-ink text-sm text-muted">
              <th scope="col" className="py-2 font-bold">
                Désignation
              </th>
              <th scope="col" className="py-2 text-right font-bold">
                Montant
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, cents]) => (
              <tr key={label} className="border-b border-line">
                <td className="py-3 pr-4">{label}</td>
                <td className="py-3 text-right whitespace-nowrap">{formatMoney(cents, true)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" className="pt-4 font-display text-lg">
                Total
              </th>
              <td className="pt-4 text-right font-display text-lg font-extrabold whitespace-nowrap">
                {formatMoney(total, true)}
              </td>
            </tr>
          </tfoot>
        </table>

        <p className="mt-8 text-sm text-muted">
          Le coach perçoit {formatMoney(slot.rate_cents, true)}. {brand.name} conserve{" "}
          {formatMoney(commission, true)} de frais de service. TVA non applicable dans cette démonstration.
        </p>
      </article>
    </div>
  );
}
