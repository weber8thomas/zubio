# Scénario de démonstration (5 minutes)

## Comptes de démo

| Rôle | E-mail | Mot de passe |
|---|---|---|
| Salle — Atrium Fitness Bayonne | `salle@zubio.demo` | `zubio-demo-2026` |
| Coach — Maialen Etcheverry | `coach@zubio.demo` | `zubio-demo-2026` |
| Admin — Claire Dufau | `admin@zubio.demo` | `zubio-demo-2026` |

Inutile de les taper : la page **/demo** connecte chaque compte en un clic.

## Préparation (1 minute avant)

- Ouvrez **deux fenêtres** côte à côte : la salle sur ordinateur, le coach sur un téléphone (ou une fenêtre étroite, ou en navigation privée pour avoir deux sessions).
- Fenêtre 1 : `/demo` → **Entrer comme salle**. Fenêtre 2 : `/demo` → **Entrer comme coach**.
- Si la démo a déjà servi, repartez d'une base propre (voir « Remettre la démo à zéro »).

## Déroulé

**0:00 — Le problème, en une phrase.** « Une salle a un coach malade ce soir. Aujourd'hui, elle passe une heure au téléphone. Avec Zubio, 30 secondes. »

**0:20 — La salle publie un créneau** (fenêtre salle)
1. Tableau de bord : créneaux à venir, pourvus, en attente.
2. **Publier un créneau** : Pilates est présélectionné, la date (le lendemain), 18 h 30, 1 h et 45 € sont préremplis. Cliquez **Publier et trouver un coach**.
3. La page du créneau liste les coachs proposés, chacun avec sa raison : « Favori · Diplôme ✓ · < 1 km · disponible ». Ouvrez **Pourquoi les autres coachs ne sont-ils pas proposés ?** : trop loin, indisponible, diplôme non vérifié… Le matching est transparent.

**1:30 — Le coach accepte** (fenêtre coach)
1. L'offre « Pilates · Atrium Fitness Bayonne » apparaît dans **Offres** (en direct).
2. Montrez le tarif, l'équivalent horaire, l'adresse, la raison. Touchez **Accepter**.
3. Le coach arrive sur **Missions** : « Mission confirmée », revenus du mois (simulés).

**2:15 — C'est confirmé côté salle, sans recharger** (fenêtre salle)
- La page du créneau passe à « Confirmé avec Maialen Etcheverry », pourvu en quelques minutes.
- **Facture** : facture d'exemple imprimable, montant de la séance et 15 % de frais de service.

**2:45 — Et si personne ne répond ?**
- Tableau de bord → créneau **Musculation** en attente → **Simuler 10 min sans réponse** : le rayon passe de 10 à 20 km et de nouveaux coachs sont sollicités.
- **Coachs** : catalogue filtrable (discipline, commune, jour) ; l'icône en forme de cœur ajoute un coach aux favoris, qui passent en tête du matching.

**3:30 — Côté coach, en mobile**
- **Dispos** : plages de la semaine, ajout et suppression au doigt.
- **Profil** : diplômes « Vérifié » ou « En attente » (la certification yoga de Maialen attend une validation).

**4:00 — L'admin** (fenêtre salle : se déconnecter, puis **Entrer comme admin**)
- Chiffres clés : créneaux publiés, taux de remplissage, délai moyen de pourvoi.
- **Coachs** → filtre **Diplômes en attente** → **Valider le diplôme** sur la certification yoga de Maialen.
- Sélecteur **Sport / Immobilier** : même cœur, autre métier. Les libellés (Agences, Artisans, Interventions, Justificatifs), les corps de métier et la couleur d'accent changent.

**4:40 — L'assistant**
- Bouton de discussion en bas à droite → **Où en est mon créneau ?** : la réponse est calculée à partir des données du compte connecté, et uniquement les siennes.

**5:00 — Conclusion.** Ce qui est réel : matching, sécurité par compte, temps réel, application installable. Ce qui est simulé (marqué « Démo ») : paiements et factures, revenus, attente de 10 minutes, assistant sans clé Mistral.

## Remettre la démo à zéro

Les dates des données de démo sont calculées au moment du chargement : rechargez-les avant chaque présentation importante.

- En local : `npx supabase db reset`
- Sur le projet hébergé : `npx supabase db reset --linked` (efface la base distante puis réapplique migrations et données de démo ; à réserver au projet de démo).
