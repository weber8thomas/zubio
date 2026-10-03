import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { SlotStatusBadge } from "@/components/status-badge";
import type { SlotStatus } from "@/core/types";
import { skillLabel } from "@/core/vertical";
import { formatMoney, formatSlotWhen } from "@/lib/format";
import { sport } from "@/verticals/sport";

export type SlotSummary = {
  id: string;
  skill: string;
  starts_at: string;
  ends_at: string;
  rate_cents: number;
  status: SlotStatus;
  coachName?: string | null;
  pendingOffers?: number;
};

export function SlotCard({ slot }: { slot: SlotSummary }) {
  let detail: string | null = null;
  if (slot.coachName) detail = `Avec ${slot.coachName}`;
  else if (slot.status === "open") {
    detail = slot.pendingOffers
      ? `${slot.pendingOffers} coach${slot.pendingOffers > 1 ? "s" : ""} sollicité${slot.pendingOffers > 1 ? "s" : ""}`
      : "Aucun coach en attente de réponse";
  }

  return (
    <Link
      href={`/salle/creneaux/${slot.id}`}
      className="flex items-center gap-3 rounded-[12px] border border-line bg-white p-4 transition-colors hover:border-ink"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display text-lg font-extrabold">{skillLabel(sport, slot.skill)}</span>
          <SlotStatusBadge status={slot.status} />
        </div>
        <p className="mt-0.5 text-[15px]">{formatSlotWhen(slot.starts_at, slot.ends_at, true)}</p>
        <p className="text-sm text-muted">
          {formatMoney(slot.rate_cents)}
          {detail && ` · ${detail}`}
        </p>
      </div>
      <ChevronRight size={20} strokeWidth={1.75} className="shrink-0 text-muted" aria-hidden />
    </Link>
  );
}
