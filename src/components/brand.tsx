import { cn } from "@/lib/utils";

/** Logo provisoire, remplacé par l'identité finale. */
export function Logo({ className }: { className?: string }) {
  return <span className={cn("font-heading text-2xl font-extrabold tracking-tight text-primary", className)}>zubio</span>;
}
