import { BadgeCheck, Heart, MapPin, Star } from "lucide-react";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Select } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { COMMUNES, WEEKDAYS } from "@/config/area";
import { skillLabel } from "@/core/vertical";
import { requireVenue } from "@/lib/data/salle";
import { formatMoney, todayIso } from "@/lib/format";
import { sport } from "@/verticals/sport";
import { toggleFavorite } from "../actions";

export const metadata: Metadata = { title: "Coachs" };


export default async function CoachCatalog({ searchParams }: PageProps<"/salle/coachs">) {
  const { supabase, venue } = await requireVenue();
  const query = await searchParams;
  const skill = typeof query.discipline === "string" ? query.discipline : "";
  const commune = typeof query.commune === "string" ? query.commune : "";
  const weekday = typeof query.jour === "string" ? Number(query.jour) : 0;

  const [{ data: providers }, { data: favorites }] = await Promise.all([
    supabase
      .from("providers")
      .select(
        "id, display_name, bio, commune, radius_km, min_hourly_rate_cents, rating, missions_count, provider_skills(skill), credentials(kind, status, expires_on), availabilities(weekday)",
      )
      .eq("vertical", sport.id)
      .order("rating", { ascending: false }),
    supabase.from("favorites").select("provider_id").eq("venue_id", venue.id),
  ]);

  const favoriteIds = new Set((favorites ?? []).map((f) => f.provider_id));
  const today = todayIso();
  const coaches = (providers ?? [])
    .filter((p) => !skill || p.provider_skills.some((s) => s.skill === skill))
    .filter((p) => !commune || p.commune === commune)
    .filter((p) => !weekday || p.availabilities.some((a) => a.weekday === weekday))
    .sort((a, b) => Number(favoriteIds.has(b.id)) - Number(favoriteIds.has(a.id)));

  return (
    <>
      <PageHeader title="Catalogue des coachs" subtitle={`${coaches.length} coach${coaches.length > 1 ? "s" : ""}`} />

      <form className="mb-6 grid grid-cols-2 items-end gap-3 rounded-[12px] border border-line bg-surface p-4 sm:grid-cols-4">
        <Field label="Discipline" htmlFor="discipline" className="col-span-2 sm:col-span-1">
          <Select id="discipline" name="discipline" defaultValue={skill}>
            <option value="">Toutes</option>
            {sport.skills.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Commune" htmlFor="commune">
          <Select id="commune" name="commune" defaultValue={commune}>
            <option value="">Toutes</option>
            {COMMUNES.map((c) => (
              <option key={c.name}>{c.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Disponible le" htmlFor="jour">
          <Select id="jour" name="jour" defaultValue={weekday || ""}>
            <option value="">Tous</option>
            {WEEKDAYS.map((d, i) => (
              <option key={d} value={i + 1}>
                {d}
              </option>
            ))}
          </Select>
        </Field>
        <Button type="submit" variant="secondary" className="col-span-2 sm:col-span-1">
          Filtrer
        </Button>
      </form>

      {coaches.length === 0 ? (
        <EmptyState title="Aucun coach ne correspond">Essayez d&apos;enlever un filtre.</EmptyState>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {coaches.map((c) => {
            const favorite = favoriteIds.has(c.id);
            const verified = c.credentials.filter(
              (cr) => cr.status === "verified" && (!cr.expires_on || cr.expires_on >= today),
            ).length;
            const pending = c.credentials.filter((cr) => cr.status === "pending").length;
            return (
              <li key={c.id} className="flex flex-col gap-3 rounded-[12px] border border-line bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg font-extrabold">{c.display_name}</p>
                    <p className="flex flex-wrap items-center gap-x-3 text-sm text-muted">
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={14} strokeWidth={1.75} aria-hidden />
                        {c.commune} · {c.radius_km} km
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Star size={14} strokeWidth={1.75} aria-hidden />
                        {Number(c.rating).toFixed(1)} · {c.missions_count} missions
                      </span>
                    </p>
                  </div>
                  <form action={toggleFavorite}>
                    <input type="hidden" name="providerId" value={c.id} />
                    <input type="hidden" name="favorite" value={favorite ? "1" : "0"} />
                    <button
                      type="submit"
                      aria-pressed={favorite}
                      aria-label={favorite ? `Retirer ${c.display_name} des favoris` : `Ajouter ${c.display_name} aux favoris`}
                      className="flex size-11 items-center justify-center rounded-[10px] border border-line hover:border-accent"
                    >
                      <Heart
                        size={20}
                        strokeWidth={1.75}
                        aria-hidden
                        className={favorite ? "fill-accent text-accent" : "text-muted"}
                      />
                    </button>
                  </form>
                </div>
                <p className="text-[15px] text-muted">{c.bio}</p>
                <div className="flex flex-wrap gap-1.5">
                  {c.provider_skills.map((s) => (
                    <Badge key={s.skill}>{skillLabel(sport, s.skill)}</Badge>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3 text-sm">
                  {verified > 0 && (
                    <Badge tone="success">
                      <BadgeCheck size={14} strokeWidth={1.75} aria-hidden />
                      {verified} diplôme{verified > 1 ? "s" : ""} vérifié{verified > 1 ? "s" : ""}
                    </Badge>
                  )}
                  {pending > 0 && <Badge tone="warning">{pending} en attente</Badge>}
                  <span className="ml-auto text-muted">dès {formatMoney(c.min_hourly_rate_cents)}/h</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
