# Spécification fonctionnelle du MVP 0.1

## Objectif de la version

Livrer une expérience complète mais volontairement étroite autour de **Rainy Apartment** : un accueil, un player immersif, trois réglages visuels, une horloge et un contrôle play/pause. La première tranche valide d’abord l’interface ; l’audio réel est raccordé dans une tranche ultérieure du même MVP.

## Périmètre

### Inclus

- Route `/` avec identité ATMOS, salutation locale et accès évident à Rainy Apartment.
- Route `/atmosphere/rainy-apartment` rendue correctement en accès direct.
- Background immersif avec solution de repli lisible.
- Horloge locale, titre, description et navigation minimale.
- Sliders Rain, Window Rain et Distant Thunder.
- Play/pause global.
- Animations d’entrée et de transition, avec version réduite.
- Mise en page desktop, tablette et mobile.
- Gestion des états de chargement, d’échec média et d’audio indisponible.
- Dans la seconde tranche : lecture en boucle de trois couches et volume indépendant.

### Exclus

- Autres ambiances, menu de catalogue complet, favoris, timer et Focus Mode.
- Mixes personnalisés et sauvegarde.
- Compte, backend, paiement, analytics et notifications.
- Vidéo, WebGL et parallaxe complexe.

## Exigences et critères d’acceptation

### FR-001 — Accueil

L’accueil présente le wordmark, une salutation adaptée à l’heure locale, une question courte et Rainy Apartment comme action principale.

- La destination est compréhensible sans hover.
- Elle est activable à la souris, au toucher et au clavier.
- Le lien utilise une URL réelle et reste utilisable sans animation.
- Aucun carrousel ou section marketing n’est requis.

### FR-002 — Accès au player

L’utilisateur peut ouvrir `/atmosphere/rainy-apartment` depuis l’accueil ou directement.

- Une URL ou un slug inconnu produit la réponse 404 de l’application.
- Le retour vers l’accueil est disponible par le wordmark ou un contrôle nommé.
- Le contenu critique reste lisible si le background échoue.

### FR-003 — Horloge et salutation

L’horloge affiche l’heure locale en heures et minutes.

- Le format suit le réglage local du navigateur, sauf décision visuelle documentée.
- La valeur se met à jour au changement de minute sans dérive perceptible.
- `05:00–11:59` affiche « Good morning. », `12:00–17:59` « Good afternoon. », sinon « Good evening. ».
- Le rendu serveur n’affiche pas une heure incorrecte comme information définitive ; l’hydratation ne génère pas d’avertissement.

### FR-004 — Présentation de l’ambiance

Le player affiche `RAINY APARTMENT` et une description éditoriale courte.

- Le titre reste lisible à 320 px de large et à 200 % de zoom.
- La hiérarchie ne dépend pas uniquement de la taille ou de la couleur.
- Le contraste est maintenu sur toutes les zones possibles du background.

### FR-005 — Sliders

Trois réglages nommés pilotent une valeur continue de 0 à 100, avec valeurs initiales proposées : Rain 65, Window Rain 40, Distant Thunder 15.

- Chaque contrôle expose nom, minimum, maximum et valeur aux technologies d’assistance.
- Flèches, Page Up/Down, Home et End ont un comportement cohérent avec un slider natif.
- La cible tactile atteint au moins 44 × 44 CSS px même si la piste est plus fine.
- La valeur devient visible au focus ou pendant l’interaction et n’est jamais disponible uniquement au hover.
- La version visuelle met à jour l’état sans nécessiter l’audio.
- Après raccordement audio, la modification agit immédiatement avec une rampe courte évitant les clics sonores.

### FR-006 — Play/pause

Le contrôle global alterne entre lecture et pause.

- L’état et l’action sont annoncés avec un nom accessible non ambigu.
- Le premier geste utilisateur peut initialiser ou reprendre l’`AudioContext`.
- Une demande pendant le chargement ne lance pas plusieurs initialisations concurrentes.
- Un échec ne laisse pas l’interface dans un faux état « playing » et produit un message discret permettant de réessayer.
- La pause et la reprise utilisent une transition de volume courte.

### FR-007 — Audio multi-couches, tranche audio

Rain, Window Rain et Distant Thunder peuvent jouer simultanément en boucle.

- Chaque couche possède son gain et converge vers le gain master.
- Les boucles ne présentent pas de coupure évidente avec les actifs choisis.
- Les ressources sont libérées au démontage et lors d’un changement futur d’ambiance.
- Un onglet masqué ne provoque pas de consommation évitable ; le comportement exact de suspension est testé par navigateur.

### FR-008 — Mouvement

Les éléments entrent par fondu, translation faible ou léger flou et les contrôles répondent avec discrétion.

- Aucun mouvement essentiel ne bloque l’action.
- Avec `prefers-reduced-motion: reduce`, les translations, parallaxes et flous animés sont supprimés ou fortement réduits.
- Les durées de transition ne retardent pas la navigation ni le feedback de contrôle.

### FR-009 — Responsive

- Desktop : composition plein écran, espace négatif important, contrôles regroupés sans panneau lourd.
- Tablette : hiérarchie préservée, aucune collision en paysage ou portrait.
- Mobile : contenu défilable si nécessaire, contrôles utilisables au pouce et respect des safe areas.
- Le player reste fonctionnel à 320 × 568, à 200 % de zoom et avec clavier logiciel lorsque pertinent.

### FR-010 — États dégradés

- Image absente : gradient thématique, texte et contrôles intacts.
- Audio absent ou décodage échoué : contrôle désactivé ou erreur actionnable, sans crash.
- JavaScript en chargement : structure et contenu essentiels stables.
- Connexion lente : priorité au texte et au contrôle, chargement média non bloquant.

## Exigences non fonctionnelles

- TypeScript strict, aucune erreur console attendue.
- HTML sémantique et navigation clavier complète.
- Aucune donnée personnelle transmise dans le MVP.
- Images responsives et formats modernes ; budgets dans le document performance.
- Actifs accompagnés de leur source et licence.
- Pas de dépendance au réseau après chargement des actifs nécessaires à l’ambiance active.

## Parcours critique de recette

1. Ouvrir l’accueil à largeur mobile puis desktop.
2. Identifier et activer Rainy Apartment au clavier.
3. Vérifier l’arrivée directe sur le player et le retour.
4. Contrôler les trois sliders avec clavier, souris et toucher.
5. Activer play, ajuster les volumes, mettre en pause et reprendre.
6. Simuler image et audio en erreur.
7. Refaire le parcours avec mouvement réduit et zoom 200 %.

## Sortie du MVP 0.1

La version est publiable lorsque tous les critères inclus sont satisfaits, que les tests utilisateurs courts ne révèlent pas d’incompréhension du parcours principal et que la [définition de terminé](../project/definition-of-done.md) est appliquée.
