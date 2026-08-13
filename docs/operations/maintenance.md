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
`npm run performance:composer` puis `npm run performance:lighthouse`. La mesure
du compositeur alterne dix mixes et bloque les dépassements de contexte, sources,
listeners, réseau et tas. La dernière commande audite les six routes
en profils mobile et desktop ; une route et un profil peuvent être ciblés, par
exemple `npm run performance:lighthouse -- home mobile`. Les rapports temporaires
sont écrits sous `.cache/`.

Après déploiement, définir `ATMOS_LIGHTHOUSE_URL` avec la racine HTTPS officielle
pour auditer directement la production sans démarrer de serveur local.

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
- Un volume, un favori, le démarrage/annulation du timer et l’entrée/sortie de
  Focus Mode fonctionnent dans le contexte navigateur neuf du smoke.
- Une page masquée ne déclenche pas de suspension volontaire ; le comportement
  après changement d’application ou verrouillage est consigné par appareil.
- Un timer arrivé à échéance en arrière-plan ne reprend jamais brièvement le son
  au retour ; un refus système de reprise laisse une Pause explicitement relançable.
- Aucune ressource critique en 404, erreur console ou requête vers une origine inconnue.
- Métadonnées, favicon, 404 et headers répondent comme prévu.

### Recette de lecture en arrière-plan

Sur desktop, Android réel et iOS réel, démarrer une ambiance puis contrôler
séparément : changement d’onglet, changement d’application pendant 30 à 60
secondes et verrouillage pendant 30 secondes. Noter si le son continue, si l’OS
le suspend et si un Play explicite récupère la session. Enfin, lancer le timer le
plus court, masquer ATMOS avant son terme et confirmer au retour que la session
est en Pause sans reprise transitoire. La continuité après verrouillage reste une
capacité best effort de la plateforme, pas une garantie produit.

## Rollback

Le dernier point de retour validé est le tag annoté `v0.3.0`, commit
`1b481e1`. Pour un défaut critique pendant le développement ou après publication
de 1.0 :

1. suspendre toute nouvelle fusion ou exécution du workflow Pages ;
2. relancer `Deploy GitHub Pages` avec la référence `v0.3.0` via
   `workflow_dispatch`, puis vérifier l’URL officielle avec un cache vide ;
3. confirmer le catalogue, les quatre players, préférences, timer, Focus Mode,
   transitions audio et 404 avec le parcours compatible 0.3 ;
4. ouvrir un correctif ou un revert revu vers `main` afin que son prochain
   déploiement ne réintroduise pas la 1.0 défectueuse par inadvertance ;
5. consigner le défaut, son impact, l’heure du rollback et la décision de
   republication.

Ne pas modifier manuellement les fichiers servis par Pages et ne pas déplacer le
tag `v0.3.0`. La version 0.3 ignore un snapshot V2, revient temporairement aux
préférences par défaut et conserve la valeur sans migration descendante. Cette
compatibilité se vérifie tant que la production sert 0.3 avec
`npm run rollback:check` ; une republication 1.0 la rendrait non probante sans
redéployer d’abord `v0.3.0` sur une URL de contrôle via `ATMOS_ROLLBACK_URL`.

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
- Branche `main` : ruleset `Protect main` actif depuis le 2026-08-11, avec PR,
  historique linéaire et contrôle strict `quality` obligatoires ; fusion par
  squash uniquement.
- Canal de sécurité : signalement privé de vulnérabilité GitHub actif.
- Preuves de licence : registres versionnés dans `docs/operations/` et
  `ASSET_CREDITS.md` ; emplacement pérenne des originaux externes à confirmer.
- Analytics : absentes ; ATMOS conserve localement favoris, volumes et, à partir
  de 1.0, mixes bornés sans transmission.
- Code : propriétaire, `UNLICENSED`, copyright LucasG0ld ; actifs tiers sous
  leurs licences respectives.
- Exécution : Node.js 24 et npm 11, commandes réelles documentées dans le README.
