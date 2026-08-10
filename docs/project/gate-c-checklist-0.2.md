# Gate C — Checklist de release ATMOS 0.2

## Cadrage

- [x] Exigences 0.2 et matrice des quatre ambiances approuvées.
- [x] ADR-0002 acceptée.
- [x] Sources et licences des nouveaux médias archivées avant commit.
- [ ] Licence du code source décidée et fichier `LICENSE` ajouté ou absence explicitement assumée.
- [ ] Aucun périmètre 0.3 introduit implicitement.

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
- [ ] Transitions croisées sans clic ni saturation.
- [ ] Échec d’une couche ou d’une ambiance récupérable sans son résiduel.
- [ ] Un seul `AudioContext`, deux bus maximum et nettoyage démontré.

## Préchargement et performance

- [x] Zéro audio avant le premier Play.
- [ ] Au plus une cible visuelle et une cible audio éligible préchargées.
- [ ] `Save-Data`, connexion lente et annulation testés.
- [ ] Budgets JS, CSS, images, audio et mémoire respectés.
- [ ] Lighthouse accueil et quatre players comparé à la baseline 0.1.

## Qualité et release

- [ ] Format, lint, types, tests, audio, build, budgets et audit réussis.
- [ ] Chromium, Firefox, WebKit et profils mobiles automatisés.
- [ ] Axe sans violation critique ou sérieuse.
- [ ] Zoom 200 %, mouvement réduit, contraste élevé et lecteurs d’écran contrôlés.
- [ ] Android Chrome et Safari iOS réels ; écart Safari macOS réévalué.
- [ ] Smoke test HTTPS cache froid sans erreur console ou ressource critique en 404.
- [ ] Documentation, crédits, changelog et procédure de rollback à jour.
- [ ] `main` protégée ou contrôle équivalent confirmé avant la fusion de release.
- [ ] Aucun défaut critique ou majeur ouvert.

## Décision

Gate C n’est validée qu’après consignation des exceptions, acceptation explicite
des risques résiduels et approbation du tag `v0.2.0` par le responsable du projet.

### Recette manuelle du Lot 12

Le 2026-08-10, LucasG0ld a validé l’écoute des trois nouvelles ambiances sur
desktop et mobile, sans problème signalé. Cette validation clôt le Lot 12 ; elle
ne couvre pas les crossfades qui seront introduits au Lot 13.
