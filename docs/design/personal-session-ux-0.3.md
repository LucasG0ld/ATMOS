# Spécification UX de la session personnelle — ATMOS 0.3

## Intention

Les nouvelles fonctions doivent aider l’utilisateur à rester dans l’ambiance,
pas attirer son attention sur la gestion d’une session. Favori, timer et focus
sont des actions secondaires, lisibles mais moins présentes que Play/Pause et
les volumes.

## Hiérarchie du player

- Play/Pause reste l’action principale et conserve sa position.
- Une ligne légère regroupe `Favorite`, `Timer` et `Focus` sans carte opaque.
- `Atmospheres` reste dans la navigation et ne devient pas une bibliothèque.
- `Preferences` est une action textuelle discrète ouvrant les informations locales et la réinitialisation.
- Sur mobile, les actions peuvent passer sur deux lignes ; aucune n’est cachée derrière un hover.

Les icônes peuvent accompagner le texte, jamais le remplacer pour Timer,
Preferences ou la sortie de Focus Mode. Le favori possède toujours un nom
accessible dynamique même si son libellé visuel est compact.

## Favoris

### Player

- Repos : `Add to favorites`.
- Actif : `Remove from favorites`, avec état `aria-pressed="true"`.
- Le feedback est immédiat et sobre ; aucune animation de récompense, confetti ou toast intrusif.
- Une erreur de stockage n’annule pas l’action en mémoire, mais un message poli indique qu’elle ne sera pas conservée.

### Accueil

Le catalogue garde son ordre éditorial. Une destination favorite reçoit le mot
`Saved` et un indicateur graphique secondaire. Il n’existe ni section dupliquée,
ni tri automatique, ni filtre en 0.3.

Avant l’hydratation, aucun marqueur n’est rendu. Son apparition ne doit pas
modifier la hauteur de la ligne ni provoquer un déplacement du catalogue.

## Timer

### Ouverture

`Timer` ouvre un `<dialog>` léger intitulé `Set a timer`. Les cinq durées sont
des boutons explicites. Si un timer est actif, le dialogue indique l’échéance
relative, propose les cinq remplacements et `Cancel timer`.

### États

| État                  | Présentation et comportement                                       |
| --------------------- | ------------------------------------------------------------------ |
| Absent                | action `Timer`, aucune tâche périodique                            |
| Actif                 | `Timer · mm:ss`, échéance fondée sur l’horloge réelle              |
| Remplacé              | nouvelle durée et annonce polie unique                             |
| Annulé                | retour à `Timer`, audio inchangé                                   |
| Fade final            | état `Ending session…`, Play annule le fade et reprend normalement |
| Terminé               | état Pause, annonce `Timer finished.`, timer supprimé              |
| Contexte audio absent | le timer se termine sans créer de contexte ni jouer de son         |

Le texte visuel peut être actualisé chaque seconde, mais il n’est pas placé dans
une région live. Le titre de l’action expose une minute arrondie lorsque cela
réduit le bruit ; le dialogue peut montrer `mm:ss`.

Le timer mesure le temps mural depuis sa confirmation. Pause ne suspend pas
l’échéance. Cette règle doit être expliquée par le texte court `Ends in…`, sans
documentation permanente dans le player.

Une lecture déjà démarrée continue lorsque la plateforme autorise Web Audio en
arrière-plan. Ce comportement reste best effort : si le système suspend le
contexte, le retour tente une reprise avant échéance. En cas de refus, le player
affiche `Background playback was paused by your device. Press Play to resume.` et
revient à Pause. Après échéance, aucune reprise automatique n’est autorisée.

## Focus Mode

Focus Mode est une composition explicite, pas un écran séparé :

- conserver la scène, l’heure, le titre, Play/Pause et l’état du timer ;
- conserver un bouton textuel `Exit focus` visible dans la safe area ;
- masquer description, sliders, favoris, navigation d’ambiance et préférences ;
- faire réapparaître toute erreur audio récupérable avec son action ;
- ne pas démarrer l’audio, le timer ou le plein écran automatiquement.

L’entrée utilise un fondu de 300–500 ms. La sortie est immédiate ou courte. Avec
`prefers-reduced-motion: reduce`, les deux changements sont immédiats. Le mode ne
requiert pas l’API Fullscreen, afin de conserver navigation et comportement
prévisibles sur mobile.

### Focus et clavier

1. L’activation mémorise le déclencheur.
2. Le focus va sur `Exit focus` après masquage des contrôles secondaires.
3. Tab parcourt uniquement les contrôles encore visibles.
4. `Escape` quitte le mode depuis tout contrôle.
5. La sortie restaure le focus au déclencheur s’il existe encore, sinon à Play/Pause.

## Preferences

Le dialogue `Preferences` contient uniquement :

- `Favorites and volumes are saved on this device.` ;
- l’état `Saved preferences` ou `Nothing saved yet` ;
- l’action destructive mais réversible `Reset saved preferences` ;
- `Close`.

La réinitialisation restaure les volumes du catalogue, retire les favoris et
confirme `Saved preferences reset.` dans une région live polie. Elle ne touche ni
au timer actif, ni à Play/Pause, ni à Focus Mode.

## États dégradés

| Situation                   | Réponse attendue                                                      |
| --------------------------- | --------------------------------------------------------------------- |
| `localStorage` indisponible | session utilisable en mémoire, message non bloquant dans Preferences  |
| JSON invalide               | défauts du catalogue, aucune erreur visible au démarrage              |
| Version inconnue            | défauts, conservation jusqu’à la prochaine action explicite           |
| Quota ou écriture refusée   | état mémoire conservé, annonce polie unique, possibilité de réessayer |
| Couche retirée              | valeur ignorée, autres préférences conservées                         |
| Timer throttlé              | calcul depuis l’échéance absolue au réveil, jamais depuis un compteur |
| Fin pendant onglet masqué   | intention Pause confirmée avant toute reprise audio                   |
| Reprise refusée par l’OS    | Pause, explication non bloquante et nouveau geste Play                |

## Contenu anglais

- `Add to favorites` / `Remove from favorites`
- `Saved`
- `Timer` / `Set a timer` / `Cancel timer`
- `Ends in 24 minutes` / `Ending session…` / `Timer finished.`
- `Focus` / `Exit focus`
- `Preferences` / `Reset saved preferences`
- `Favorites and volumes are saved on this device.`

## Critères de revue du Lot 16

- Les fonctions restent secondaires face à Play/Pause et à l’ambiance.
- Aucun nouvel écran, dashboard, route de bibliothèque ou onboarding n’est nécessaire.
- Chaque état possède une sortie visible, tactile et clavier.
- Timer et Focus Mode restent compréhensibles sans animation ni audio.
- La réinitialisation locale est découvrable sans bannière de consentement.
