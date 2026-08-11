# ADR-0003 — Préférences locales, timer et Focus Mode 0.3

- Statut : accepté le 2026-08-11
- Date : 2026-08-11
- Décideur : LucasG0ld
- Remplace : aucune décision

## Contexte

ATMOS 0.3 doit mémoriser favoris et volumes, terminer une session à une échéance
fiable et réduire l’interface à la demande. L’application reste un export
statique sans compte, backend ou analytics. Les routes sont rendues côté serveur,
tandis que `localStorage`, le temps local et Web Audio restent des APIs client.

Le provider audio persiste déjà entre les routes du player. Une solution doit
prolonger cette frontière sans introduire de store tiers, réveiller l’audio au
chargement ou faire dépendre l’UI d’une donnée non validée.

## Décision

### Préférences

- Utiliser une seule clé stable `atmos.preferences` avec une version dans la valeur.
- Le schéma V1 contient uniquement `favoriteAtmosphereIds` et `layerVolumes`.
- Implémenter un adaptateur pur de lecture, validation, écriture et suppression.
- Exposer les préférences par un React Context client minimal disponible sur l’accueil et le player.
- Conserver le HTML serveur fondé sur les défauts ; appliquer les préférences après hydratation sans bloquer le rendu.
- Ne pas ajouter de dépendance de validation : le schéma est petit et validé par gardes TypeScript testées.

```ts
type StoredPreferencesV1 = {
  version: 1;
  favoriteAtmosphereIds: AtmosphereId[];
  layerVolumes: Record<AtmosphereId, Record<SoundLayerId, number>>;
};
```

Les IDs inconnus sont filtrés. Les volumes doivent être finis et bornés entre 0
et 1. Les écritures utilisent un snapshot complet inférieur à 32 Kio, regroupé
après une interaction. Une erreur conserve l’état mémoire et n’interrompt pas
l’audio.

### État éphémère de session

- Timer et Focus Mode restent dans la frontière cliente des routes player.
- Ils survivent à un changement d’ambiance, mais sont détruits en quittant `/atmosphere/*`.
- Ils ne sont pas stockés dans `localStorage` et ne reprennent pas après rechargement.
- L’intention Play/Pause, les erreurs, les buffers et l’ambiance courante ne deviennent pas persistants.

### Timer

- Représenter un timer actif par `endsAt`, timestamp absolu en millisecondes.
- Programmer au plus un timeout de réveil et recalculer le restant depuis `Date.now()`.
- Réévaluer l’échéance sur `visibilitychange`, `pageshow` et reprise du contexte.
- À échéance, verrouiller d’abord l’intention en Pause, puis automatiser un fade master de cinq secondes et nettoyer le timer.
- Si le master est déjà silencieux ou le contexte suspendu, confirmer Pause immédiatement sans automation inaudible.
- Une nouvelle intention Play pendant le fade annule la fin de timer et reste prioritaire.
- Une nouvelle durée remplace atomiquement l’ancienne ; annuler ne touche pas à l’audio.
- Le timer continue pendant Pause : il limite du temps mural, pas un quota d’écoute.

### Focus Mode

- Utiliser un état de composition explicite, sans API Fullscreen.
- Masquer réellement les contrôles secondaires du DOM interactif ou via `hidden` ; ne pas les rendre seulement transparents.
- Conserver titre, heure, Play/Pause, timer, erreurs et sortie.
- `Escape` quitte le mode et la restauration de focus est gérée explicitement.
- Aucun déclenchement automatique par inactivité et aucune persistance.

### Favoris et volumes

- Les favoris ne changent ni l’ordre du catalogue ni les routes.
- Les volumes sont stockés par `AtmosphereId` et `SoundLayerId`.
- Les défauts du registre restent la source lorsque la préférence est absente.
- Réinitialiser les préférences met à jour l’UI et le moteur actif avec les défauts, sans redémarrer l’audio.

## Options considérées

### Store tiers global

Écarté : React Context et un adaptateur de stockage couvrent le besoin. Ajouter
une dépendance augmenterait le JavaScript et créerait une abstraction sans
pression réelle.

### Clé `localStorage` par ambiance ou fonction

Écartée : les migrations et la suppression deviennent fragmentées. Un snapshot
versionné unique est plus simple à valider et réinitialiser.

### Persister timer et Play/Pause

Écarté : les politiques autoplay empêchent une reprise fiable et un ancien timer
pourrait terminer une nouvelle visite de façon surprenante.

### Compteur décrémenté chaque seconde

Écarté : les navigateurs ralentissent les timers en arrière-plan. Une échéance
absolue donne un résultat déterministe au réveil.

### API Fullscreen pour Focus Mode

Écartée : permissions, différences mobiles et sortie moins prévisible sans gain
nécessaire pour la composition sobre recherchée.

### Synchronisation multi-onglets

Écartée du MVP 0.3 : écouter `storage` complexifierait les conflits pour un cas
secondaire. Un nouvel onglet lit toutefois le dernier snapshot au montage.

## Conséquences

- Un provider de préférences client devient la source partagée des favoris et volumes.
- Le premier rendu affiche les défauts, puis hydrate des valeurs sans changement de layout.
- Le contrôleur du timer doit être testé avec horloge simulée, visibilité et délais fortement retardés.
- Focus Mode exige des tests de tabulation, restauration de focus et erreur audio.
- La suppression du stockage ne supprime aucune donnée distante puisqu’il n’en existe pas.
- Le rollback vers 0.2 laisse une clé inconnue inutilisée ; il ne doit jamais planter.

## Critères de réévaluation

- Besoin de synchronisation multi-onglets ou multi-appareils.
- Schéma dépassant 32 Kio ou migrations devenant nombreuses.
- Ajout de mixes personnalisés en v1 nécessitant stockage plus volumineux ou transactionnel.
- Besoin démontré de reprendre un timer après rechargement.
- Complexité du Context rendant ses mises à jour ou tests difficiles à isoler.

## Validation

ADR approuvée par LucasG0ld le 2026-08-11 avec le cadrage du Lot 16. Son
implémentation progressive commence au Lot 17 par le socle de préférences locales.
