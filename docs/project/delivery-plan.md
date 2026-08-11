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

**Statut : terminé le 2026-08-10.**

### Livrables

- Liste éditoriale à quatre destinations et previews visuelles.
- Action `Atmospheres` et navigation interne du player.
- Focus, historique, toucher, mouvement réduit et erreurs de preview.

### Validation

- Aucun audio avant Play.
- Aucun double tap, piège clavier ou saut de layout.
- URL et ambiance courante restent synchronisées.

## Lot 11 — Identités visuelles

**Statut : terminé le 2026-08-10.**

### Livrables

- Fallbacks et médias finaux des trois nouvelles ambiances.
- Points focaux, thèmes, variantes responsive, preuves de licence et crédits.
- Références visuelles desktop/mobile.

### Validation

- Revue créative distincte pour chaque ambiance.
- Lisibilité, contraste, zoom et budgets images conformes.

## Lot 12 — Actifs et mixages audio

**Statut : terminé le 2026-08-10 ; recette d’écoute longue validée sur desktop et mobile.**

### Livrables

- Deux ou trois couches finales par nouvelle ambiance.
- Pipeline reproductible, crédits, caractéristiques et validation de boucle.
- Mixages par défaut cohérents entre les quatre ambiances.

### Validation

- Écoute longue sans jointure, fatigue ou saturation.
- Actifs et total du catalogue dans les budgets.

## Lot 13 — Session persistante et crossfades

**Statut : terminé le 2026-08-10 ; recette desktop et mobile validée.**

### Livrables

- Un `AudioContext`, deux bus maximum et session persistante du player.
- Crossfade, annulation des cibles obsolètes et reprise après erreur.
- Transition visuelle coordonnée sans API expérimentale critique.

### Validation

- Navigation rapide sans son doublé, clic, fuite ou URL incohérente.
- Cible lente et couche partielle testées.

## Lot 14 — Préchargement et performance

**Statut : terminé le 2026-08-10 ; contrôles automatisés validés.**

### Livrables

- Préchargement d’une cible visuelle et, après Play, d’une cible audio éligible.
- Conditions `Save-Data`/connexion, annulation et cache borné.
- Mesures réseau, mémoire, bundles et Lighthouse.

### Validation

- Une action explicite reste prioritaire.
- Budgets 0.2 et baseline 0.1 respectés.

Le laboratoire local confirme les budgets et l’absence de fuite après dix
transitions. Les mesures Lighthouse de production restent une validation de
release du Lot 15, après déploiement de la candidate.

## Lot 15 — Stabilisation 0.2

**Statut : terminé le 2026-08-11 ; Gate C validée et tag `v0.2.0` autorisé.**

### Livrables

- Matrice multi-navigateurs/appareils, accessibilité et écoute croisée.
- Smoke test des quatre routes et scénarios dégradés.
- Documentation de release, rollback et Gate C.

### Validation

- Gate C approuvée sans défaut critique ou majeur.
- Tag `v0.2.0` autorisé explicitement.

Les contrôles automatisés, le smoke local de production, la documentation de
candidate, les appareils réels et les technologies d’assistance sont validés.
Les mesures HTTPS post-déploiement, la Gate C et la création du tag `v0.2.0` ont
été approuvées explicitement par le responsable du projet.

## Lot 16 — Cadrage produit, UX et architecture 0.3

**Statut : terminé et approuvé le 2026-08-11.**

### Livrables

- Exigences fonctionnelles et parcours critique du MVP 0.3.
- UX des favoris, volumes persistants, timer, Focus Mode et réinitialisation.
- ADR-0003 sur le stockage versionné et l’état éphémère de session.
- Modèle V1, budgets, risques, stratégie de tests et checklist Gate D.
- Découpage des Lots 17 à 21 sans implémentation anticipée.

### Validation

- Périmètre inclus/exclus et vocabulaire approuvés.
- Sémantique du timer et contenu réellement persisté acceptés.
- ADR-0003 acceptée avant création de la couche de préférences.
- Aucun élément v1, backend, analytics ou média supplémentaire introduit.

## Lot 17 — Socle de préférences locales

**Statut : terminé le 2026-08-11.**

### Livrables

- Adaptateur `localStorage` V1 pur, validation, erreurs et reset.
- Provider client minimal et hydratation sans incohérence serveur.
- Tests corruption, versions, IDs obsolètes, quota et absence de stockage.

### Validation

- Aucun accès navigateur au rendu serveur ou à l’import.
- Aucun contexte audio ou réseau déclenché par la lecture des préférences.
- Snapshot borné, écritures regroupées et nettoyage des listeners.

Le provider est monté au layout racine avec une projection des seuls IDs utiles.
Seize tests ciblés couvrent SSR, validation, corruption, versions, IDs obsolètes,
quota, reset, coalescence et flush. Un scénario navigateur injecte JSON corrompu
et version inconnue avant un vrai rechargement sur les cinq profils. Aucun
contrôle public n’est encore branché.

## Lot 18 — Favoris et volumes persistants

**Statut : terminé et validé le 2026-08-11.**

### Livrables

- Toggle favori dans le player et indicateur stable sur l’accueil.
- Volumes par ambiance restaurés et reliés au moteur actif.
- Dialogue Preferences et réinitialisation complète.

### Validation

- Ordre éditorial inchangé et aucun dashboard ajouté.
- Navigation/rechargement conservent les valeurs valides.
- Reset restaure données, UI et gains sans redémarrer l’audio.

Le player expose un toggle favori secondaire avec `aria-pressed`. L’accueil
réserve un marqueur textuel `Saved` sans modifier l’ordre éditorial. Les volumes
du snapshot deviennent la source du player après hydratation et chaque mutation
reste appliquée immédiatement au moteur actif. Le dialogue `Preferences`,
disponible sur l’accueil et les players, explique le stockage local, signale la
dégradation mémoire et supprime la clé complète lors du reset.

La couverture automatisée atteint 103 tests unitaires/composants et 70 cas
Playwright sur cinq profils. Le parcours dédié vérifie écriture coalescée,
rechargement réel, marqueur d’accueil, dialogue accessible, suppression de la
clé et retour au volume catalogue. La recette des favoris, des volumes restaurés
et du reset a été validée sur desktop et mobile par le responsable du projet.

## Lot 19 — Timer de session

**Statut : terminé et validé le 2026-08-11.**

### Livrables

- Dialogue des cinq durées, état visible, remplacement et annulation.
- Contrôleur à échéance absolue et reprise après throttling.
- Fade-out final de cinq secondes puis Pause confirmée.

### Validation

- Lecture, pause, navigation, arrière-plan et délai fortement retardé testés.
- Une seule échéance et aucune création audio avant Play.
- Aucun son transitoire au retour d’un onglet après échéance.

Le timer vit dans le provider de session des routes player et conserve un unique
timestamp absolu `endsAt`. Il survit donc aux changements d’ambiance, mais son
timeout et son état sont détruits à la sortie ou au rechargement. Le réveil est
réévalué sur `visibilitychange` et `pageshow`. Le moteur expose seulement une
intention de fade master : cinq secondes si le contexte joue réellement, ou une
Pause immédiate lorsque le son est absent, suspendu ou déjà fermé.

Le dialogue natif propose exactement les cinq durées approuvées, le remplacement
et l’annulation. Le compte à rebours visuel est séparé des annonces polies. La
couverture atteint 112 tests unitaires/composants et 80 cas Playwright sur cinq
profils. Une horloge navigateur simulée confirme une échéance fortement retardée
sans création d’`AudioContext`. La recette humaine du fade et des contrôles
desktop/mobile a confirmé les durées, la navigation, l’annulation et la fin de
session. La coupure volontaire en arrière-plan observée pendant cette recette a
motivé le Lot 19b.

## Lot 19b — Lecture en arrière-plan best effort

**Statut : terminé et validé le 2026-08-11.**

### Livrables

- Lecture maintenue sur page masquée lorsque la plateforme l’autorise.
- Fade du timer programmé à l’avance dans Web Audio puis réarmé après Play.
- Dégradation vers Pause si une suspension système ne peut pas être reprise.
- ADR-0004 et limites de la promesse produit documentées.

### Validation

- Aucun appel volontaire à `AudioContext.suspend()` au masquage.
- Timer remplacé, annulé, pausé ou expiré sans automation master résiduelle.
- Échéance évaluée avant reprise et aucun son transitoire après expiration.
- Recette desktop, Android et iOS distinguant onglet, application et verrouillage.

Le moteur conserve l’heure audio de fin du fade. Si JavaScript se réveille en
retard, la session attend seulement la portion encore active ; si le fade est
déjà terminé, Pause est confirmée immédiatement. Les plateformes qui refusent la
reprise restent utilisables avec un nouveau geste Play explicite. La validation
automatisée atteint 117 tests unitaires/composants et 85 cas Playwright sur cinq
profils : 81 réussissent et les quatre skips WebKit connus restent inchangés.
La recette réelle confirme la lecture de fond best effort et la récupération de
session sur desktop et mobile.

## Lot 20 — Focus Mode

**Statut : terminé et validé le 2026-08-11.**

### Livrables

- Composition épurée, sortie visible, `Escape` et restauration du focus.
- Maintien de Play/Pause, timer et erreurs récupérables.
- Responsive, safe areas et mouvement réduit.

### Validation

- Aucun contrôle masqué encore focusable.
- Parcours souris, clavier, toucher et lecteurs d’écran.
- Changement d’ambiance et fin du timer sans issue cachée.

Le mode est un état éphémère du layout player, indépendant de Web Audio et du
stockage. L’entrée retire les zones secondaires du rendu et place le focus sur
la sortie textuelle. Le bouton ou `Escape` restaure le déclencheur courant, avec
Play/Pause comme repli si aucun déclencheur n’est disponible. La validation automatisée
atteint 120 tests unitaires/composants et 90 cas Playwright sur cinq profils ; 86
passent et les quatre skips WebKit historiques restent inchangés. La recette
souris, clavier, toucher et responsive est validée sur desktop et mobile.

## Lot 21 — Stabilisation 0.3

**Statut : terminé le 2026-08-11 ; Gate D approuvée et tag `v0.3.0` autorisé.**

### Livrables

- Matrice multi-navigateurs, appareils réels, accessibilité et stockage dégradé.
- Mesures bundles, écritures, timers/listeners, Lighthouse et smoke production.
- Documentation de release, rollback, candidate et Gate D.

### Validation

- Gate D approuvée sans défaut critique ou majeur.
- Tag `v0.3.0` autorisé explicitement.

La candidate `0.3.0` passe une installation verrouillée, 120 tests, la matrice
Playwright complète en une seule exécution, les audits médias/dépendances, le
smoke local enrichi et dix audits Lighthouse. Un ancien parcours Firefox a été
stabilisé en attendant le DOM utile plutôt que l’événement `load` complet. Le
rollback public 0.2 est validé avec une préférence V1 présente. La recette
consolidée desktop/mobile, technologies d’assistance, texte agrandi et contraste
élevé est validée le 2026-08-11 ; le risque Safari macOS résiduel est
renouvelé. La CI de PR et les contrôles HTTPS post-déploiement restent requis.

La PR #3 est fusionnée par Squash sur `main` au commit `71db4e7`. Les workflows
`quality`, build et déploiement Pages réussissent. Le smoke HTTPS 0.3 valide
quatre routes, préférences, timer, Focus Mode, transition audio et 404. Les dix
audits Lighthouse de production obtiennent 99–100 en performance et 100 en
accessibilité, bonnes pratiques et SEO. LucasG0ld approuve la Gate D et autorise
explicitement le tag `v0.3.0` le 2026-08-11.
