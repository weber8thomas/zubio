import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// BASE_PATH="/zubio/" en déploiement GitHub Pages (voir .github/workflows/pages.yml).
export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  // La carte (MapLibre) est un gros module, chargé à part et seulement à l'affichage.
  build: { chunkSizeWarningLimit: 1200 },
});
