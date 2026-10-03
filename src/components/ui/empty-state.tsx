import type { ReactNode } from "react";

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-[12px] border border-dashed border-line bg-surface px-5 py-8 text-center">
      <p className="font-bold">{title}</p>
      {children && <div className="mt-1 text-muted">{children}</div>}
    </div>
  );
}
