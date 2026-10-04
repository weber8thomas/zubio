import "maplibre-gl/dist/maplibre-gl.css";
import { setWorkerUrl, type StyleSpecification } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { motion } from "motion/react";
import { use, useEffect, useMemo, useRef } from "react";
import Map, { Layer, type MapRef, Marker, NavigationControl, Source } from "react-map-gl/maplibre";
import type { Point } from "@/data/types";
import { circle } from "@/lib/geo";
import { cn } from "@/lib/utils";

export type MapMarker = Point & {
  id: string;
  kind: "venue" | "coach" | "slot";
  /** coach : id de la photo ; slot : libellé du prix. */
  label?: string;
  state?: "idle" | "active" | "selected";
  tone?: string;
  onClick?: () => void;
};

// MapLibre cherche son worker à côté de son fichier : on le fait empaqueter par Vite.
setWorkerUrl(workerUrl);

const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

// Fond OpenFreeMap (gratuit, sans clé) recoloré aux couleurs Zubio.
const PAINT: [RegExp, Record<string, string>][] = [
  [/^background$/, { "background-color": "#fbf6ec" }],
  [/^water$/, { "fill-color": "#dcebf4" }],
  [/^waterway$/, { "line-color": "#c9dfee" }],
  [/^(park|landcover_wood)$/, { "fill-color": "#e9eedb" }],
  [/^landuse_residential$/, { "fill-color": "#f6eedf" }],
  [/^building$/, { "fill-color": "#efe4d1" }],
  [/casing$/, { "line-color": "#e7dbc6" }],
  [/^highway_(minor|major_inner|motorway_inner|path)/, { "line-color": "#ffffff" }],
  [/^label_|name/, { "text-color": "#5e5148", "text-halo-color": "#fbf6ec" }],
];

let cachedStyle: Promise<StyleSpecification> | null = null;
function zubioStyle() {
  cachedStyle ??= fetch(STYLE_URL)
    .then((r) => r.json() as Promise<StyleSpecification>)
    .then((style) => {
      for (const layer of style.layers) {
        for (const [re, paint] of PAINT) {
          if (!re.test(layer.id)) continue;
          for (const [k, v] of Object.entries(paint)) {
            if (k.split("-")[0] === layer.type || (layer.type === "symbol" && k.startsWith("text"))) {
              (layer as { paint?: Record<string, unknown> }).paint = { ...(layer as { paint?: object }).paint, [k]: v };
            }
          }
        }
      }
      return style;
    })
    // Tuiles injoignables : fond uni, la carte reste utilisable (repères, rayon).
    .catch(() => ({ version: 8, sources: {}, layers: [{ id: "background", type: "background", paint: { "background-color": "#fbf6ec" } }] }) as StyleSpecification);
  return cachedStyle;
}

function bounds(center: Point, km: number): [[number, number], [number, number]] {
  const dLat = km / 111.32;
  const dLng = km / (111.32 * Math.cos((center.lat * Math.PI) / 180));
  return [
    [center.lng - dLng, center.lat - dLat],
    [center.lng + dLng, center.lat + dLat],
  ];
}

/** Carte interactive (MapLibre). Cadre automatiquement le rayon s'il est fourni. */
export default function ZMap({
  center,
  radiusKm,
  markers = [],
  zoomKm = radiusKm ?? 8,
  className,
}: {
  center: Point;
  radiusKm?: number;
  markers?: MapMarker[];
  zoomKm?: number;
  className?: string;
}) {
  const ref = useRef<MapRef>(null);
  const style = useMemo(() => zubioStyle(), []);
  const area = useMemo(() => (radiusKm ? circle(center, radiusKm) : null), [center, radiusKm]);

  useEffect(() => {
    ref.current?.fitBounds(bounds(center, zoomKm * 1.08), { padding: 24, duration: 700 });
  }, [center, zoomKm]);

  return (
    <div className={cn("relative overflow-hidden bg-[#fbf6ec]", className)}>
      <MapWithStyle style={style} innerRef={ref} center={center} zoomKm={zoomKm}>
        {area && (
          <Source id="radius" type="geojson" data={area}>
            <Layer id="radius-fill" type="fill" paint={{ "fill-color": "#d63b27", "fill-opacity": 0.07 }} />
            <Layer id="radius-line" type="line" paint={{ "line-color": "#d63b27", "line-opacity": 0.5, "line-width": 1.5, "line-dasharray": [2, 2] }} />
          </Source>
        )}
        {[...markers]
          .sort((a, b) => rank(a) - rank(b))
          .map((m) => (
            <Marker key={m.id} latitude={m.lat} longitude={m.lng} anchor="center" style={{ zIndex: rank(m) }}>
              <Pin marker={m} />
            </Marker>
          ))}
        <NavigationControl position="top-right" showCompass={false} />
      </MapWithStyle>
      <a
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noreferrer"
        className="absolute right-2 bottom-2 rounded-full bg-card/85 px-2 py-0.5 text-[10px] text-muted-foreground"
      >
        © OpenStreetMap · OpenFreeMap
      </a>
    </div>
  );
}

const rank = (m: MapMarker) => (m.kind === "venue" ? 3 : m.state === "selected" ? 2 : m.state === "active" ? 1 : 0);

function MapWithStyle({
  style,
  innerRef,
  center,
  zoomKm,
  children,
}: {
  style: Promise<StyleSpecification>;
  innerRef: React.RefObject<MapRef | null>;
  center: Point;
  zoomKm: number;
  children: React.ReactNode;
}) {
  const resolved = use(style);
  return (
    <Map
      ref={innerRef}
      mapStyle={resolved}
      initialViewState={{ bounds: bounds(center, zoomKm * 1.08), fitBoundsOptions: { padding: 24 } }}
      attributionControl={false}
      cooperativeGestures
      style={{ position: "absolute", inset: 0 }}
    >
      {children}
    </Map>
  );
}


function Pin({ marker: m }: { marker: MapMarker }) {
  const base = import.meta.env.BASE_URL;
  const tap = m.onClick ? { whileHover: { scale: 1.12 }, whileTap: { scale: 0.95 } } : {};
  if (m.kind === "venue")
    return (
      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="relative block size-6">
        <span className="absolute -inset-3 rounded-full bg-primary/15" />
        <span className="absolute inset-0 rounded-full border-[5px] border-primary bg-white shadow-soft" />
      </motion.span>
    );
  if (m.kind === "slot")
    return (
      <motion.button
        type="button"
        onClick={m.onClick}
        initial={{ scale: 0, y: 6 }}
        animate={{ scale: 1, y: 0 }}
        {...tap}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-bold shadow-lift ring-2 ring-white",
          m.state === "active" ? "bg-primary text-white" : "bg-card text-foreground",
        )}
      >
        {m.label}
      </motion.button>
    );
  return (
    <motion.button
      type="button"
      onClick={m.onClick}
      aria-label="Voir le profil"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 18 }}
      {...tap}
      className={cn(
        "relative block overflow-hidden rounded-full bg-card shadow-lift",
        m.state === "idle" ? "size-7 opacity-70 ring-2 ring-white grayscale" : "size-10 ring-[3px]",
        m.state === "active" && "ring-primary",
        m.state === "selected" && "ring-success",
      )}
    >
      <img src={`${base}avatars/${m.label}.jpg`} alt="" className="size-full object-cover" />
    </motion.button>
  );
}
