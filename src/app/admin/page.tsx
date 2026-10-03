import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { SlotStatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader, SectionTitle } from "@/components/ui/page-header";
import { Stat } from "@/components/ui/stat";
import { credentialLabel, skillLabel } from "@/core/vertical";
import { fillRate, requireAdmin } from "@/lib/data/admin";
import { formatDuration, formatSlotWhen } from "@/lib/format";

export const metadata: Metadata = { title: "Vue d'ensemble" };

const RECENT_COUNT = 8;

export default async function AdminOverview() {
  const { supabase, vertical } = await requireAdmin();
  const { labels } = vertical;

  const [{ data: slots }, { count: venueCount }, { count: providerCount }, { count: pendingCount }] = await Promise.all(
    [
      supabase
        .from("slots")
        .select("id, skill, starts_at, ends_at, status, published_at, filled_at, venues!inner(name)")
        .eq("venues.vertical", vertical.id)
        .order("published_at", { ascending: false }),
      supabase.from("venues").select("id", { count: "exact", head: true }).eq("vertical", vertical.id),
      supabase.from("providers").select("id", { count: "exact", head: true }).eq("vertical", vertical.id),
      supabase
        .from("credentials")
        .select("id, providers!inner(vertical)", { count: "exact", head: true })
        .eq("status", "pending")
        .eq("providers.vertical", vertical.id),
    ],
  );

  const all = slots ?? [];
  const rate = fillRate(all.map((s) => s.status));
  const delays = all.flatMap((s) =>
    s.filled_at ? [(new Date(s.filled_at).getTime() - new Date(s.published_at).getTime()) / 60_000] : [],
  );
  const averageDelay = delays.length ? delays.reduce((sum, d) => sum + d, 0) / delays.length : null;
  const recent = all.slice(0, RECENT_COUNT);

  return (
    <>
      <PageHeader title="Vue d'ensemble" subtitle={`Verticale ${vertical.name}`} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label={labels.slots} value={all.length} hint="Tous statuts confondus" />
        <Stat label="Taux de remplissage" value={rate === null ? "–" : `${rate} %`} hint="Hors annulations" />
        <Stat
          label="Délai moyen"
          value={averageDelay === null ? "–" : formatDuration(averageDelay)}
          hint="De la publication à la confirmation"
        />
        <Stat label={labels.venues} value={venueCount ?? 0} />
        <Stat label={labels.providers} value={providerCount ?? 0} />
        <Stat
          label={`${labels.credentials} en attente`}
          value={pendingCount ?? 0}
          hint={
            pendingCount ? (
              <Link
                href="/admin/prestataires?filtre=attente"
                className="inline-flex min-h-11 items-center gap-1 font-bold text-accent-hover hover:underline"
              >
                À valider
                <ArrowRight size={20} strokeWidth={1.75} aria-hidden />
              </Link>
            ) : (
              "Rien à valider"
            )
          }
        />
      </div>

      <SectionTitle>Dernières publications</SectionTitle>
      {recent.length ? (
        <ul className="divide-y divide-line rounded-[12px] border border-line bg-white">
          {recent.map((s) => (
            <li key={s.id} className="flex items-start gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-bold">{skillLabel(vertical, s.skill)}</p>
                <p className="text-[15px]">{s.venues.name}</p>
                <p className="text-[15px] text-muted">{formatSlotWhen(s.starts_at, s.ends_at, true)}</p>
              </div>
              <SlotStatusBadge status={s.status} labels={vertical.slotStatusLabels} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="Rien n'a encore été publié" />
      )}

      <Card className="mt-8 bg-surface">
        <h2 className="text-xl">Même cœur, autre métier</h2>
        <p className="mt-1 text-[15px] text-muted">
          Le sélecteur de verticale, en haut de page, change le vocabulaire, les {labels.skills.toLowerCase()}, les{" "}
          {labels.credentials.toLowerCase()} exigés et la couleur d&apos;accent. Le matching, la base et les écrans
          restent les mêmes.
        </p>
        <h3 className="mt-4 text-base">
          {labels.credentials} exigés par {labels.skill.toLowerCase()}
        </h3>
        <dl className="mt-2 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {vertical.skills.map((skill) => (
            <div key={skill.id}>
              <dt className="font-bold">{skill.label}</dt>
              <dd className="text-[15px] text-muted">
                {skill.requires
                  .map((group) => group.map((id) => credentialLabel(vertical, id)).join(" ou "))
                  .join(" et ")}
              </dd>
            </div>
          ))}
        </dl>
      </Card>
    </>
  );
}
