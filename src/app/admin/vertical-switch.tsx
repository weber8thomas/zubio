import { cn } from "@/lib/cn";
import { verticals } from "@/verticals";
import { setVertical } from "./actions";

/** Sélecteur Sport / Immobilier : même cœur, autre vocabulaire et autre couleur d'accent. */
export function VerticalSwitch({ current, className }: { current: string; className?: string }) {
  return (
    <form action={setVertical} className={cn("flex items-center gap-3", className)}>
      <span id="vertical-label" className="text-sm font-bold text-muted">
        Verticale
      </span>
      <div
        role="group"
        aria-labelledby="vertical-label"
        className="grid flex-1 grid-cols-2 gap-0.5 rounded-[10px] border border-line bg-white p-0.5 md:flex-none"
      >
        {Object.values(verticals).map((v) => {
          const active = v.id === current;
          return (
            <button
              key={v.id}
              type="submit"
              name="vertical"
              value={v.id}
              aria-pressed={active}
              className={cn(
                "min-h-11 rounded-[8px] px-4 font-bold",
                active ? "bg-accent-light text-accent-hover" : "text-muted hover:text-ink",
              )}
            >
              {v.name}
            </button>
          );
        })}
      </div>
    </form>
  );
}
