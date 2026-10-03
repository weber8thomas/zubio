// Captures des pages principales à 375 px (mobile) et 1280 px (ordinateur) dans docs/screenshots.
// Prérequis : base de démo initialisée (seed) et application lancée (npm run build && npm start).
// Usage : BASE_URL=http://localhost:3000 npm run screenshots
// Chromium : celui de Playwright, ou un binaire désigné par CHROMIUM_PATH.
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import sharp from "sharp";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = new URL("../docs/screenshots/", import.meta.url);
const OPEN_SLOT = "40000000-0000-4000-8000-000000000001";
const FILLED_SLOT = "40000000-0000-4000-8000-000000000004";

const PAGES = {
  public: [
    ["accueil", "/"],
    ["demo", "/demo"],
    ["connexion", "/connexion"],
  ],
  salle: [
    ["salle-tableau-de-bord", "/salle"],
    ["salle-publier", "/salle/publier"],
    ["salle-creneau", `/salle/creneaux/${OPEN_SLOT}`],
    ["salle-coachs", "/salle/coachs"],
    ["salle-facture", `/salle/factures/${FILLED_SLOT}`],
  ],
  coach: [
    ["coach-offres", "/coach"],
    ["coach-missions", "/coach/missions"],
    ["coach-disponibilites", "/coach/disponibilites"],
    ["coach-profil", "/coach/profil"],
  ],
  admin: [
    ["admin-vue-ensemble", "/admin"],
    ["admin-prestataires", "/admin/prestataires"],
    ["admin-structures", "/admin/structures"],
  ],
};

const VIEWPORTS = [
  ["mobile", { width: 375, height: 812 }],
  ["desktop", { width: 1280, height: 800 }],
];

/** Capture pleine page, compressée en PNG à palette pour garder le dépôt léger. */
async function capture(page, file) {
  await page.addStyleTag({ content: PIN_FIXED_TO_PAGE });
  const image = await page.screenshot({ fullPage: true });
  await sharp(image).png({ palette: true, quality: 90 }).toFile(new URL(file, OUT).pathname);
  console.log(`✓ ${file}`);
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({
  args: ["--lang=fr-FR"],
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
});

// En capture pleine page, les éléments fixes (onglets, bouton d'aide) sont ramenés en bas de page.
const PIN_FIXED_TO_PAGE = "body { position: relative; } .fixed { position: absolute !important; }";

for (const [device, viewport] of VIEWPORTS) {
  for (const [space, pages] of Object.entries(PAGES)) {
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: device === "mobile" ? 2 : 1,
      locale: "fr-FR",
      timezoneId: "Europe/Paris",
    });
    const page = await context.newPage();
    if (space !== "public") {
      await page.goto(`${BASE}/demo`);
      await page.getByRole("button", { name: new RegExp(`Entrer comme ${space}`) }).click();
      await page.waitForURL(`**/${space}`);
    }
    for (const [name, path] of pages) {
      await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      if (overflow) console.warn(`⚠ défilement horizontal : ${name} (${device})`);
      await capture(page, `${name}-${device}.png`);
    }
    if (space === "admin") {
      await page.goto(`${BASE}/admin`);
      await page.getByRole("button", { name: "Immobilier" }).click();
      await page.waitForLoadState("networkidle");
      await capture(page, `admin-immobilier-${device}.png`);
      await page.getByRole("button", { name: "Sport" }).click();
      await page.waitForLoadState("networkidle");
    }
    await context.close();
  }
}

await browser.close();
