import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { DemoTag } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { skillLabel } from "@/core/vertical";
import { requireVenue } from "@/lib/data/salle";
import { formatMoney, formatSlotWhen } from "@/lib/format";
import { sport } from "@/verticals/sport";

export const metadata: Metadata = { title: "Factures" };

export default async function InvoicesPage() {
  const { supabase, venue } = await requireVenue();
  const { data } = await supabase
    .from("slots")
    .select("id, skill, starts_at, ends_at, rate_cents, status, providers(display_name)")
    .eq("venue_id", venue.id)
    .in("status", ["filled", "done"])
    .order("starts_at", { ascending: false });

  return (
    <>
      <PageHeader
        title="Factures"
        subtitle={
          <span className="inline-flex flex-wrap items-center gap-2">
            Une facture par mission confirmée. <DemoTag />
          </span>
        }
      />
      {data?.length ? (
        <ul className="flex flex-col gap-2">
          {data.map((s) => (
            <li key={s.id}>
              <Link
                href={`/salle/factures/${s.id}`}
                className="flex items-center gap-3 rounded-[12px] border border-line bg-white p-4 hover:border-ink"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-bold">
                    {skillLabel(sport, s.skill)} · {s.providers?.display_name}
                  </p>
                  <p className="text-sm text-muted">{formatSlotWhen(s.starts_at, s.ends_at, true)}</p>
                </div>
                <span className="font-bold">{formatMoney(s.rate_cents)}</span>
                <ChevronRight size={20} strokeWidth={1.75} className="text-muted" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="Aucune facture pour l'instant" />
      )}
    </>
  );
}
