# Références visuelles

Ces captures figent la composition de référence après l'assainissement visuel,
la validation du Player B1 et celle de l'Accueil mobile B2 le 15 août 2026. Elles
utilisent Chromium, une date fixe au 2026-08-10 à 20:07, le mouvement réduit et
les actifs locaux.

## Desktop — 1440 × 900

- [Accueil](references/home-desktop.png)
- [Player Rainy Apartment](references/player-desktop.png)

## Mobile — 375 × 812

- [Accueil](references/home-mobile.png)
- [Player Rainy Apartment](references/player-mobile.png)

Régénérer après une modification visuelle intentionnelle avec :

```bash
npm run visual:capture
```

Une différence n’est acceptée qu’après vérification desktop/mobile. Ces fichiers servent de référence de revue ; les contrôles comportementaux restent dans Playwright afin d’éviter une dépendance excessive aux différences de rastérisation entre systèmes.

## Compositeur — Baseline B3

Les deux états figent la règle d'origine conditionnelle : aucune répétition pour
un mix mono-scène, puis une origine visible sur chaque couche lorsqu'un second
lieu est ajouté.

| État         | Desktop 1440 × 900                                 | Mobile 375 × 812                                  |
| ------------ | -------------------------------------------------- | ------------------------------------------------- |
| Mono-scène   | [référence](references/composer-desktop.png)       | [référence](references/composer-mobile.png)       |
| Multi-scènes | [référence](references/composer-mixed-desktop.png) | [référence](references/composer-mixed-mobile.png) |

## Dialogues — Baseline B4

Les références couvrent les formats court, centré et étendu, ainsi que les
états localement vide et enregistré de Preferences.

| État            | Desktop 1440 × 900                                       | Mobile 375 × 812                                        |
| --------------- | -------------------------------------------------------- | ------------------------------------------------------- |
| Nommage         | [référence](references/dialog-name-mix-desktop.png)      | [référence](references/dialog-name-mix-mobile.png)      |
| Liste des mixes | [référence](references/dialog-your-mixes-desktop.png)    | [référence](references/dialog-your-mixes-mobile.png)    |
| Suppression     | [référence](references/dialog-delete-mix-desktop.png)    | [référence](references/dialog-delete-mix-mobile.png)    |
| Bibliothèque    | [référence](references/dialog-sound-library-desktop.png) | [référence](references/dialog-sound-library-mobile.png) |
| Preferences     | [référence](references/dialog-preferences-desktop.png)   | [référence](references/dialog-preferences-mobile.png)   |
| Timer           | [référence](references/dialog-timer-desktop.png)         | [référence](references/dialog-timer-mobile.png)         |

## Identités 1.0

Les captures suivantes figent les visuels générés, leurs recadrages responsive,
les overlays et les états audio actifs de la version 1.0.

| Ambiance          | Desktop 1440 × 900                                    | Mobile 375 × 812                                     |
| ----------------- | ----------------------------------------------------- | ---------------------------------------------------- |
| Rainy Apartment   | [référence](references/player-desktop.png)            | [référence](references/player-mobile.png)            |
| Quiet Coffee Shop | [référence](references/quiet-coffee-shop-desktop.png) | [référence](references/quiet-coffee-shop-mobile.png) |
| Deep Forest       | [référence](references/deep-forest-desktop.png)       | [référence](references/deep-forest-mobile.png)       |
| Fireplace         | [référence](references/fireplace-desktop.png)         | [référence](references/fireplace-mobile.png)         |

### Revue créative

- Rainy Apartment : pluie crédible sur la baie, refuge urbain bleu nuit et lampe chaude sans spectaculaire météorologique.
- Quiet Coffee Shop : chaleur matinale, matériaux crédibles, tasse non marquée et espace calme conservé.
- Deep Forest : profondeur froide, chemin lisible, absence d’effet fantasy et masse sombre suffisante pour le texte.
- Fireplace : feu intégré à une pièce vécue, palette retenue, aucune décoration saisonnière ou composition publicitaire.
- Les quatre variantes mobiles conservent le sujet, les contrôles et le titre sans débordement à 320 px.
- La pluie décorative est désormais déclarée par les données et reste réservée à Rainy Apartment.
