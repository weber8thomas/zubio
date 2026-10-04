import { AnimatePresence, motion } from "motion/react";
import { Component, lazy, Suspense, type ComponentProps, type ReactNode } from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// La carte (MapLibre, ~800 ko) n'est chargée qu'à l'affichage.
const ZMap = lazy(() => import("./zmap"));
export type { MapMarker } from "./zmap";

/** Une carte en panne ne doit jamais casser la page. */
class MapBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function MapView(props: ComponentProps<typeof ZMap>) {
  const placeholder = <div className={cn("bg-muted", props.className)} />;
  return (
    <MapBoundary fallback={placeholder}>
      <Suspense fallback={<div className={cn("animate-pulse bg-muted", props.className)} />}>
        <ZMap {...props} />
      </Suspense>
    </MapBoundary>
  );
}

/** Curseur de rayon, avec le nombre de coachs atteints animé. */
export function RadiusControl({ value, onChange, count, max = 30 }: { value: number; onChange: (km: number) => void; count?: number; max?: number }) {
  return (
    <div className="flex items-center gap-4 bg-card px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-baseline justify-between gap-2 text-sm">
          <span className="font-semibold">Rayon de recherche</span>
          <span className="font-heading font-extrabold tabular-nums">{value} km</span>
        </div>
        <Slider value={[value]} min={1} max={max} step={1} onValueChange={([v]) => onChange(v)} aria-label="Rayon de recherche en kilomètres" />
      </div>
      {count !== undefined && (
        <div className="w-16 shrink-0 text-center">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={count}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              className="font-heading text-2xl leading-none font-extrabold tabular-nums"
            >
              {count}
            </motion.p>
          </AnimatePresence>
          <p className="mt-1 text-[11px] leading-tight text-muted-foreground">coach{count > 1 ? "s" : ""} compatible{count > 1 ? "s" : ""}</p>
        </div>
      )}
    </div>
  );
}
