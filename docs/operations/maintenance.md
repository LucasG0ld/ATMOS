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

Pour un défaut critique, revenir au déploiement précédemment validé via le fournisseur, puis ouvrir un correctif isolé. Ne pas modifier manuellement des fichiers de production. Les préférences locales futures doivent tolérer un rollback de code ; une migration irréversible exige un plan particulier.

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

## Informations à compléter avant production

- URL de production et propriétaire du domaine.
- Responsables de déploiement et de sécurité.
- Canal privé de vulnérabilité.
- Emplacement des preuves de licence et originaux.
- Politique éventuelle d’analytics et de conservation.
- Commandes réelles de projet et version minimale de Node dans le README.
