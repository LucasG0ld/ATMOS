# ATMOS

ATMOS est une application web immersive permettant de composer et d’écouter des ambiances sonores. Le produit privilégie l’atmosphère, la sobriété et la continuité de l’expérience plutôt que les conventions d’un lecteur audio ou d’un dashboard.

> Less interface, more atmosphere.

Le projet démarre par un prototype visuel complet de **Rainy Apartment**. Le moteur audio sera intégré seulement lorsque l’expérience visuelle, responsive et accessible sera convaincante.

## État du projet

- Phase actuelle : Lots 0 à 7 et Gate B terminés.
- Code applicatif : ATMOS 0.1 Rainy Apartment visuelle et sonore publiée.
- Prochaine étape : cadrage du MVP 0.2 — catalogue initial.
- Langue de l’interface : anglais.
- Langue de la documentation : français.

## Stack initialisée

- Next.js 16.3 avec App Router ;
- React 19.2 et TypeScript 6.0 en mode strict ;
- Tailwind CSS 4.3 et propriétés CSS personnalisées ;
- Motion 13 pour les transitions ;
- Lucide React pour les icônes ;
- Web Audio API pour le moteur sonore ;
- stockage local pour les préférences du MVP ;
- export statique et déploiement continu sur GitHub Pages.

Les versions sont verrouillées dans `package.json` et `package-lock.json`. TypeScript 6 et ESLint 9 sont volontairement retenus jusqu’à ce que l’outillage ESLint de Next.js prenne en charge leurs versions majeures suivantes.

## Développement local

Prérequis : Node.js 24 et npm 11.

```bash
npm ci
npm run dev
```

L’application est ensuite disponible sur `http://localhost:3000`.

## Déploiement

La branche `main` est publiée automatiquement à l’adresse
[lucasg0ld.github.io/ATMOS](https://lucasg0ld.github.io/ATMOS/) par le workflow
`Deploy GitHub Pages`. Le build de déploiement active l’export statique Next.js
et le préfixe `/ATMOS`; ces paramètres ne modifient pas le développement local.

Dans GitHub, la source Pages doit rester configurée sur **GitHub Actions**.

## Commandes

```bash
npm run format      # vérifie le formatage
npm run lint        # exécute ESLint
npm run typecheck   # vérifie TypeScript sans émission
npm run test        # exécute les tests une fois
npm run audio:check # contrôle formats, durées, jointures et budget audio
npm run build       # crée le build de production
npm run budget:check # contrôle les budgets JS, CSS et fonts après build
npm run test:e2e    # exécute la recette sur cinq profils navigateur/mobile
npm run smoke:production # contrôle le parcours critique sur l’URL publique, cache désactivé
```

## Documentation

Le point d’entrée documentaire est [docs/README.md](docs/README.md). Les documents les plus utiles pour démarrer sont :

- [Vision et périmètre](docs/product/vision-and-scope.md)
- [Spécification du MVP](docs/product/mvp-requirements.md)
- [Spécification UX](docs/design/ux-specification.md)
- [Système de design](docs/design/design-system.md)
- [Architecture technique](docs/architecture/architecture.md)
- [Plan de réalisation](docs/project/delivery-plan.md)
- [Définition de terminé](docs/project/definition-of-done.md)

Le brief d’origine reste la source d’intention : [ATMOS — Product & Design Brief.md](ATMOS%20%E2%80%94%20Product%20%26%20Design%20Brief.md).

## Principes non négociables

1. Une interface calme, immersive, cinématographique et non générique.
2. Une seule ambiance correctement aboutie avant d’élargir le catalogue.
3. Accessibilité, responsive et réduction des animations dès le prototype.
4. Une architecture pilotée par les données afin d’ajouter une ambiance sans modifier les composants.
5. Aucun son ou visuel sans provenance et licence compatibles documentées.
6. Pas d’authentification, backend, paiement ou synchronisation cloud dans le MVP.

## Contribution

Consulter [CONTRIBUTING.md](CONTRIBUTING.md) avant toute modification et [AGENTS.md](AGENTS.md) pour les conventions destinées aux assistants de développement.
