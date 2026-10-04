import { FileText, Minus, Plus } from "lucide-react";
import { motion } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { certLabel } from "@/data/classes";
import { coachById } from "@/data/coaches";
import { cn } from "@/lib/utils";

// Documents au format A4 (794 × 1123 px à 96 ppp) : miniature cliquable et visionneuse lisible.

const A4 = { w: 794, h: 1123 };

/** Page A4 mise à l'échelle de son conteneur (la mise en page reste celle d'une vraie page). */
export function A4Page({ children, width }: { children: ReactNode; width?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(width ?? 0);
  useEffect(() => {
    if (width || !ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [width]);
  const scale = (width ?? w) / A4.w;
  return (
    <div ref={ref} style={{ width: width ?? "100%", height: A4.h * scale }} className="relative overflow-hidden bg-white">
      <div style={{ width: A4.w, height: A4.h, transform: `scale(${scale})`, transformOrigin: "top left" }} className="absolute top-0 left-0 bg-white text-[#2a211c]">
        {children}
      </div>
    </div>
  );
}

/** Miniature cliquable qui ouvre la visionneuse. */
export function DocThumb({ title, subtitle, children, width = 132 }: { title: string; subtitle?: string; children: ReactNode; width?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <motion.button type="button" onClick={() => setOpen(true)} whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }} className="group block text-left" aria-label={`Ouvrir ${title}`}>
        <span className="block overflow-hidden rounded-xl shadow-lift ring-1 ring-border/70 transition group-hover:ring-primary">
          <A4Page width={width}>{children}</A4Page>
        </span>
        <span className="mt-2 block truncate text-sm font-semibold" style={{ width }}>
          {title}
        </span>
        {subtitle && (
          <span className="block truncate text-xs text-muted-foreground" style={{ width }}>
            {subtitle}
          </span>
        )}
      </motion.button>
      <DocViewer open={open} onOpenChange={setOpen} title={title}>
        {children}
      </DocViewer>
    </>
  );
}

/** Visionneuse : page entière, lisible, avec zoom. */
export function DocViewer({ open, onOpenChange, title, children }: { open: boolean; onOpenChange: (v: boolean) => void; title: string; children: ReactNode }) {
  const [zoom, setZoom] = useState(1);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[92dvh] max-w-[min(920px,96vw)] flex-col gap-0 overflow-hidden bg-muted p-0 sm:max-w-[min(920px,96vw)]">
        <div className="flex items-center gap-2 border-b border-border/70 bg-card px-4 py-2.5 pr-12">
          <FileText className="size-4 text-muted-foreground" aria-hidden />
          <DialogTitle className="min-w-0 flex-1 truncate text-sm font-semibold">{title}</DialogTitle>
          <button type="button" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} aria-label="Dézoomer" className="flex size-9 items-center justify-center rounded-full hover:bg-muted">
            <Minus className="size-4" />
          </button>
          <span className="w-12 text-center text-xs font-semibold tabular-nums">{Math.round(zoom * 100)} %</span>
          <button type="button" onClick={() => setZoom((z) => Math.min(2, z + 0.25))} aria-label="Zoomer" className="flex size-9 items-center justify-center rounded-full hover:bg-muted">
            <Plus className="size-4" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-3 sm:p-6">
          <div className="mx-auto shadow-lift" style={{ width: `min(${A4.w * zoom}px, ${zoom * 100}%)` }}>
            <A4Page>{children}</A4Page>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const ISSUERS: Record<string, string> = {
  "bpjeps-af": "Organisme de formation habilité (fictif)",
  "bpjeps-aan": "Organisme de formation habilité (fictif)",
  "cqp-als": "Branche du sport · certification de qualification (fictif)",
  staps: "Université (fictif)",
  bnssa: "Centre de formation au sauvetage (fictif)",
  pilates: "École de Pilates (fictif)",
  reformer: "École de Pilates (fictif)",
  yoga200: "École de yoga (fictif)",
  zumba: "Réseau d'instructeurs (fictif)",
};

/** Justificatif de certification, au format A4, marqué spécimen. */
export function CertificateDoc({ coachId, certId }: { coachId: string; certId: string }) {
  const coach = coachById(coachId);
  const issuer = certId.startsWith("lm-") ? "Programme de cours chorégraphiés · licence instructeur (fictif)" : (ISSUERS[certId] ?? "Organisme certificateur (fictif)");
  return (
    <div className="relative flex h-full flex-col p-[72px] font-sans">
      <Watermark />
      <div className="rounded-[18px] border-[3px] border-[#d5c4a8] p-[56px]" style={{ minHeight: 979 }}>
        <p className="text-center text-[15px] tracking-[0.3em] text-[#756558] uppercase">{issuer}</p>
        <p className="mt-[72px] text-center font-heading text-[46px] leading-tight font-extrabold">Attestation de certification</p>
        <p className="mt-6 text-center text-[20px] text-[#5e5148]">Il est certifié que</p>
        <p className="mt-4 text-center font-heading text-[40px] font-extrabold">{coach.name}</p>
        <p className="mt-6 text-center text-[20px] text-[#5e5148]">a satisfait aux épreuves de la certification</p>
        <p className="mx-auto mt-4 max-w-[560px] text-center text-[30px] leading-tight font-bold">{certLabel(certId)}</p>
        <dl className="mt-[96px] grid grid-cols-2 gap-x-12 gap-y-8 text-[18px]">
          <Field k="Numéro" v={`SPEC-${coach.id.slice(0, 3).toUpperCase()}-${(certId.length * 731) % 10000}`} />
          <Field k="Délivrée à" v={coach.town} />
          <Field k="Date de délivrance" v="Il y a moins d'un mois" />
          <Field k="Validité" v="5 ans" />
        </dl>
        <div className="mt-[96px] flex items-end justify-between">
          <div className="text-[16px] text-[#756558]">
            <p>Le responsable de la certification</p>
            <p className="mt-6 font-heading text-[26px] text-[#2a211c] italic">Signature</p>
          </div>
          <div className="flex size-[120px] items-center justify-center rounded-full border-[3px] border-dashed border-[#d63b27] text-center text-[13px] font-bold text-[#d63b27] uppercase">
            Cachet
            <br />
            fictif
          </div>
        </div>
      </div>
    </div>
  );
}

/** Pièce jointe d'une facture : sa mise en page A4. */
export function InvoicePageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-full p-[56px] text-[17px] [&_table]:text-[16px]">
      <div className="mb-8 flex items-center justify-between">
        <Logo className="h-9" />
        <span className="text-[13px] tracking-[0.2em] text-[#756558] uppercase">Facture électronique · spécimen</span>
      </div>
      {children}
    </div>
  );
}

const Field = ({ k, v }: { k: string; v: string }) => (
  <div>
    <dt className="text-[14px] tracking-wide text-[#756558] uppercase">{k}</dt>
    <dd className="mt-1 font-semibold">{v}</dd>
  </div>
);

function Watermark() {
  return (
    <span className={cn("pointer-events-none absolute inset-0 flex items-center justify-center")} aria-hidden>
      <span className="-rotate-[30deg] font-heading text-[150px] font-extrabold tracking-widest text-[#d63b27]/10">SPÉCIMEN</span>
    </span>
  );
}
