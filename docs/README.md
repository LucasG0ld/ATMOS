# Documentation ATMOS

Cette documentation transforme le brief initial en documents opérationnels. En cas de contradiction, l’ordre d’autorité est : décision d’architecture acceptée, spécification MVP, vision produit, puis brief initial. Une modification de périmètre doit être enregistrée dans le journal des décisions.

## Produit

- [Vision et périmètre](product/vision-and-scope.md) — problème, promesse, utilisateurs, limites et indicateurs.
- [Spécification du MVP](product/mvp-requirements.md) — exigences vérifiables et critères d’acceptation.
- [Spécification du MVP 0.2](product/mvp-requirements-0.2.md) — catalogue, transitions et préchargement.
- [Matrice des ambiances 0.2](product/atmosphere-matrix-0.2.md) — identités et besoins médias.
- [Roadmap](product/roadmap.md) — progression 0.1, 0.2, 0.3 et version 1.

## Expérience et design

- [Spécification UX](design/ux-specification.md) — parcours, états et comportements responsive.
- [Système de design](design/design-system.md) — fondations visuelles, tokens, mouvement et contenu.
- [UX du catalogue 0.2](design/catalogue-ux-0.2.md) — accueil, previews et navigation interne.

## Architecture

- [Architecture technique](architecture/architecture.md) — frontières, structure cible et responsabilités.
- [Modèle de données](architecture/data-model.md) — contrats TypeScript et persistance.
- [Moteur audio](architecture/audio-engine.md) — cycle de vie Web Audio, transitions et erreurs.
- [ADR-0001 : décisions fondatrices](architecture/decisions/0001-foundational-architecture.md).
- [ADR-0002 : catalogue, transitions et préchargement](architecture/decisions/0002-catalogue-transitions-and-preloading.md).
- [Modèle d’ADR](architecture/decisions/0000-template.md).

## Projet et qualité

- [Plan de réalisation](project/delivery-plan.md) — lots incrémentaux et points de validation.
- [Définition de terminé](project/definition-of-done.md) — checklist commune.
- [Registre des risques](project/risk-register.md) — risques, signaux et mitigations.
- [Matrice de traçabilité](project/traceability.md) — couverture du brief par les documents opérationnels.
- [Stratégie de tests](quality/testing-strategy.md).
- [Accessibilité](quality/accessibility.md).
- [Performance](quality/performance.md).
- [Références visuelles](quality/visual-references.md).
- [Checklist de release 0.1](project/release-checklist-0.1.md).
- [Fiche de recette manuelle Gate B](project/gate-b-manual-test.md).
- [Checklist Gate C — 0.2](project/gate-c-checklist-0.2.md).
- [Candidate de release 0.2](project/release-candidate-0.2.md) — résultats automatisés, matrice et validations externes restantes.

## Exploitation et conformité

- [Sécurité et vie privée](operations/security-and-privacy.md).
- [Actifs et licences](operations/assets-and-licenses.md).
- [Actifs audio ATMOS](operations/audio-assets.md) — sources, preuves, transformations, mixages et validation.
- [Actifs visuels 0.2](operations/visual-assets-0.2.md) — prompts, droits, transformations et empreintes.
- [Maintenance et exploitation](operations/maintenance.md).
- [Registre des actifs](../ASSET_CREDITS.md).
- [Droits du code](../COPYRIGHT.md).
- [Politique de sécurité](../SECURITY.md).

## Règle de mise à jour

Une fonctionnalité n’est pas terminée si son comportement public, ses contraintes ou ses opérations ont changé sans mise à jour du document concerné. Les documents doivent décrire l’état voulu du produit ; les écarts temporaires sont suivis dans les issues, pas inscrits comme ambiguïtés permanentes.
