import { OFFER_STATUS_LABELS, SLOT_STATUS_LABELS, type OfferStatus, type SlotStatus } from "@/core/types";
import { Badge, type BadgeTone } from "@/components/ui/badge";

const SLOT_TONES: Record<SlotStatus, BadgeTone> = {
  open: "warning",
  filled: "success",
  cancelled: "neutral",
  done: "neutral",
};

const OFFER_TONES: Record<OfferStatus, BadgeTone> = {
  pending: "warning",
  accepted: "success",
  declined: "neutral",
  expired: "neutral",
};

export function SlotStatusBadge({ status }: { status: SlotStatus }) {
  return <Badge tone={SLOT_TONES[status]}>{SLOT_STATUS_LABELS[status]}</Badge>;
}

export function OfferStatusBadge({ status }: { status: OfferStatus }) {
  return <Badge tone={OFFER_TONES[status]}>{OFFER_STATUS_LABELS[status]}</Badge>;
}
