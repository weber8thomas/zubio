import { BadgeCheck, Clock, Star } from "lucide-react";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Select } from "@/components/ui/field";
import { PageHeader, SectionTitle } from "@/components/ui/page-header";
import { credentialLabel, skillLabel } from "@/core/vertical";
import { requireProvider } from "@/lib/data/coach";
import { todayIso } from "@/lib/format";
import { sport } from "@/verticals/sport";
import { declareCredential } from "../actions";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Profil" };

const expiryFormat = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });

export default async function CoachProfile() {
  const { supabase, provider } = await requireProvider();
  const [{ data: skills }, { data: credentials }] = await Promise.all([
    supabase.from("provider_skills").select("skill").eq("provider_id", provider.id),
    supabase.from("credentials").select("id, kind, status, expires_on").eq("provider_id", provider.id).order("created_at"),
  ]);
  const today = todayIso();
  const declared = new Set((credentials ?? []).map((c) => c.kind));
  const declarable = sport.credentials.filter((c) => !declared.has(c.id));

  return (
    <>
      <PageHeader
        title={provider.display_name}
        subtitle={
          <span className="inline-flex flex-wrap items-center gap-x-3">
            <span className="inline-flex items-center gap-1">
              <Star size={16} strokeWidth={1.75} aria-hidden />
              {Number(provider.rating).toFixed(1)}/5
            </span>
            <span>{provider.missions_count} missions réalisées</span>
          </span>
        }
      />

      <h2 className="text-xl">Disciplines</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {(skills ?? []).map((s) => (
          <Badge key={s.skill} tone="accent">
            {skillLabel(sport, s.skill)}
          </Badge>
        ))}
      </div>

      <SectionTitle>Diplômes</SectionTitle>
      <ul className="flex flex-col gap-2">
        {(credentials ?? []).map((c) => {
          const expired = c.status === "verified" && c.expires_on !== null && c.expires_on < today;
          return (
            <li key={c.id} className="flex flex-wrap items-center gap-3 rounded-[12px] border border-line bg-white p-4">
              <div className="min-w-0 flex-1">
                <p className="font-bold">{credentialLabel(sport, c.kind)}</p>
                {c.expires_on && (
                  <p className="text-sm text-muted">
                    Valable jusqu&apos;en {expiryFormat.format(new Date(`${c.expires_on}T12:00:00Z`))}
                  </p>
                )}
              </div>
              {expired ? (
                <Badge>Expiré</Badge>
              ) : c.status === "verified" ? (
                <Badge tone="success">
                  <BadgeCheck size={14} strokeWidth={1.75} aria-hidden />
                  Vérifié
                </Badge>
              ) : (
                <Badge tone="warning">
                  <Clock size={14} strokeWidth={1.75} aria-hidden />
                  En attente
                </Badge>
              )}
            </li>
          );
        })}
      </ul>
      {declarable.length > 0 && (
        <form action={declareCredential} className="mt-3 flex flex-wrap items-end gap-3">
          <Field label="Déclarer un diplôme" htmlFor="kind" className="min-w-0 flex-1 basis-64">
            <Select id="kind" name="kind">
              {declarable.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>
          <Button type="submit" variant="secondary">
            Envoyer pour vérification
          </Button>
        </form>
      )}

      <SectionTitle>Zone et tarif</SectionTitle>
      <Card>
        <ProfileForm
          profile={{
            bio: provider.bio,
            commune: provider.commune,
            radiusKm: provider.radius_km,
            minRate: provider.min_hourly_rate_cents / 100,
          }}
        />
      </Card>
    </>
  );
}
