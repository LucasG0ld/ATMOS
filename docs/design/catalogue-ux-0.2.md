# Spécification UX du catalogue — ATMOS 0.2

## Intention

Le catalogue n’est ni une bibliothèque dense ni une page marketing. Il prolonge
la question « What atmosphere do you need today? » par quatre réponses éditoriales.
Le choix doit rester calme, lisible et immédiat.

## Accueil

### Baseline B2 — Breathing Index

La révision mobile validée le 15 août 2026 conserve le registre et les
interactions ci-dessous, mais emploie une micro-description déclarée dans chaque
ambiance, réaffiche les index `01–04` et augmente la pause visuelle entre la
question et la liste. Les descriptions complètes restent utilisées sur desktop
et dans le player. B2 ne masque aucune destination et ne demande jamais une
première pression de preview.

### Composition

- Conserver wordmark, salutation et question principale.
- Afficher une liste verticale numérotée `01–04` dans l’ordre du registre.
- Donner plus de présence à l’ambiance active sans réduire les autres à des miniatures.
- Maintenir une seule scène de fond, pilotée par la preview courante.
- Éviter cartes répétitives, badges, catégories, pagination et carrousel.

### Interaction

- Repos : Rainy Apartment initialise la preview sans être sélectionnée au clavier.
- Hover : la destination survolée devient la preview après une intention courte.
- Focus : la destination focalisée devient immédiatement la preview.
- Toucher : une pression navigue ; aucune étape de preview obligatoire.
- Sortie de liste : conserver la dernière preview plutôt que faire clignoter le fond.
- Activation : commencer la baisse de luminosité puis naviguer sans bloquer le lien.

La preview ne modifie pas le titre principal, ne déclenche pas d’annonce live et
ne charge jamais l’audio. Le nom du lien suffit à comprendre la destination.

## Player — navigation `Atmospheres`

Le header ajoute un bouton discret `Atmospheres`. Il ouvre une liste verticale
superposée à la scène, avec :

- titre `Atmospheres` ;
- quatre liens réels ;
- index, nom et indication `Current` accessible ;
- fermeture par bouton, `Escape`, activation ou retour navigateur pertinent ;
- focus initial sur l’ambiance courante et retour du focus au déclencheur à la fermeture.

Le panneau ne masque pas Play/Pause de façon irréversible et n’emploie pas de
termes `playlist`, `track` ou `library`. Sur mobile, il occupe la largeur utile et
respecte les safe areas. Sur desktop, il conserve une marge laissant percevoir la scène.

## Séquence de changement

```text
Choix de la cible
  → verrou logique de la transition
  → baisse légère de la scène courante
  → navigation vers l’URL cible
  → préparation visuelle et, si nécessaire, audio cible
  → crossfade des scènes et des bus audio
  → titre cible net
  → libération des ressources précédentes
```

- Durée visuelle cible : 500–700 ms.
- Crossfade audio cible : 800–1 200 ms, ajusté après écoute.
- L’ambiance courante continue si l’audio cible charge lentement.
- Une nouvelle intention remplace la cible précédente sans empiler les transitions.
- Si la cible audio échoue, terminer la navigation visuelle et afficher Retry.
- Mouvement réduit : opacité courte, aucun blur animé ; le fondu audio reste actif.

## Préchargement perçu

- Accueil : le fallback de chaque destination est disponible dans les données ; au plus une image suivante anticipée.
- Player avant Play : aucune requête audio.
- Player après Play : une seule cible probable peut être téléchargée en arrière-plan selon les règles réseau.
- Une action explicite est toujours prioritaire et annule le préchargement obsolète.

Le préchargement ne doit jamais changer un état visible, annoncer un chargement
ou empêcher l’utilisateur de sélectionner une autre ambiance.

## États

| État                  | Comportement attendu                                                         |
| --------------------- | ---------------------------------------------------------------------------- |
| Preview prête         | thème et média changent sans déplacement                                     |
| Preview indisponible  | fallback CSS cible, lien toujours actif                                      |
| Cible audio en charge | scène courante audible, feedback discret après délai perceptible             |
| Couche cible absente  | crossfade des couches disponibles, slider concerné indisponible              |
| Cible audio en échec  | scène et URL cibles, état Retry, aucun son précédent résiduel après décision |
| Sélection rapide      | seule la dernière cible gagne, requêtes et graphes obsolètes nettoyés        |

## Accessibilité

- Liste structurée et liens natifs ; boutons réservés à ouverture/fermeture.
- Focus visible sur toutes les scènes et couleurs.
- `aria-current="page"` pour l’ambiance active.
- Aucun focus déplacé pendant une simple preview.
- L’ouverture du panneau suit un modèle de dialogue ou popover accessible testé ; aucun composant ARIA artisanal sans nécessité.
- Le changement d’URL fournit le nouveau titre de document ; une annonce supplémentaire n’est ajoutée que si les tests lecteurs d’écran montrent un manque.

## Critères de revue du Lot 10

- Parcours complet souris, clavier et toucher sans double action.
- Quatre destinations compréhensibles sans image.
- Pas de saut de layout pendant les previews.
- Retour, historique et URL directe cohérents.
- Aucun audio chargé depuis l’accueil ou avant le premier Play.
