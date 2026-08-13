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
renouvelé. La CI de PR et les contrôles HTTPS post-déploiement ont ensuite été
validés avant la publication du tag `v0.3.0`.

La PR #3 est fusionnée par Squash sur `main` au commit `71db4e7`. Les workflows
`quality`, build et déploiement Pages réussissent. Le smoke HTTPS 0.3 valide
quatre routes, préférences, timer, Focus Mode, transition audio et 404. Les dix
audits Lighthouse de production obtiennent 99–100 en performance et 100 en
accessibilité, bonnes pratiques et SEO. LucasG0ld approuve la Gate D et autorise
explicitement le tag `v0.3.0` le 2026-08-11.

## Lot 22 — Cadrage produit et UX 1.0

**Statut : terminé et approuvé le 2026-08-11.**

### Livrables

- Exigences fonctionnelles et parcours critique de la composition 1.0.
- Spécification UX du compositeur, de la bibliothèque et de `Your mixes`.
- ADR-0005 sur le domaine, le stockage V2, la route statique et le moteur borné.
- Budgets 1.0, nouveaux risques et checklist Gate E.
- Découpage des Lots 23 à 28 sans implémentation anticipée.

### Validation

- Quatre couches et 20 mixes maximum approuvés.
- Scène d’origine fixe, médias existants uniquement et stockage local approuvés.
- Migration, rollback, états dégradés et limites audio compris avant implémentation.
- Aucun import, compte, cloud, partage ou interface de DAW implicite.

## Lot 23 — Registre sonore et stockage V2

**Statut : terminé le 2026-08-11.**

### Livrables

- Résolution validée des références globales de couches.
- Contrats `SavedMixV1` et `StoredPreferencesV2` indépendants de l’UI.
- Migration pure V1 vers V2, limites, corruption et stockage indisponible.
- Actions provider pour créer, mettre à jour et supprimer un mix.

### Validation

- Valeurs 0.3 valides préservées sémantiquement par la migration.
- Aucun accès stockage côté serveur et aucune création audio.
- Reset, quota et version inconnue couverts ; rollback complet réservé à Gate E.

Le registre sonore est dérivé des quatre ambiances et résout les douze actifs par
couple `atmosphereId`/`layerId`, sans dupliquer chemin ou licence. Les contrats
`SoundReference`, `SavedMix` et `StoredPreferencesV2` restent indépendants de
l’UI. La migration V1 valide les valeurs existantes, initialise `savedMixes`,
puis tente une écriture atomique ; quota refusé et version inconnue conservent un
état mémoire sûr sans suppression. Le provider expose création, mise à jour et
suppression, coalesce les écritures et bloque les limites approuvées.

La couverture atteint 132 tests unitaires/composants sur 24 fichiers. Build,
lint, types, audit de dépendances et budgets réussissent sans nouveau package,
média, fetch ou `AudioContext`. Le build mesure 12,5 Kio de JavaScript gzip sur
l’accueil et 60,4 Kio sur le player, soit +0,8 Kio par route face à la candidate
0.3 ; CSS et fonts restent respectivement à 6,8/9,1 Kio et 29,4 Kio.

Un parcours navigateur injecte une V1 réelle, vérifie la V2 écrite, les valeurs
restaurées et l’absence d’audio sur les cinq profils. La matrice consolidée
compte 95 cas : 91 réussissent et les quatre skips WebKit documentés restent
inchangés. Une attente `load` Firefox ponctuellement bloquée sous cinq workers a
été limitée à `DOMContentLoaded` sur le parcours concerné ; ses assertions
attendent ensuite explicitement les contrôles et la matrice complète est verte.

## Lot 24 — Fondations visuelles du compositeur

**Statut : terminé et validé sur desktop et mobile le 2026-08-12.**

### Livrables

- Route statique `/compose` et entrée `Create a mix`.
- Brouillon local, liste de couches et sliders sans moteur étendu.
- Dialogue `Add a sound`, limites et états responsive.

### Validation

- Parcours complet simulé au clavier, toucher et zoom 200 %.
- Aucune requête audio avant Play et aucun dashboard visuel.
- Dialogues et navigation restaurent le focus.

La route statique `/compose` partage désormais la frontière de session des
players via le route group `(session)`. L’entrée `Create a mix` transmet la scène
d’origine, avec repli sûr vers Rainy Apartment. Le brouillon affiche trois
couches initiales, leurs origines et leurs volumes persistés, puis permet
d’ajouter ou retirer des sons du registre dans la limite de quatre et sans
descendre sous une couche.

La bibliothèque est un dialogue natif regroupé par ambiance. Les sons déjà
présents et les ajouts au-delà de la limite sont désactivés explicitement ; la
fermeture restaure le focus et les changements sont annoncés. Les actions Play
et Save restent visibles mais indisponibles avec une explication, car le moteur
live et la sauvegarde relèvent respectivement des Lots 25 et 26. Aucun chargement
audio, fetch ou `AudioContext` n’est déclenché par ce lot.

La couverture atteint 136 tests unitaires/composants sur 25 fichiers et la
matrice Playwright 100 cas : 96 réussissent et les quatre reports WebKit
historiques restent inchangés. Le parcours compositeur, l’ordre clavier et la
largeur 320 px passent sur les cinq profils. Le build statique, les types, le
lint, l’audit, les actifs et les budgets passent ; `/compose` mesure 20,9 Kio de
JavaScript gzip et 9,2 Kio de CSS. La recette manuelle desktop et mobile est
validée par le responsable du projet.

## Lot 25 — Moteur de composition live

**Statut : terminé et validé sur desktop et mobile le 2026-08-12.**

### Livrables

- Graphe audio arbitraire borné à quatre couches.
- Ajout, retrait, volume, erreur partielle et nettoyage par référence globale.
- Intégration Play/Pause, timer, Focus Mode et arrière-plan best effort.

### Validation

- Un contexte unique et quatre voies stables maximum.
- Aucun clic, son résiduel ou chargement de la bibliothèque complète.
- Tests de stress sur changements rapides et erreurs partielles.

Le compositeur pilote désormais la session audio existante avec un identifiant
de mix éphémère et les références globales `atmosphereId:layerId`. Play demeure
le seul geste qui crée l’`AudioContext` et charge les trois sons initiaux. Une
mutation ultérieure synchronise uniquement la différence : l’ajout charge et
démarre une source, le retrait l’éteint puis la déconnecte, et les volumes
utilisent les rampes de 50 ms déjà éprouvées. Le moteur refuse les ensembles
vides, dupliqués ou supérieurs à quatre couches.

Une couche ajoutée en erreur reste locale : son contrôle est désactivé et les
autres continuent. Les requêtes concurrentes d’une même référence sont
partagées, les ajouts devenus obsolètes sont annulés et le nettoyage arrête
sources, gains, timers et fetchs. Timer, Focus Mode et lecture en arrière-plan
best effort restent portés par la même session ; la sauvegarde reste désactivée
jusqu’au Lot 26.

La couverture atteint 144 tests unitaires/composants sur 25 fichiers. La matrice
Playwright comporte 110 cas : 106 réussissent, dont l’ajout/retrait live, le
Focus Mode et l’échec partiel sur cinq profils ; les quatre reports WebKit restent
inchangés. Le build, les types, le lint, l’audit et les budgets passent.
`/compose` mesure 23,4 Kio de JavaScript gzip et 9,3 Kio de CSS. La dernière
La recette manuelle desktop/mobile des mutations pendant la lecture, y compris
timer, Focus Mode et arrière-plan, est validée par le responsable du projet. Le timeout E2E passe à 60
secondes afin d’absorber les chargements `load` Firefox sous cinq workers, sans
modifier les assertions fonctionnelles.

## Lot 26 — Sauvegarde et gestion des mixes

**Statut : terminé et validé sur desktop et mobile le 2026-08-12.**

### Livrables

- Nommage, sauvegarde, état dirty et confirmation de perte.
- `Your mixes`, ouverture, modification, renommage et suppression.
- États stockage indisponible et limites 20 mixes/128 Kio.

### Validation

- CRUD et rechargement réels sans reprise audio automatique.
- Noms identiques, IDs stables et données obsolètes couverts.
- Reset global explicite et accessible.

Le premier `Save mix` ouvre un dialogue de nommage borné à 40 caractères ; les
sauvegardes suivantes mettent à jour le même ID opaque. `Your mixes` apparaît
uniquement lorsqu’une collection existe et conserve son ordre de création. Il
permet d’ouvrir en pause, renommer et supprimer chaque mix, y compris lorsque des
noms sont identiques. Supprimer le mix actif restaure un brouillon sûr de sa
scène sans toucher aux médias.

Les changements non sauvegardés protègent l’ouverture d’un autre mix et le
retour à la scène par une confirmation interne ; `beforeunload` couvre aussi la
fermeture complète selon la politique du navigateur. La collection pleine est
expliquée avant sauvegarde. Le budget sérialisé de 128 Kio est vérifié avant
commit, et un échec de stockage conserve l’état en mémoire avec une annonce.
Le reset des préférences exige désormais une confirmation nommant favoris,
volumes et tous les mixes.

La couverture atteint 149 tests unitaires/composants sur 25 fichiers. La matrice
Playwright comporte 115 cas : 111 réussissent, dont un CRUD réel avec
rechargement et contrôle de l’ID stable sur cinq profils, et les quatre skips
WebKit historiques restent inchangés. `/compose` mesure 25,5 Kio de JavaScript gzip et
9,7 Kio de CSS. Types, lint, format, build, médias, audit et budgets passent. La
recette manuelle desktop/mobile du CRUD et des confirmations est validée par le
responsable du projet.

## Lot 27 — Intégration et performance 1.0

**Statut : terminé et validé sur desktop et mobile le 2026-08-13.**

### Livrables

- Intégration discrète à l’accueil et aux players.
- Cache, décodage, transitions et bundles mesurés puis bornés.
- Parcours consolidés 0.1 à 1.0 et documentation de maintenance.

### Validation

- Dix changements de mix sans fuite ni croissance non bornée.
- Budgets réseau, mémoire, stockage et JavaScript respectés.
- Aucune régression catalogue, timer, favoris ou Focus Mode.

L’accueil expose désormais un unique lien textuel `Your mixes`, après
hydratation et seulement si la collection n’est pas vide. Il mène au compositeur
sans ajouter de grille ou de bloc promotionnel. Les players conservent leur
entrée secondaire `Create a mix`. Le smoke local couvre les quatre routes,
préférences, timer, Focus Mode, transition catalogue, création/sauvegarde,
réouverture depuis l’accueil, lecture du mix et 404.

La reprise audio compare désormais l’ID de scène et la signature réelle des
couches : deux mixes d’une même scène ouverts en pause sont resynchronisés avant
Play. Le test dédié évite qu’un ancien graphe reste audible sous un nouveau nom.

La mesure de dix changements de mix retourne à deux sources stables, atteint au
plus sept sources transitoires sur huit, conserve un seul `AudioContext` et huit
listeners avant/après. Neuf URL audio uniques transfèrent 4 628 969 octets, sous
le budget catalogue de 12 Mio. Après collecte du garbage collector, le tas croît
de 575 933 octets, contre 1 334 668 octets sur le parcours catalogue 0.3 mesuré
dans le même build, et sous le plafond automatique de 1,5 Mo.

Le build conserve 12,9 Kio de JavaScript sur l’accueil, 61,9 Kio sur le player et
25,6 Kio sur `/compose`, avec 9,7 Kio de CSS. Les douze audits Lighthouse locaux
obtiennent 100 en accessibilité, bonnes pratiques et SEO. Le compositeur obtient
99 en performance mobile (LCP 2,10 s) et 100 desktop (LCP 0,45 s). La couverture
atteint 151 tests unitaires/composants ; la matrice consolidée reste à 115 cas,
111 réussites et quatre skips WebKit historiques.

La recette d’intégration est validée par le responsable du projet sur desktop
et mobile le 2026-08-13 : entrée conditionnelle, ouverture et lecture d’un mix,
deux mixes d’une même scène, navigation et fonctions historiques sont conformes.

## Lot 28 — Stabilisation 1.0

**Statut : candidate locale en préparation depuis le 2026-08-13 ; Gate E en attente.**

### Livrables

- Matrice navigateurs, appareils réels, accessibilité et écoute longue.
- Candidate, changelog, rollback, smoke, Lighthouse et dossier Gate E.
- PR protégée vers `main` et préparation du tag `v1.0.0`.

### Validation

- Gate E approuvée sans défaut critique ou majeur.
- Production HTTPS vérifiée après fusion.
- Tag `v1.0.0` autorisé explicitement.

La candidate locale est préparée en version `1.0.0`, sans nouvelle dépendance.
Une installation verrouillée de 483 paquets, format, lint, types, 151 tests,
build statique, audits médias/dépendances et budgets réussissent. Le smoke local
couvre le parcours consolidé jusqu’à la lecture d’un mix sauvegardé. La matrice
Playwright rejouée avec les deux workers de CI compte 111 réussites et quatre
reports WebKit historiques sur 115 cas.

Les mesures de candidate confirment un seul `AudioContext`. Après dix changements
de mix, deux sources restent actives, le pic transitoire atteint sept sur huit,
les huit listeners restent stables et le delta de tas après GC est de 573 305
octets, contre 1 208 560 sur le parcours catalogue du même build. Les bundles
restent à 12,9 Kio pour l’accueil, 61,9 Kio pour le player et 25,6 Kio pour le
compositeur.

Le rollback réel vers la production 0.3 ignore et préserve sans erreur un
snapshot V2 contenant un mix. Le contrôle est reproductible par
`npm run rollback:check`. Lighthouse accepte désormais une racine HTTPS externe
via `ATMOS_LIGHTHOUSE_URL`; son mode local et son mode production ont été
contrôlés. La recette réelle, la PR, le déploiement, le smoke/Lighthouse HTTPS et
l’autorisation du tag restent requis avant de terminer ce lot.

Le responsable du projet valide le 2026-08-13 la candidate sur desktop et
mobile : écoute longue multi-mixes, clavier, toucher, lecteurs d’écran, zoom
200 %, texte agrandi, contraste élevé, mouvement réduit, Chrome Android et
Safari iOS réels sont conformes. Aucun défaut n’est signalé. Le risque Safari
macOS reste à réévaluer explicitement avant la décision Gate E.
