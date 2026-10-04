import type { Feature, Polygon } from "geojson";
import { MARKET } from "@/config/market";
import type { Point } from "@/data/types";

export function distanceKm(a: Point, b: Point) {
  const r = (d: number) => (d * Math.PI) / 180;
  const h = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

export const km = (d: number) => (d < 1 ? "< 1 km" : `${Math.round(d)} km`);

/** Polygone GeoJSON approchant un cercle (rayon en km), pour la carte. */
export function circle(center: Point, radiusKm: number, steps = 72): Feature<Polygon> {
  const coords: [number, number][] = [];
  const dLat = radiusKm / 111.32;
  const dLng = radiusKm / (111.32 * Math.cos((center.lat * Math.PI) / 180));
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * 2 * Math.PI;
    coords.push([center.lng + dLng * Math.cos(t), center.lat + dLat * Math.sin(t)]);
  }
  return { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [coords] } };
}

export type Place = Point & { label: string };

/** Autocomplétion d'adresse (API Adresse, gratuite et sans clé). */
export async function searchPlaces(q: string, signal?: AbortSignal): Promise<Place[]> {
  if (q.trim().length < 3) return [];
  const res = await fetch(`${MARKET.geocoder}?q=${encodeURIComponent(q)}&limit=5`, { signal });
  const data = (await res.json()) as { features: { geometry: { coordinates: [number, number] }; properties: { label: string } }[] };
  return data.features.map((f) => ({ label: f.properties.label, lng: f.geometry.coordinates[0], lat: f.geometry.coordinates[1] }));
}

export const inMarket = (p: Point) => distanceKm(p, MARKET.center) <= MARKET.coverageKm;
