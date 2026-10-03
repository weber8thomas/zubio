import { MapPin } from "lucide-react";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { activeVertical, fillRate, requireAdmin } from "@/lib/data/admin";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await activeVertical()).labels.venues };
}

export default async function AdminVenues() {
  const { supabase, vertical } = await requireAdmin();
  const { labels } = vertical;
  const { data } = await supabase
    .from("venues")
    .select("id, name, commune, address, owner_id, slots(status)")
    .eq("vertical", vertical.id)
    .order("name");
  const venues = data ?? [];

  return (
    <>
      <PageHeader
        title={labels.venues}
        subtitle={`${venues.length} ${labels.venue.toLowerCase()}${venues.length > 1 ? "s" : ""}`}
      />

      {venues.length === 0 ? (
        <EmptyState title={`Aucune donnée pour la verticale ${vertical.name}`} />
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {venues.map((v) => {
            const rate = fillRate(v.slots.map((s) => s.status));
            return (
              <li key={v.id} className="flex flex-col gap-3 rounded-[12px] border border-line bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                  <p className="min-w-0 font-display text-lg font-extrabold">{v.name}</p>
                  {v.owner_id ? <Badge tone="success">Compte actif</Badge> : <Badge>Sans compte</Badge>}
                </div>
                <p className="flex items-start gap-1.5 text-[15px] text-muted">
                  <MapPin size={20} strokeWidth={1.75} className="mt-0.5 shrink-0" aria-hidden />
                  <span>
                    {v.address}, {v.commune}
                  </span>
                </p>
                <dl className="grid grid-cols-2 gap-3 border-t border-line pt-3">
                  <div>
                    <dt className="text-sm text-muted">{labels.slots}</dt>
                    <dd className="font-bold">{v.slots.length}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted">Taux de remplissage</dt>
                    <dd className="font-bold">{rate === null ? "–" : `${rate} %`}</dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
