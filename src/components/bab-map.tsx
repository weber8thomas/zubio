import { motion } from "motion/react";
import type { Point } from "@/data/demo";
import { cn } from "@/lib/utils";

// Carte stylisée Bayonne · Anglet · Biarritz : côte, Adour, Nive. Projection simple (équirectangulaire).
type Box = { n: number; s: number; w: number; e: number };
const AREA: Box = { n: 43.535, s: 43.44, w: -1.61, e: -1.44 };
const W = 400;
const COS = Math.cos((43.49 * Math.PI) / 180);
const height = (b: Box) => Math.round(((b.n - b.s) / ((b.e - b.w) * COS)) * W);

/** Cadre centré sur un point, assez large pour un rayon donné (en km). */
const around = (p: Point, km: number): Box => {
  const dLat = km / 111.32;
  const dLng = (km * 1.25) / (111.32 * COS);
  return { n: p.lat + dLat, s: p.lat - dLat, w: p.lng - dLng, e: p.lng + dLng };
};

function projection(b: Box) {
  const h = height(b);
  const xy = (lat: number, lng: number): [number, number] => [((lng - b.w) / (b.e - b.w)) * W, ((b.n - lat) / (b.n - b.s)) * h];
  const path = (pts: [number, number][]) => pts.map(([lat, lng], i) => `${i ? "L" : "M"}${xy(lat, lng).map((v) => v.toFixed(1)).join(" ")}`).join("");
  return { h, xy, path, km: W / ((b.e - b.w) * 111.32 * COS) };
}

const COAST: [number, number][] = [
  [43.72, -1.43], [43.66, -1.445], [43.6, -1.48], [43.55, -1.514], [43.528, -1.524], [43.515, -1.533], [43.5, -1.541], [43.494, -1.548], [43.488, -1.556],
  [43.484, -1.561], [43.481, -1.567], [43.474, -1.568], [43.462, -1.575], [43.45, -1.585], [43.42, -1.605], [43.39, -1.66], [43.3, -1.75],
];
const ADOUR: [number, number][] = [[43.528, -1.524], [43.526, -1.506], [43.518, -1.49], [43.506, -1.479], [43.497, -1.474], [43.493, -1.463], [43.489, -1.38]];
const NIVE: [number, number][] = [[43.4945, -1.4745], [43.481, -1.468], [43.462, -1.462], [43.4, -1.45]];

const TOWNS = [
  { name: "Bayonne", lat: 43.4775, lng: -1.4555 },
  { name: "Anglet", lat: 43.4745, lng: -1.523 },
  { name: "Biarritz", lat: 43.4655, lng: -1.553 },
];

export type MapPin = Point & { id: string; active?: boolean; color?: string; photo?: boolean };

/**
 * Carte de la côte basque. `venue` est la salle ; les `pins` actifs sont reliés
 * à la salle par un arc (un pont : « zubi » en basque).
 */
export function BabMap({
  venue,
  pins = [],
  radiusKm,
  focusKm,
  className,
}: {
  venue?: Point;
  pins?: MapPin[];
  radiusKm?: number;
  /** Cadre la carte sur la salle, sur ce rayon. */
  focusKm?: number;
  className?: string;
}) {
  const { h: H, xy, path, km: KM } = projection(venue && focusKm ? around(venue, focusKm) : AREA);
  const v = venue && xy(venue.lat, venue.lng);
  const ocean = `${path(COAST)}L-400 ${H + 400}L-400 -400Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn("block h-auto w-full", className)} role="img" aria-label="Carte de Bayonne, Anglet et Biarritz">
      <rect width={W} height={H} fill="var(--map-land)" />
      <path d={ocean} fill="var(--map-sea)" />
      <path d={path(COAST)} fill="none" stroke="var(--map-coast)" strokeWidth={1.5} />
      <path d={path(ADOUR)} fill="none" stroke="var(--map-sea)" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
      <path d={path(NIVE)} fill="none" stroke="var(--map-sea)" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      {TOWNS.map((t) => {
        const [x, y] = xy(t.lat, t.lng);
        return (
          <text key={t.name} x={x} y={y} textAnchor="middle" className="fill-[var(--map-label)] stroke-[var(--map-land)] font-heading text-[11px] font-semibold tracking-wide uppercase [paint-order:stroke] [stroke-width:3px]">
            {t.name}
          </text>
        );
      })}

      {v && radiusKm && (
        <motion.circle
          cx={v[0]}
          cy={v[1]}
          fill="var(--primary)"
          fillOpacity={0.05}
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
          const my = Math.min(y, v[1]) - Math.max(28, Math.hypot(x - v[0], y - v[1]) * 0.4);
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
            {p.active && p.photo ? (
              <>
                <clipPath id={`pin-${p.id}`}>
                  <circle cx={x} cy={y} r={11} />
                </clipPath>
                <circle cx={x} cy={y} r={13} fill="var(--map-land)" />
                <image href={`${import.meta.env.BASE_URL}avatars/${p.id}.jpg`} x={x - 11} y={y - 11} width={22} height={22} clipPath={`url(#pin-${p.id})`} />
                <circle cx={x} cy={y} r={12} fill="none" stroke={p.color ?? "var(--primary)"} strokeWidth={2} />
              </>
            ) : (
              <circle cx={x} cy={y} r={p.active ? 6.5 : 4} fill={p.active ? (p.color ?? "var(--primary)") : "var(--map-pin)"} stroke="var(--map-land)" strokeWidth={2} />
            )}
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
