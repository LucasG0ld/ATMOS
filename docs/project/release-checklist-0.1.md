# Checklist de release — ATMOS 0.1

## État

**Gate B validée le 2026-08-10. Lot 7 terminé et release ATMOS 0.1 approuvée.**

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

- [x] Écoute d’au moins dix minutes : fonctionnelle, aucun problème rencontré lors de la recette utilisateur.
- [x] Safari macOS réel : non exécuté faute d’appareil ; risque résiduel explicitement accepté par LucasG0ld, avec couverture compensatoire Safari iOS et WebKit desktop.
- [x] Safari iOS réel : fonctionnel, aucun problème rencontré lors de la recette utilisateur.
- [x] Chrome Android réel : fonctionnel, aucun problème rencontré lors de la recette utilisateur.
- [x] Lecteur d’écran desktop et mobile : fonctionnel, aucun problème rencontré lors de la recette utilisateur.
- [x] Zoom 200 % : fonctionnel, aucun problème rencontré lors de la recette utilisateur.
- [x] Texte agrandi et contraste élevé : fonctionnels, aucun problème rencontré lors de la recette utilisateur.
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

La Gate B est validée. L’écoute longue, iOS, Android, les technologies d’assistance, le zoom 200 %, le texte agrandi et le contraste élevé sont validés. Safari macOS réel reste non exécuté faute d’appareil ; LucasG0ld, responsable du projet et du déploiement, a explicitement accepté ce risque résiduel avec couverture compensatoire par Safari iOS réel et WebKit desktop automatisé.

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

Décision de release : aucun défaut critique ou majeur ouvert ; publication 0.1 approuvée et tag `v0.1.0` autorisé.
