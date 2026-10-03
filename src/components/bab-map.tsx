import { motion } from "motion/react";
import type { Point } from "@/data/demo";
import { cn } from "@/lib/utils";

// Carte stylisée Bayonne · Anglet · Biarritz : côte, Adour, Nive. Projection simple (équirectangulaire).
const BOX = { n: 43.535, s: 43.44, w: -1.61, e: -1.44 };
const W = 400;
const H = Math.round(((BOX.n - BOX.s) / ((BOX.e - BOX.w) * Math.cos((43.49 * Math.PI) / 180))) * W);
const KM = W / ((BOX.e - BOX.w) * 111.32 * Math.cos((43.49 * Math.PI) / 180));

const xy = (lat: number, lng: number): [number, number] => [
  ((lng - BOX.w) / (BOX.e - BOX.w)) * W,
  ((BOX.n - lat) / (BOX.n - BOX.s)) * H,
];
const path = (pts: [number, number][]) =>
  pts.map(([lat, lng], i) => `${i ? "L" : "M"}${xy(lat, lng).map((v) => v.toFixed(1)).join(" ")}`).join("");

const COAST: [number, number][] = [
  [43.55, -1.514], [43.528, -1.524], [43.515, -1.533], [43.5, -1.541], [43.494, -1.548], [43.488, -1.556],
  [43.484, -1.561], [43.481, -1.567], [43.474, -1.568], [43.462, -1.575], [43.45, -1.585], [43.43, -1.598],
];
const OCEAN = `${path(COAST)}L0 ${H + 40}L0 -40Z`;
const ADOUR = path([[43.528, -1.524], [43.526, -1.506], [43.518, -1.49], [43.506, -1.479], [43.497, -1.474], [43.493, -1.463], [43.489, -1.44]]);
const NIVE = path([[43.4945, -1.4745], [43.481, -1.468], [43.462, -1.462], [43.44, -1.455]]);

const TOWNS = [
  { name: "Bayonne", lat: 43.4775, lng: -1.4555 },
  { name: "Anglet", lat: 43.4745, lng: -1.523 },
  { name: "Biarritz", lat: 43.4655, lng: -1.553 },
];

export type MapPin = Point & { id: string; label?: string; active?: boolean; color?: string };

/**
 * Carte de la côte basque. `venue` est la salle ; les `pins` actifs sont reliés
 * à la salle par un arc (un pont : « zubi » en basque).
 */
export function BabMap({
  venue,
  pins = [],
  radiusKm,
  className,
}: {
  venue?: Point;
  pins?: MapPin[];
  radiusKm?: number;
  className?: string;
}) {
  const v = venue && xy(venue.lat, venue.lng);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn("block h-auto w-full", className)} role="img" aria-label="Carte de Bayonne, Anglet et Biarritz">
      <rect width={W} height={H} fill="var(--map-land)" />
      <path d={OCEAN} fill="var(--map-sea)" />
      <path d={path(COAST)} fill="none" stroke="var(--map-coast)" strokeWidth={1.5} />
      <path d={ADOUR} fill="none" stroke="var(--map-sea)" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
      <path d={NIVE} fill="none" stroke="var(--map-sea)" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      {TOWNS.map((t) => {
        const [x, y] = xy(t.lat, t.lng);
        return (
          <text key={t.name} x={x} y={y} textAnchor="middle" className="fill-[var(--map-label)] font-heading text-[11px] font-semibold tracking-wide uppercase">
            {t.name}
          </text>
        );
      })}

      {v && radiusKm && (
        <motion.circle
          cx={v[0]}
          cy={v[1]}
          fill="var(--primary)"
          fillOpacity={0.07}
          stroke="var(--primary)"
          strokeOpacity={0.35}
          strokeDasharray="4 5"
          initial={false}
          animate={{ r: radiusKm * KM }}
          transition={{ type: "spring", stiffness: 60, damping: 16 }}
        />
      )}

      {v &&
        pins.filter((p) => p.active).map((p, i) => {
          const [x, y] = xy(p.lat, p.lng);
          const mx = (x + v[0]) / 2;
          const my = Math.min(y, v[1]) - Math.hypot(x - v[0], y - v[1]) * 0.35;
          return (
            <motion.path
              key={`arc-${p.id}`}
              d={`M${v[0]} ${v[1]}Q${mx} ${my} ${x} ${y}`}
              fill="none"
              stroke={p.color ?? "var(--primary)"}
              strokeWidth={2}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.25 + i * 0.12, ease: "easeOut" }}
            />
          );
        })}

      {pins.map((p, i) => {
        const [x, y] = xy(p.lat, p.lng);
        return (
          <motion.g
            key={p.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18, delay: p.active ? 0.3 + i * 0.12 : 0 }}
            style={{ transformOrigin: `${x}px ${y}px` }}
          >
            <circle cx={x} cy={y} r={p.active ? 6.5 : 4} fill={p.active ? (p.color ?? "var(--primary)") : "var(--map-pin)"} stroke="var(--map-land)" strokeWidth={2} />
          </motion.g>
        );
      })}

      {v && (
        <g>
          <circle cx={v[0]} cy={v[1]} r={11} fill="var(--foreground)" stroke="var(--map-land)" strokeWidth={3} />
          <circle cx={v[0]} cy={v[1]} r={3.5} fill="var(--map-land)" />
        </g>
      )}
    </svg>
  );
}
