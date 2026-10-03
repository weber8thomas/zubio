import type { ReactNode } from "react";

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="rounded-[12px] border border-line bg-white p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-display text-[28px] font-extrabold leading-tight tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
    </div>
  );
}
