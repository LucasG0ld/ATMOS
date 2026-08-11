# Candidate de release — ATMOS 0.3

## État

**Candidate technique préparée le 2026-08-11 sur `mvp-0.3`. Gate D, fusion,
déploiement et tag `v0.3.0` restent soumis aux validations finales et à
l’autorisation explicite de LucasG0ld.**

Le périmètre est celui approuvé au Lot 16 : préférences locales versionnées,
favoris, volumes persistants, timer, lecture en arrière-plan best effort et
Focus Mode. Aucun compte, backend, analytics, paiement ou synchronisation n’est
introduit.

## Vérifications automatisées locales

- [x] Installation verrouillée avec 483 paquets et zéro vulnérabilité connue.
- [x] Formatage, ESLint, TypeScript strict et build Next.js statique.
- [x] 120 tests unitaires et composants répartis sur 23 fichiers.
- [x] 90 cas Playwright sur cinq profils : 86 validations et 4 reports WebKit documentés.
- [x] Zéro violation axe critique ou sérieuse sur accueil, quatre players, dialogues et Focus Mode.
- [x] Préférences absentes, valides, corrompues, inconnues, hors bornes et stockage refusé récupérables.
- [x] Favoris, volumes et reset persistants sans requête audio ni transmission distante.
- [x] Timer absolu, remplacement, annulation, navigation, arrière-plan, fade et priorité de Play.
- [x] Aucune suspension audio volontaire sur page masquée et reprise système dégradée vers Pause.
- [x] Focus Mode : retrait du rendu, ordre clavier, `Escape`, restauration, erreur et fin du timer.
- [x] Audits audio, images, bundles et dépendances sans anomalie bloquante.
- [x] Smoke local : quatre routes, préférences, timer, Focus Mode, transition audio et 404.
- [x] Aucun défaut critique ou majeur identifié pendant la stabilisation locale.

## Matrice automatisée

| Profil           | Navigation, persistance, timer, Focus et axe | Audio réel      | Limite connue                                |
| ---------------- | -------------------------------------------- | --------------- | -------------------------------------------- |
| Chromium desktop | validé                                       | validé          | navigateur automatisé                        |
| Firefox desktop  | validé                                       | validé Windows  | fallback MP3 attendu sur runner Linux        |
| WebKit desktop   | validé                                       | fallback validé | pas d’`AudioContext` dans le binaire Windows |
| Chromium mobile  | validé à 393 px et 320 px                    | validé          | appareil émulé                               |
| WebKit mobile    | validé à 390 px et 320 px                    | fallback validé | appareil émulé                               |

Les quatre reports locaux sont les deux scénarios de couche partielle qui
exigent un `AudioContext` WebKit et les deux contrôles d’ordre clavier liés au
réglage Safari excluant certains liens de la tabulation. Ils sont inchangés
depuis la candidate 0.2. Une attente `load` inutile rendait un ancien parcours
Firefox instable sous cinq workers ; l’attente est désormais limitée à
`DOMContentLoaded` et la matrice complète passe en une seule exécution.

## Budgets de candidate

| Ressource               |      Mesure | Budget applicable | Résultat |
| ----------------------- | ----------: | ----------------: | -------- |
| JavaScript accueil gzip |    11,7 Kio |           100 Kio | conforme |
| JavaScript player gzip  |    59,6 Kio |           140 Kio | conforme |
| CSS accueil/player gzip | 6,8/9,1 Kio |         50/60 Kio | conforme |
| Police WOFF2            |    29,4 Kio |           120 Kio | conforme |
| Snapshot de préférences |     < 8 Kio |            32 Kio | conforme |
| Images du catalogue     |   576,4 Kio | plafond par actif | conforme |
| Audio du catalogue      |    5,81 Mio |            12 Mio | conforme |

Après dix transitions, la mesure crée un seul `AudioContext`, charge 12 URL
audio uniques et mesure un delta de tas de +1 398 527 octets. Les 39 requêtes
observées incluent les revalidations et préchargements bornés.

## Lighthouse local

Lighthouse 13.4.1 est exécuté sur build local et cache froid. Accessibilité,
bonnes pratiques et SEO obtiennent 100 sur les dix audits.

| Route             | Performance mobile | LCP mobile | Performance desktop | LCP desktop |
| ----------------- | -----------------: | ---------: | ------------------: | ----------: |
| Accueil           |                 92 |     3,33 s |                 100 |      0,44 s |
| Rainy Apartment   |                 99 |     2,26 s |                 100 |      0,48 s |
| Quiet Coffee Shop |                 99 |     2,11 s |                 100 |      0,48 s |
| Deep Forest       |                 97 |     2,55 s |                 100 |      0,64 s |
| Fireplace         |                 99 |     2,11 s |                 100 |      0,49 s |

L’accueil et Deep Forest dépassent ponctuellement la cible LCP locale de 2,5 s,
comme en 0.2. Cette simulation est stable par rapport à la précédente candidate
et doit être comparée aux résultats HTTPS après déploiement ; une régression de
plus de 10 % nécessitera correction ou exception explicite.

## Rollback validé

Le 2026-08-11, la production officielle 0.2 a réussi le smoke cache froid :
quatre routes, transition Rainy Apartment vers Deep Forest, audio et 404. Une
préférence V1 de 0.3 injectée avant chargement est restée intacte et a été
ignorée sans crash ni erreur console. Le tag annoté `v0.2.0` reste le point de
retour et la procédure est décrite dans le guide de maintenance.

## Recettes déjà confirmées

- [x] Favoris et volumes sur desktop et mobile.
- [x] Timer et fin de session sur desktop et mobile.
- [x] Lecture en arrière-plan best effort sur desktop et appareils mobiles réels.
- [x] Focus Mode souris, clavier, toucher, responsive, mouvement réduit et zoom 200 %.
- [x] Candidate consolidée sur Chrome Android et Safari iOS réels.
- [x] Lecteurs d’écran desktop/mobile, texte agrandi et contraste élevé sur les fonctions 0.3.
- [x] Risque Safari macOS réel réévalué et résiduel accepté par LucasG0ld.

## Contrôles requis avant Gate D

- [ ] Obtenir une CI verte sur la pull request `mvp-0.3` vers `main`.
- [x] Rejouer la candidate consolidée sur Chrome Android et Safari iOS réels.
- [x] Vérifier lecteurs d’écran desktop/mobile, texte agrandi et contraste élevé sur les fonctions 0.3.
- [x] Réévaluer explicitement le risque Safari macOS réel.
- [x] Confirmer qu’aucun défaut critique ou majeur n’est ouvert.
- [ ] Fusionner uniquement après ces contrôles, puis exécuter smoke HTTPS et Lighthouse sur les cinq routes de production.
- [ ] Approuver explicitement la Gate D et autoriser le tag `v0.3.0`.

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
