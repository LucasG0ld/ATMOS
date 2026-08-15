# Variante Compositeur B3 — Quiet Layers

**Statut :** candidat à valider, non approuvé comme baseline

**Branche :** `design/revision-foundations`

**Date :** 15 août 2026

**Périmètre :** compositeur desktop et mobile, sans modification audio ou stockage

## Hypothèse

Le compositeur reste compréhensible avec moins de répétitions. L'origine d'une
couche est utile lorsqu'elle distingue plusieurs lieux, mais devient du bruit
lorsque toutes les couches proviennent de la scène courante. Les actions de
composition doivent former un rythme lisible sans ressembler à une barre d'outil.

## Changements proposés

- origine masquée pour un mix mono-scène et rétablie sur toutes les lignes dès
  que deux scènes sont présentes ;
- nom accessible des sliders soumis à la même règle afin d'éviter la répétition
  au lecteur d'écran ;
- lignes légèrement plus compactes, avec cibles tactiles et sliders inchangés ;
- titre et colonne de composition rapprochés sur desktop ;
- bouton Remove placé sur une surface discrète mais perceptible ;
- Add et Save regroupés plus tôt après la dernière ligne ;
- Save reçoit un contour calme et reste secondaire par rapport à Play ;
- retour visible raccourci en `Scene`, avec son nom accessible complet conservé.

## Comparaison

| État                | Desktop 1440 × 900                                      | Mobile 375 × 812                                       |
| ------------------- | ------------------------------------------------------- | ------------------------------------------------------ |
| Baseline mono-scène | [capture](variants/composer-baseline-desktop.png)       | [capture](variants/composer-baseline-mobile.png)       |
| B3 mono-scène       | [capture](variants/composer-b3-desktop.png)             | [capture](variants/composer-b3-mobile.png)             |
| Baseline mixte      | [capture](variants/composer-baseline-mixed-desktop.png) | [capture](variants/composer-baseline-mixed-mobile.png) |
| B3 mixte            | [capture](variants/composer-b3-mixed-desktop.png)       | [capture](variants/composer-b3-mixed-mobile.png)       |

Les captures B3 se régénèrent avec `npm run design:variant:capture`. Les états
baseline restent séparés jusqu'à validation explicite.

## Critères de décision

1. Un mix mono-scène reste compréhensible sans répéter son origine trois fois.
2. Un mix multi-scènes expose sans ambiguïté l'origine de chaque couche.
3. Add, Save et Remove restent découvrables au toucher comme au clavier.
4. L'ordre clavier et toutes les opérations de composition restent inchangés.
5. Aucun contrôle ne déborde à 320 ou 375 px et le zoom 200 % reste utilisable.
6. Le compositeur paraît plus intégré à la scène, sans devenir une DAW.

## Suite si la variante est validée

Promouvoir B3 dans la baseline de révision, mettre à jour la règle d'origine
dans la spécification UX, puis poursuivre avec le système de dialogues B4.
