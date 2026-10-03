import { useSyncExternalStore } from "react";

// Routage minimal par ancre (#/salle/publier) : fonctionne tel quel sur GitHub Pages.
const read = () => window.location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);

export function useRoute() {
  const hash = useSyncExternalStore(
    (l) => (window.addEventListener("hashchange", l), () => window.removeEventListener("hashchange", l)),
    () => window.location.hash,
  );
  return hash ? read() : [];
}

export function go(path: string) {
  window.location.hash = path;
  window.scrollTo({ top: 0 });
}
