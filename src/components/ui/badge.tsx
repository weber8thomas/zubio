import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "neutral" | "accent" | "success" | "warning";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-surface text-muted border-line",
  accent: "bg-accent-light text-accent-hover border-transparent",
  success: "bg-success-light text-success-text border-transparent",
  warning: "bg-warning-light text-warning-text border-transparent",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[13px] font-bold leading-5 whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Indique discrètement qu'une fonction est simulée. */
export function DemoTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-dashed border-muted px-2 text-[12px] font-bold uppercase tracking-wide text-muted",
        className,
      )}
    >
      Démo
    </span>
  );
}
