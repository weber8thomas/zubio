import type { VerticalConfig } from "@/core/vertical";
import { immobilier } from "./immobilier";
import { sport } from "./sport";

export const verticals: Record<string, VerticalConfig> = { sport, immobilier };

export const DEFAULT_VERTICAL = sport;

export const VERTICAL_COOKIE = "zubio-vertical";

export function getVertical(id: string | undefined | null): VerticalConfig {
  return (id && verticals[id]) || DEFAULT_VERTICAL;
}

/** Variables CSS qui remplacent la couleur d'accent pour une verticale. */
export function accentStyle(vertical: VerticalConfig): Record<string, string> {
  return {
    "--accent": vertical.accent.base,
    "--accent-hover": vertical.accent.hover,
    "--accent-light": vertical.accent.light,
  };
}
