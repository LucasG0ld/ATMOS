# Variante Player B1 — Immediate Play

**Statut :** candidat à valider, non approuvé pour `main`  
**Branche :** `design/revision-foundations`  
**Date :** 15 août 2026  
**Périmètre :** player catalogue, sans modification du moteur audio

## Hypothèse

Le player devient plus immédiat si son action principale précède les réglages,
si l'horloge cesse de former un pôle concurrent et si le retour vers l'accueil
reste disponible sous une forme moins présente.

Cette variante ne transforme pas ATMOS en lecteur musical : elle ne crée ni
barre persistante, ni waveform, ni contrôles supplémentaires. La scène, le titre
et les trois couches sonores restent visibles.

## Changements proposés

### Tous les viewports

- Play/Pause devient un bouton plein de 56 px de haut et arrive avant les sliders
  dans l'ordre visuel comme dans l'ordre clavier.
- Le libellé décoratif `Audio` disparaît ; l'action et la légende `Sound layers`
  suffisent à nommer la zone.
- L'horloge emploie une échelle plus petite et une teinte plus en retrait.
- Le lien `Back`, redondant avec le wordmark, est retiré. Le retour vers l'accueil
  reste disponible avec le premier lien clavier `ATMOS — Home`, tandis que
  `Atmospheres` conserve le changement direct de scène.

### Mobile

- Play apparaît avant les réglages, sans rendre ceux-ci progressifs ou cachés.
- La navigation tient plus facilement à 375 px et conserve une stratégie de
  retour à la ligne à 320 px.

## Éléments préservés

- initialisation audio uniquement après un geste explicite ;
- mêmes états Play, Loading, Retry et Pause ;
- mêmes destinations, favoris, timer, Focus Mode, volumes et messages d'erreur ;
- cibles tactiles d'au moins 44 px, focus visible et réduction du mouvement ;
- photographie, typographie, contenu et ordre des trois couches.

## Comparaison

| État         | Desktop 1440 × 900                                  | Mobile 375 × 812                                   |
| ------------ | --------------------------------------------------- | -------------------------------------------------- |
| Baseline 1.0 | [capture](../quality/references/player-desktop.png) | [capture](../quality/references/player-mobile.png) |
| Candidat B1  | [capture](variants/player-b1-desktop.png)           | [capture](variants/player-b1-mobile.png)           |

Les captures B1 se régénèrent avec `npm run design:variant:capture`. Elles ne
remplacent pas la baseline avant validation explicite.

## Critères de décision

La variante est retenue si :

1. Play est compris comme première action sans lecture du détail des réglages ;
2. le titre et la scène restent dominants ;
3. le parcours clavier reflète le nouvel ordre visuel ;
4. aucun contrôle n'est coupé à 320 ou 375 px et le zoom 200 % reste utilisable ;
5. les trois couches restent faciles à découvrir et à ajuster ;
6. la navigation simplifiée ne rend pas le retour à l'accueil ambigu.

## Suite si la variante est validée

Mettre à jour la spécification UX et la baseline visuelle, puis poursuivre avec
la variante ciblée de l'accueil mobile. Un rejet restaure la composition 1.0
sans impact sur les données, l'audio ou la persistance.
