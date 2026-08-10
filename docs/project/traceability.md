# Matrice de traçabilité du brief

Cette matrice permet de retrouver où chaque thème du brief initial devient une règle opérationnelle. Le brief reste conservé sans réécriture.

| Sections du brief  | Sujet                                                          | Document opérationnel principal                                                                                                                                                |
| ------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1–3                | proposition, objectifs, philosophie                            | [Vision et périmètre](../product/vision-and-scope.md)                                                                                                                          |
| 4–6, 39, 42–45     | direction artistique, identité, typo, photo, logo, ton, langue | [Système de design](../design/design-system.md)                                                                                                                                |
| 7–8, 16, 21–23, 41 | accueil, player, horloge, navigation, layouts                  | [Spécification UX](../design/ux-specification.md)                                                                                                                              |
| 9–11               | layers, mixer et sliders                                       | [Moteur audio](../architecture/audio-engine.md) et [MVP](../product/mvp-requirements.md)                                                                                       |
| 12–15, 28, 40      | mouvement, transitions, background, grain, thème               | [Système de design](../design/design-system.md) et [Spécification UX](../design/ux-specification.md)                                                                           |
| 17–20              | Focus Mode, timer, favoris, mixes                              | [Roadmap](../product/roadmap.md)                                                                                                                                               |
| 24–27              | composants, données, état, stack                               | [Architecture](../architecture/architecture.md), [Modèle de données](../architecture/data-model.md) et [ADR-0001](../architecture/decisions/0001-foundational-architecture.md) |
| 29                 | responsive                                                     | [Spécification UX](../design/ux-specification.md) et [Définition de terminé](definition-of-done.md)                                                                            |
| 30                 | accessibilité                                                  | [Référentiel d’accessibilité](../quality/accessibility.md)                                                                                                                     |
| 31                 | performance                                                    | [Budget performance](../quality/performance.md)                                                                                                                                |
| 32                 | droits audio                                                   | [Actifs et licences](../operations/assets-and-licenses.md) et [registre](../../ASSET_CREDITS.md)                                                                               |
| 33–38, 47–48       | phases, priorités, première mission                            | [Roadmap](../product/roadmap.md) et [Plan de réalisation](delivery-plan.md)                                                                                                    |
| 37                 | fonctionnalités exclues                                        | [Vision et périmètre](../product/vision-and-scope.md) et [MVP](../product/mvp-requirements.md)                                                                                 |
| 46                 | critères de réussite                                           | [Vision et périmètre](../product/vision-and-scope.md), [MVP](../product/mvp-requirements.md) et [Définition de terminé](definition-of-done.md)                                 |
| 49–50              | méthode de travail avec Codex                                  | [AGENTS.md](../../AGENTS.md), [Contribution](../../CONTRIBUTING.md) et [Plan de réalisation](delivery-plan.md)                                                                 |

Pour le MVP 0.2, les sections catalogue, navigation, transitions et performance
sont précisées par la [spécification 0.2](../product/mvp-requirements-0.2.md), la
[matrice des ambiances](../product/atmosphere-matrix-0.2.md), l’[UX catalogue](../design/catalogue-ux-0.2.md)
et l’[ADR-0002](../architecture/decisions/0002-catalogue-transitions-and-preloading.md).

## Éléments ajoutés pour rendre le projet maintenable

Le brief n’explicite pas entièrement certains besoins de livraison. Ils sont couverts par :

- [Stratégie de tests](../quality/testing-strategy.md) ;
- [Registre des risques](risk-register.md) ;
- [Sécurité et vie privée](../operations/security-and-privacy.md) ;
- [Maintenance et exploitation](../operations/maintenance.md) ;
- [Politique de sécurité](../../SECURITY.md) ;
- [Journal des changements](../../CHANGELOG.md).

## Points volontairement non décidés

- Visuels et sons des trois nouvelles ambiances : sourcés, crédités et validés pendant les Lots 11 et 12, avec écoute longue sur desktop et mobile.
- Session et transitions : implémentation de l’ADR-0002 au Lot 13, avec un contexte, deux bus, annulation et récupération automatisés ; recette auditive restante.
- Licence du code source : choix du propriétaire requis avant la release 0.2.
- Analytics : absentes par défaut, décision de confidentialité préalable obligatoire.
