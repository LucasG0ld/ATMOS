# Checklist de release — ATMOS 0.1

## État

**Candidate locale prête. Publication bloquée jusqu’à validation de la Gate B.**

## Vérifications automatisées — 2026-08-10

- [x] Formatage, ESLint, TypeScript strict et build Next.js.
- [x] 46 tests unitaires et composants.
- [x] 30 cas Playwright sur cinq profils desktop/mobile : 28 validations et 2 reports clavier WebKit documentés.
- [x] Parcours réel Play/Pause et trois téléchargements audio sous Chromium et Firefox.
- [x] Fallback récupérable lorsque Web Audio ou les trois médias sont indisponibles.
- [x] Aucun fetch audio avant Play.
- [x] Aucun débordement horizontal à 320 × 568 avec mouvement réduit.
- [x] Ordre clavier complet accueil → player → sliders → Play.
- [x] Aucun résultat axe critique ou sérieux sur accueil et player.
- [x] Métadonnées, 404, CSP et en-têtes critiques contrôlés.
- [x] Budgets : 7,8 Kio JS accueil, 50,9 Kio JS player, 6,4 Kio CSS, 40,3 Kio fonts et 1,92 Mio audio.
- [x] `npm audit` et `npm audit --omit=dev` : zéro vulnérabilité connue.
- [x] Références visuelles desktop/mobile archivées.

## Matrice automatisée

| Profil           | Layout, navigation, clavier, axe | Audio réel      | Limite connue                                  |
| ---------------- | -------------------------------- | --------------- | ---------------------------------------------- |
| Chromium desktop | validé                           | validé          | émulation desktop                              |
| Firefox desktop  | validé                           | validé          | émulation desktop                              |
| WebKit desktop   | validé                           | fallback validé | le binaire Windows n’expose pas `AudioContext` |
| Chromium mobile  | validé à 393 px et 320 px        | validé          | émulation tactile                              |
| WebKit mobile    | validé à 390 px et 320 px        | fallback validé | émulation, pas iOS réel                        |

## Gate B — validations manuelles et externes

- [ ] Écoute d’au moins dix minutes : niveaux, jointures, pause/reprise rapide et tonnerre espacé.
- [ ] Safari macOS et Safari iOS réels : Play, MP3, sliders, onglet masqué et reprise.
- [ ] Chrome Android réel : toucher, orientation, safe areas et consommation.
- [ ] Lecteur d’écran desktop et mobile : noms, états Loading/Retry et sliders.
- [ ] Zoom 200 %, texte agrandi et contraste élevé sur les deux routes.
- [ ] Preview HTTPS depuis un cache vide, sans erreur console ni ressource 404.
- [ ] URL de production, propriétaire du domaine et responsable du déploiement renseignés.
- [ ] Canal privé de signalement de sécurité renseigné dans `SECURITY.md`.
- [ ] Core Web Vitals/Lighthouse mesurés sur la preview, puis comparés aux cibles.

## Commande de recette locale

```bash
npm ci
npm run format
npm run lint
npm run typecheck
npm run test
npm run audio:check
npm run build
npm run budget:check
npm run test:e2e
npm run audit:prod
```

Après validation, marquer le Lot 7 terminé, renseigner l’URL de preview, puis taguer `v0.1.0` selon la procédure de maintenance.
