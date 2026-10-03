# Décisions prises en autonomie

Chaque choix non précisé dans la demande est noté ici, avec sa raison.

## Socle

- **Next.js 16 (App Router)**, version stable courante au moment du développement. Conséquences : le middleware s'appelle désormais `src/proxy.ts`, `cookies()`/`params` sont asynchrones, `next lint` n'existe plus (on lance `eslint` directement).
- **Tailwind CSS v4** : la configuration se fait en CSS (`@theme` dans `src/app/globals.css`), il n'y a plus de `tailwind.config.ts`. Les couleurs y sont déclarées comme variables CSS puis exposées à Tailwind (`bg-accent`, `text-muted`, `border-line`…).
- **Types de base générés** par `supabase gen types` (`src/lib/database.types.ts`, commande `npm run db:types`) plutôt qu'écrits à la main.
- **Vérification des types** : `npm run typecheck` = `next typegen && tsc --noEmit` (les types de routes `PageProps<…>` sont générés par Next).

## Données et sécurité

- **Noms de tables génériques** (`venues`, `providers`, `slots`, `offers`, `credentials`…) avec une colonne `vertical` : le cœur reste réutilisable ; « salle », « coach », « diplôme » sont des libellés de la verticale sport. Les rôles en base restent `admin`, `salle`, `coach`, comme demandé.
- **Aucune utilisation de la clé `service_role` à l'exécution.** Tout passe par la session de l'utilisateur et la RLS. Les opérations qui touchent plusieurs propriétaires (un coach qui accepte → le créneau de la salle passe « pourvu ») sont des fonctions SQL `SECURITY DEFINER` (`accept_offer`, `decline_offer`) qui imposent `auth.uid()`. La clé `service_role` n'est donc nécessaire qu'aux outils (CLI Supabase), jamais dans l'application. C'est plus sûr qu'un client « admin » côté serveur.
- **Le catalogue des coachs est lisible par toutes les salles** (profil public, compétences, statut des diplômes, disponibilités) : c'est nécessaire au matching et au catalogue. Les missions d'un coach chez d'autres salles ne sont exposées que sous forme de plages occupées (`provider_busy_ranges`), sans le nom de la salle.
- **Un coach voit une salle** uniquement si elle lui a proposé un créneau.
- **Colonnes protégées** : un coach ne peut pas modifier sa note ni son compteur de missions ; un diplôme déclaré est toujours « en attente », seul l'admin le valide ; l'attribution d'un coach à un créneau passe exclusivement par `accept_offer`.
- **Lien magique sans création de compte** (`shouldCreateUser: false`) : les vrais comptes sont créés par l'équipe (voir DEPLOY.md). Cela évite qu'un inconnu obtienne un rôle.
- **Mot de passe des comptes de démo** : il est public (le dépôt l'est et le seed le contient). C'est assumé pour une démo ; il se change via `DEMO_PASSWORD` + `npm run seed:generate`.
- **Dates du seed relatives à `now()`** : la démo reste à jour quel que soit le jour où la base est initialisée.

## Métier

- **Tarif d'un créneau** = rémunération totale de la séance ; **tarif minimum du coach** = taux horaire. Le matching compare le taux horaire équivalent.
- **Justificatifs exigés** : chaque compétence déclare des groupes de justificatifs (tous les groupes requis, un seul justificatif par groupe suffit). Exemple sport : pilates = certification Pilates **ou** BPJEPS AF. Exemple immobilier : plomberie = Kbis **et** décennale.
- **Un diplôme expiré** est traité comme absent.
- **Score sur 100** : favori 40, note 40, proximité 20. Les favoris passent toujours en tête.
- **5 propositions maximum** par publication ; « Simuler 10 min sans réponse » ajoute 10 km au rayon de recherche (plafonné à 50 km) et relance le matching sans re-solliciter les coachs déjà contactés.
- **Commission de 15 %** sur la facture d'exemple (configurable dans `src/config/brand.ts`).
- **Jours ISO** (1 = lundi … 7 = dimanche) et fuseau `Europe/Paris` pour les disponibilités.

## Interface

- **Le sélecteur de verticale s'applique à l'espace admin**, là où la réutilisabilité est montrée au partenaire. Les comptes de démo salle et coach restent sport.
- **Accent de la verticale immobilier : vert sapin `#1F6F5C`** (ni violet, ni bleu électrique, contraste AA sur blanc).
- **Textes des badges succès/attente** dans des teintes plus foncées (`#17723A`, `#8A5300`) que les couleurs de statut, pour atteindre le contraste AA sur fond clair. Les couleurs `#1E8E3E` et `#C77700` restent utilisées pour les pastilles et icônes.
- **Logotype vectorisé** (contours d'Archivo ExtraBold, interlettrage −3 %) : le logo ne dépend pas du chargement de la police.
- **Favicon** : symbole seul, agrandi à 16 px pour rester lisible ; icône maskable sur fond rouge plein.
