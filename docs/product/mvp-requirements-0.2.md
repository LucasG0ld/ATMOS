# Spécification fonctionnelle du MVP 0.2

## Objectif

Transformer ATMOS 0.1 en un catalogue initial de quatre ambiances sans perdre
la simplicité du parcours `Choose → Stay`. L’utilisateur doit pouvoir découvrir,
ouvrir et changer d’environnement sans revenir à une interface de bibliothèque
classique et sans rupture visuelle ou sonore brutale.

La version 0.1 publiée reste la référence de stabilité. Le développement 0.2 se
fait sur la branche `mvp-0.2` et ne rejoint `main` qu’après Gate C.

## Catalogue cible

1. Rainy Apartment — ambiance existante et référence de qualité.
2. Quiet Coffee Shop — matin chaleureux, bois et activité discrète sans voix identifiable.
3. Deep Forest — environnement frais, calme et légèrement mystérieux.
4. Fireplace — soirée d’hiver, chaleur et confort.

Les identités détaillées sont définies dans la
[matrice des ambiances](atmosphere-matrix-0.2.md).

## Inclus

- Accueil éditorial présentant les quatre ambiances.
- Routes statiques `/atmosphere/[slug]` pour chaque entrée du catalogue.
- Preview visuelle au hover et au focus, sans prérequis pour le tactile.
- Navigation entre ambiances depuis le player.
- Identité visuelle, fallback CSS et deux ou trois couches audio par nouvelle ambiance.
- Transition visuelle et sonore lors d’un changement d’ambiance.
- Préchargement mesuré et limité à une ambiance suivante.
- Cache de médias borné, annulation des chargements obsolètes et nettoyage audio.
- États chargement, média partiel, erreur et récupération pour chaque ambiance.
- Recette responsive, clavier, lecteur d’écran et mouvement réduit.

## Exclus

- Recherche, filtres, catégories, tri et route `/library` séparée.
- Favoris, historique, persistance des volumes et synchronisation.
- Timer, Focus Mode et mixes personnalisés.
- Compte, backend, analytics, recommandation ou personnalisation automatique.
- Lecture simultanée volontaire de plusieurs ambiances.
- Vidéo, WebGL, parallaxe complexe et contenu distant requis au runtime.

## Exigences et critères d’acceptation

### FR-201 — Catalogue éditorial

L’accueil présente les quatre ambiances comme des destinations ordonnées, pas
comme des produits dans une grille SaaS.

- Chaque nom est lisible et actionnable sans hover ni animation.
- L’ordre du catalogue vient du registre de données et reste stable.
- Une seule ambiance possède l’état de preview actif à la fois.
- L’accueil conserve la salutation, la question et un espace négatif important.
- Le contenu reste utilisable à 320 px, au zoom 200 % et sans mouvement.

### FR-202 — Accès direct et navigation interne

- Chaque slug connu produit une page statique avec ses métadonnées.
- Un slug inconnu conserve la 404 utile de l’application.
- Le player expose une action discrète `Atmospheres` permettant de choisir une autre ambiance.
- La liste indique l’ambiance courante sans la désactiver pour les technologies d’assistance.
- `Escape`, retour navigateur et historique restent cohérents.
- Le changement met à jour l’URL réelle ; aucun état uniquement client ne remplace le routage.

### FR-203 — Preview

- Hover et focus peuvent prévisualiser thème et média sans déplacer le layout.
- La preview ne charge ni ne joue aucun audio.
- Le tactile ouvre directement la destination ; aucun double tap n’est requis.
- Une image absente laisse le fallback thématique complet.
- La preview est courte ou immédiate avec `prefers-reduced-motion: reduce`.

### FR-204 — Rendu piloté par les données

- Ajouter une ambiance ne demande aucun branchement conditionnel dans l’accueil, le player ou les contrôles.
- Noms, description, thème, visuels et couches sonores viennent du contrat `Atmosphere` validé.
- Slugs et IDs sont uniques ; les chemins média restent locaux et préfixés correctement pour GitHub Pages.
- Les composants n’inventent pas de valeurs par défaut propres à une ambiance.

### FR-205 — Audio par ambiance

- Chaque nouvelle ambiance possède deux ou trois couches indépendantes.
- Aucun fetch audio ne part avant le premier Play de la session.
- Les gains par défaut produisent un mix cohérent sans saturation.
- Une couche indisponible n’arrête pas les autres.
- Les boucles, sources, licences, transformations et niveaux sont documentés.

### FR-206 — Changement d’ambiance

- À l’arrêt, le changement reste visuel et ne déclenche pas l’audio.
- En lecture, l’ambiance courante continue pendant le chargement de la cible.
- Lorsque la cible est prête, les deux bus effectuent un crossfade sans clic ni double contexte.
- L’URL et le contenu éditorial convergent vers la cible même si son audio échoue ; un message récupérable décrit alors l’état.
- Une nouvelle sélection annule proprement une transition obsolète.
- Le mouvement réduit conserve une transition courte d’opacité et un fondu sonore non décoratif.

### FR-207 — Préchargement borné

- Au plus une preview visuelle suivante est préchargée.
- Aucun audio n’est préchargé avant la première activation sonore.
- Après Play, au plus une ambiance suivante peut être préchargée si `Save-Data` est désactivé et si la connexion n’est pas lente.
- Le préchargement est annulable et ne concurrence pas une action explicite.
- Les buffers décodés sont limités à l’ambiance active et à la cible d’un crossfade.

### FR-208 — États dégradés

- Catalogue disponible si une ou plusieurs images échouent.
- Changement de route possible si la preview échoue.
- Transition audio impossible : cible visuelle active, état audio explicite et action Retry.
- Chargement lent : ambiance courante maintenue jusqu’à disponibilité de la cible.
- Erreur totale d’une ambiance : aucune fuite, aucun son doublé et navigation toujours disponible.

### FR-209 — Accessibilité et responsive

- Ordre clavier identique à l’ordre éditorial du catalogue.
- Preview au focus sans vol de focus ni annonce live bavarde.
- Menu d’ambiances nommé, courant annoncé et fermeture prévisible.
- Contrastes, focus, sliders et cibles tactiles conservent les exigences 0.1.
- Les transitions n’empêchent jamais une action et respectent le mouvement réduit.

### FR-210 — Performance et livraison

- Une seule image de preview non active peut être anticipée.
- Le JavaScript initial reste dans les budgets 0.2 documentés.
- Aucune régression supérieure à 10 % des métriques 0.1 sans justification.
- Les quatre routes passent smoke test, axe, Lighthouse et matrice navigateur.
- Tous les médias disposent d’une licence validée avant leur premier commit.

## Parcours critique 0.2

1. Ouvrir l’accueil avec cache froid et identifier les quatre destinations.
2. Parcourir la liste au clavier et vérifier les previews sans requête audio.
3. Ouvrir chaque ambiance directement puis via l’accueil.
4. Lancer une ambiance, régler ses couches et changer d’ambiance pendant la lecture.
5. Enchaîner rapidement deux changements et vérifier annulation, URL et absence de son doublé.
6. Simuler échec image, couche, ambiance complète et connexion lente.
7. Refaire les parcours au toucher, avec lecteur d’écran, zoom 200 % et mouvement réduit.
8. Vérifier les budgets réseau et mémoire avant et après préchargement.

## Sortie du MVP 0.2

La version est publiable lorsque les quatre ambiances sont complètes, qu’une
ambiance s’ajoute sans code spécifique d’UI, que les transitions restent fluides
sur mobile médian et que la [Gate C](../project/gate-c-checklist-0.2.md) est validée.
