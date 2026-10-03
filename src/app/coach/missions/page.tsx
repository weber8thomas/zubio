import { CheckCircle2, MapPin } from "lucide-react";
import type { Metadata } from "next";
import { DemoTag } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader, SectionTitle } from "@/components/ui/page-header";
import { Stat } from "@/components/ui/stat";
import { skillLabel } from "@/core/vertical";
import { brand } from "@/config/brand";
import { requireProvider } from "@/lib/data/coach";
import { formatMoney, formatSlotWhen, todayIso } from "@/lib/format";
import { sport } from "@/verticals/sport";

export const metadata: Metadata = { title: "Missions" };

const monthName = new Intl.DateTimeFormat(brand.locale, { month: "long", timeZone: brand.timeZone });

export default async function CoachMissions({ searchParams }: PageProps<"/coach/missions">) {
  const { supabase, provider } = await requireProvider();
  const { confirme } = await searchParams;
  const { data } = await supabase
    .from("slots")
    .select("id, skill, starts_at, ends_at, rate_cents, status, notes, venues(name, commune, address, phone)")
    .eq("assigned_provider_id", provider.id)
    .in("status", ["filled", "done"])
    .order("starts_at");

  const now = new Date().toISOString();
  const missions = data ?? [];
  const upcoming = missions.filter((m) => m.ends_at >= now);
  const month = todayIso().slice(0, 7);
  const thisMonth = missions.filter((m) => m.starts_at.slice(0, 7) === month);
  const earned = thisMonth.filter((m) => m.ends_at < now).reduce((sum, m) => sum + m.rate_cents, 0);
  const planned = thisMonth.filter((m) => m.ends_at >= now).reduce((sum, m) => sum + m.rate_cents, 0);

  return (
    <>
      <PageHeader title="Missions" subtitle={`${upcoming.length} mission${upcoming.length > 1 ? "s" : ""} à venir`} />

      {confirme && (
        <Card className="mb-6 flex items-start gap-3 border-success">
          <CheckCircle2 size={24} strokeWidth={1.75} className="mt-0.5 shrink-0 text-success" aria-hidden />
          <p>
            <strong>Mission confirmée.</strong> La salle a été prévenue à l&apos;instant.
          </p>
        </Card>
      )}

      <div className="flex items-center gap-2">
        <h2 className="text-xl">Revenus de {monthName.format(new Date())}</h2>
        <DemoTag />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Stat label="Déjà réalisés" value={formatMoney(earned)} />
        <Stat label="À venir ce mois-ci" value={formatMoney(planned)} />
      </div>

      <SectionTitle>À venir</SectionTitle>
      {upcoming.length ? (
        <ul className="grid gap-3 lg:grid-cols-2">
          {upcoming.map((m) => (
            <li key={m.id} className="rounded-[12px] border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-display text-lg font-extrabold">{skillLabel(sport, m.skill)}</p>
                <p className="font-bold">{formatMoney(m.rate_cents)}</p>
              </div>
              <p className="font-bold">{formatSlotWhen(m.starts_at, m.ends_at)}</p>
              <p className="mt-2 flex items-start gap-1.5 text-[15px] text-muted">
                <MapPin size={18} strokeWidth={1.75} className="mt-0.5 shrink-0" aria-hidden />
                <span>
                  {m.venues?.name} · {m.venues?.address}, {m.venues?.commune}
                </span>
              </p>
              {m.venues?.phone && (
                <a
                  href={`tel:${m.venues.phone.replaceAll(" ", "")}`}
                  className="mt-1 inline-flex min-h-11 items-center font-bold underline underline-offset-4"
                >
                  {m.venues.phone}
                </a>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="Aucune mission à venir" />
      )}
    </>
  );
}
