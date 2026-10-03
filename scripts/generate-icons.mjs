// Génère favicon, apple-touch-icon et icônes PWA à partir du symbole Zubio.
// Usage : npm run icons:generate
import { writeFile } from "node:fs/promises";
import sharp from "sharp";

const RED = "#D7263D";
const WHITE = "#FFFFFF";

// Symbole dessiné sur une grille de 48 : deux points reliés par un arc (un pont).
const symbol = (color) =>
  `<g fill="${color}" stroke="${color}"><circle cx="11" cy="29" r="6"/><circle cx="37" cy="29" r="6"/><path d="M11 29a13 13 0 0 1 26 0" fill="none" stroke-width="7"/></g>`;

/** Icône carrée : `inset` = part du côté occupée par le symbole. */
function iconSvg({ size, bg, fg, inset, radius = 0 }) {
  const scale = (size * inset) / 48;
  const offset = (size - 48 * scale) / 2;
  const background = bg
    ? `<rect width="${size}" height="${size}" rx="${radius}" fill="${bg}"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${background}<g transform="translate(${offset} ${offset - scale}) scale(${scale})">${symbol(fg)}</g></svg>`;
}

const png = (svg) => sharp(Buffer.from(svg)).png().toBuffer();

/** Fichier .ico contenant des PNG (format accepté par tous les navigateurs actuels). */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const entries = [];
  let offset = 6 + 16 * images.length;
  for (const { size, data } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(entry);
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

const faviconSizes = [16, 32, 48];
const favicon = await Promise.all(
  faviconSizes.map(async (size) => ({
    size,
    // À très petite taille, le symbole occupe presque tout le carré pour rester lisible.
    data: await png(iconSvg({ size, bg: null, fg: RED, inset: 1.05 })),
  })),
);

const outputs = {
  "src/app/favicon.ico": ico(favicon),
  "src/app/icon.svg": Buffer.from(iconSvg({ size: 48, bg: null, fg: RED, inset: 1 })),
  "public/icons/apple-touch-icon.png": await png(iconSvg({ size: 180, bg: RED, fg: WHITE, inset: 0.66 })),
  "public/icons/icon-192.png": await png(iconSvg({ size: 192, bg: WHITE, fg: RED, inset: 0.8, radius: 36 })),
  "public/icons/icon-512.png": await png(iconSvg({ size: 512, bg: WHITE, fg: RED, inset: 0.8, radius: 96 })),
  // Maskable : fond plein, symbole dans la zone sûre (cercle de 80 %).
  "public/icons/icon-maskable-512.png": await png(iconSvg({ size: 512, bg: RED, fg: WHITE, inset: 0.56 })),
};

for (const [path, data] of Object.entries(outputs)) {
  await writeFile(new URL(`../${path}`, import.meta.url), data);
  console.log(`✓ ${path}`);
}
