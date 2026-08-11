# Candidate de release — ATMOS 0.2

## État

**Candidate technique préparée le 2026-08-11 sur `mvp-0.2`. Gate C non encore
approuvée ; aucun merge, déploiement de production ou tag `v0.2.0` n’est
autorisé par ce document.**

Le périmètre reste celui accepté pour le MVP 0.2 : quatre ambiances, navigation
interne, crossfades et préchargement borné. Aucun élément du MVP 0.3 n’a été
introduit.

## Vérifications automatisées

- [x] Formatage, ESLint, TypeScript strict et build Next.js.
- [x] 82 tests unitaires et composants.
- [x] 60 cas Playwright sur cinq profils : local Windows, 56 validations et 4 reports WebKit ; CI Linux, 55 validations et 5 reports WebKit/Firefox documentés.
- [x] Zéro violation axe critique ou sérieuse sur accueil et player.
- [x] Quatre routes directes, navigation, historique, 404 et métadonnées.
- [x] Zéro audio avant Play, préchargement borné et `Save-Data`.
- [x] Échec total récupérable et couche partielle désactivée sans interrompre le mix.
- [x] Session persistante, changement rapide et un seul `AudioContext`.
- [x] Smoke du build de production local, cache désactivé : quatre routes, Rainy Apartment → Deep Forest, six couches uniques et 404, sans erreur console ou réseau.
- [x] Audits audio, images et dépendances sans anomalie bloquante.
- [x] Export GitHub Pages avec le préfixe `/ATMOS` construit avec succès.
- [x] Aucune issue ou pull request ouverte selon l’API publique GitHub le 2026-08-11.
- [x] Code propriétaire `UNLICENSED`, copyright LucasG0ld et licences des médias séparées.
- [x] Risque résiduel Safari macOS reconduit par LucasG0ld pour la version 0.2.
- [x] Ruleset `Protect main` actif : PR, historique linéaire, conversations résolues et contrôle strict `quality`, sans bypass.
- [x] Seul Squash merging est autorisé dans les réglages du dépôt, confirmé par LucasG0ld.

## Matrice automatisée

| Profil           | Navigation, responsive et axe | Audio réel      | Limite connue                                |
| ---------------- | ----------------------------- | --------------- | -------------------------------------------- |
| Chromium desktop | validé                        | validé          | navigateur automatisé                        |
| Firefox desktop  | validé                        | validé Windows  | fallback MP3 validé sur le runner Linux      |
| WebKit desktop   | validé                        | fallback validé | pas d’`AudioContext` dans le binaire Windows |
| Chromium mobile  | validé à 393 px et 320 px     | validé          | appareil émulé                               |
| WebKit mobile    | validé à 390 px et 320 px     | fallback validé | appareil émulé, pas un Safari iOS réel       |

Les quatre reports locaux sont les deux contrôles d’ordre clavier WebKit liés au
réglage Safari de tabulation et les deux scénarios de couche partielle qui exigent
un `AudioContext`. Sur le runner Ubuntu, Firefox expose Web Audio mais ne décode
pas les MP3 : le scénario de couche partielle ajoute un cinquième report et les
autres parcours audio valident le fallback récupérable. La lecture Firefox réelle
reste couverte sous Windows ; le moteur reste couvert indépendamment par ses tests
unitaires.

## Budgets de candidate

| Ressource                               |    Mesure |   Budget applicable | Résultat |
| --------------------------------------- | --------: | ------------------: | -------- |
| JavaScript accueil gzip                 |   9,7 Kio |             100 Kio | conforme |
| JavaScript player gzip                  |  54,7 Kio |             140 Kio | conforme |
| CSS par route gzip                      |   7,3 Kio |           50/60 Kio | conforme |
| Police WOFF2                            |  29,4 Kio |             120 Kio | conforme |
| Images du catalogue                     | 576,4 Kio |   plafond par actif | conforme |
| Audio du catalogue                      |  5,81 Mio |              12 Mio | conforme |
| Tas JS après dix transitions, variation | +1,34 Mio | mesure de stabilité | conforme |

La mesure de transition crée un seul contexte, effectue 33 requêtes pour 12 URL
audio uniques et termine avec un seul bus actif.

## Lighthouse local de candidate

Lighthouse 13.4.1 a été exécuté le 2026-08-11 sur le build local avec cache froid.
Tous les profils obtiennent 100 en accessibilité, bonnes pratiques et SEO.

| Route             | Performance mobile | LCP mobile | Performance desktop | LCP desktop |
| ----------------- | -----------------: | ---------- | ------------------: | ----------- |
| Accueil           |                 92 | 3,33 s     |                 100 | 0,44 s      |
| Rainy Apartment   |                 98 | 2,26 s     |                 100 | 0,48 s      |
| Quiet Coffee Shop |                 99 | 2,11 s     |                 100 | 0,45 s      |
| Deep Forest       |                 97 | 2,55 s     |                 100 | 0,64 s      |
| Fireplace         |                 99 | 2,26 s     |                 100 | 0,48 s      |

La simulation locale de l’accueil et de Deep Forest dépasse la cible de 2,5 s.
Elle n’est pas directement comparable à la baseline 0.1 mesurée sur GitHub Pages
et varie sensiblement entre exécutions. La comparaison Gate C reste donc ouverte
jusqu’à l’audit HTTPS post-déploiement ; un dépassement de plus de 10 % en
production exigera correction ou exception explicite.

## Validations requises avant Gate C

- [ ] Obtenir une CI verte sur la pull request vers `main`.
- [ ] Rejouer le parcours 0.2 sur Chrome Android et Safari iOS réels.
- [ ] Contrôler zoom 200 %, texte agrandi, contraste élevé et lecteurs d’écran sur la candidate 0.2.
- [ ] Confirmer qu’aucun défaut critique ou majeur n’est ouvert.
- [ ] Fusionner uniquement après ces contrôles, puis exécuter le smoke HTTPS et Lighthouse sur les cinq routes de production.
- [ ] Approuver explicitement la Gate C et le tag `v0.2.0`.

## Commandes de candidate

```bash
npm ci
npm run format
npm run lint
npm run typecheck
npm run test
npm run audio:check
npm run images:check
npm run audit:prod
npm run build
npm run budget:check
npm run performance:runtime
npm run smoke:local
npm run test:e2e
npm run performance:lighthouse
```

Après déploiement seulement :

```bash
npm run smoke:production
```
