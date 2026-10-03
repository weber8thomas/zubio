# PLAN — prototype showcase Zubio

## Contexte

Dépôt vide (`/home/user/zubio`, branche `claude/zubio-showcase-prototype-gwrkmr`, aucun commit). Objectif : démo partenaire mobile d'abord reliant salles de sport et coachs (Bayonne / Anglet / Biarritz), parcours bout en bout : **salle publie un créneau → matching → coach accepte → confirmé des deux côtés**, avec espaces admin / salle / coach, déployable sur GitHub + Supabase + Vercel gratuits.

Environnement constaté : Node 22, npm 10, `gh` + `GH_TOKEN` présents, PostgreSQL 16 local (`/usr/lib/postgresql/16`), Docker binaire présent, Chromium Playwright dans `/opt/pw-browsers`, Google Fonts et npm joignables. **Pas** de `SUPABASE_ACCESS_TOKEN`, `VERCEL_TOKEN` ni `MISTRAL_API_KEY` → déploiement Supabase/Vercel documenté dans `DEPLOY.md`, agent support en mode réponses préparées.

Mode autonome : aucune question à l'utilisateur ; chaque choix non spécifié est consigné dans `DECISIONS.md`.

## Architecture

```
src/
  core/        types.ts (Slot, Provider, Offer, statuts), geo.ts (haversine),
               availability.ts, matching.ts (filtres + score + raison), vertical.ts (type VerticalConfig)
  verticals/   sport/index.ts (disciplines, diplômes, libellés, accent #D7263D)
               immobilier/index.ts (corps de métier, justificatifs, libellés, accent)
               index.ts (registre + getVertical depuis cookie)
  config/      brand.ts (nom, slogan, couleurs, chemins logo), demo.ts (comptes démo)
  lib/supabase/ server.ts, client.ts, admin.ts (service_role, import "server-only"), middleware.ts
  lib/auth.ts  requireRole(role) — lit profiles.role côté serveur, redirige sinon
  lib/validation.ts  schémas zod (créneau, dispo, profil, chat)
  app/         (public) /, /demo, /connexion, /auth/callback
               /salle (tableau de bord, /publier, /creneaux/[id], /coachs, /factures/[id])
               /coach (offres, /missions, /disponibilites, /profil)
               /admin (chiffres, /salles, /coachs, sélecteur verticale)
               /api/support (route POST de l'agent)
               manifest.ts → /manifest.webmanifest
  components/ui/  Button, Card, Badge, Field/Input/Select, BottomTabs, AdminNav,
                  PageHeader, StatTile, EmptyState, DemoTag, Logo, SupportChat
public/brand/  logo-full.svg, logo-symbol.svg, logo-white-on-red.svg, logo-mono-black.svg
public/icons/  icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png ; app/favicon.ico
supabase/      config.toml, migrations/0001_schema.sql, 0002_rls.sql, 0003_functions_realtime.sql, seed.sql
scripts/       generate-seed.mjs (données → seed.sql), generate-icons.mjs (sharp), screenshots.mjs (Playwright)
```

Stack : Next.js (dernière stable, App Router, TS, Tailwind v4 via `@theme` + variables CSS), `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `lucide-react`, `next/font/google` (Archivo, Atkinson Hyperlegible). Dev : `playwright`, `sharp`, `supabase` CLI (npx). `vercel.json` → `regions: ["cdg1"]`.

## Modèle de données (noms génériques, le métier vient de la verticale)

- `profiles` (id → auth.users, `role app_role` : admin | salle | coach, full_name)
- `venues` (salles/agences : owner_id nullable, name, commune, address, lat, lng, vertical)
- `providers` (coachs/artisans : user_id nullable unique, display_name, bio, commune, lat, lng, radius_km, min_rate_cents, rating, vertical)
- `provider_skills` (provider_id, skill) · `credentials` (provider_id, kind, label, status verified|pending, expires_on)
- `availabilities` (provider_id, weekday, start_time, end_time) · `favorites` (venue_id, provider_id)
- `slots` (venue_id, skill, starts_at, ends_at, rate_cents, status open|filled|cancelled|done, search_radius_km, assigned_provider_id, published_at, filled_at)
- `offers` (slot_id, provider_id, score, reason, status pending|accepted|declined|expired, responded_at)

**RLS sur toutes les tables**, fonctions `security definer` `is_admin()`, `current_role()`, `my_provider_id()`, `owns_venue(id)` :
- admin : tout ; salle : ses venues, ses slots, les offers de ses slots, favoris ; lecture du catalogue providers/skills/credentials/dispos (nécessaire au matching et au catalogue — consigné) ; coach : son provider, ses dispos/diplômes/skills, ses offers, les slots et venues liés à ses offers.
- `accept_offer(offer_id)` / `decline_offer(offer_id)` en `security definer` vérifiant `auth.uid()` = coach de l'offre, transaction atomique (offre acceptée, autres expirées, slot `filled`). Coach ne peut jamais modifier un slot directement.
- `slots` et `offers` ajoutés à la publication `supabase_realtime`.
- `service_role` utilisé uniquement dans `lib/supabase/admin.ts` (`server-only`), pour l'insertion des offres issues du matching.

## Matching (`src/core/matching.ts`)

Fonction pure `matchProviders(slot, venue, candidates, ctx)` :
1. Éliminatoires : compétence, diplôme requis `verified` et non expiré, distance ≤ min(rayon coach, rayon de recherche du créneau), disponibilité hebdo couvrant l'horaire (Europe/Paris) sans mission en conflit, `min_rate ≤ tarif`.
2. Classement : favori de la salle, note, distance.
3. Raison lisible : « Favori · Diplôme ✓ · 4 km · disponible ». Retourne aussi les exclus avec motif (utile admin/debug, non affiché si inutile).
Publication → server action : zod, `requireRole('salle')`, insert slot, matching, insert des 5 meilleures offres. « Simuler 10 min sans réponse » : rayon +10 km, relance du matching hors coachs déjà sollicités, badge « Démo ».

## Données de démo (`scripts/generate-seed.mjs` → `supabase/seed.sql`)

Comptes `auth.users` + `auth.identities` (pgcrypto) : `admin@zubio.demo`, `salle@zubio.demo`, `coach@zubio.demo`, mot de passe démo commun (public, consigné). 15 salles, 40 coachs fictifs (noms français réalistes, Bayonne/Anglet/Biarritz, coordonnées réelles + léger décalage), disciplines pilates, yoga, cross-training, cours collectifs, musculation, aquagym ; diplômes BPJEPS AF, CQP ALS, DEUST, certifs Pilates/Yoga, BNSSA (aquagym), certains en attente ; ~20 créneaux à dates relatives à `now()` dans tous les statuts ; offres associées. Verticale immobilier : 3 agences, 6 artisans, quelques créneaux. Le compte coach démo est compatible avec un créneau publiable par la salle démo (parcours garanti).

## Design

Tokens `:root` (`--red #D7263D`, `--red-hover #B51E31`, `--red-50 #FDECEE`, `--bg #FFF`, `--surface #FAFAFA`, `--text #111`, `--text-2 #5F6368`, `--border #E8E8E8`, `--success #1E8E3E`, `--warning #C77700`, `--accent` remplaçable) exposés dans `@theme`. Archivo titres / Atkinson texte, 16 px, interligne 1.6. Cartes 12 px, boutons 10 px, bordures 1 px, une seule ombre légère (barre d'onglets / chat flottant). Aucun dégradé, flou, emoji, violet. Lucide `strokeWidth 1.75`, 20 px. Bottom tabs (≤4) salle et coach sur mobile, sidebar ≥768 px ; menu simple admin. Cibles ≥44 px, `inputMode`/`type` adaptés, labels partout, focus visible, AA.
Logo SVG à la main : deux disques pleins reliés par un arc épais (pont) en rouge + « zubio » Archivo gras, `letter-spacing -0.03em` (texte vectorisé pour ne pas dépendre de la police). Icônes PNG générées par `sharp`, favicon testé à 16 px.

## Organisation du travail

Je garde le socle (étapes 1–4 : projet, design system, schéma/RLS, auth) dans la session principale pour fixer les conventions. Ensuite, délégation **séquentielle** à des subagents `general-purpose` quand le lot est autonome : un agent à la fois, avec le contexte précis (fichiers, conventions, critères), puis relecture de son diff, lint/typecheck/build et commit par moi avant de lancer le suivant. Candidats : espace salle (5), espace coach (6), espace admin + verticale immobilier (7), agent support (8). Le contrôle visuel (9) et la livraison (10) restent dans la session principale.

## Étapes d'exécution (lint + `tsc --noEmit` + build + commit après chacune)

1. `PLAN.md`, `DECISIONS.md` ; `create-next-app` ; `.gitignore` (`.env*` sauf `!.env.example`), `.env.example` ; CI `.github/workflows/ci.yml` (npm ci, lint, typecheck, build avec variables factices) ; remote `origin`.
2. Design system : tokens, polices, `brand.ts`, logos SVG, icônes/manifest PWA, composants `ui/`.
3. Migrations + RLS + fonctions + seed. **Vérif** : appliquer sur PostgreSQL 16 local avec un schéma `auth` minimal simulé ; tester RLS via `set role authenticated` + `request.jwt.claims` (coach ne voit pas les offres d'un autre, salle pas les slots d'une autre, admin tout, `accept_offer` refusé à un autre coach).
4. Auth : middleware `@supabase/ssr`, `/demo` (3 boutons → `signInWithPassword` en server action), `/connexion` lien magique, `/auth/callback`, `requireRole`, déconnexion.
5. Espace salle : tableau de bord, publier (<30 s, valeurs par défaut intelligentes), détail créneau avec propositions + Realtime, catalogue filtrable, simulation 10 min, facture imprimable (`@media print`, commission 15 % consignée, « Facture d'exemple – aucun paiement »).
6. Espace coach : offres (accepter/refuser 1 geste), missions + revenus du mois (« Démo »), disponibilités éditables, profil + badges diplômes.
7. Espace admin : chiffres clés (créneaux publiés, taux de remplissage, délai moyen published→filled), listes salles/coachs, « Valider le diplôme », sélecteur Sport/Immobilier (cookie → libellés, métiers, `--accent`).
8. Agent support : bouton flottant + panneau ; `/api/support` : user lu depuis la session, ~10 FAQ par mots-clés, « où en est mon créneau » via requêtes RLS de l'utilisateur ; si `MISTRAL_API_KEY`, appel `https://api.mistral.ai/v1/chat/completions` avec le contexte calculé serveur (le modèle ne choisit jamais d'identifiant), repli sur réponses préparées en cas d'erreur.
9. Contrôle visuel : stack locale pour E2E — tenter `npx supabase start` (Docker) ; à défaut, Postgres 16 local + binaires GoTrue/PostgREST/Realtime derrière un petit proxy dans le scratchpad (hors dépôt). `scripts/screenshots.mjs` : captures 375 et 1280 px de chaque page principale dans `docs/screenshots/`, examen visuel, corrections ; Lighthouse mobile (Chromium `/opt/pw-browsers`) accessibilité ≥ 90 sur `/demo`, `/salle`, `/coach`.
10. Docs et livraison : `README.md`, `DEPLOY.md` (projet Supabase UE, clés, `supabase link` + `db push` + seed, variables Vercel, URL de redirection `https://<app>.vercel.app/auth/callback`, pause Supabase 7 jours, Hobby non commercial), `DEMO.md` (scénario 5 min + comptes), `DECISIONS.md` final. Push : `git push -u origin claude/zubio-showcase-prototype-gwrkmr`, puis les mêmes commits sur `main` comme demandé explicitement dans la mission (dépôt vide, branche de prod Vercel). Pas de PR.

## Critères de réussite / vérification

- `npm install && npm run dev` démarre ; `npm run lint`, `npm run typecheck`, `npm run build` passent localement et en CI.
- Migrations + seed s'appliquent sans erreur ; tests RLS manuels ci-dessus OK ; aucune occurrence de `SUPABASE_SERVICE_ROLE_KEY` dans un fichier client (`grep` sur `.next/static`).
- E2E manuel (Playwright) sur la stack locale : connexion salle démo → publier → offres affichées avec raison → connexion coach démo → accepter → créneau « Pourvu » côté salle (mise à jour en direct) et mission côté coach.
- Aucun `src/core/**` ne contient « sport »/discipline métier (`grep`).
- Captures 375/1280 présentes dans `docs/screenshots/`, sans défilement horizontal ; Lighthouse accessibilité ≥ 90.
- Aucun secret commité (`git grep` sur clés/JWT avant push).
