# Déploiement pas à pas

Cible : **GitHub** (code et CI) → **Supabase** (base, authentification, temps réel, offre gratuite, région UE) → **Vercel** (application, offre Hobby, fonctions à Paris `cdg1`).

Compter 20 à 30 minutes. Aucune étape ne demande de carte bancaire.

## État à la fin de la session de développement

- Tout le code est commité. Le push vers `https://github.com/weber8thomas/zubio` a été **refusé (HTTP 403)** : l'application GitHub « Claude » n'avait pas accès au dépôt. Les commits sont sur la branche `claude/zubio-showcase-prototype-gwrkmr` de la session.
- Aucun jeton `SUPABASE_ACCESS_TOKEN` ni `VERCEL_TOKEN` n'était disponible : les étapes 2 à 4 sont à faire à la main, comme décrit ci-dessous.

## 1. Pousser le code sur GitHub

Le dépôt `weber8thomas/zubio` existe déjà, vide et **public** : ne commitez jamais de fichier `.env.local`.

Depuis une copie locale du projet :

```bash
git remote add origin https://github.com/weber8thomas/zubio.git   # si « origin » n'existe pas encore
git push -u origin claude/zubio-showcase-prototype-gwrkmr:main      # publie l'historique sur la branche main
```

Pour que Claude puisse pousser lui-même lors d'une prochaine session : connectez GitHub sur https://claude.ai/connect-github et installez l'application Claude sur le dépôt.

La CI (`.github/workflows/ci.yml`) se lance à chaque push et pull request : `npm run lint`, `npm run typecheck`, `npm run build`. Elle n'a besoin d'aucun secret.

## 2. Créer le projet Supabase (région UE)

1. Créez un compte sur https://supabase.com, puis **New project**.
2. Renseignez :
   - **Name** : `zubio`
   - **Database password** : générez-le et gardez-le (gestionnaire de mots de passe).
   - **Region** : **West EU (Paris)** `eu-west-3`, ou Central EU (Frankfurt) à défaut.
   - **Plan** : Free.
3. Une fois le projet prêt, ouvrez **Project Settings → API** (ou **Data API** / **API Keys** selon la version de l'interface) et notez :
   - **Project URL** (`https://<ref>.supabase.co`) → variable `NEXT_PUBLIC_SUPABASE_URL` ;
   - la clé publique **anon** (ou **publishable**) → variable `NEXT_PUBLIC_SUPABASE_ANON_KEY` ;
   - la **référence du projet** `<ref>` (dans l'URL du tableau de bord).
   - La clé **service_role / secret** n'est **pas** nécessaire à l'application : ne la copiez nulle part.

## 3. Appliquer les migrations et les données de démo

Avec la CLI Supabase (incluse dans les dépendances de développement) :

```bash
npm install
npx supabase login                         # ouvre le navigateur ; ou exportez SUPABASE_ACCESS_TOKEN
npx supabase link --project-ref <ref>      # demande le mot de passe de la base
npx supabase db push --include-seed        # schéma, RLS, fonctions, Realtime + données de démo
```

Vérification : dans **Table Editor**, les tables `venues` (18 lignes), `providers` (46) et `slots` (26) sont remplies ; dans **Authentication → Users**, les trois comptes `@zubio.demo` existent.

Sans CLI : ouvrez **SQL Editor**, exécutez dans l'ordre le contenu des trois fichiers de `supabase/migrations/`, puis celui de `supabase/seed.sql`.

Pour remettre la démo à zéro plus tard (dates recalculées) : `npx supabase db reset --linked`. Cette commande efface toute la base distante.

## 4. Déployer sur Vercel

1. Sur https://vercel.com, **Add New → Project**, importez le dépôt GitHub `weber8thomas/zubio` (autorisez l'accès au dépôt si demandé).
2. **Framework** : Next.js (détecté). Laissez les commandes par défaut.
3. **Environment Variables** (pour Production et Preview) :

   | Variable | Valeur |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL de l'étape 2 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clé anon / publishable de l'étape 2 |
   | `NEXT_PUBLIC_SITE_URL` | l'URL Vercel, par exemple `https://zubio.vercel.app` (sans barre finale) |
   | `NEXT_PUBLIC_DEMO_MODE` | `true` (affiche `/demo` et ses boutons de connexion) |
   | `DEMO_PASSWORD` | `zubio-demo-2026` (le mot de passe du seed) |
   | `MISTRAL_API_KEY` | facultatif : active les réponses de l'assistant par l'API Mistral |
   | `MISTRAL_MODEL` | facultatif, `mistral-small-latest` par défaut |

4. **Deploy**. La région des fonctions est fixée à Paris (`cdg1`) par `vercel.json`.
5. Chaque push sur `main` redéploie automatiquement ; chaque pull request obtient une URL de prévisualisation.

Si vous changez l'URL (domaine personnalisé), mettez à jour `NEXT_PUBLIC_SITE_URL` puis redéployez.

## 5. Configurer l'authentification Supabase

Dans **Authentication → URL Configuration** :

- **Site URL** : `https://zubio.vercel.app` (votre URL Vercel).
- **Redirect URLs** : ajoutez `https://zubio.vercel.app/auth/callback`, et pour les prévisualisations `https://*-<votre-compte>.vercel.app/auth/callback`.

C'est nécessaire au **lien magique** des vrais comptes ; les boutons de `/demo` fonctionnent sans.

Le service d'e-mail intégré de Supabase est limité à quelques envois par heure : suffisant pour une démo. Pour un usage plus large, configurez un SMTP dans **Authentication → Emails → SMTP Settings**.

### Ouvrir un vrai compte

Le lien magique ne crée pas de compte (choix de sécurité, voir DECISIONS.md). Pour ajouter une personne :

1. **Authentication → Users → Invite user** (ou **Add user**) avec son e-mail.
2. Dans **SQL Editor**, donnez-lui un rôle et rattachez-la à sa salle ou à sa fiche coach :

```sql
-- Remplacez l'e-mail, le nom et le rôle ('salle', 'coach' ou 'admin').
insert into public.profiles (id, role, full_name)
select id, 'salle', 'Prénom Nom' from auth.users where email = 'prenom@exemple.fr';

-- Salle : rattacher une structure existante à ce compte.
update public.venues set owner_id = (select id from auth.users where email = 'prenom@exemple.fr')
where name = 'Nom de la salle';

-- Coach : rattacher une fiche existante.
-- update public.providers set user_id = (select id from auth.users where email = 'prenom@exemple.fr')
-- where display_name = 'Prénom Nom';
```

## 6. Vérifier

1. Ouvrez `https://<votre-app>.vercel.app/demo` → **Entrer comme salle** : le tableau de bord affiche des créneaux.
2. Suivez le scénario de [DEMO.md](DEMO.md) avec une deuxième fenêtre connectée en coach.
3. Sur mobile, menu du navigateur → **Ajouter à l'écran d'accueil** : l'application s'installe avec l'icône Zubio.

## Limites des offres gratuites

- **Supabase (Free)** : le projet est **mis en pause après 7 jours sans activité**. Avant une démonstration, ouvrez le tableau de bord Supabase et cliquez **Restore project** si nécessaire (une à deux minutes), puis rechargez les données de démo si les dates sont dépassées (`npx supabase db reset --linked`). Autres limites : 500 Mo de base, 2 projets gratuits actifs.
- **Vercel (Hobby)** : réservé à un **usage personnel et non commercial**. Cela convient à une démo partenaire ; une exploitation commerciale demandera l'offre Pro.

## Dépannage

| Symptôme | Cause probable |
|---|---|
| `/demo` affiche « Connexion impossible » | Seed non appliqué, ou `DEMO_PASSWORD` différent du mot de passe du seed |
| `/demo` affiche « DEMO_PASSWORD n'est pas configurée » | Variable absente dans Vercel |
| Le lien magique renvoie vers `localhost` | `Site URL` / `Redirect URLs` Supabase ou `NEXT_PUBLIC_SITE_URL` non mis à jour |
| Pas de mise à jour en direct | Tables absentes de la publication Realtime : réappliquez la 3ᵉ migration ; la page se rafraîchit de toute façon toutes les 15 s |
| Plus aucun créneau à venir | Les dates du seed sont passées : rechargez les données de démo |
