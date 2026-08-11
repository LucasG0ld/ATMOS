# Spécification fonctionnelle du MVP 0.3

## Objectif

Faire d’ATMOS une session personnelle locale sans transformer le player en outil
de productivité ou en tableau de bord. L’utilisateur peut retrouver ses favoris
et ses volumes, limiter une session par un timer et réduire volontairement
l’interface avec Focus Mode.

La version 0.2 publiée reste la référence de stabilité. Le développement 0.3 se
fait sur `mvp-0.3` et ne rejoint `main` qu’après validation de la Gate D.

## Inclus

- Favori par ambiance, visible depuis l’accueil et le player.
- Volumes de couches mémorisés séparément pour chaque ambiance.
- Préférences locales dans une clé unique, versionnée, validée et réinitialisable.
- Timer de 15, 30, 45, 60 ou 90 minutes avec remplacement et annulation.
- Échéance du timer robuste aux onglets masqués et au throttling des timers.
- Fade-out final de cinq secondes, puis état audio réellement en pause.
- Lecture en arrière-plan best effort lorsque le navigateur et l’OS l’autorisent.
- Focus Mode explicite conservant contexte, Play/Pause, timer et sortie visible.
- Recette clavier, lecteurs d’écran, mobile réel, arrière-plan et stockage dégradé.

## Exclus

- Compte, backend, synchronisation cloud ou partage entre appareils.
- Historique d’écoute, streak, statistiques, objectifs ou notifications système.
- Reprise automatique du son ou d’un timer après rechargement/fermeture.
- Synchronisation en direct entre plusieurs onglets.
- Durée libre, alarmes sonores, planification ou répétition du timer.
- Garantie de lecture après verrouillage d’écran ou suspension imposée par l’OS.
- Tri automatique du catalogue par favoris, filtre, route `/saved` ou bibliothèque.
- Persistance de l’ambiance courante, de Play/Pause, de Focus Mode ou des erreurs.
- Mixes personnalisés, master volume persistant et fonctions prévues pour la v1.

## Exigences et critères d’acceptation

### FR-301 — Préférences locales versionnées

- La clé `atmos.preferences` contient un objet JSON avec `version: 1`.
- Seuls les IDs de favoris et volumes de couches connus, finis et bornés sont appliqués.
- Une valeur absente, corrompue ou d’une version inconnue revient aux défauts sans crash.
- Une ambiance ou une couche retirée est ignorée sans rendre le reste illisible.
- Une action `Reset saved preferences` supprime la clé et restaure immédiatement les défauts.
- Aucune donnée n’est transmise et aucun consentement analytique n’est introduit.

### FR-302 — Volumes persistants par ambiance

- Chaque couche conserve sa dernière valeur entre navigation et rechargement.
- Une ambiance sans préférence utilise son `defaultVolume` issu du registre.
- La lecture du stockage ne crée ni `AudioContext` ni requête audio.
- Le moteur actif reçoit une préférence restaurée comme une intention de volume normale.
- Les écritures sont regroupées après interaction et non effectuées à chaque frame.
- Une valeur stockée pour une couche indisponible ne rend pas les autres indisponibles.

### FR-303 — Favoris

- Le player expose un bouton toggle nommé `Add to favorites` ou `Remove from favorites`.
- L’accueil indique les favoris sans changer l’ordre éditorial `01–04`.
- Le statut ne dépend ni de la couleur seule ni d’une icône sans nom accessible.
- Ajouter ou retirer un favori met à jour l’interface et le stockage immédiatement.
- Un favori devenu inconnu est filtré à la lecture.

### FR-304 — Timer de session

- Une action `Timer` propose exactement 15, 30, 45, 60 et 90 minutes.
- Choisir une durée démarre immédiatement une échéance de temps réel.
- Le timer continue pendant Pause, changement d’ambiance et onglet masqué.
- ATMOS ne suspend pas volontairement une lecture lors du masquage de l’onglet.
- Une nouvelle durée remplace l’échéance ; `Cancel timer` l’annule sans modifier l’audio.
- À l’échéance, le master effectue un fade-out de cinq secondes puis passe en pause.
- Si l’échéance passe en arrière-plan, le retour ne doit jamais rouvrir brièvement le son.
- Le fade est armé dans Web Audio avant l’échéance lorsque le contexte joue, afin de ne pas dépendre uniquement d’un timeout ralenti.
- Si la plateforme suspend le contexte, une reprise avant échéance est tentée ; un refus revient à Pause et exige un nouveau Play.
- Si l’audio est déjà silencieux ou suspendu, la session passe directement en pause sans attendre une automation inaudible.
- Une action Play explicite pendant le fade annule la fin de timer et reprend avec le fondu normal.
- Le timer n’est pas persisté : un rechargement ou la sortie du player l’annule.

### FR-305 — Focus Mode

- Focus Mode est activé par une action explicite et n’est jamais déclenché par inactivité.
- Il conserve l’heure, le nom de l’ambiance, Play/Pause, l’état du timer et `Exit focus`.
- Il masque les contrôles secondaires sans les laisser focusables ou annoncés.
- `Escape` quitte le mode ; toucher et clavier disposent de la même sortie visible.
- L’activation place le focus sur `Exit focus` et la sortie le rend au déclencheur si possible.
- Une erreur audio ou la fin du timer reste perceptible et actionnable dans ce mode.
- Le mode survit à un changement de slug dans le player, mais pas à sa sortie.

### FR-306 — Gestion des préférences

- Une action discrète `Preferences` explique que favoris et volumes restent sur l’appareil.
- Le panneau expose la réinitialisation sans demander à l’utilisateur d’effacer tout le stockage du site.
- L’application ne promet ni synchronisation, ni sauvegarde distante, ni confidentialité d’un profil.
- La réinitialisation est confirmée dans l’interface sans dialogue bloquant du navigateur.

### FR-307 — Accessibilité et responsive

- Timer, favoris, préférences et Focus Mode fonctionnent au clavier et au toucher.
- Le compte à rebours visible n’est pas une région live mise à jour chaque seconde.
- Des annonces polies sont limitées au démarrage, à l’annulation et à la fin du timer.
- Le panneau Timer/Preferences suit un modèle de dialogue natif déjà éprouvé dans ATMOS.
- À 320 px, en paysage, au zoom 200 % et avec texte agrandi, aucune sortie n’est masquée.
- Le mouvement réduit supprime les transitions décoratives de Focus Mode sans supprimer le fade audio fonctionnel.

### FR-308 — Performance et livraison

- Aucun média, service distant ou dépendance produit n’est requis par le MVP 0.3.
- Le stockage sérialisé reste sous 32 Kio et les écritures sont mesurées en test.
- Aucun polling à la seconde n’est actif lorsque le timer est absent.
- Une seule échéance et un seul fade de fin peuvent exister à la fois.
- Les budgets 0.2 restent bloquants ; l’incrément 0.3 est mesuré séparément.
- Stockage indisponible, quota dépassé et JSON invalide font partie de la matrice de test.

## Parcours critique 0.3

1. Ouvrir une ambiance sans stockage et vérifier les volumes par défaut.
2. Modifier plusieurs volumes, ajouter un favori, naviguer puis recharger.
3. Vérifier la restauration par ambiance et les marqueurs de favoris sur l’accueil.
4. Démarrer, remplacer et annuler chaque durée de timer sans lecture automatique.
5. Laisser une échéance passer en lecture, en pause et pendant un onglet masqué.
6. Activer Focus Mode au clavier et au toucher, changer d’ambiance puis en sortir.
7. Injecter stockage corrompu, version inconnue, IDs obsolètes et erreur d’écriture.
8. Réinitialiser les préférences et confirmer le retour aux valeurs du catalogue.
9. Rejouer le parcours avec lecteurs d’écran, zoom 200 %, texte agrandi et mouvement réduit.

## Sortie du MVP 0.3

La version est publiable lorsque favoris et volumes survivent de façon sûre à un
rechargement, que le timer se termine correctement en arrière-plan, que Focus
Mode ne masque aucune issue accessible et que la
[Gate D](../project/gate-d-checklist-0.3.md) est validée.
