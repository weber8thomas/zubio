import type { SlotStatus } from "./types";

/**
 * Contrat qu'une verticale (un domaine métier) doit remplir pour réutiliser
 * le cœur : vocabulaire, compétences, justificatifs exigés, couleur d'accent.
 */

export interface CredentialDefinition {
  id: string;
  label: string;
}

export interface SkillDefinition {
  id: string;
  label: string;
  /**
   * Justificatifs exigés : chaque groupe doit être satisfait,
   * et un groupe est satisfait par l'un quelconque de ses justificatifs.
   */
  requires: string[][];
}

export interface VerticalLabels {
  venue: string;
  venues: string;
  provider: string;
  providers: string;
  slot: string;
  slots: string;
  skill: string;
  skills: string;
  credential: string;
  credentials: string;
}

export interface VerticalConfig {
  id: string;
  name: string;
  accent: { base: string; hover: string; light: string };
  labels: VerticalLabels;
  /** Libellés de statut accordés au genre du mot « créneau » de la verticale (par défaut : masculin). */
  slotStatusLabels?: Record<SlotStatus, string>;
  skills: SkillDefinition[];
  credentials: CredentialDefinition[];
  defaults: { durationMinutes: number; rateCents: number; searchRadiusKm: number };
}

export function skillLabel(vertical: VerticalConfig, id: string): string {
  return vertical.skills.find((s) => s.id === id)?.label ?? id;
}

export function credentialLabel(vertical: VerticalConfig, id: string): string {
  return vertical.credentials.find((c) => c.id === id)?.label ?? id;
}

export function requiredCredentials(vertical: VerticalConfig, skillId: string): string[][] {
  return vertical.skills.find((s) => s.id === skillId)?.requires ?? [];
}
