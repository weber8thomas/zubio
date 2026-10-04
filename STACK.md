# Stack technique

Vitrine 100 % statique : pas de serveur ni de base de données, tout tourne dans le navigateur et se publie sur GitHub Pages.

| Domaine | Choix | Version | Rôle dans Zubio |
|---|---|---|---|
| Build | Vite + `@vitejs/plugin-react` | 8.3 · 6.1 | Serveur de dev, build statique, chemin de base `/zubio/` |
| Langage | TypeScript | 6.0 | Typage strict, vérifié par `tsc -b` |
| Interface | React | 19.2 | Composants, `useSyncExternalStore` pour l'état |
| Styles | Tailwind CSS (+ tw-animate-css) | 4.3 | Jetons de marque en variables CSS (`@theme inline`) |
| Composants | shadcn/ui sur Radix UI, cva, clsx, tailwind-merge | 4.21 · 1.6 | Boutons, dialogues, curseurs, interrupteurs… |
| Animations | Motion | 14 | Transitions de page, `layoutId`, apparitions décalées |
| Icônes | Lucide | 1.51 | Pictogrammes des cours, statuts et navigation |
| Polices | Unbounded + Onest Variable (Fontsource) | 5.3 | Titres et texte, auto-hébergées |
| Carte | MapLibre GL + react-map-gl, tuiles OpenFreeMap | 6.12 · 8.1 | Carte interactive recolorée, sans clé, chargée à la demande |
| Géocodage | api-adresse.data.gouv.fr | — | Adresses et « me localiser » |
| Dates | date-fns + react-day-picker | 4.4 · 10.0 | Calendrier en français, créneaux jusqu'à 3 mois |
| Recherche, retours | cmdk + sonner | 1.1 · 2.0 | Sélecteur de cours, notifications |
| État | Store maison + `localStorage` | — | Créneaux, candidatures, factures (`src/lib/store.ts`) |
| Routage | Routeur par ancre maison | — | `#/salle/...`, retour contextuel et position de défilement (`src/lib/router.ts`) |
| Documents | HTML A4 imprimable, XML Factur-X/CII (EN 16931), CSV, `.ics` | — | Factures électroniques, export comptable, agenda |
| Appli installable | Manifeste web + service worker | — | Installation sur mobile, secours hors ligne |
| Qualité | oxlint, `tsc -b`, Playwright | 1.81 · 6.0 · 1.63 | Lint, types, tests de parcours et captures |
| Hébergement | GitHub Pages via GitHub Actions | — | Publication à chaque push sur `main` (`.github/workflows/pages.yml`) |

## Données et contenus

| Contenu | Source |
|---|---|
| Salles | Réelles : noms, adresses géocodées, couleurs et logos repris de leurs sites. Démo, salles non partenaires. |
| Photos de couverture | Unsplash (licence Unsplash), illustratives |
| Portraits de coachs | randomuser.me |
| Coachs, créneaux, avis, chiffres | Fictifs |

## Organisation du code

```
src/config/      zone de lancement, paramètres de facturation
src/data/        catalogue des cours, salles, coachs, avis, identités des salles
src/lib/         store, routeur, matching, facturation, fiscalité, dates, géo
src/components/  kit d'interface, sélecteurs, carte, profils, documents, factures
src/views/       espaces Salle, Coach, Admin, publication, facturation
public/          logos Zubio, portraits, photos et logos des salles, icônes, manifeste
```

## Commandes

```bash
npm install
npm run dev       # développement
npm run build     # types + build statique dans dist/
npm run lint      # oxlint
npm run preview   # sert le build
```
