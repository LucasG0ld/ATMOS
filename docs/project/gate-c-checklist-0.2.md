# Gate C — Checklist de release ATMOS 0.2

## Cadrage

- [x] Exigences 0.2 et matrice des quatre ambiances approuvées.
- [x] ADR-0002 acceptée.
- [x] Sources et licences des nouveaux médias archivées avant commit.
- [x] Code propriétaire, absence de licence open source explicitement assumée et copyright documenté.
- [x] Aucun périmètre 0.3 introduit implicitement.

## Catalogue et navigation

- [x] Quatre destinations lisibles sans hover ni média.
- [x] Quatre routes directes, métadonnées et 404 validées.
- [x] Preview clavier/souris sans audio et tactile sans double tap.
- [x] Navigation interne, `aria-current`, `Escape`, focus et historique cohérents.
- [x] Une ambiance s’ajoute sans condition spécifique dans les composants.

## Visuels et audio

- [x] Chaque nouvelle ambiance possède fallback, visuel ou décision sans image, crédits et revue responsive.
- [x] Deux ou trois couches licenciées, bouclées et mixées par ambiance.
- [x] Écoute longue individuelle des trois nouvelles ambiances sans clic, fatigue ou saturation.
- [x] Transitions croisées sans clic ni saturation.
- [x] Échec d’une couche ou d’une ambiance récupérable sans son résiduel.
- [x] Un seul `AudioContext`, deux bus maximum et nettoyage démontré.

## Préchargement et performance

- [x] Zéro audio avant le premier Play.
- [x] Au plus une cible visuelle et une cible audio éligible préchargées.
- [x] `Save-Data`, connexion lente et annulation testés.
- [x] Budgets JS, CSS, images, audio et mémoire respectés.
- [x] Lighthouse accueil et quatre players comparé à la baseline 0.1.

## Qualité et release

- [x] Format, lint, types, tests, audio, images, build, budgets et audit réussis.
- [x] Chromium, Firefox, WebKit et profils mobiles automatisés.
- [x] Axe sans violation critique ou sérieuse.
- [x] Zoom 200 %, mouvement réduit, contraste élevé et lecteurs d’écran contrôlés.
- [x] Android Chrome et Safari iOS réels.
- [x] Écart Safari macOS réévalué et risque résiduel de nouveau accepté par LucasG0ld.
- [x] Smoke test HTTPS cache froid sans erreur console ou ressource critique en 404.
- [x] Documentation, crédits, changelog et procédure de rollback à jour.
- [x] `main` protégée par le ruleset actif `Protect main`, PR et contrôle strict `quality` obligatoires.
- [x] Aucun défaut critique ou majeur ouvert dans le suivi public au 2026-08-11.

## Décision

**Gate C validée le 2026-08-11 par LucasG0ld, responsable du projet et du
déploiement. Le risque résiduel Safari macOS est accepté et le tag `v0.2.0` est
explicitement autorisé.**

Les résultats de la candidate, de la recette manuelle et des contrôles de
production sont consignés dans la
[fiche de candidate 0.2](release-candidate-0.2.md).

### Recette manuelle du Lot 12

Le 2026-08-10, LucasG0ld a validé l’écoute des trois nouvelles ambiances sur
desktop et mobile, sans problème signalé. Cette validation clôt le Lot 12 ; elle
ne couvrait pas encore les crossfades introduits au Lot 13.

### Recette manuelle du Lot 13

Le 2026-08-10, LucasG0ld a validé sur desktop et mobile la continuité de session,
les changements rapides d’ambiance, les crossfades, Pause/Play après transition
et l’arrêt du son en quittant le player. Aucun problème n’a été signalé. Les
navigateurs exacts n’ayant pas été consignés, les contrôles Safari iOS et Android
Chrome de la recette de release restent distincts.

### Recette manuelle de la candidate 0.2

Le 2026-08-11, LucasG0ld a validé la candidate 0.2 sur desktop, Chrome Android
réel et Safari iOS réel. Le parcours est fonctionnel à 200 % de zoom, avec texte
agrandi et contraste élevé, ainsi qu’avec un lecteur d’écran sur desktop et
mobile. Aucun défaut critique ou majeur n’a été signalé. Le mouvement réduit
reste également couvert par la matrice automatisée. Le smoke HTTPS et la
comparaison Lighthouse restent volontairement ouverts jusqu’au déploiement.

### Vérifications de production

Le 2026-08-11, la PR #1 a été fusionnée par Squash sur `main` au commit
`f0afbfc`. Les workflows `Quality` et `Deploy GitHub Pages` ont réussi. Le smoke
HTTPS à cache désactivé a validé les quatre routes, Rainy Apartment → Deep
Forest, six couches audio et la 404 personnalisée, sans erreur console, réseau
ou ressource critique en 404.

Lighthouse 13.4.1 obtient 100 en accessibilité, bonnes pratiques et SEO sur les
dix audits. Les players atteignent 99 à 100 en performance mobile et 100 sur
desktop. L’accueil mobile a été répété trois fois après une première mesure plus
variable : médiane 99 en performance, LCP 1,66 s et TBT 50 ms. Aucune régression
stable supérieure à 10 % face à la baseline 0.1 n’est constatée.
