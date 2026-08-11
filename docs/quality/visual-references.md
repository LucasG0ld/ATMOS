# Références visuelles

Ces captures figent la composition approuvée après la Gate A et le raccordement audio. Elles utilisent Chromium, une date fixe au 2026-08-10 à 20:07, le mouvement réduit et les actifs locaux.

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

## Identités 0.2 — Lot 11

Les captures suivantes figent les visuels générés, leurs recadrages responsive,
les overlays et les fallbacks approuvés le 2026-08-10.

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
