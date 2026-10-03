import { Check, MapPin, X } from "lucide-react";
import type { Metadata } from "next";
import { LiveRefresh } from "@/components/live-refresh";
import { OfferStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader, SectionTitle } from "@/components/ui/page-header";
import { durationHours } from "@/core/time";
import { skillLabel } from "@/core/vertical";
import { requireProvider } from "@/lib/data/coach";
import { formatMoney, formatSlotWhen } from "@/lib/format";
import { sport } from "@/verticals/sport";
import { acceptOffer, declineOffer } from "./actions";

export const metadata: Metadata = { title: "Offres reçues" };

export default async function CoachOffers({ searchParams }: PageProps<"/coach">) {
  const { supabase, provider } = await requireProvider();
  const { pris } = await searchParams;
  const { data } = await supabase
    .from("offers")
    .select(
      "id, status, reason, created_at, responded_at, slots(skill, starts_at, ends_at, rate_cents, notes, venues(name, commune, address))",
    )
    .eq("provider_id", provider.id)
    .order("created_at", { ascending: false });

  const now = new Date().toISOString();
  const offers = (data ?? []).filter((o) => o.slots?.venues);
  const pending = offers
    .filter((o) => o.status === "pending" && o.slots!.starts_at > now)
    .sort((a, b) => a.slots!.starts_at.localeCompare(b.slots!.starts_at));
  const history = offers.filter((o) => o.status !== "pending").slice(0, 5);

  return (
    <>
      <PageHeader
        title="Offres reçues"
        subtitle={
          pending.length
            ? `${pending.length} offre${pending.length > 1 ? "s" : ""} en attente de votre réponse`
            : "Vous êtes à jour."
        }
        action={<LiveRefresh channel={`coach-${provider.id}`} watch={[{ table: "offers", filter: `provider_id=eq.${provider.id}` }]} />}
      />

      {pris && (
        <p role="status" className="mb-6 rounded-[12px] border border-line bg-surface p-4">
          <strong>Trop tard pour celui-ci :</strong> un autre coach a accepté le créneau juste avant vous.
        </p>
      )}

      {pending.length ? (
        <ul className="grid gap-3 lg:grid-cols-2">
          {pending.map((o) => {
            const slot = o.slots!;
            const hours = durationHours({ startsAt: slot.starts_at, endsAt: slot.ends_at });
            return (
              <li key={o.id} className="flex flex-col rounded-[12px] border border-line bg-white p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-xl font-extrabold">{skillLabel(sport, slot.skill)}</p>
                    <p className="font-bold">{formatSlotWhen(slot.starts_at, slot.ends_at, true)}</p>
                  </div>
                  <p className="text-right">
                    <span className="block font-display text-xl font-extrabold">{formatMoney(slot.rate_cents)}</span>
                    <span className="text-sm text-muted">{formatMoney(Math.round(slot.rate_cents / hours / 100) * 100)}/h</span>
                  </p>
                </div>
                <p className="mt-2 flex items-start gap-1.5 text-[15px]">
                  <MapPin size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-muted" aria-hidden />
                  <span>
                    {slot.venues!.name}, {slot.venues!.commune}
                  </span>
                </p>
                <p className="mt-1 text-[15px] text-muted">{o.reason}</p>
                {slot.notes && <p className="mt-1 text-[15px] text-muted">« {slot.notes} »</p>}
                <div className="mt-4 grid grid-cols-[1fr_2fr] gap-2">
                  <form action={declineOffer}>
                    <input type="hidden" name="offerId" value={o.id} />
                    <Button type="submit" variant="secondary" size="lg" className="w-full">
                      <X size={20} strokeWidth={1.75} aria-hidden />
                      Refuser
                    </Button>
                  </form>
                  <form action={acceptOffer}>
                    <input type="hidden" name="offerId" value={o.id} />
                    <Button type="submit" size="lg" className="w-full">
                      <Check size={20} strokeWidth={1.75} aria-hidden />
                      Accepter
                    </Button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState title="Aucune offre en attente">
          Gardez vos disponibilités à jour : les salles vous sollicitent automatiquement.
        </EmptyState>
      )}

      {history.length > 0 && (
        <>
          <SectionTitle>Réponses récentes</SectionTitle>
          <ul className="flex flex-col gap-2">
            {history.map((o) => (
              <li key={o.id} className="flex items-center gap-3 rounded-[12px] border border-line bg-white p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-bold">
                    {skillLabel(sport, o.slots!.skill)} · {o.slots!.venues!.name}
                  </p>
                  <p className="text-sm text-muted">{formatSlotWhen(o.slots!.starts_at, o.slots!.ends_at, true)}</p>
                </div>
                <OfferStatusBadge status={o.status} />
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
