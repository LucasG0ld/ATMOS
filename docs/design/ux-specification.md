# Spécification UX

## Modèle mental

ATMOS propose deux espaces simples :

- **Choose** : l’accueil aide à choisir une ambiance.
- **Stay** : le player laisse vivre, écouter et ajuster l’ambiance.

La navigation ne doit pas introduire des notions de playlist, piste, album ou studio. Une ambiance est un environnement ; ses sons sont des éléments discrets de cet environnement.

## Architecture de l’information

### MVP 0.1

```text
/
└── Rainy Apartment → /atmosphere/rainy-apartment
                       └── retour accueil
```

### Évolution prévue

```text
/
├── /atmosphere/[slug]
├── /library
├── /saved
└── /about
```

Seules les routes du MVP doivent être exposées dans la navigation initiale.

## Parcours 1 — Découvrir et entrer

1. L’utilisateur arrive sur `/`.
2. Il perçoit le wordmark, la salutation et la question principale.
3. Rainy Apartment est présenté comme destination, pas comme une carte de produit générique.
4. Au focus ou au hover, un changement discret confirme l’interactivité.
5. L’activation navigue immédiatement ; la transition embellit le changement sans le retarder.

Le libellé doit suffire sans image. Une preview ne doit pas produire de déplacement important du contenu.

La salutation rend d’abord le texte neutre `Hello.` côté serveur et au premier rendu client, puis adopte l’heure locale après hydratation. Ce fallback évite d’afficher une période de journée incorrecte et stabilise le HTML initial.

## Parcours 2 — Ajuster et écouter

1. Le player affiche d’abord le contexte : heure, titre, description.
2. Les trois sons et le contrôle principal apparaissent dans le même ordre visuel et clavier.
3. L’utilisateur peut régler une valeur avant de lancer l’audio.
4. Play déclenche l’initialisation audio après le geste explicite.
5. Pause réduit progressivement le master ; Resume revient aux valeurs précédentes.

Une valeur de couche à zéro signifie muet pour cette couche sans la confondre avec la pause globale.

## Structure du player

### Desktop

- Canvas plein écran avec background couvrant.
- Wordmark/navigation dans la zone supérieure.
- Horloge, titre et description dans une zone éditoriale dominante.
- Réglages regroupés dans une colonne légère, sans carte opaque massive.
- Contrôle principal proche des réglages.
- Espace négatif conservé entre contexte et contrôles.

### Mobile

- Hauteur minimum fondée sur `100dvh`, sans supposer une hauteur fixe.
- Contenu critique dans la zone sûre ; navigation et play facilement atteignables.
- Réglages en bloc inférieur intégré ou panneau léger si nécessaire, jamais cachés par défaut dans le MVP.
- Défilement vertical autorisé sur petits écrans et au zoom ; aucune information essentielle ne doit être coupée.

Les breakpoints sont choisis selon le contenu, pas selon un appareil particulier. Les états de référence à vérifier sont 320 px, 375 px, 768 px, 1024 px et 1440 px, portrait et paysage lorsque pertinent.

## Matrice des interactions

| Élément     | Repos            | Hover           | Focus clavier             | Actif                          | Désactivé / erreur                          |
| ----------- | ---------------- | --------------- | ------------------------- | ------------------------------ | ------------------------------------------- |
| Destination | lisible          | preview douce   | contour net et non masqué | transition                     | reste navigable si seul le média manque     |
| Slider      | nom + piste      | piste éclaircie | valeur visible + focus    | valeur visible, pouce accentué | contraste maintenu, raison exposée          |
| Play/pause  | action explicite | contraste accru | focus visible             | icône et libellé cohérents     | indisponible pendant erreur non récupérable |
| Navigation  | discrète         | opacité accrue  | focus visible             | feedback immédiat              | sans objet                                  |

Le hover est un enrichissement. Toute action reste compréhensible au toucher et au clavier.

## Slider accessible

Privilégier un `<input type="range">` stylé. Un composant ARIA personnalisé n’est acceptable que si le natif empêche réellement la direction visuelle et si l’ensemble des interactions clavier est réimplémenté et testé.

- Pas de mise à jour via React à chaque frame si le navigateur peut gérer l’interaction fluidement.
- Valeur visible au focus, au drag et après un changement clavier pendant un court délai.
- Valeur annoncée comme pourcentage.
- Cible tactile généreuse autour d’une piste visuellement fine.

L’implémentation du prototype conserve un `<input type="range">` natif de 0 à 100 avec un pas de 1. La valeur visuelle apparaît au hover ou tant que le contrôle possède le focus ; `aria-valuetext` expose simultanément le pourcentage. Les volumes restent indépendants et locaux jusqu’au raccordement du moteur audio.

## Horloge

L’horloge est décorative dans son échelle mais informative dans son contenu. Pour éviter un rendu serveur incohérent, le composant réserve l’espace avec une valeur masquée et non exposée à l’accessibilité, puis affiche l’heure locale côté client selon la locale du navigateur. Sa mise à jour est alignée sur le changement de minute. Elle ne doit pas être annoncée à chaque minute par un lecteur d’écran ; utiliser un texte normal sans région `live`.

## Chargement et erreurs

### Background

Le gradient de thème est rendu avant l’image. L’arrivée de l’image utilise un fondu. En cas d’échec, aucun message intrusif : le gradient reste la composition de repli.

### Audio

- Avant lecture : aucun spinner permanent.
- Après Play : feedback de chargement uniquement si le délai devient perceptible.
- Échec récupérable : message court, par exemple « Sound couldn’t start. Try again. » avec action.
- Autoplay bloqué : rester en pause et inviter à activer le son, sans boucle de tentative.
- Couche absente : désactiver uniquement sa commande et laisser les autres fonctionner.

## Mouvement

Le mouvement traduit une continuité, jamais une récompense ludique.

- Entrée de page : fondu et translation de faible amplitude.
- Changement d’ambiance futur : baisse de luminosité, crossfade du média et du thème, puis titre.
- Interaction : 120–240 ms environ.
- Composition : 400–800 ms environ, à valider en contexte.
- Courbes : décélération douce ; éviter ressort, rebond et overshoot.
- Mouvement réduit : changements d’opacité courts ou immédiats, aucun suivi de souris ni blur animé.

## Contenu

Le texte de l’interface est anglais, bref, calme et concret.

### Vocabulaire recommandé

- `Good morning.` / `Good afternoon.` / `Good evening.`
- `What atmosphere do you need today?`
- `Rainy Apartment`
- `A quiet evening while the city disappears behind the rain.`
- `Play`, `Pause`, `Back`, `Try again`

Éviter les superlatifs, les promesses de productivité et les explications de fonction visibles en permanence.

## Focus Mode futur

Le mode masque progressivement les contrôles non essentiels mais ne piège jamais le clavier. L’heure, le nom, play/pause et une manière évidente de quitter restent accessibles. La réapparition ne dépend pas uniquement du mouvement de souris : focus, toucher et touche `Escape` sont aussi gérés.
