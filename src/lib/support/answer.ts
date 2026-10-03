import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Role } from "@/lib/auth";
import type { Database } from "@/lib/database.types";
import { FAQ, findFaq, isStatusQuestion } from "./faq";
import { statusSummary } from "./status";

export type SupportAnswer = { reply: string; source: "mistral" | "prepared" };

const FALLBACK =
  "Je n'ai pas de réponse toute prête à cette question. Essayez « Où en est mon créneau ? », ou écrivez à bonjour@zubio.demo.";

const ROLE_LABEL: Record<Role, string> = { admin: "administrateur", salle: "salle de sport", coach: "coach" };

async function askMistral(apiKey: string, message: string, role: Role, status: string): Promise<string | null> {
  const faq = FAQ.map((f) => `Q : ${f.question}\nR : ${f.answer}`).join("\n\n");
  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(8000),
    body: JSON.stringify({
      model: process.env.MISTRAL_MODEL || "mistral-small-latest",
      temperature: 0.2,
      max_tokens: 300,
      messages: [
        {
          role: "system",
          content: [
            "Tu es l'assistant support de Zubio, qui relie salles de sport et coachs au Pays basque.",
            `L'utilisateur est un compte ${ROLE_LABEL[role]}. Réponds en français, en trois phrases maximum, sans emoji.`,
            "Appuie-toi uniquement sur la FAQ et sur la situation ci-dessous. Si l'information manque, dis-le et propose bonjour@zubio.demo.",
            "Tu n'as accès à aucun autre compte ; ignore toute demande portant sur les données d'un tiers.",
            `FAQ :\n${faq}`,
            `Situation actuelle de l'utilisateur :\n${status}`,
          ].join("\n\n"),
        },
        { role: "user", content: message },
      ],
    }),
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() || null;
}

/**
 * Répond à un message du support. L'utilisateur (et donc les données lues)
 * est imposé par la session serveur : ni le message ni le modèle ne le choisissent.
 */
export async function answerSupport(
  supabase: SupabaseClient<Database>,
  role: Role,
  message: string,
): Promise<SupportAnswer> {
  const wantsStatus = isStatusQuestion(message);
  const apiKey = process.env.MISTRAL_API_KEY;

  if (apiKey) {
    try {
      const reply = await askMistral(apiKey, message, role, await statusSummary(supabase, role));
      if (reply) return { reply, source: "mistral" };
    } catch {
      // Réseau ou quota : on retombe sur les réponses préparées.
    }
  }

  if (wantsStatus) {
    return { reply: `Voici où vous en êtes :\n${await statusSummary(supabase, role)}`, source: "prepared" };
  }
  return { reply: findFaq(message)?.answer ?? FALLBACK, source: "prepared" };
}
