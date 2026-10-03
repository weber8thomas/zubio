"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Watch = { table: "slots" | "offers"; filter?: string };

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
    return () => {
      active = false;
      supabase.removeChannel(subscription);
    };
  }, [channel, key, router]);

  return (
    <p className="no-print inline-flex items-center gap-2 text-sm text-muted" aria-live="polite">
      <span className="size-2 rounded-full bg-success" aria-hidden />
      Mise à jour en direct
    </p>
  );
}
