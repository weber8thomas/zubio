import { distanceKm, formatDistance } from "./geo";
import { coversRange, durationHours, rangesOverlap } from "./time";
import type { ProviderCandidate, ProviderCredential, SlotRequest } from "./types";

/**
 * Matching à règles simples :
 * 1. filtres éliminatoires (compétence, justificatif valide, distance, disponibilité, tarif) ;
 * 2. classement (favori de la structure, note, distance) ;
 * 3. une raison lisible pour chaque proposition.
 */

export type RejectionMotive =
  | "skill"
  | "credential"
  | "distance"
  | "availability"
  | "busy"
  | "rate"
  | "already-asked";

export const REJECTION_LABELS: Record<RejectionMotive, string> = {
  skill: "Compétence absente",
  credential: "Justificatif manquant ou non vérifié",
  distance: "Trop loin",
  availability: "Indisponible sur ce créneau",
  busy: "Déjà en mission",
  rate: "Tarif inférieur à son minimum",
  "already-asked": "Déjà sollicité",
};

export interface MatchContext {
  /** Groupes de justificatifs exigés pour la compétence du créneau. */
  requiredCredentials: string[][];
  /** Libellé court du justificatif dans la raison (« Diplôme », « Assurance »…). */
  credentialLabel: string;
  favoriteIds: ReadonlySet<string>;
  /** Prestataires à ignorer (déjà sollicités pour ce créneau). */
  excludedIds?: ReadonlySet<string>;
  timeZone: string;
  /** Date du jour (« AAAA-MM-JJ ») pour tester l'expiration des justificatifs. */
  today: string;
}

export interface Match {
  providerId: string;
  score: number;
  distanceKm: number;
  favorite: boolean;
  reason: string;
}

export interface Rejection {
  providerId: string;
  motive: RejectionMotive;
}

function isValid(credential: ProviderCredential, today: string): boolean {
  return (
    credential.status === "verified" &&
    (credential.expiresOn === null || credential.expiresOn >= today)
  );
}

function hasRequiredCredentials(
  credentials: ProviderCredential[],
  required: string[][],
  today: string,
): boolean {
  const valid = new Set(credentials.filter((c) => isValid(c, today)).map((c) => c.kind));
  return required.every((group) => group.some((kind) => valid.has(kind)));
}

function rejectionFor(
  slot: SlotRequest,
  candidate: ProviderCandidate,
  ctx: MatchContext,
  distance: number,
): RejectionMotive | null {
  if (ctx.excludedIds?.has(candidate.id)) return "already-asked";
  if (!candidate.skills.includes(slot.skill)) return "skill";
  if (!hasRequiredCredentials(candidate.credentials, ctx.requiredCredentials, ctx.today)) {
    return "credential";
  }
  if (distance > Math.min(candidate.radiusKm, slot.searchRadiusKm)) return "distance";
  if (!coversRange(candidate.availabilities, slot, ctx.timeZone)) return "availability";
  if (candidate.busy.some((mission) => rangesOverlap(mission, slot))) return "busy";
  const hourlyRate = slot.rateCents / Math.max(durationHours(slot), 0.25);
  if (hourlyRate < candidate.minHourlyRateCents) return "rate";
  return null;
}

/** Score sur 100 : favori (40) + note sur 5 (40) + proximité (20). */
function scoreFor(candidate: ProviderCandidate, favorite: boolean, distance: number, radius: number) {
  const proximity = radius > 0 ? Math.max(0, 1 - distance / radius) : 0;
  return Math.round((favorite ? 40 : 0) + (candidate.rating / 5) * 40 + proximity * 20);
}

export function matchProviders(
  slot: SlotRequest,
  candidates: ProviderCandidate[],
  ctx: MatchContext,
): { matches: Match[]; rejections: Rejection[] } {
  const matches: Match[] = [];
  const rejections: Rejection[] = [];

  for (const candidate of candidates) {
    const distance = distanceKm(slot.location, candidate.location);
    const motive = rejectionFor(slot, candidate, ctx, distance);
    if (motive) {
      rejections.push({ providerId: candidate.id, motive });
      continue;
    }
    const favorite = ctx.favoriteIds.has(candidate.id);
    const parts = [
      ...(favorite ? ["Favori"] : []),
      ...(ctx.requiredCredentials.length > 0 ? [`${ctx.credentialLabel} ✓`] : []),
      formatDistance(distance),
      "disponible",
    ];
    matches.push({
      providerId: candidate.id,
      score: scoreFor(candidate, favorite, distance, slot.searchRadiusKm),
      distanceKm: Math.round(distance * 10) / 10,
      favorite,
      reason: parts.join(" · "),
    });
  }

  matches.sort(
    (a, b) =>
      Number(b.favorite) - Number(a.favorite) || b.score - a.score || a.distanceKm - b.distanceKm,
  );
  return { matches, rejections };
}
