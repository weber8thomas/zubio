"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Watch = { table: "slots" | "offers"; filter?: string };

/** Filet de sécurité si la connexion Realtime tombe (réseau mobile, mise en veille). */
const FALLBACK_REFRESH_MS = 15_000;

/**
 * Écoute Supabase Realtime (sous la RLS de l'utilisateur) et rafraîchit
 * la page serveur dès qu'une ligne surveillée change.
 */
export function LiveRefresh({ channel, watch }: { channel: string; watch: Watch[] }) {
  const router = useRouter();
  const key = JSON.stringify(watch);

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    const subscription = supabase.channel(channel);
    for (const w of JSON.parse(key) as Watch[]) {
      subscription.on(
        "postgres_changes",
        { event: "*", schema: "public", table: w.table, ...(w.filter ? { filter: w.filter } : {}) },
        () => router.refresh(),
      );
    }
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      supabase.realtime.setAuth(data.session?.access_token ?? null);
      subscription.subscribe();
    });
    const fallback = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, FALLBACK_REFRESH_MS);
    return () => {
      active = false;
      window.clearInterval(fallback);
      supabase.removeChannel(subscription);
    };
  }, [channel, key, router]);

  return (
    <p className="no-print inline-flex items-center gap-2 text-sm text-muted" aria-live="polite">
      <span className="size-2 rounded-full bg-success" aria-hidden />
      En direct
    </p>
  );
}
