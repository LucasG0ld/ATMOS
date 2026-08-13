# Gate E — Checklist de release 1.0

## Produit et UX

- [x] Création depuis chacune des quatre ambiances comprise sans tutoriel.
- [x] Ajout, retrait, réglage, nommage et sauvegarde restent sobres et directs.
- [x] Aucun écran ne ressemble à un dashboard ou une station de travail audio.
- [x] Les limites de quatre couches et 20 mixes sont expliquées avant blocage.
- [x] Les changements non sauvegardés ne sont pas perdus lors d’une navigation interne.

## Données locales

- [x] Migration V1 vers V2 préserve favoris et volumes réels.
- [x] JSON corrompu, version inconnue, IDs obsolètes et quota refusé sont récupérables.
- [x] Reset supprime préférences et mixes après confirmation.
- [x] Le snapshot reste sous 128 Kio et aucune donnée n’est transmise.
- [x] Le comportement de rollback 0.3 face à V2 est testé et documenté.

## Audio

- [x] Aucun `AudioContext` ou fetch audio avant Play.
- [x] Une seule couche en erreur n’interrompt pas les autres.
- [x] Ajout, retrait, pause, reprise et changement de mix restent sans clic audible.
- [x] Un seul contexte, quatre voies stables maximum et nettoyage des transitions confirmé.
- [x] Timer, Focus Mode et arrière-plan best effort ne régressent pas.
- [x] Écoute continue d’au moins dix minutes sur plusieurs mixes validée.

## Accessibilité et appareils

- [x] Clavier seul, toucher et lecteurs d’écran couvrent le parcours critique.
- [x] Dialogues, confirmations et erreurs restaurent correctement le focus.
- [x] Zoom 200 %, texte agrandi, contraste élevé et mouvement réduit validés.
- [x] Chrome Android et Safari iOS réels validés.
- [ ] Risque Safari macOS réel réévalué explicitement.

## Qualité et livraison

- [x] Formatage, lint, types, tests, build, audits médias et dépendances réussis.
- [x] Matrice Playwright des parcours 0.1 à 1.0 réussie ou écarts documentés.
- [x] Budgets JS, stockage, audio, mémoire et réseau respectés.
- [ ] Lighthouse et smoke HTTPS production réussis.
- [x] Aucun défaut critique ou majeur ouvert.
- [ ] Documentation, changelog, rollback et tag `v1.0.0` approuvés.

## Décision

Gate E n’est validée qu’après recette réelle, vérifications de production,
acceptation explicite des risques résiduels et autorisation du tag `v1.0.0` par
le responsable du projet.

Les preuves automatisées, mesures et contrôles restant manuels sont détaillés
dans la [candidate de release 1.0](release-candidate-1.0.md). Une case cochée ici
n’implique ni fusion, ni validation de production, ni approbation de la Gate E.
