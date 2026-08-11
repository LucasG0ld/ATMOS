# Sécurité et vie privée

## Modèle de menace du MVP

Le MVP est une application statique sans authentification, backend ou collecte déclarée. Les principales surfaces sont : chaîne de dépendances, médias et fonts, contenu des données d’ambiance, URLs, déploiement, APIs navigateur et futurs contenus persistés dans `localStorage`.

## Principes

- Collecter et transmettre zéro donnée utilisateur par défaut.
- Ne jamais placer de secret dans le bundle, les variables `NEXT_PUBLIC_*` ou le dépôt.
- Réduire dépendances, origines distantes et permissions navigateur.
- Traiter toute donnée externe ou persistée comme non fiable.
- Maintenir dépendances et plateforme avec des mises à jour petites et régulières.

## Données

### MVP 0.1–0.2

Aucune préférence persistée et aucune donnée personnelle requise. L’heure locale est calculée dans le navigateur et n’a pas à être transmise.

### À partir de 0.3

Favoris et volumes peuvent être enregistrés localement dans la clé unique
`atmos.preferences`. La valeur V1 contient uniquement les IDs d’ambiances
favorites et les volumes par IDs d’ambiance/couche. Elle est validée avant usage
et supprimable depuis `Reset saved preferences`. Timer, Play/Pause, Focus Mode,
historique, identifiants personnels, empreinte appareil et données sensibles ne
sont pas stockés.

Le stockage reste local au navigateur et n’est ni transmis ni synchronisé. Un
refus d’accès ou de quota dégrade la session vers un état mémoire sans bloquer le
player. Aucune bannière de consentement n’est nécessaire en l’absence de traceur,
mais l’interface explique clairement la finalité et la méthode de suppression.

Le socle du Lot 17 applique l’accès après montage uniquement, la liste blanche
issue du catalogue, la taille sérialisée maximale de 32 Kio et l’absence de
lecture automatique d’une autre clé. Le Lot 18 expose ces règles dans le dialogue
`Preferences` et son action de reset. Si le stockage est indisponible, un message
non bloquant indique que les changements ne valent que pour la visite courante.

Toute analytics, error tracking ou ressource distante future exige une décision séparée couvrant base légale, consentement éventuel, rétention, sous-traitants et politique publique.

## Frontières et protections

- Valider slugs contre le catalogue ; ne pas transformer une route en chemin fichier libre.
- Autoriser explicitement les origines média si des hôtes distants sont introduits.
- Ne pas rendre du HTML non fiable ; éviter `dangerouslySetInnerHTML`.
- Parser et valider `localStorage` avant usage.
- Configurer des en-têtes adaptés au déploiement : CSP restrictive, `X-Content-Type-Options: nosniff`, politique de referrer, permissions policy minimale et protection de framing selon le besoin.
- Les URLs de source dans les crédits ne sont pas injectées automatiquement dans l’application.

La CSP finale dépendra des sources de fonts, images, audio et du comportement de Next.js. Commencer avec des actifs locaux simplifie la politique.

La candidate 0.1 configure dans `next.config.ts` :

- CSP limitée à l’origine du site pour scripts, styles, fonts, médias et connexions ; `object-src 'none'`, `frame-ancestors 'none'` et `base-uri 'self'` ;
- `unsafe-inline` pour les scripts d’amorçage Next.js et les styles dynamiques locaux ; `unsafe-eval` uniquement en développement ;
- `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, politiques COOP/CORP et referrer restrictive ;
- Permissions Policy désactivant caméra, microphone, géolocalisation et topics publicitaires ;
- cache public court et revalidation pour les pistes versionnées par le dépôt.

HSTS et redirection HTTPS restent à valider sur l’hébergeur réel afin de ne pas casser les environnements locaux. La suite navigateur contrôle la présence des en-têtes critiques et le type MIME audio.

GitHub Pages sert un export statique et ne permet pas de définir les en-têtes
personnalisés de `next.config.ts`. Ceux-ci restent actifs sur un hébergement
Next.js avec serveur, mais ne s’appliquent pas au déploiement Pages. Cette
limitation doit être réévaluée avant d’ajouter des sources distantes, des
données sensibles ou une logique authentifiée.

## Dépendances

- Lockfile versionné et installation figée en CI.
- Vérifier licence, maintenance et vulnérabilités avant ajout.
- Mettre à jour régulièrement par petits lots, avec tests et build.
- Ne pas exécuter aveuglément un correctif majeur automatique.
- Examiner les scripts d’installation de paquets inhabituels.

## Secrets et environnements

Aucun secret attendu au MVP. Si un service est ajouté : variables serveur uniquement, valeurs distinctes preview/production, rotation possible et accès minimal. Documenter les noms dans un fichier d’exemple sans valeur réelle.

## Déploiement

- Protéger les droits du projet et utiliser l’authentification forte du fournisseur.
- Preview pour chaque changement important, production depuis la branche protégée.
- Vérifier headers, source maps, erreurs console et origines réseau avant release.
- Conserver une version précédente déployable pour rollback.

## Réponse à incident

1. Confirmer et limiter l’exposition.
2. Retirer ou désactiver la version affectée si nécessaire.
3. Révoquer les secrets concernés, même s’ils ne devraient pas exister côté client.
4. Corriger, tester et redéployer.
5. Documenter chronologie, impact et prévention.

Le signalement privé de vulnérabilité GitHub est activé et documenté dans `SECURITY.md`.
