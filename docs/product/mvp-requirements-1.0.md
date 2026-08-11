# Spécification fonctionnelle de la version 1.0

## Objectif

Permettre à une personne de composer et retrouver ses propres environnements à
partir des couches sonores déjà présentes dans ATMOS, sans transformer
l’expérience en station de travail audio. La création reste immédiate, visuelle,
locale et réversible.

La version 0.3 publiée reste la référence stable. Le développement 1.0 se fait
sur `mvp-1.0` et ne rejoint `main` qu’après validation de la Gate E.

## Principes de périmètre

- Une scène existante fournit le contexte visuel et le point de départ du mix.
- Un mix contient entre une et quatre couches distinctes du catalogue licencié.
- Les couches peuvent provenir d’ambiances différentes.
- La lecture, les volumes, le timer et Focus Mode conservent leurs comportements
  éprouvés lorsque le contexte le permet.
- Les mixes restent exclusivement sur l’appareil dans un stockage versionné.
- L’interface doit ressembler à ATMOS, jamais à une console de mixage.

## Inclus

- Action `Create a mix` depuis une ambiance.
- Route statique `/compose`, dans la même frontière de session que les players,
  hydratant un brouillon local après le rendu serveur.
- Brouillon initial fondé sur la scène, les couches et les volumes de l’ambiance
  d’origine.
- Bibliothèque des douze couches audio déjà licenciées, regroupées par ambiance.
- Ajout et retrait de couches avec plafond explicite de quatre.
- Réglage du volume de chaque couche et écoute live après un geste Play.
- Nommage, sauvegarde, ouverture, modification et suppression de mixes locaux.
- Schéma V2, migration déterministe depuis les préférences V1 et récupération des
  valeurs invalides.
- Liste `Your mixes` discrète, visible seulement lorsqu’au moins un mix existe.
- Recette audio longue, stockage dégradé, clavier, lecteurs d’écran, mobile réel
  et zoom 200 %.

## Exclus

- Import de fichiers, microphone, enregistrement, export audio ou téléchargement.
- Nouveaux sons, génération sonore, effets, égaliseur, panoramique ou automation.
- Timeline, formes d’onde, BPM, synchronisation rythmique ou solo/mute avancé.
- Plus de quatre couches actives ou plusieurs scènes dans un même mix.
- Changement de scène après la création initiale du mix.
- Partage par URL, compte, cloud, collaboration ou synchronisation multi-appareils.
- Marketplace, recommandations, tags, recherche ou dossiers.
- Historique, annulation multi-étapes ou sauvegarde automatique des brouillons.
- Garantie de lecture en arrière-plan au-delà de la promesse best effort 0.3.

## Exigences et critères d’acceptation

### FR-1001 — Création depuis une ambiance

- `Create a mix` est une action secondaire du player standard.
- L’action ouvre `/compose` avec la scène courante comme origine explicite.
- Un nouveau brouillon reprend les couches disponibles de cette ambiance, dans
  leur ordre éditorial, avec leurs volumes restaurés ou leurs défauts.
- Le brouillon ne devient persistant qu’après `Save mix`.
- Ouvrir le compositeur ne crée ni `AudioContext` ni requête audio.

### FR-1002 — Références de couches

- Une couche est identifiée par le couple stable `atmosphereId` et `layerId`.
- Seules les couches présentes dans le registre d’ambiances sont sélectionnables.
- Une couche ne peut apparaître qu’une fois dans un mix.
- Un mix contient au minimum une couche et au maximum quatre couches.
- Une référence inconnue ou devenue indisponible est retirée à la lecture sans
  rendre les autres couches inutilisables.

### FR-1003 — Bibliothèque sonore

- `Add sound` ouvre un dialogue regroupant les couches par ambiance.
- La scène source et les couches déjà actives sont annoncées sans dépendre de la
  couleur seule.
- Une couche active est désactivée dans le sélecteur plutôt que dupliquée.
- Lorsque quatre couches sont présentes, l’interface explique la limite et
  permet encore de retirer une couche.
- Fermer ou annuler le dialogue ne modifie pas le brouillon.

### FR-1004 — Écoute et réglage live

- Play reste l’unique action principale et le seul geste pouvant initialiser Web Audio.
- Ajouter une couche pendant la lecture la charge puis l’introduit par un fondu
  sans interrompre les autres couches.
- Retirer une couche pendant la lecture la ferme par un fondu avant nettoyage.
- Un échec de couche est localisé, annoncé et récupérable sans arrêter le mix.
- Pause, reprise et variations de volume conservent les rampes sans clic de 0.3.
- Le moteur utilise un seul `AudioContext` et au plus quatre voies de couche actives
  hors transition.

### FR-1005 — Nommage et sauvegarde

- Un nom contient de 1 à 40 caractères après suppression des espaces périphériques.
- `Save mix` crée un identifiant opaque stable et ne dépend pas du nom.
- Sauvegarder un mix existant le met à jour sans créer de doublon.
- Les noms identiques sont autorisés ; l’identité ne repose jamais sur le libellé.
- Un succès ou un échec de sauvegarde est annoncé poliment sans interrompre l’audio.
- Le stockage est limité à 20 mixes et 128 Kio sérialisés ; la limite est expliquée
  avant de refuser une nouvelle sauvegarde.

### FR-1006 — Mixes sauvegardés

- `Your mixes` expose les mixes dans leur ordre de création stable.
- Ouvrir un mix remplace le brouillon après confirmation si des changements non
  sauvegardés seraient perdus.
- Renommer ou modifier exige une sauvegarde explicite.
- Supprimer demande une confirmation nommant le mix et ne supprime aucun média.
- La suppression du mix actif ouvre un nouveau brouillon sûr fondé sur sa scène.
- Une liste vide n’ajoute ni section ni appel à l’action dominant sur l’accueil.

### FR-1007 — Persistance et migration

- `atmos.preferences` migre atomiquement de V1 vers V2 au premier chargement 1.0.
- La migration préserve favoris et volumes et initialise `savedMixes` à une liste vide.
- Une valeur V2 valide est réutilisée sans réécriture au chargement.
- JSON invalide, version inconnue, IDs obsolètes, doublons, volumes non finis et
  dépassements de limites reviennent à un état sûr sans crash.
- Une écriture échouée conserve le brouillon et les changements en mémoire.
- `Reset saved preferences` supprime aussi les mixes après confirmation explicite.
- ATMOS ne transmet aucune donnée locale et n’ajoute aucun traceur.

### FR-1008 — Intégration de session

- Un layout de groupe partagé conserve timer et Focus Mode entre `/atmosphere/*`
  et `/compose`, sans déplacer cette session dans le layout racine.
- Une navigation vers l’accueil détruit l’audio et les états éphémères comme en 0.3.
- Un mix sauvegardé ne persiste ni Play/Pause, ni timer, ni Focus Mode, ni erreur.
- Un rechargement ouvre le compositeur en pause et ne reprend jamais le son.
- La lecture en arrière-plan conserve la politique best effort de l’ADR-0004.

### FR-1009 — Accessibilité et responsive

- Toutes les opérations fonctionnent au clavier et au toucher, sans drag obligatoire.
- Chaque slider natif possède un nom comprenant la couche et son ambiance d’origine.
- L’ordre des couches est lisible sans dépendre du positionnement visuel.
- Le dialogue de bibliothèque et les confirmations restaurent le focus.
- À 320 px, en paysage, au zoom 200 % et avec texte agrandi, Play, Save et la
  sortie restent atteignables.
- Le mouvement réduit supprime les transitions décoratives sans supprimer les
  fondus audio nécessaires à l’absence de clic.

### FR-1010 — Performance et livraison

- Aucun nouvel actif média ou service distant n’est requis par la version 1.0.
- La bibliothèque ne précharge ni ne décode ses douze couches à l’ouverture.
- Une couche n’est récupérée qu’après Play ou ajout pendant une lecture active.
- Le cache compressé, les buffers décodés et les nœuds sont bornés et nettoyés.
- Les budgets 0.3 restent bloquants ; l’incrément du compositeur est mesuré séparément.
- Dix changements complets de mixes ne créent ni contexte supplémentaire, ni
  listener résiduel, ni croissance mémoire non bornée.

## Parcours critique 1.0

1. Ouvrir Rainy Apartment puis `Create a mix` sans requête audio préalable.
2. Lire le brouillon, ajouter une couche d’une autre ambiance et en retirer une.
3. Ajuster quatre volumes, mettre en pause puis reprendre sans clic audible.
4. Nommer et sauvegarder le mix, quitter, recharger puis le rouvrir en pause.
5. Modifier, renommer et sauvegarder sans doublon, puis supprimer avec confirmation.
6. Atteindre les limites de quatre couches, 20 mixes et 128 Kio.
7. Migrer un snapshot V1 réel et injecter données corrompues, inconnues ou obsolètes.
8. Rejouer avec timer, Focus Mode, arrière-plan best effort et erreur d’une couche.
9. Rejouer au clavier, au toucher, avec lecteurs d’écran, zoom 200 %, texte agrandi,
   contraste élevé et mouvement réduit.

## Sortie de la version 1.0

La version est publiable lorsqu’un mix peut être créé, écouté, sauvegardé,
rouvert, modifié et supprimé sans fuite audio ni perte des préférences 0.3, que
le compositeur reste sobre et accessible sur mobile, et que la Gate E est validée.
