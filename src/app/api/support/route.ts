import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { answerSupport } from "@/lib/support/answer";
import { chatSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const parsed = chatSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Message invalide" }, { status: 400 });

  const answer = await answerSupport(session.supabase, session.profile.role, parsed.data.message);
  return NextResponse.json(answer);
}
