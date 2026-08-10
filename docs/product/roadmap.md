# Roadmap

La roadmap est orientée résultats. Une phase ne commence que lorsque les critères de sortie de la précédente sont atteints ; les dates seront ajoutées lorsqu’une capacité de réalisation sera connue.

## Fondation documentaire — terminée

**Résultat :** vision, périmètre, architecture et critères de qualité partagés.

- Documentation initiale.
- Décisions fondatrices et registre des risques.
- Préparation des règles de contribution et de licence.

**Sortie :** documentation reliée, sans contradiction bloquante, et prochaine tranche définie.

## Prototype visuel Rainy Apartment — terminé

**Résultat :** l’expérience est convaincante sans dépendre du moteur audio.

- Scaffold Next.js et outillage minimal.
- Fonts, tokens, reset, layout et thème Rainy Apartment.
- Accueil et route player.
- Background, overlays, horloge, titre et description.
- Trois sliders visuels et bouton play/pause simulé.
- Animations, responsive, clavier et mouvement réduit.

**Sortie :** revue visuelle desktop/mobile validée, aucun blocage d’accessibilité, contrôles compris lors d’un test rapide.

## MVP 0.1 — Rainy Apartment sonore — terminé

**Résultat :** les trois couches sont réellement écoutables et réglables.

- Sélection et licence des boucles.
- Moteur Web Audio minimal, gestion de chargement et erreurs.
- Volumes indépendants, master play/pause et fondus.
- Tests de cycle de vie et validation multi-navigateurs.
- Mesures de performance média.

**Sortie :** production GitHub Pages, Gate B automatisée et manuelle validées le 2026-08-10. Le contrôle Safari macOS réel, impossible faute d’appareil, est couvert partiellement par Safari iOS réel et WebKit desktop automatisé ; le responsable du projet a explicitement accepté ce risque résiduel.

## MVP 0.2 — Catalogue initial

**Statut : Lots 8 à 10 terminés sur `mvp-0.2` ; Lot 11 à démarrer.**

**Résultat :** l’utilisateur explore plusieurs personnalités sans rupture d’expérience.

- Quiet Coffee Shop, Deep Forest et Fireplace.
- Données, visuels et actifs audio licenciés pour chaque ambiance.
- Navigation interne et preview.
- Crossfades visuels et audio entre ambiances.
- Préchargement mesuré et limité.

**Sortie :** ajout d’une ambiance sans code spécifique d’UI ; transitions fluides sur mobile médian.

## MVP 0.3 — Session personnelle locale

**Résultat :** l’utilisateur peut s’immerger, limiter une session et retrouver ses préférences.

- Focus Mode.
- Timer 15, 30, 45, 60 et 90 minutes avec fade-out.
- Favoris et préférences dans `localStorage`.
- Versionnement et récupération des données locales.

**Sortie :** persistance robuste, timer testé en arrière-plan et Focus Mode accessible.

## Version 1 — Composition

**Résultat :** l’utilisateur crée et sauvegarde localement ses propres mixes.

- Bibliothèque d’ambiances.
- Création, nommage, modification et suppression de mixes.
- Sauvegarde locale et migration de schéma.
- Gestion audio et transitions approfondies.

## Parking lot

Ces pistes exigent une nouvelle décision produit et ne sont pas implicitement planifiées : compte, synchronisation cloud, backend, paiement, social, application native, WebGL avancé, analytics comportementales et internationalisation.
