import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { LiveRefresh } from "@/components/live-refresh";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader, SectionTitle } from "@/components/ui/page-header";
import { Stat } from "@/components/ui/stat";
import { requireVenue } from "@/lib/data/salle";
import { SlotCard, type SlotSummary } from "./slot-card";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function SalleDashboard() {
  const { supabase, venue } = await requireVenue();
  const { data } = await supabase
    .from("slots")
    .select("id, skill, starts_at, ends_at, rate_cents, status, providers(display_name), offers(status)")
    .eq("venue_id", venue.id)
    .order("starts_at");

  const now = new Date().toISOString();
  const slots: SlotSummary[] = (data ?? []).map((s) => ({
    ...s,
    coachName: s.providers?.display_name,
    pendingOffers: s.offers.filter((o) => o.status === "pending").length,
  }));
  const upcoming = slots.filter((s) => s.ends_at >= now && s.status !== "cancelled");
  const waiting = upcoming.filter((s) => s.status === "open");
  const filled = upcoming.filter((s) => s.status === "filled");
  const past = slots.filter((s) => s.ends_at < now || s.status === "cancelled").reverse().slice(0, 5);

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        subtitle={`${venue.name} · ${venue.commune}`}
        action={
          <div className="hidden sm:block">
            <ButtonLink href="/salle/publier">
              <Plus size={20} strokeWidth={1.75} aria-hidden />
              Publier un créneau
            </ButtonLink>
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-3">
        <Stat label="À venir" value={upcoming.length} />
        <Stat label="Pourvus" value={filled.length} />
        <Stat label="En attente" value={waiting.length} />
      </div>

      <div className="mt-4 sm:hidden">
        <ButtonLink href="/salle/publier" size="lg" className="w-full">
          <Plus size={20} strokeWidth={1.75} aria-hidden />
          Publier un créneau
        </ButtonLink>
      </div>

      <SectionTitle action={<LiveRefresh channel={`salle-${venue.id}`} watch={[{ table: "slots", filter: `venue_id=eq.${venue.id}` }, { table: "offers" }]} />}>
        En attente de coach
      </SectionTitle>
      {waiting.length ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {waiting.map((s) => (
            <SlotCard key={s.id} slot={s} />
          ))}
        </div>
      ) : (
        <EmptyState title="Aucun créneau en attente">Tous vos créneaux à venir ont un coach.</EmptyState>
      )}

      <SectionTitle>Pourvus</SectionTitle>
      {filled.length ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {filled.map((s) => (
            <SlotCard key={s.id} slot={s} />
          ))}
        </div>
      ) : (
        <EmptyState title="Aucun créneau pourvu pour l'instant" />
      )}

      {past.length > 0 && (
        <>
          <SectionTitle>Historique récent</SectionTitle>
          <div className="grid gap-3 lg:grid-cols-2">
            {past.map((s) => (
              <SlotCard key={s.id} slot={s} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
