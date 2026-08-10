# Références visuelles 0.1

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
