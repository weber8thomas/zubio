import { Check, ChevronDown, Clock, Minus, Plus, Search } from "lucide-react";
import { motion } from "motion/react";
import { type ReactNode, useRef, useState } from "react";
import { ClassTile } from "@/components/kit";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { CATEGORIES, CLASSES, classById } from "@/data/classes";
import type { CategoryId, ClassId } from "@/data/types";
import { duration as fmtDuration, endOf } from "@/lib/date";
import { cn } from "@/lib/utils";

// Champs du formulaire de publication. Chacun est utilisable seul.

const field = "flex min-h-14 w-full items-center gap-3 rounded-2xl bg-card px-3 text-left ring-1 ring-border/70 transition hover:ring-border-strong focus-visible:ring-2 focus-visible:ring-primary";

export function Label({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <span className="text-sm font-semibold">{children}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}

/** Recherche d'un cours dans tout le catalogue, par nom ou catégorie. */
export function ClassPicker({ value, onChange, featured }: { value: ClassId; onChange: (id: ClassId) => void; featured: ClassId[] }) {
  const [open, setOpen] = useState(false);
  const pick = (id: ClassId) => (onChange(id), setOpen(false));
  const item = (id: ClassId) => (
    <CommandItem key={id} value={`${classById(id).label} ${CATEGORIES[classById(id).category].label}`} onSelect={() => pick(id)} className="gap-3 rounded-xl py-2">
      <ClassTile id={id} size="sm" />
      <span className="flex-1 font-medium">{classById(id).label}</span>
      {id === value && <Check className="size-4 text-primary" aria-hidden />}
    </CommandItem>
  );
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={field}>
        <Search className="ml-1 size-5 text-muted-foreground" aria-hidden />
        <span className="flex-1 text-muted-foreground">BodyPump, aquabike, zumba…</span>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
          <DialogTitle className="sr-only">Choisir un cours</DialogTitle>
          <Command className="rounded-none bg-card">
            <CommandInput placeholder="BodyPump, aquabike, pilates…" />
            <CommandList className="max-h-[60dvh]">
              <CommandEmpty>Aucun cours trouvé.</CommandEmpty>
              {featured.length > 0 && <CommandGroup heading="Les cours de votre salle">{featured.map(item)}</CommandGroup>}
              {(Object.keys(CATEGORIES) as CategoryId[]).map((cat) => (
                <CommandGroup key={cat} heading={CATEGORIES[cat].label}>
                  {CLASSES.filter((x) => x.category === cat && !featured.includes(x.id)).map((x) => item(x.id))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}

const USUAL_TIMES = ["07:00", "09:30", "12:15", "18:00", "18:30", "19:30"];

/** Heure au pas de 5 minutes + horaires usuels en un geste. */
export function TimeField({ value, onChange }: { value: string; onChange: (t: string) => void }) {
  return (
    <div>
      <label className={cn(field, "focus-within:ring-2 focus-within:ring-primary")}>
        <span className="flex size-9 items-center justify-center rounded-[11px] bg-muted text-ink-soft">
          <Clock className="size-[18px]" aria-hidden />
        </span>
        <input
          type="time"
          step={300}
          value={value}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          aria-label="Heure de début"
          className="flex-1 bg-transparent font-heading text-xl font-extrabold tabular-nums outline-none [&::-webkit-calendar-picker-indicator]:hidden"
        />
      </label>
      <div className="scroll-row -mx-1 mt-2 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {USUAL_TIMES.map((t) => (
          <Chip key={t} active={t === value} onClick={() => onChange(t)} small>
            {t}
          </Chip>
        ))}
      </div>
    </div>
  );
}

export function DurationField({ value, onChange, start }: { value: number; onChange: (m: number) => void; start: string }) {
  return (
    <div className="rounded-2xl bg-card p-4 ring-1 ring-border/70">
      <div className="flex items-baseline justify-between">
        <span className="font-heading text-xl font-extrabold tabular-nums">{fmtDuration(value)}</span>
        <span className="text-sm text-muted-foreground">
          fin à <span className="font-semibold text-foreground tabular-nums">{endOf(start, value)}</span>
        </span>
      </div>
      <Slider className="mt-4" value={[value]} min={15} max={180} step={5} onValueChange={([v]) => onChange(v)} aria-label="Durée en minutes" />
      <div className="mt-3 grid grid-cols-5 gap-1.5">
        {[30, 45, 55, 60, 90].map((m) => (
          <Chip key={m} active={m === value} onClick={() => onChange(m)} small className="w-full px-0">
            {fmtDuration(m)}
          </Chip>
        ))}
      </div>
    </div>
  );
}

/** Nombre ajustable : boutons −/+ (appui long qui accélère) et saisie directe. */
export function Stepper({ value, onChange, min, max, suffix, label }: { value: number; onChange: (n: number) => void; min: number; max: number; suffix?: string; label: string }) {
  const timer = useRef<number>(0);
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  const hold = (delta: number) => {
    let current = value;
    const tick = (wait: number) => {
      current = clamp(current + delta);
      onChange(current);
      timer.current = window.setTimeout(() => tick(Math.max(40, wait * 0.8)), wait);
    };
    tick(350);
  };
  const stop = () => window.clearTimeout(timer.current);
  const btn = (delta: number, Icon: typeof Plus, name: string) => (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      aria-label={name}
      onPointerDown={() => hold(delta)}
      onPointerUp={stop}
      onPointerLeave={stop}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onChange(clamp(value + delta))}
      className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-foreground hover:bg-border"
    >
      <Icon className="size-5" aria-hidden />
    </motion.button>
  );
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-card p-1.5 ring-1 ring-border/70">
      {btn(-1, Minus, `Diminuer ${label}`)}
      <label className="flex flex-1 items-baseline justify-center gap-1">
        <span className="sr-only">{label}</span>
        <input
          inputMode="numeric"
          value={value}
          onChange={(e) => {
            const n = parseInt(e.target.value.replace(/\D/g, "") || "0", 10);
            onChange(clamp(n));
          }}
          className="w-16 bg-transparent text-right font-heading text-2xl font-extrabold tabular-nums outline-none"
        />
        {suffix && <span className="font-heading text-lg font-extrabold">{suffix}</span>}
      </label>
      {btn(1, Plus, `Augmenter ${label}`)}
    </div>
  );
}

export function Chip({ active, onClick, children, small, className }: { active: boolean; onClick: () => void; children: ReactNode; small?: boolean; className?: string }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "shrink-0 rounded-full font-semibold whitespace-nowrap transition-colors",
        small ? "h-9 px-3 text-[13px]" : "h-11 px-4 text-sm",
        active ? "bg-foreground text-background" : "bg-card ring-1 ring-border/70 hover:ring-border-strong",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}

/** Choix exclusif en pastilles. */
export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: Record<T, string> }) {
  return (
    <div className="scroll-row -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
      {(Object.keys(options) as T[]).map((k) => (
        <Chip key={k} active={k === value} onClick={() => onChange(k)} small>
          {options[k]}
        </Chip>
      ))}
    </div>
  );
}

export function ToggleRow({ title, text, checked, onChange }: { title: string; text: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-3">
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{title}</span>
        <span className="block text-sm text-muted-foreground">{text}</span>
      </span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

export function SelectField({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: string[]; label: string }) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={cn(field, "appearance-none pr-10 font-semibold")}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
    </label>
  );
}

