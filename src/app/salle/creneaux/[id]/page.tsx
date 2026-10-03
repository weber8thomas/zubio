import { ArrowLeft, CheckCircle2, FileText, Star } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LiveRefresh } from "@/components/live-refresh";
import { OfferStatusBadge, SlotStatusBadge } from "@/components/status-badge";
import { DemoTag } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionTitle } from "@/components/ui/page-header";
import { REJECTION_LABELS, type RejectionMotive } from "@/core/matching";
import { skillLabel } from "@/core/vertical";
import { evaluateSlot } from "@/lib/data/matching";
import { requireVenue } from "@/lib/data/salle";
import { formatMoney, formatSlotWhen } from "@/lib/format";
import { uuidSchema } from "@/lib/validation";
import { sport } from "@/verticals/sport";
import { simulateNoAnswer } from "../../actions";

export const metadata: Metadata = { title: "Créneau" };

export default async function SlotPage({ params, searchParams }: PageProps<"/salle/creneaux/[id]">) {
  const { id } = await params;
  const query = await searchParams;
  if (!uuidSchema.safeParse(id).success) notFound();

  const { supabase, venue } = await requireVenue();
  const { data: slot } = await supabase
    .from("slots")
    .select(
      "id, skill, starts_at, ends_at, rate_cents, notes, status, search_radius_km, filled_at, published_at, providers(display_name, commune, rating, missions_count), offers(id, status, reason, score, created_at, providers(display_name, rating))",
    )
    .eq("id", id)
    .eq("venue_id", venue.id)
    .maybeSingle();
  if (!slot) notFound();

  const offers = [...slot.offers].sort(
    (a, b) => b.score - a.score || a.created_at.localeCompare(b.created_at),
  );
  const isOpen = slot.status === "open";
  const evaluation = isOpen ? await evaluateSlot(supabase, slot.id) : null;
  const motives = new Map<RejectionMotive, number>();
  for (const r of evaluation?.rejections ?? []) {
    if (r.motive !== "already-asked") motives.set(r.motive, (motives.get(r.motive) ?? 0) + 1);
  }
  const fillMinutes = slot.filled_at
    ? Math.max(1, Math.round((new Date(slot.filled_at).getTime() - new Date(slot.published_at).getTime()) / 60_000))
    : null;

  return (
    <>
      <Link href="/salle" className="mb-4 inline-flex min-h-11 items-center gap-2 font-bold text-muted hover:text-ink">
        <ArrowLeft size={20} strokeWidth={1.75} aria-hidden />
        Tableau de bord
      </Link>

      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[28px] sm:text-[34px]">{skillLabel(sport, slot.skill)}</h1>
          <SlotStatusBadge status={slot.status} />
        </div>
        <p className="mt-1 text-lg">{formatSlotWhen(slot.starts_at, slot.ends_at)}</p>
        <p className="text-muted">
          {formatMoney(slot.rate_cents)} · rayon de recherche {slot.search_radius_km} km
        </p>
        {slot.notes && <p className="mt-2 text-muted">« {slot.notes} »</p>}
      </header>

      {query.publie && isOpen && (
        <p role="status" className="mb-6 rounded-[12px] border border-line bg-surface p-4">
          <strong>Créneau publié.</strong> {offers.length} coach{offers.length > 1 ? "s ont" : " a"} reçu la
          proposition.
        </p>
      )}
      {typeof query.elargi === "string" && (
        <p role="status" className="mb-6 rounded-[12px] border border-line bg-surface p-4">
          <strong>Rayon élargi à {slot.search_radius_km} km.</strong>{" "}
          {query.elargi === "0"
            ? "Aucun nouveau coach compatible dans ce rayon."
            : `${query.elargi} nouveau${query.elargi === "1" ? "" : "x"} coach${query.elargi === "1" ? "" : "s"} sollicité${query.elargi === "1" ? "" : "s"}.`}
        </p>
      )}

      {slot.providers && (
        <Card className="mb-6 flex items-start gap-3 border-success">
          <CheckCircle2 size={24} strokeWidth={1.75} className="mt-0.5 shrink-0 text-success" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-extrabold">Confirmé avec {slot.providers.display_name}</p>
            <p className="text-muted">
              {slot.providers.commune} · {Number(slot.providers.rating).toFixed(1)}/5 ·{" "}
              {slot.providers.missions_count} missions
              {fillMinutes !== null && ` · pourvu en ${fillMinutes} min`}
            </p>
          </div>
          <ButtonLink href={`/salle/factures/${slot.id}`} variant="secondary" className="shrink-0">
            <FileText size={20} strokeWidth={1.75} aria-hidden />
            Facture
          </ButtonLink>
        </Card>
      )}

      <SectionTitle
        action={
          isOpen ? (
            <LiveRefresh
              channel={`slot-${slot.id}`}
              watch={[
                { table: "offers", filter: `slot_id=eq.${slot.id}` },
                { table: "slots", filter: `id=eq.${slot.id}` },
              ]}
            />
          ) : undefined
        }
      >
        Coachs proposés
      </SectionTitle>

      {offers.length ? (
        <ul className="flex flex-col gap-2">
          {offers.map((o) => (
            <li key={o.id} className="flex items-center gap-3 rounded-[12px] border border-line bg-white p-4">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-x-2 font-bold">
                  {o.providers?.display_name}
                  <span className="inline-flex items-center gap-1 text-sm font-normal text-muted">
                    <Star size={14} strokeWidth={1.75} aria-hidden />
                    {Number(o.providers?.rating ?? 0).toFixed(1)}
                  </span>
                </p>
                <p className="text-[15px] text-muted">{o.reason}</p>
              </div>
              <OfferStatusBadge status={o.status} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="Aucun coach compatible pour l'instant">
          Élargissez le rayon ou ajustez le tarif.
        </EmptyState>
      )}

      {isOpen && (
        <Card className="mt-6 bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0 flex-1 basis-64">
              <p className="flex items-center gap-2 font-bold">
                Personne ne répond ? <DemoTag />
              </p>
              <p className="text-[15px] text-muted">
                Simule 10 minutes sans réponse : le rayon passe à {Math.min(slot.search_radius_km + 10, 50)} km et
                de nouveaux coachs sont sollicités.
              </p>
            </div>
            <form action={simulateNoAnswer}>
              <input type="hidden" name="slotId" value={slot.id} />
              <Button type="submit" variant="secondary" disabled={slot.search_radius_km >= 50}>
                Simuler 10 min sans réponse
              </Button>
            </form>
          </div>
          {motives.size > 0 && (
            <details className="mt-4 border-t border-line pt-3">
              <summary className="min-h-11 cursor-pointer content-center font-bold">
                Pourquoi les autres coachs ne sont-ils pas proposés ?
              </summary>
              <ul className="mt-2 grid gap-1 text-[15px] text-muted sm:grid-cols-2">
                {[...motives.entries()].map(([motive, count]) => (
                  <li key={motive}>
                    {REJECTION_LABELS[motive]} : {count}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </Card>
      )}
    </>
  );
}
