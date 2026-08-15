# Spécification UX de la composition — ATMOS 1.0

## Candidat B3 — Quiet Layers

La révision visuelle testée le 15 août 2026 conserve toutes les limites et
interactions de la version 1.0. Elle masque l'origine répétée lorsqu'un mix ne
contient qu'une seule scène, puis la rétablit sur chaque ligne dès que deux
scènes sont réunies. Les actions Add et Save forment un groupe plus compact,
Save reçoit un contour explicite et les lignes occupent moins de hauteur sans
réduire les sliders ni les cibles tactiles.

## Intention

Composer doit ressembler à l’ajustement calme d’une atmosphère, pas à la
production d’un morceau. L’utilisateur part d’une scène familière, écoute, ajoute
au plus quelques sons et donne un nom au résultat. La bibliothèque reste un
outil ponctuel ; elle ne devient jamais l’écran principal.

## Architecture du parcours

1. Depuis un player, `Create a mix` ouvre le compositeur avec la scène courante.
2. Le compositeur reprend les couches et volumes de cette ambiance.
3. `Add sound` ouvre une bibliothèque regroupée par ambiance.
4. Play permet l’écoute live ; chaque couche garde un slider et une action Remove.
5. `Save mix` demande un nom lors de la première sauvegarde.
6. `Your mixes` permet d’ouvrir, renommer ou supprimer les créations locales.

L’accueil conserve sa mission de sélection d’atmosphère. Il peut exposer une
action textuelle `Your mixes` lorsque la collection n’est pas vide, sans ajouter
de grille, compteur ou bloc promotionnel.

## Composition de l’écran

Le fond, l’overlay, la typographie et les points focaux viennent de la scène
d’origine. La scène est affichée comme contexte, pas comme un champ à configurer.

### Desktop

- En haut : retour, wordmark discret et `Your mixes`.
- Au centre : nom du brouillon ou `Untitled mix`, scène et Play/Pause.
- Dans la zone de contrôle : une liste verticale de une à quatre couches.
- En retrait : `Add sound`, état de sauvegarde et `Save mix`.
- Timer et Focus restent secondaires et ne concurrencent pas Save ou Play.

### Mobile

- Une seule colonne et aucun panneau côte à côte.
- Play, nom et sortie apparaissent avant la liste de couches.
- Les sliders utilisent toute la largeur utile et les actions Remove restent des
  cibles d’au moins 44 × 44 px.
- La bibliothèque utilise un `<dialog>` plein écran visuel avec une sortie dans
  la safe area ; elle ne repose pas sur un geste de glissement.

## Couches actives

Chaque ligne affiche :

- le nom de la couche ;
- son ambiance d’origine en texte secondaire ;
- un slider natif ;
- une action `Remove sound` nommée avec la couche.

Le nom et l’origine empêchent qu’une même étiquette générique devienne ambiguë.
L’ordre correspond à l’ordre d’ajout et reste stable ; la version 1.0 ne propose
pas de réorganisation, car l’ordre n’affecte pas le mix sonore simultané.

Une unique couche restante ne peut pas être retirée avant qu’une autre soit
ajoutée. L’interface explique `A mix needs at least one sound.` au lieu de laisser
une action silencieusement inactive.

## Bibliothèque sonore

Le dialogue `Add a sound` suit l’ordre éditorial des ambiances. Chaque groupe
contient le nom de l’ambiance, puis ses trois couches. Les couches déjà actives
sont marquées `Added` et désactivées. Aucune preview audio ne démarre depuis la
bibliothèque ; l’utilisateur ajoute d’abord, puis utilise le Play principal.

Au quatrième son, l’action devient `Mix full · 4 sounds` et ouvre encore le
dialogue en lecture seule afin d’expliquer la limite et de montrer les choix.
L’utilisateur revient ensuite retirer une couche dans la liste active.

## Nommage et sauvegarde

La première action `Save mix` ouvre un dialogue `Name your mix` avec un champ
texte, un compteur discret et les actions `Cancel` et `Save`. Le focus arrive
dans le champ et revient sur Save après fermeture.

- Une valeur vide ou uniquement composée d’espaces est refusée dans le dialogue.
- Le nom est limité à 40 caractères sans troncature silencieuse.
- Après sauvegarde, un statut poli `Mix saved on this device.` est annoncé.
- Une modification rend visible l’état textuel `Unsaved changes`.
- `Save changes` met à jour le mix courant ; `Save as new` est hors périmètre 1.0.

Quitter ou ouvrir un autre mix avec des changements non sauvegardés ouvre une
confirmation interne `Discard unsaved changes?`. Le navigateur peut avertir lors
d’une fermeture complète, mais ATMOS ne promet pas de récupération de brouillon.

## Your mixes

`Your mixes` est un dialogue ou une vue légère, jamais une grille de cartes. Une
liste verticale expose nom et scène d’origine, puis `Open`, `Rename` et `Delete`
par navigation clavier ordinaire. Les actions secondaires peuvent être regroupées
dans une ligne, mais restent textuelles et explicites sur mobile.

La suppression demande `Delete “{name}”?` puis explique qu’elle ne retire aucun
son du catalogue. Aucun toast de récompense, animation de corbeille ou undo
temporaire n’est ajouté.

## États

| État                  | Présentation et comportement                                       |
| --------------------- | ------------------------------------------------------------------ |
| Nouveau               | `Untitled mix`, couches de la scène, Save disponible               |
| Chargement audio      | contrôles présents, état poli, aucune navigation bloquée           |
| Lecture partielle     | couche en échec marquée, autres couches toujours réglables         |
| Non sauvegardé        | mention textuelle sobre près de Save                               |
| Sauvegardé            | nom stable et confirmation polie unique                            |
| Stockage indisponible | écoute maintenue, Save explique la conservation en mémoire         |
| Limite de couches     | quatre lignes, ajout bloqué avec explication                       |
| Limite de mixes       | édition possible, nouvelle sauvegarde refusée avec solution Delete |
| Données réparées      | couches invalides retirées, message seulement si le mix a changé   |

## Focus Mode et timer

Focus Mode conserve scène, nom du mix, Play/Pause, timer et sortie. Il masque la
bibliothèque, les sliders, Save et `Your mixes` du rendu interactif. Un brouillon
non sauvegardé n’empêche pas d’entrer en Focus Mode et reste intact à la sortie.

Le timer limite la session en cours sans modifier ni sauvegarder le mix. Sa fin
met le compositeur en pause selon le fade 0.3. Un mix rouvert après rechargement
n’hérite d’aucun timer.

## Accessibilité et mouvement

- La liste active est une liste sémantique, pas une table de mixage ARIA personnalisée.
- Les sliders natifs et boutons conservent les styles de focus visibles ATMOS.
- Les dialogues possèdent titre, description courte, fermeture et restauration du focus.
- Les annonces live concernent ajout/retrait, sauvegarde, suppression et erreurs,
  jamais les valeurs pendant le déplacement d’un slider.
- Aucun drag, hover ou double tap n’est requis.
- Le mouvement réduit raccourcit les transitions visuelles, sans supprimer les
  fondus audio fonctionnels.

## Anti-patterns explicites

- console sombre remplie de pistes, vu-mètres ou boutons techniques ;
- grille de presets ou cartes SaaS ;
- icônes seules pour Save, Remove ou Delete ;
- lecture automatique d’une preview au focus ou au survol ;
- panneau permanent de bibliothèque ;
- scène modifiable, waveform, timeline, solo, mute ou effets en 1.0.
