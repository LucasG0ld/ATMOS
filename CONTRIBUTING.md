# Contribuer à ATMOS

## Avant de commencer

1. Lire la [spécification du MVP](docs/product/mvp-requirements.md) et le document lié au changement.
2. Vérifier que le changement appartient à la phase active de la [roadmap](docs/product/roadmap.md).
3. Pour une décision structurante ou difficile à inverser, créer un ADR depuis le [modèle](docs/architecture/decisions/0000-template.md).
4. Ne pas mélanger refactorisation sans rapport et fonctionnalité produit.

## Principes de réalisation

- Procéder par petites tranches verticales vérifiables.
- Conserver TypeScript strict ; éviter `any`, les assertions non justifiées et les états impossibles.
- Garder les données d’ambiance hors des composants d’interface.
- Préférer les composants natifs accessibles avant d’ajouter une abstraction.
- Respecter `prefers-reduced-motion` et tester au clavier dès la création du composant.
- Ne pas introduire de dépendance sans bénéfice clair, vérification de licence et justification.
- Ne jamais ajouter un actif média sans entrée dans `ASSET_CREDITS.md`.

## Conventions attendues

- Composants : `PascalCase`.
- Hooks : `useCamelCase`.
- Fonctions, variables et fichiers non composants : `camelCase` ou `kebab-case` selon la convention créée par le scaffold.
- Identifiants et slugs persistés : stables, minuscules et séparés par des tirets.
- Texte visible dans l’application : anglais concis.
- Commentaires : expliquer le pourquoi, pas paraphraser le code.

Les outils de formatage, lint et test exacts seront ajoutés avec le scaffold. Le dépôt devra proposer des commandes uniques pour le développement, le lint, la vérification des types, les tests et le build.

## Validation d’une contribution

Avant revue :

- exécuter formatage, lint, typecheck, tests et build ;
- parcourir les tailles mobile, tablette et desktop concernées ;
- vérifier clavier, focus, contraste et réduction des animations ;
- contrôler l’absence d’erreurs console et de requêtes média inattendues ;
- mettre à jour documentation, tests, `CHANGELOG.md` et crédits si nécessaire ;
- appliquer la [définition de terminé](docs/project/definition-of-done.md).

## Commits et revues

Utiliser des commits courts et intentionnels. Une pull request décrit le problème, le résultat, le périmètre hors-sujet, les validations effectuées et fournit des captures ou vidéos pour tout changement visuel. La revue porte d’abord sur l’expérience, l’accessibilité et les régressions, puis sur l’élégance interne.
