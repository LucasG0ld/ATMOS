# Référentiel d’accessibilité

## Cible

Viser WCAG 2.2 niveau AA pour les routes et composants du produit. Les audits automatiques sont nécessaires mais insuffisants ; clavier, zoom, toucher et technologie d’assistance font partie de la recette.

## Structure

- Un `<main>` unique et des landmarks pertinents.
- Hiérarchie de titres logique ; le nom spectaculaire de l’ambiance reste un vrai titre.
- Liens pour naviguer, boutons pour agir, input range pour régler.
- Un lien d’évitement si la navigation devient assez dense pour le justifier.
- L’ordre DOM suit l’ordre de lecture et d’interaction, sans correction artificielle par `tabindex` positif.

## Clavier et focus

- Toute action est disponible au clavier.
- Focus visible avec contraste suffisant sur image, overlay et surface.
- Aucun piège de focus ; `Escape` ferme un panneau futur lorsqu’approprié.
- Après navigation, le focus suit le comportement natif ; tout déplacement programmatique doit répondre à un besoin testé.
- Les éléments masqués visuellement ne restent pas focusables.

## Contrôles

- Boutons icône avec nom accessible décrivant l’action, par exemple `Pause Rainy Apartment`.
- État toggle exposé par texte et, si pertinent, `aria-pressed`.
- Slider natif avec label explicite, bornes et valeur textuelle en pourcentage.
- Disabled uniquement si l’action est réellement impossible ; expliquer une indisponibilité durable.
- Cible tactile minimum 44 × 44 CSS px, avec espace évitant les activations voisines.

## Couleur et contraste

- Texte normal : ratio minimum 4,5:1.
- Grand texte : minimum 3:1 selon la définition WCAG.
- Composants et indicateurs de focus : minimum 3:1 avec les couleurs adjacentes.
- Ne jamais transmettre un état par couleur seule.
- Tester sur le background réel, ses recadrages et le gradient de repli.

## Mouvement

Respecter `prefers-reduced-motion: reduce` :

- supprimer parallaxe et suivi du pointeur ;
- supprimer translations et changements d’échelle non essentiels ;
- raccourcir ou supprimer crossfades longs et blur animé ;
- garder un feedback d’état immédiat et compréhensible.

Aucun contenu ne clignote. Les médias animés futurs nécessitent pause/arrêt si leur mouvement dépasse les seuils applicables.

## Audio

- Aucun son automatique à l’ouverture.
- Play/pause toujours disponible et explicite.
- Le timer ne produit aucun signal sonore obligatoire ; il termine la session par un fade-out.
- L’application ne dépend jamais du son seul pour signaler une erreur ou un état.
- Les volumes peuvent être réglés au clavier et leur valeur est annoncée.

## Images et texte

Un background purement décoratif utilise un alt vide ou du CSS. Une image informative reçoit un texte alternatif concis. Le texte essentiel n’est jamais aplati dans l’image. Le zoom 200 % et l’augmentation de taille de texte ne doivent ni couper les commandes ni imposer un défilement bidimensionnel pour le contenu principal.

## Messages et états asynchrones

- Ne pas annoncer chaque variation de slider dans une région live en plus du contrôle natif.
- Les erreurs de lecture sont associées au contrôle et annoncées poliment.
- Un chargement perceptible expose un état compréhensible sans voler le focus.
- Les décorations et overlays portent `pointer-events: none` et restent absents de l’arbre accessible.

## Checklist de recette

1. Parcourir chaque route avec Tab, Shift+Tab, Enter, Espace et flèches.
2. Vérifier l’ordre, le focus et les noms dans l’arbre d’accessibilité.
3. Tester sliders et play/pause avec lecteur d’écran sur au moins une combinaison desktop et une mobile avant release.
4. Mesurer les contrastes dans les recadrages extrêmes.
5. Tester mouvement réduit, zoom 200 %, texte agrandi et mode contraste élevé lorsque disponible.
6. Exécuter un audit automatique et résoudre toute violation critique ou sérieuse.

## Recette ATMOS 0.2

Le 2026-08-11, la candidate 0.2 a été validée avec lecteurs d’écran desktop et
mobile, zoom navigateur 200 %, texte agrandi et contraste élevé. Les parcours
desktop, Chrome Android réel et Safari iOS réel sont fonctionnels sans problème
signalé. Le mouvement réduit et axe restent couverts par la matrice automatisée.

## Session personnelle 0.3

- Un favori est un bouton toggle avec nom dynamique et `aria-pressed` ; son état ne dépend pas de l’icône seule.
- Le dialogue Timer utilise un titre, un bouton de fermeture et une restauration du focus éprouvés.
- Le compte à rebours n’est pas une région live actualisée chaque seconde ; seules activation, annulation et fin sont annoncées poliment.
- Focus Mode retire les contrôles secondaires de la tabulation et conserve toujours `Exit focus`, Play/Pause, timer et erreurs.
- `Escape` quitte Focus Mode sans intercepter les raccourcis d’une technologie d’assistance hors du contexte de page.
- La réinitialisation des préférences annonce une confirmation unique et ne vole pas le focus.
- Une erreur de stockage n’empêche jamais l’usage en mémoire du player.

Le Lot 19 implémente le dialogue Timer avec cinq boutons textuels, fermeture
native et retour du focus au déclencheur. L’état `Timer · mm:ss` reste du texte
ordinaire ; une région live invisible et polie ne change qu’au démarrage,
remplacement, annulation ou terme. Le dialogue et le parcours clavier passent
axe-core sur les cinq profils Playwright.

Le Lot 19b conserve une dégradation compréhensible lorsque la plateforme refuse
de reprendre un contexte suspendu : la commande revient à Play et un message
annonçable indique qu’un nouveau geste est requis. Aucun changement de visibilité
ne déplace le focus ou ne crée une annonce répétitive.
