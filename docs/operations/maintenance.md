# Maintenance et exploitation

## Environnements

- **Local** : développement et tests.
- **Preview** : validation par changement ou pull request.
- **Production** : branche protégée et release approuvée.

La production statique est hébergée par GitHub Pages à l’adresse
`https://lucasg0ld.github.io/ATMOS/`. Le workflow `Deploy GitHub Pages` construit
et publie automatiquement la branche `main`. La source Pages du dépôt doit
rester configurée sur **GitHub Actions**.

## Cadence

### À chaque changement

- CI complète, preview et recette ciblée.
- Documentation et changelog si le comportement public change.

### Hebdomadaire pendant développement actif

- Trier défauts et risques.
- Examiner alertes de dépendances et échecs de preview.
- Vérifier dérive du périmètre par rapport au jalon.

### Mensuel ou avant chaque release

- Mises à jour de dépendances par lots contrôlés.
- Audit accessibilité et performance des routes clés.
- Contrôle des liens de crédits et conservation des preuves de licence.
- Test multi-navigateurs et écoute longue.
- Vérification du canal de sécurité et des accès au déploiement.

## Procédure de release

1. Geler le périmètre du jalon et fermer les défauts bloquants.
2. Exécuter lint, typecheck, tests, build et E2E sur installation propre.
3. Vérifier preview : desktop/mobile, clavier, mouvement réduit, erreur média et audio.
4. Mesurer performance et taille des bundles/actifs.
5. Vérifier crédits, licences, `CHANGELOG.md` et documentation.
6. Déployer en production.
7. Effectuer un smoke test depuis un cache vide.
8. Taguer la version lorsque la stratégie de versionnage est active.

Pour le point 4, construire d’abord avec `npm run build`, puis exécuter
`npm run budget:check`, `npm run performance:runtime` et
`npm run performance:lighthouse`. Cette dernière commande audite les cinq routes
en profils mobile et desktop ; une route et un profil peuvent être ciblés, par
exemple `npm run performance:lighthouse -- home mobile`. Les rapports temporaires
sont écrits sous `.cache/`.

`npm run smoke:local` construit et sert automatiquement la candidate sur un port
isolé, puis exécute le même parcours que le smoke de production. Il ne remplace
pas le contrôle HTTPS après déploiement.

## Smoke test production

Exécuter `npm run smoke:production` pour contrôler le parcours public avec un
contexte navigateur neuf et le cache désactivé, puis compléter les vérifications
manuelles ci-dessous.

- Accueil charge sans erreur et affiche l’action principale.
- Route Rainy Apartment directe et retour fonctionnent.
- Image ou fallback, horloge et contrôles sont visibles.
- Play après geste, trois volumes et pause fonctionnent lorsque l’audio est livré.
- Aucune ressource critique en 404, erreur console ou requête vers une origine inconnue.
- Métadonnées, favicon, 404 et headers répondent comme prévu.

## Rollback

Le dernier point de retour validé est le tag annoté `v0.1.0`, commit
`889de88`. Pour un défaut critique après publication de 0.2 :

1. suspendre toute nouvelle fusion ou exécution du workflow Pages ;
2. relancer `Deploy GitHub Pages` avec la référence `v0.1.0` via
   `workflow_dispatch`, puis vérifier l’URL officielle avec un cache vide ;
3. confirmer le retour de l’accueil, de Rainy Apartment, des trois couches audio
   et de la 404 avec le parcours compatible 0.1 ;
4. ouvrir un correctif ou un revert revu vers `main` afin que son prochain
   déploiement ne réintroduise pas 0.2 par inadvertance ;
5. consigner le défaut, son impact, l’heure du rollback et la décision de
   republication.

Ne pas modifier manuellement les fichiers servis par Pages et ne pas déplacer le
tag `v0.1.0`. ATMOS 0.2 ne crée aucune donnée utilisateur ni migration : ce
rollback de code et d’actifs est réversible.

## Mises à jour

- Patchs et mineures : petits lots, revue du changelog amont, tests complets.
- Majeures : branche dédiée ou tranche explicite, guide de migration et ADR si l’architecture change.
- Framework et moteur audio : tests navigateurs renforcés.
- Supprimer les dépendances inutilisées et surveiller l’augmentation du JavaScript client.

## Sauvegarde et récupération

Le code, la documentation et la configuration versionnable vivent dans Git. Le MVP n’a pas de base de données. Les éléments non reproductibles à protéger sont : domaine et DNS, configuration du fournisseur, preuves de licence et fichiers sources originaux. Leur emplacement et responsable devront être définis avant publication.

## Fin de vie d’un actif ou d’une ambiance

- Retirer l’entrée du catalogue sans casser les slugs persistés futurs.
- Prévoir redirection ou 404 intentionnelle selon l’usage.
- Supprimer les chargements et références, puis l’actif uniquement après vérification.
- Conserver crédits et preuve pour les versions historiques.

## Décisions opératoires actuelles

- Production officielle : `https://lucasg0ld.github.io/ATMOS/`.
- Propriétaire du dépôt et responsable du déploiement : LucasG0ld.
- Branche `main` : non protégée selon l’API GitHub le 2026-08-11 ; protection
  ou contrôle équivalent requis avant la fusion 0.2.
- Canal de sécurité : signalement privé de vulnérabilité GitHub actif.
- Preuves de licence : registres versionnés dans `docs/operations/` et
  `ASSET_CREDITS.md` ; emplacement pérenne des originaux externes à confirmer.
- Analytics : absentes du MVP 0.2 ; aucune conservation de données utilisateur.
- Code : propriétaire, `UNLICENSED`, copyright LucasG0ld ; actifs tiers sous
  leurs licences respectives.
- Exécution : Node.js 24 et npm 11, commandes réelles documentées dans le README.
