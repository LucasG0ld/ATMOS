# Variante Dialogues B4 — Quiet Dialogues

**Statut :** validé comme nouvelle baseline des dialogues

**Branche :** `design/revision-foundations`

## Intention

Faire comprendre la profondeur d'interface avant même de lire le contenu, tout
en conservant la scène comme contexte. B4 ne remplace ni les dialogues natifs,
ni leurs flux, ni leurs restaurations de focus.

## Grammaire proposée

| Format         | Usage                                | Desktop                                      | Mobile                                    |
| -------------- | ------------------------------------ | -------------------------------------------- | ----------------------------------------- |
| Court centré   | nommage, suppression, abandon, reset | largeur bornée et actions nettement séparées | carte centrée avec marge sûre             |
| Panneau centré | Timer, Preferences                   | surface moyenne, scène encore perceptible    | carte centrée ; aucun plein écran inutile |
| Étendu         | bibliothèque sonore, liste des mixes | surface large et scroll interne              | plein écran fonctionnel avec safe areas   |

Le menu `Atmospheres`, déjà jugé abouti, reste inchangé. La bibliothèque et les
mixes conservent leur capacité longue ; les confirmations ne prennent plus leur
géométrie. Le bouton destructif devient explicite sans introduire de rouge ni de
dramatisation étrangère à ATMOS.

## Ajustements associés

- Le Timer mobile adopte une grille `2 + 2 + 1`, sans cellule vide implicite.
- L'action de reset disparaît lorsque rien n'est enregistré localement.
- Les déclencheurs qui ouvrent toujours un dialogue annoncent `aria-haspopup`.
- Les contrastes renforcés, le mouvement réduit et le focus natif restent pris
  en charge.

## Captures candidates

| État            | Desktop                                                 | Mobile                                                 |
| --------------- | ------------------------------------------------------- | ------------------------------------------------------ |
| Nommage         | [capture](variants/dialog-b4-name-mix-desktop.png)      | [capture](variants/dialog-b4-name-mix-mobile.png)      |
| Liste des mixes | [capture](variants/dialog-b4-your-mixes-desktop.png)    | [capture](variants/dialog-b4-your-mixes-mobile.png)    |
| Suppression     | [capture](variants/dialog-b4-delete-mix-desktop.png)    | [capture](variants/dialog-b4-delete-mix-mobile.png)    |
| Bibliothèque    | [capture](variants/dialog-b4-sound-library-desktop.png) | [capture](variants/dialog-b4-sound-library-mobile.png) |
| Preferences     | [capture](variants/dialog-b4-preferences-desktop.png)   | [capture](variants/dialog-b4-preferences-mobile.png)   |
| Timer           | [capture](variants/dialog-b4-timer-desktop.png)         | [capture](variants/dialog-b4-timer-mobile.png)         |

Les captures se régénèrent avec `npm run design:variant:capture`.

## Critères de décision

1. Le format du dialogue correspond à la quantité et à la durée du contenu.
2. Nommage et confirmation paraissent centrés, calmes et immédiatement lisibles.
3. Bibliothèque et mixes utilisent correctement l'espace mobile sans déborder.
4. Les actions secondaires et principales restent distinctes à 320 px et au
   zoom 200 %.
5. La grille Timer mobile paraît volontaire et conserve cinq grandes cibles.
6. La scène reste perceptible derrière les formats non expansifs.

## Décision

B4 a été validée manuellement le 15 août 2026. Les six états rejoignent les
références visuelles officielles et la grammaire est inscrite dans le design
system. Cette validation clôture l'étape B de la révision.
