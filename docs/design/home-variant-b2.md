# Variante Accueil B2 — Breathing Index

**Statut :** candidat à valider, non approuvé comme baseline

**Branche :** `design/revision-foundations`

**Date :** 15 août 2026

**Périmètre :** accueil mobile jusqu'à 640 px ; desktop inchangé

## Hypothèse

L'accueil mobile évoque davantage une destination si la question et l'index sont
séparés par une pause visible, et si chaque réponse reste concise. Les quatre
ambiances doivent néanmoins demeurer compréhensibles et accessibles sans hover,
carrousel ni première pression de preview.

## Changements proposés

- pause verticale plus ample entre le contexte éditorial et l'index ;
- lignes ramenées à une hauteur minimale de 88 px ;
- index `01–04` visibles à 320 comme à 375 px ;
- micro-descriptions propres au catalogue, limitées à 64 caractères dans le
  registre validé ;
- titres légèrement réduits pour laisser respirer l'image et les séparateurs ;
- aucune translation horizontale de la ligne active sur écran tactile.

Les descriptions complètes restent présentes sur desktop et dans chaque player.
L'ordre, les liens, les favoris, la preview clavier/souris et le préchargement
visuel ne changent pas.

## Comparaison

| État        | Desktop 1440 × 900                                | Mobile 375 × 812                                 |
| ----------- | ------------------------------------------------- | ------------------------------------------------ |
| Baseline    | [capture](../quality/references/home-desktop.png) | [capture](../quality/references/home-mobile.png) |
| Candidat B2 | [capture](variants/home-b2-desktop.png)           | [capture](variants/home-b2-mobile.png)           |

Les captures du candidat se régénèrent avec
`npm run design:variant:capture`. Elles restent séparées de la baseline jusqu'à
validation explicite.

## Critères de décision

1. La scène est perceptible comme un lieu, et pas seulement comme un fond.
2. Les quatre destinations sont compréhensibles sans image et sans interaction.
3. Chaque lien reste une cible tactile d'au moins 44 px.
4. L'index tient sans débordement à 320 et 375 px, ainsi qu'au zoom 200 %.
5. L'ordre clavier, les favoris et les previews restent inchangés.
6. Desktop ne subit aucun changement de composition.

## Suite si la variante est validée

Promouvoir B2 dans la baseline, marquer la description courte comme règle du
catalogue mobile, puis poursuivre avec la variante du compositeur.
