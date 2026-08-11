# Gate D — Checklist de release ATMOS 0.3

## Cadrage

- [x] Spécification fonctionnelle et UX 0.3 approuvées.
- [x] ADR-0003 acceptée.
- [x] Aucun périmètre v1, backend, analytics ou synchronisation introduit.
- [x] Schéma, clé, finalité et suppression du stockage documentés.

## Préférences et favoris

- [x] Favoris ajoutés/retirés depuis le player et visibles sur l’accueil sans réordonner le catalogue.
- [x] Volumes restaurés séparément pour les quatre ambiances.
- [x] Défauts du registre appliqués si préférence absente ou invalide.
- [x] Reset supprime la clé et remet UI et moteur actif aux défauts.
- [x] JSON corrompu, version inconnue, IDs obsolètes et écriture refusée récupérables.
- [x] Aucune requête réseau, donnée personnelle ou initialisation audio causée par la persistance.

## Timer

- [x] Durées 15, 30, 45, 60 et 90 minutes disponibles.
- [x] Démarrage, remplacement et annulation sans timer concurrent.
- [x] Échéance correcte en lecture, en pause, après changement d’ambiance et onglet masqué.
- [x] Fade-out de cinq secondes puis état Pause, sans reprise sonore transitoire.
- [x] Play pendant le fade annule proprement la fin du timer et reprend normalement.
- [x] Rechargement et sortie du player annulent le timer sans effet résiduel.
- [x] Aucun contexte audio créé si le timer se termine avant le premier Play.
- [x] Lecture en arrière-plan best effort validée sur desktop, Android et iOS réels.
- [x] Suspension imposée ou reprise refusée revient à Pause sans faux état de lecture.

## Focus Mode

- [ ] Entrée et sortie souris, clavier et toucher.
- [ ] Heure, titre, Play/Pause, timer, erreurs et `Exit focus` restent disponibles.
- [ ] Contrôles masqués absents de l’ordre de tabulation et de l’arbre accessible.
- [ ] `Escape` et restauration du focus prévisibles.
- [ ] Changement d’ambiance, erreur audio et fin du timer restent récupérables.
- [ ] Mouvement réduit et zoom 200 % contrôlés.

## Performance, sécurité et confidentialité

- [x] Aucun nouveau média, service distant ou dépendance produit non approuvée.
- [x] Snapshot sous 32 Kio et écritures regroupées.
- [x] Aucun polling actif sans timer et aucune fuite de listener/timeout.
- [x] Budgets JS/CSS 0.2 respectés et incrément 0.3 mesuré.
- [x] Aucun secret, identifiant personnel, historique détaillé ou donnée sensible stocké.
- [ ] Rollback 0.2 testé avec présence d’une préférence V1 ignorée sans crash.

## Qualité et release

- [ ] Format, lint, types, tests, build, budgets et audit réussis.
- [ ] Matrice Chromium, Firefox, WebKit et profils mobiles réussie.
- [ ] Axe sans violation critique ou sérieuse sur accueil, player et dialogues.
- [ ] Lecteurs d’écran desktop/mobile, texte agrandi et contraste élevé contrôlés.
- [ ] Chrome Android et Safari iOS réels validés.
- [ ] Risque Safari macOS réévalué explicitement.
- [ ] Smoke HTTPS et Lighthouse production réussis.
- [ ] Aucun défaut critique ou majeur ouvert.
- [ ] Documentation, changelog, rollback et tag `v0.3.0` approuvés.

## Décision

Gate D n’est validée qu’après recette manuelle, vérifications de production,
acceptation explicite des risques résiduels et autorisation du tag `v0.3.0` par
le responsable du projet.
