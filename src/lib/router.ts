import { useSyncExternalStore } from "react";

// Routage minimal par ancre (#/salle/publier) : fonctionne tel quel sur GitHub Pages.
const read = () => window.location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);

// Chaque nouvelle page s'ouvre en haut (le navigateur garderait sinon la position de la précédente).
if (typeof window !== "undefined") {
  history.scrollRestoration = "manual";
  window.addEventListener("hashchange", () => window.scrollTo({ top: 0, behavior: "instant" }));
}

export function useRoute() {
  const hash = useSyncExternalStore(
    (l) => (window.addEventListener("hashchange", l), () => window.removeEventListener("hashchange", l)),
    () => window.location.hash,
  );
  return hash ? read() : [];
}

export function go(path: string) {
  window.location.hash = path;
}
