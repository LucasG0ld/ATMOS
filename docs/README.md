# Documentation ATMOS

Cette documentation transforme le brief initial en documents opérationnels. En cas de contradiction, l’ordre d’autorité est : décision d’architecture acceptée, spécification MVP, vision produit, puis brief initial. Une modification de périmètre doit être enregistrée dans le journal des décisions.

## Produit

- [Vision et périmètre](product/vision-and-scope.md) — problème, promesse, utilisateurs, limites et indicateurs.
- [Spécification du MVP](product/mvp-requirements.md) — exigences vérifiables et critères d’acceptation.
- [Spécification du MVP 0.2](product/mvp-requirements-0.2.md) — catalogue, transitions et préchargement.
- [Spécification du MVP 0.3](product/mvp-requirements-0.3.md) — préférences locales, timer et Focus Mode.
- [Spécification de la version 1.0](product/mvp-requirements-1.0.md) — composition locale et mixes sauvegardés.
- [Matrice des ambiances 0.2](product/atmosphere-matrix-0.2.md) — identités et besoins médias.
- [Roadmap](product/roadmap.md) — progression 0.1, 0.2, 0.3 et version 1.

## Expérience et design

- [Spécification UX](design/ux-specification.md) — parcours, états et comportements responsive.
- [Système de design](design/design-system.md) — fondations visuelles, tokens, mouvement et contenu.
- [Moodboard multi-sources](design/reference-moodboard.md) — références créatives et produit, principes à reprendre et contre-références.
- [Audit du design actuel](design/current-design-audit.md) — confrontation écran par écran au corpus et priorités de révision.
- [Variante Player B1](design/player-variant-b1.md) — « Immediate Play », validée comme baseline du player.
- [Variante Accueil B2](design/home-variant-b2.md) — « Breathing Index », validée comme baseline mobile.
- [Variante Compositeur B3](design/composer-variant-b3.md) — « Quiet Layers », validée comme baseline mono-scène et mixte.
- [Variante Dialogues B4](design/dialog-system-variant-b4.md) — « Quiet Dialogues », validée comme baseline centrée / panneau / plein écran mobile.
- [Validation consolidée C1](design/consolidated-validation-c1.md) — cohérence B1–B4, reflow, accessibilité et recette transversale.
- [UX du catalogue 0.2](design/catalogue-ux-0.2.md) — accueil, previews et navigation interne.
- [UX de la session personnelle 0.3](design/personal-session-ux-0.3.md) — favoris, timer, Focus Mode et préférences.
- [UX de la composition 1.0](design/composition-ux-1.0.md) — compositeur, bibliothèque et gestion des mixes.

## Architecture

- [Architecture technique](architecture/architecture.md) — frontières, structure cible et responsabilités.
- [Modèle de données](architecture/data-model.md) — contrats TypeScript et persistance.
- [Moteur audio](architecture/audio-engine.md) — cycle de vie Web Audio, transitions et erreurs.
- [ADR-0001 : décisions fondatrices](architecture/decisions/0001-foundational-architecture.md).
- [ADR-0002 : catalogue, transitions et préchargement](architecture/decisions/0002-catalogue-transitions-and-preloading.md).
- [ADR-0003 : préférences locales, timer et Focus Mode](architecture/decisions/0003-local-preferences-timer-and-focus.md) — accepté au Lot 16.
- [ADR-0004 : lecture en arrière-plan best effort](architecture/decisions/0004-best-effort-background-playback.md) — accepté au Lot 19b.
- [ADR-0005 : composition locale et mixes sauvegardés](architecture/decisions/0005-local-composition-and-saved-mixes.md) — accepté au Lot 22.
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
- [Candidate de release 0.2](project/release-candidate-0.2.md) — résultats automatisés, recette et validation de production.
- [Release 0.3](project/release-candidate-0.3.md) — résultats locaux et de production, rollback et validation Gate D.
- [Candidate de release 1.0](project/release-candidate-1.0.md) — preuves locales, rollback et contrôles restants de Gate E.
- [Checklist Gate D — 0.3](project/gate-d-checklist-0.3.md).
- [Checklist Gate E — 1.0](project/gate-e-checklist-1.0.md).

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
