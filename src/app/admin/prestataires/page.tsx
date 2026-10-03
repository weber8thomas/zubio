import { MapPin, Star } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { credentialLabel, skillLabel } from "@/core/vertical";
import { cn } from "@/lib/cn";
import { activeVertical, requireAdmin } from "@/lib/data/admin";
import { todayIso } from "@/lib/format";
import { validateCredential } from "../actions";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await activeVertical()).labels.providers };
}

export default async function AdminProviders({ searchParams }: PageProps<"/admin/prestataires">) {
  const { supabase, vertical } = await requireAdmin();
  const { labels } = vertical;
  const { filtre } = await searchParams;
  const pendingOnly = filtre === "attente";

  const { data } = await supabase
    .from("providers")
    .select(
      "id, display_name, commune, rating, missions_count, provider_skills(skill), credentials(id, kind, status, expires_on)",
    )
    .eq("vertical", vertical.id)
    .order("display_name");

  const today = todayIso();
  const all = (data ?? [])
    .map((p) => ({ ...p, pending: p.credentials.filter((c) => c.status === "pending").length }))
    .sort((a, b) => Number(b.pending > 0) - Number(a.pending > 0));
  const withPending = all.filter((p) => p.pending > 0).length;
  const providers = pendingOnly ? all.filter((p) => p.pending > 0) : all;
  const validateLabel = `Valider le ${labels.credential.toLowerCase()}`;

  const filters = [
    { href: "/admin/prestataires", label: `Tous (${all.length})`, active: !pendingOnly },
    {
      href: "/admin/prestataires?filtre=attente",
      label: `${labels.credentials} en attente (${withPending})`,
      active: pendingOnly,
    },
  ];

  return (
    <>
      <PageHeader
        title={labels.providers}
        subtitle={`${all.length} ${labels.provider.toLowerCase()}${all.length > 1 ? "s" : ""} · ${withPending} avec un ${labels.credential.toLowerCase()} à valider`}
      />

      <nav aria-label="Filtrer la liste" className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            aria-current={f.active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 items-center rounded-[10px] border px-4 font-bold",
              f.active
                ? "border-transparent bg-accent-light text-accent-hover"
                : "border-line text-muted hover:text-ink",
            )}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {providers.length === 0 ? (
        <EmptyState title={pendingOnly ? "Rien à valider" : `Aucune donnée pour la verticale ${vertical.name}`} />
      ) : (
        <ul className="grid items-start gap-3 lg:grid-cols-2">
          {providers.map((p) => (
            <li key={p.id} className="flex flex-col gap-3 rounded-[12px] border border-line bg-white p-4">
              <div>
                <p className="font-display text-lg font-extrabold">{p.display_name}</p>
                <p className="flex flex-wrap items-center gap-x-3 text-sm text-muted">
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={14} strokeWidth={1.75} aria-hidden />
                    {p.commune}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Star size={14} strokeWidth={1.75} aria-hidden />
                    {Number(p.rating).toFixed(1)} · {p.missions_count} missions
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {p.provider_skills.map((s) => (
                  <Badge key={s.skill}>{skillLabel(vertical, s.skill)}</Badge>
                ))}
              </div>
              <ul className="flex flex-col divide-y divide-line border-t border-line">
                {p.credentials.map((c) => {
                  const expired = c.status === "verified" && !!c.expires_on && c.expires_on < today;
                  return (
                    <li key={c.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3 last:pb-0">
                      <span className="min-w-0 flex-1 basis-40 text-[15px]">{credentialLabel(vertical, c.kind)}</span>
                      {c.status === "pending" ? (
                        <Badge tone="warning">En attente</Badge>
                      ) : expired ? (
                        <Badge>Expiré</Badge>
                      ) : (
                        <Badge tone="success">Vérifié</Badge>
                      )}
                      {c.status === "pending" && (
                        <form action={validateCredential} className="w-full sm:w-auto">
                          <input type="hidden" name="credentialId" value={c.id} />
                          <Button type="submit" className="w-full sm:w-auto">
                            {validateLabel}
                          </Button>
                        </form>
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
