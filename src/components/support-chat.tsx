"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { DemoTag } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

type Message = { from: "user" | "bot"; text: string };

const SUGGESTIONS = ["Où en est mon créneau ?", "Comment les coachs sont-ils choisis ?", "Combien coûte Zubio ?"];

export function SupportChat({ aiEnabled }: { aiEnabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "Bonjour ! Posez votre question, ou choisissez une suggestion." },
  ]);
  const listRef = useRef<HTMLOListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || pending) return;
    setMessages((m) => [...m, { from: "user", text: message }]);
    setInput("");
    setPending(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = (await res.json()) as { reply?: string };
      setMessages((m) => [...m, { from: "bot", text: data.reply ?? "Le service est indisponible pour le moment." }]);
    } catch {
      setMessages((m) => [...m, { from: "bot", text: "Le service est indisponible pour le moment." }]);
    } finally {
      setPending(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <div className="no-print">
      {open && (
        <section
          role="dialog"
          aria-label="Assistant Zubio"
          className="fixed inset-x-3 bottom-20 z-40 flex max-h-[70dvh] flex-col rounded-[12px] border border-line bg-white shadow-float md:inset-x-auto md:bottom-24 md:right-6 md:w-96"
        >
          <header className="flex items-center gap-2 border-b border-line py-1 pl-4 pr-1">
            <h2 className="flex-1 text-base">Assistant Zubio</h2>
            {!aiEnabled && <DemoTag />}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer l'assistant"
              className="flex size-11 items-center justify-center rounded-[10px] text-muted hover:text-ink"
            >
              <X size={20} strokeWidth={1.75} aria-hidden />
            </button>
          </header>
          <ol ref={listRef} className="flex flex-1 flex-col gap-2 overflow-y-auto p-4" aria-live="polite">
            {messages.map((m, i) => (
              <li
                key={i}
                className={cn(
                  "max-w-[85%] whitespace-pre-line rounded-[12px] px-3 py-2 text-[15px] leading-snug",
                  m.from === "user" ? "self-end bg-accent text-white" : "self-start bg-surface",
                )}
              >
                {m.text}
              </li>
            ))}
            {pending && <li className="self-start text-sm text-muted">L&apos;assistant écrit…</li>}
          </ol>
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 px-4 pb-3">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="min-h-11 rounded-[10px] border border-line px-3 text-left text-sm font-bold hover:border-accent"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <form onSubmit={onSubmit} className="flex gap-2 border-t border-line p-3">
            <label htmlFor="support-input" className="sr-only">
              Votre question
            </label>
            <input
              ref={inputRef}
              id="support-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={500}
              placeholder="Votre question…"
              autoComplete="off"
              className="min-h-11 min-w-0 flex-1 rounded-[10px] border border-line px-3 focus:border-ink focus:outline-none"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              aria-label="Envoyer"
              className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-accent text-white hover:bg-accent-hover disabled:opacity-50"
            >
              <Send size={20} strokeWidth={1.75} aria-hidden />
            </button>
          </form>
        </section>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Fermer l'assistant" : "Ouvrir l'assistant"}
        className={cn(
          "fixed bottom-20 right-4 z-40 size-14 items-center justify-center rounded-full bg-accent text-white shadow-float hover:bg-accent-hover md:bottom-6 md:right-6 md:flex",
          open ? "hidden" : "flex",
        )}
      >
        {open ? <X size={24} strokeWidth={1.75} aria-hidden /> : <MessageCircle size={24} strokeWidth={1.75} aria-hidden />}
      </button>
    </div>
  );
}
