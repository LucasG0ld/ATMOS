# Gate E — Checklist de release 1.0

## Produit et UX

- [ ] Création depuis chacune des quatre ambiances comprise sans tutoriel.
- [ ] Ajout, retrait, réglage, nommage et sauvegarde restent sobres et directs.
- [ ] Aucun écran ne ressemble à un dashboard ou une station de travail audio.
- [ ] Les limites de quatre couches et 20 mixes sont expliquées avant blocage.
- [ ] Les changements non sauvegardés ne sont pas perdus lors d’une navigation interne.

## Données locales

- [ ] Migration V1 vers V2 préserve favoris et volumes réels.
- [ ] JSON corrompu, version inconnue, IDs obsolètes et quota refusé sont récupérables.
- [ ] Reset supprime préférences et mixes après confirmation.
- [ ] Le snapshot reste sous 128 Kio et aucune donnée n’est transmise.
- [ ] Le comportement de rollback 0.3 face à V2 est testé et documenté.

## Audio

- [ ] Aucun `AudioContext` ou fetch audio avant Play.
- [ ] Une seule couche en erreur n’interrompt pas les autres.
- [ ] Ajout, retrait, pause, reprise et changement de mix restent sans clic audible.
- [ ] Un seul contexte, quatre voies stables maximum et nettoyage des transitions confirmé.
- [ ] Timer, Focus Mode et arrière-plan best effort ne régressent pas.
- [ ] Écoute continue d’au moins dix minutes sur plusieurs mixes validée.

## Accessibilité et appareils

- [ ] Clavier seul, toucher et lecteurs d’écran couvrent le parcours critique.
- [ ] Dialogues, confirmations et erreurs restaurent correctement le focus.
- [ ] Zoom 200 %, texte agrandi, contraste élevé et mouvement réduit validés.
- [ ] Chrome Android et Safari iOS réels validés.
- [ ] Risque Safari macOS réel réévalué explicitement.

## Qualité et livraison

- [ ] Formatage, lint, types, tests, build, audits médias et dépendances réussis.
- [ ] Matrice Playwright des parcours 0.1 à 1.0 réussie ou écarts documentés.
- [ ] Budgets JS, stockage, audio, mémoire et réseau respectés.
- [ ] Lighthouse et smoke HTTPS production réussis.
- [ ] Aucun défaut critique ou majeur ouvert.
- [ ] Documentation, changelog, rollback et tag `v1.0.0` approuvés.

## Décision

Gate E n’est validée qu’après recette réelle, vérifications de production,
acceptation explicite des risques résiduels et autorisation du tag `v1.0.0` par
le responsable du projet.
