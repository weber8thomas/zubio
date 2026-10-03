import { cn } from "@/lib/utils";

const src = (file: string) => `${import.meta.env.BASE_URL}brand/${file}`;

/** Logo « Ligne Z » : le z va de l'anneau (la salle publie) au point (le coach confirmé). */
export function Logo({ className, mark = false }: { className?: string; mark?: boolean }) {
  return <img src={src(mark ? "logo-mark.svg" : "logo.svg")} alt="Zubio" className={cn("block w-auto", className)} />;
}
