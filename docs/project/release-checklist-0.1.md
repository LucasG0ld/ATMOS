# Checklist de release — ATMOS 0.1

## État

**Candidate locale prête. Publication bloquée jusqu’à validation de la Gate B.**

## Vérifications automatisées — 2026-08-10

- [x] Formatage, ESLint, TypeScript strict et build Next.js.
- [x] 47 tests unitaires et composants.
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
- [x] Smoke test de production à cache désactivé : accueil, player, trois couches audio, pause et 404 personnalisée sans erreur console ou réseau.

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
- [ ] Safari macOS réel : Play, MP3, sliders, onglet masqué et reprise.
- [x] Safari iOS réel : fonctionnel, aucun problème rencontré lors de la recette utilisateur.
- [x] Chrome Android réel : fonctionnel, aucun problème rencontré lors de la recette utilisateur.
- [ ] Lecteur d’écran desktop et mobile : noms, états Loading/Retry et sliders.
- [x] Zoom 200 % : fonctionnel, aucun problème rencontré lors de la recette utilisateur.
- [ ] Texte agrandi et contraste élevé sur les deux routes.
- [x] Production HTTPS depuis un cache vide, sans erreur console ni ressource critique en 404.
- [x] URL de production officielle : `https://lucasg0ld.github.io/ATMOS/` ; propriétaire du dépôt et responsable du déploiement : LucasG0ld.
- [x] Signalement privé de vulnérabilité GitHub activé et renseigné dans `SECURITY.md`.
- [x] Lighthouse 13.4.1 mesuré sur accueil et player, mobile et desktop, puis comparé aux cibles.

## Mesures de production — 2026-08-10

| Route / profil  | Performance | Accessibilité | Bonnes pratiques | SEO | LCP   | TBT    | CLS   |
| --------------- | ----------: | ------------: | ---------------: | --: | ----- | ------ | ----- |
| Accueil mobile  |          99 |           100 |              100 | 100 | 1,8 s | 90 ms  | 0,005 |
| Accueil desktop |         100 |           100 |              100 | 100 | 0,4 s | 0 ms   | 0,004 |
| Player mobile   |          99 |           100 |              100 | 100 | 2,0 s | 110 ms | 0     |
| Player desktop  |         100 |           100 |              100 | 100 | 0,4 s | 0 ms   | 0     |

Mesures de laboratoire, cache froid et throttling Lighthouse. Elles ne remplacent pas les données terrain, indisponibles avant un trafic suffisant.

La partie automatisable et distante de Gate B est validée. iOS, Android et le zoom 200 % sont également validés. L’écoute longue, Safari macOS, les technologies d’assistance, le texte agrandi et le contraste élevé restent ouverts dans la [fiche de recette Gate B](gate-b-manual-test.md).

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
