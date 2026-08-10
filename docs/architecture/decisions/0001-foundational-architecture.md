# ADR-0001 — Architecture fondatrice du MVP

- Statut : accepté
- Date : 2026-08-10
- Décideurs : équipe ATMOS
- Remplace : aucune décision

## Contexte

ATMOS commence sans code applicatif. Le brief recommande Next.js, TypeScript, Tailwind, Motion et Web Audio tout en demandant une progression incrémentale, une priorité visuelle et l’absence de backend au MVP. Il faut éviter à la fois une architecture jetable centrée sur Rainy Apartment et une plateforme abstraite construite pour des fonctions futures.

## Décision

- Utiliser Next.js App Router et TypeScript strict.
- Rendre les routes et contenus en composants serveur par défaut.
- Isoler horloge, interactions, audio et stockage dans des composants ou hooks clients ciblés.
- Décrire les ambiances dans des objets validés indépendants de React.
- Commencer avec état React local ; introduire Context puis éventuellement Zustand seulement sur preuve de complexité.
- Construire le prototype visuel avant de raccorder un moteur Web Audio fondé sur un gain par couche et un gain master.
- Servir les actifs du MVP localement et documenter chaque licence.
- Ne pas ajouter de backend, compte, analytics ou persistance avant leur phase.

## Options considérées

### Application entièrement cliente

Simple au premier abord, mais augmente le JavaScript, mélange contenu et APIs navigateur et réduit les bénéfices naturels de Next.js. Rejetée.

### Store global et architecture audio complète dès le départ

Anticipe les phases futures mais ajoute des états et abstractions sans besoin validé. Rejetée.

### Balises audio uniquement

Suffisantes pour une démo rapide, mais moins adaptées au graphe multi-couches, aux rampes et aux crossfades visés. Elles restent une solution de secours de prototypage, pas la cible.

### Architecture progressive retenue

Elle permet de valider l’expérience avec peu de code et conserve des frontières adaptées à l’évolution.

## Conséquences

- Le premier player contient des contrôles simulés avant le moteur réel.
- Certaines frontières n’apparaissent qu’au premier besoin, ce qui exige de résister aux dossiers et abstractions vides.
- Les données doivent être conçues correctement dès Rainy Apartment.
- Le code audio nécessite des tests navigateur et un nettoyage rigoureux.
- Un changement vers un backend ou une synchronisation demandera un nouvel ADR.

## Critères de réévaluation

- Le Context provoque des rerenders ou dépendances croisées difficiles à contrôler.
- Le volume des données ne peut plus être raisonnablement empaqueté statiquement.
- La synchronisation entre appareils devient une exigence acceptée.
- Les contraintes audio navigateur imposent une autre primitive.
