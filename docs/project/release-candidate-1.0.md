# Candidate de release — ATMOS 1.0

## État

**Candidate fusionnée par Squash et déployée le 2026-08-13. La Gate E et le tag
`v1.0.0` ne sont pas encore approuvés.**

La PR #6 est fusionnée sur `main` au commit `dc6cad8`. Les workflows `Quality`,
build et déploiement GitHub Pages sont verts sur ce commit.

Le périmètre est celui accepté au Lot 22 : composition locale d’une à quatre
couches licenciées, lecture live, sauvegarde de 20 mixes maximum et stockage V2.
Aucun import, compte, cloud, partage, analytics ou interface de production
musicale n’est introduit.

## Vérifications automatisées locales

- [x] Version applicative et lockfile préparés en `1.0.0` sans nouveau package.
- [x] Formatage, ESLint, TypeScript strict et build statique réussis.
- [x] 151 tests unitaires et composants sur 25 fichiers.
- [x] 115 cas Playwright sur cinq profils : 111 réussites et 4 reports WebKit documentés.
- [x] Stockage V2, migration V1, corruption, version inconnue, quota et reset couverts.
- [x] Parcours création, lecture, sauvegarde, ouverture, modification et suppression couvert.
- [x] Aucun audio avant Play ; erreur partielle, timer, Focus Mode et arrière-plan couverts.
- [x] Audits audio, images, dépendances et bundles sans anomalie bloquante.
- [x] Smoke local consolidé de l’accueil jusqu’à la lecture d’un mix sauvegardé.
- [x] Stress de dix changements de mix sans fuite de contexte, source ou listener.
- [x] Douze audits Lighthouse locaux couvrant accueil, quatre players et compositeur.
- [x] Aucun défaut critique ou majeur identifié pendant la stabilisation locale.

## Matrice automatisée

| Profil           | Parcours 0.1–1.0 | Audio réel      | Limite connue                                |
| ---------------- | ---------------- | --------------- | -------------------------------------------- |
| Chromium desktop | validé           | validé          | navigateur automatisé                        |
| Firefox desktop  | validé           | validé Windows  | fallback MP3 attendu sur runner Linux        |
| WebKit desktop   | validé           | fallback validé | pas d’`AudioContext` dans le binaire Windows |
| Chromium mobile  | validé           | validé          | appareil émulé                               |
| WebKit mobile    | validé           | fallback validé | appareil émulé                               |

Les quatre reports historiques concernent deux scénarios exigeant un
`AudioContext` WebKit et deux contrôles d’ordre clavier dépendant du réglage
Safari. Une exécution locale à cinq workers a rencontré des timeouts de
navigation ponctuels ; chaque scénario a réussi isolément et la matrice complète
a réussi avec deux workers, comme en CI.

## Budgets de candidate

| Ressource                   |    Mesure | Budget applicable | Résultat |
| --------------------------- | --------: | ----------------: | -------- |
| JavaScript accueil gzip     |  12,9 Kio |           100 Kio | conforme |
| JavaScript player gzip      |  61,9 Kio |           140 Kio | conforme |
| JavaScript compositeur gzip |  25,6 Kio |           180 Kio | conforme |
| CSS accueil/player/compose  |   9,7 Kio |      50/60/70 Kio | conforme |
| Police WOFF2                |  29,4 Kio |           120 Kio | conforme |
| Snapshot V2                 |     borné |           128 Kio | conforme |
| Images du catalogue         | 576,4 Kio | plafond par actif | conforme |
| Audio du catalogue          |  5,81 Mio |            12 Mio | conforme |

Après dix changements de mix, la mesure conserve un seul `AudioContext`, deux
sources finales, un pic transitoire de sept sources sur huit, huit listeners
avant/après et neuf URL audio uniques. Le delta de tas après GC est de 573 305
octets, inférieur aux 1 208 560 octets du parcours catalogue 0.3 mesuré dans le
même build.

## Lighthouse local

Les douze audits obtiennent 100 en accessibilité, bonnes pratiques et SEO. Le
compositeur obtient 99 en performance mobile avec un LCP de 2,10 s, et 100 en
desktop (LCP de contrôle Lot 28 : 0,57 s). L’accueil local obtient 92 avec un
LCP de 3,33 s ; sa mesure HTTPS après déploiement reste obligatoire avant la
Gate E.

## Rollback validé

Le 2026-08-13, la production officielle 0.3 a été chargée avec un snapshot V2
réel contenant favori, volume et mix sauvegardé. Elle est revenue à ses défauts
sans erreur ni audio, n’a pas exposé le mix et a conservé le JSON V2 octet pour
octet. `npm run rollback:check` rend ce contrôle reproductible. Le tag annoté
`v0.3.0`, commit `1b481e1`, reste le point de retour de la candidate 1.0.

## Lighthouse et smoke de production

Le smoke HTTPS avec cache désactivé valide l’URL officielle, les quatre players,
préférences, timer, Focus Mode, transition audio, création, sauvegarde et lecture
d’un mix, ainsi que la 404. Le premier passage a uniquement révélé que GitHub
Pages normalise `/compose` en `/compose/` ; l’assertion accepte désormais les
deux formes et le parcours complet réussit.

Les douze audits HTTPS obtiennent 100 en accessibilité, bonnes pratiques et SEO.

| Route             | Performance mobile | LCP mobile | Performance desktop | LCP desktop |
| ----------------- | -----------------: | ---------: | ------------------: | ----------: |
| Accueil           |                 98 |     2,11 s |                 100 |      0,41 s |
| Rainy Apartment   |                 99 |     1,81 s |                 100 |      0,41 s |
| Quiet Coffee Shop |                100 |     1,66 s |                 100 |      0,42 s |
| Deep Forest       |                100 |     1,66 s |                 100 |      0,57 s |
| Fireplace         |                 99 |     1,66 s |                 100 |      0,45 s |
| Compositeur       |                 96 |     1,66 s |                 100 |      0,41 s |

Tous les CLS sont nuls et aucun LCP mobile ne dépasse 2,11 s. L’accueil progresse
face à la production 0.3 mesurée à 2,21 s ; aucune régression stable supérieure
à 10 % n’est observée.

## Recettes déjà confirmées

- [x] Création visuelle, moteur live et CRUD sur desktop et mobile aux Lots 24–26.
- [x] Intégration accueil, mixes d’une même scène et non-régression 0.3 sur desktop et mobile au Lot 27.
- [x] Écoute continue d’au moins dix minutes en alternant plusieurs mixes.
- [x] Parcours 1.0 au clavier et avec lecteurs d’écran desktop/mobile.
- [x] Zoom 200 %, texte agrandi, contraste élevé et mouvement réduit sur `/compose`.
- [x] Candidate 1.0 sur Chrome Android et Safari iOS réels.
- [x] Risque Safari macOS réel réévalué et accepté par LucasG0ld le 2026-08-13.

## Contrôles restants avant Gate E

- [x] CI verte et fusion Squash de la pull request `mvp-1.0` vers `main`.
- [x] Risque Safari macOS accepté et absence de défaut majeur confirmée.
- [x] Fusionner uniquement après autorisation explicite du responsable du projet.
- [x] Vérifier le smoke et Lighthouse HTTPS sur les six routes après déploiement.
- [ ] Approuver explicitement la Gate E et autoriser le tag `v1.0.0`.

Après le premier déploiement 1.0, GitHub Pages a correctement servi
`/compose/?scene=deep-forest`. Le smoke attendait uniquement la forme locale sans
slash et a donc échoué après chargement réussi du compositeur. Son assertion a
été rendue compatible avec les deux formes canoniques ; aucun défaut applicatif
n’a été observé.

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
npm run performance:composer
npm run smoke:local
npx playwright test --workers=2
npm run performance:lighthouse
npm run rollback:check
```

Après déploiement seulement :

```bash
npm run smoke:production
ATMOS_LIGHTHOUSE_URL="https://lucasg0ld.github.io/ATMOS/" npm run performance:lighthouse
```
