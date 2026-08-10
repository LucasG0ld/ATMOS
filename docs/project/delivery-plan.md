# Plan de réalisation

Chaque lot produit un résultat démontrable. Ne pas commencer le lot audio avant validation du prototype visuel.

## Lot 0 — Initialisation

**Statut : terminé le 2026-08-10.**

### Livrables

- Projet Next.js TypeScript avec App Router et répertoire `src`.
- Tailwind, Motion et Lucide installés à leurs versions stables vérifiées au moment du scaffold.
- Scripts `dev`, `build`, `lint`, `typecheck` et `test`.
- TypeScript strict, formatage, lint et tests de base.
- Métadonnées, favicon provisoire typographique et structure de styles.

### Validation

- Installation reproductible depuis un clone propre.
- Toutes les commandes passent en local et CI.
- Aucun composant ou dépendance de fonctionnalité future.

## Lot 1 — Fondations visuelles

**Statut : terminé le 2026-08-10.**

### Livrables

- Font choisie après comparaison courte.
- Tokens globaux, reset, styles de focus et utilitaires de safe area.
- Données Rainy Apartment validées.
- Primitive de scène avec thème et fallback de background.

### Validation

- Page d’essai lisible de 320 à 1440 px, zoom 200 % compris.
- Contrastes initiaux contrôlés sur image et fallback.
- Licence du visuel enregistrée.

## Lot 2 — Accueil

**Statut : terminé le 2026-08-10.**

### Livrables

- Wordmark, salutation, question et destination Rainy Apartment.
- États hover, focus, touch et mouvement réduit.
- Navigation sémantique vers le player.

### Validation

- Parcours au clavier sans piège.
- Destination comprise sans hover ni son.
- Rendu stable sur mobile et desktop.

## Lot 3 — Player visuel

**Statut : terminé le 2026-08-10.**

### Livrables

- Route dynamique et gestion 404.
- Background, overlays, horloge, titre et description.
- Composition responsive desktop/mobile.
- Animations d’entrée.

### Validation

- Pas d’avertissement d’hydratation.
- Gradient de repli valide si l’image échoue.
- Titre intact à 320 px et zoom 200 %.

## Lot 4 — Contrôles simulés

**Statut : terminé le 2026-08-10.**

### Livrables

- `AtmosSlider` accessible sur primitive native.
- Trois volumes en état local.
- Play/pause visuel et états d’interaction.
- Tests composants et parcours automatisé critique sans audio.

### Validation

- Souris, clavier et toucher.
- Cibles 44 × 44 px.
- Revue visuelle et mini-test utilisateur validant le prototype.

## Gate A — Validation visuelle

**Statut : validée par revue utilisateur le 2026-08-10.**

Décider explicitement si l’interface satisfait les principes du brief. Corriger composition, rythme et comportements avant toute complexité sonore. Conserver captures desktop/mobile approuvées comme références de régression.

## Lot 5 — Actifs audio

**Statut : terminé le 2026-08-10.**

### Livrables

- Rain, Window Rain et Distant Thunder sourcés légalement.
- Boucles éditées, niveaux cohérents et formats compressés.
- Crédits, licences et preuves complétés.

### Validation

- Écoute longue sans jointure évidente.
- Taille totale dans le budget ou exception documentée.
- Compatibilité testée sur navigateurs cibles.

## Lot 6 — Moteur audio

**Statut : terminé le 2026-08-10.**

### Livrables

- Adaptateur Web Audio, machine d’états et nettoyage.
- Chargement après geste, gains individuels et master.
- Fondus play/pause et erreurs récupérables.
- Tests unitaires et intégration navigateur.

### Validation

- Pas de double contexte ou fuite sous Strict Mode.
- Pas de clic lors des changements normaux.
- Échec d’une couche sans crash global.

## Lot 7 — Stabilisation 0.1

**Statut : terminé le 2026-08-10 ; Gate B validée et release 0.1 approuvée.**

### Livrables

- Tests multi-navigateurs et appareils.
- Audit accessibilité, performance et média.
- SEO/métadonnées minimales, page 404 et politique de sécurité complétée.
- Déploiement de préproduction et checklist de release.

### Validation

- Tous les critères du MVP et la définition de terminé satisfaits.
- Aucun défaut critique ou majeur ouvert sur le parcours principal.

## Lot 8 — Cadrage produit et UX 0.2

**Statut : terminé et approuvé le 2026-08-10.**

### Livrables

- Exigences fonctionnelles 0.2 et parcours critique.
- Matrice éditoriale, visuelle et sonore des quatre ambiances.
- Spécification UX du catalogue, des previews et de la navigation interne.
- ADR catalogue, session persistante, crossfade et préchargement.
- Budgets 0.2, registre des risques et checklist Gate C.

### Validation

- Périmètre, vocabulaire et identités approuvés.
- Décisions techniques acceptées avant refactor du moteur.
- Aucun média non licencié ajouté au dépôt.

## Lot 9 — Registre et routes du catalogue

**Statut : terminé le 2026-08-10.**

### Livrables

- Définitions validées Quiet Coffee Shop, Deep Forest et Fireplace avec fallbacks CSS.
- Registre ordonné, invariants d’unicité et génération statique des quatre routes.
- Player générique démontré avec données et médias dégradés.

### Validation

- Ajouter une ambiance de test ne modifie aucun composant.
- Routes, métadonnées, préfixe GitHub Pages et 404 passent les tests.

## Lot 10 — Accueil catalogue et navigation

**Statut : en attente.**

### Livrables

- Liste éditoriale à quatre destinations et previews visuelles.
- Action `Atmospheres` et navigation interne du player.
- Focus, historique, toucher, mouvement réduit et erreurs de preview.

### Validation

- Aucun audio avant Play.
- Aucun double tap, piège clavier ou saut de layout.
- URL et ambiance courante restent synchronisées.

## Lot 11 — Identités visuelles

**Statut : en attente.**

### Livrables

- Fallbacks et médias finaux des trois nouvelles ambiances.
- Points focaux, thèmes, variantes responsive, preuves de licence et crédits.
- Références visuelles desktop/mobile.

### Validation

- Revue créative distincte pour chaque ambiance.
- Lisibilité, contraste, zoom et budgets images conformes.

## Lot 12 — Actifs et mixages audio

**Statut : en attente.**

### Livrables

- Deux ou trois couches finales par nouvelle ambiance.
- Pipeline reproductible, crédits, caractéristiques et validation de boucle.
- Mixages par défaut cohérents entre les quatre ambiances.

### Validation

- Écoute longue sans jointure, fatigue ou saturation.
- Actifs et total du catalogue dans les budgets.

## Lot 13 — Session persistante et crossfades

**Statut : en attente.**

### Livrables

- Un `AudioContext`, deux bus maximum et session persistante du player.
- Crossfade, annulation des cibles obsolètes et reprise après erreur.
- Transition visuelle coordonnée sans API expérimentale critique.

### Validation

- Navigation rapide sans son doublé, clic, fuite ou URL incohérente.
- Cible lente et couche partielle testées.

## Lot 14 — Préchargement et performance

**Statut : en attente.**

### Livrables

- Préchargement d’une cible visuelle et, après Play, d’une cible audio éligible.
- Conditions `Save-Data`/connexion, annulation et cache borné.
- Mesures réseau, mémoire, bundles et Lighthouse.

### Validation

- Une action explicite reste prioritaire.
- Budgets 0.2 et baseline 0.1 respectés.

## Lot 15 — Stabilisation 0.2

**Statut : en attente.**

### Livrables

- Matrice multi-navigateurs/appareils, accessibilité et écoute croisée.
- Smoke test des quatre routes et scénarios dégradés.
- Documentation de release, rollback et Gate C.

### Validation

- Gate C approuvée sans défaut critique ou majeur.
- Tag `v0.2.0` autorisé explicitement.
