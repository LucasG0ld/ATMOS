# ADR-0005 — Composition locale et mixes sauvegardés 1.0

- Statut : accepté le 2026-08-11
- Date : 2026-08-11
- Décideur : LucasG0ld
- Remplace : aucune décision
- Complète : [ADR-0002](0002-catalogue-transitions-and-preloading.md) et
  [ADR-0003](0003-local-preferences-timer-and-focus.md)

## Contexte

ATMOS 1.0 doit permettre de combiner des couches appartenant à plusieurs
ambiances, d’écouter le résultat et de le retrouver localement. L’application
reste un export statique GitHub Pages sans compte, backend ou média utilisateur.
Le moteur 0.3 sait maintenir un contexte et changer d’ambiance, mais son unité de
lecture reste une ambiance fixe de trois couches. Le stockage V1 ne contient que
favoris et volumes par ambiance.

La solution doit préserver l’absence d’audio avant geste, les limites mémoire sur
mobile, la politique d’arrière-plan best effort et l’identité visuelle sobre.

## Décision

### Domaine

- Définir une référence globale de son par `{ atmosphereId, layerId }` sans
  dupliquer les métadonnées ou les chemins média dans un mix.
- Un mix référence une `sceneAtmosphereId` immuable après sa création et de une à
  quatre couches distinctes.
- Le nom est une donnée utilisateur de 1 à 40 caractères ; l’identité est un ID
  opaque stable généré côté client.
- L’ordre des couches est conservé pour la présentation mais ne porte aucune
  sémantique audio.

```ts
type SoundReference = {
  atmosphereId: AtmosphereId;
  layerId: SoundLayerId;
};

type SavedMixV1 = {
  id: string;
  name: string;
  sceneAtmosphereId: AtmosphereId;
  layers: Array<{
    sound: SoundReference;
    volume: number;
  }>;
};
```

### Persistance

- Faire évoluer `atmos.preferences` vers `StoredPreferencesV2`, contenant les
  champs V1 inchangés et `savedMixes`.
- Migrer V1 vers V2 par une fonction pure, testée et atomique ; ne réécrire
  qu’après validation complète du résultat.
- Limiter la collection à 20 mixes, chaque mix à quatre couches et le snapshot à
  128 Kio.
- Ne stocker ni brouillon, ni état audio, ni timer, ni Focus Mode, ni erreur.
- Une version inconnue ou une migration impossible revient aux défauts en mémoire
  sans supprimer la valeur brute.

```ts
type StoredPreferencesV2 = {
  version: 2;
  favoriteAtmosphereIds: AtmosphereId[];
  layerVolumes: Record<AtmosphereId, Record<SoundLayerId, number>>;
  savedMixes: SavedMixV1[];
};
```

### Route et rendu

- Ajouter une route statique `/compose`, rendue côté serveur avec une enveloppe
  stable puis hydratée côté client.
- Placer `/atmosphere/*` et `/compose` sous un même route group App Router portant
  les providers audio et Focus Mode. Les URL restent inchangées et l’accueil
  demeure hors de cette frontière afin de conserver le nettoyage de session 0.3.
- Transmettre uniquement l’intention de scène par navigation interne ; les mixes
  sauvegardés sont résolus depuis le provider local après hydratation.
- Ne pas créer de route dynamique par ID local et ne pas promettre de partage URL.
- Conserver les players d’ambiances comme parcours principal indépendant.

### Audio

- Étendre le moteur autour d’un seul `AudioContext` et d’un master unique.
- Identifier et charger les couches à la demande par référence globale.
- Maintenir au plus quatre voies de couche actives hors transition ; l’ajout et le
  retrait utilisent des rampes courtes avant connexion ou nettoyage.
- Mutualiser un même actif demandé et borner les buffers décodés à ceux du mix
  courant et de sa transition immédiate.
- La bibliothèque ne précharge et ne pré-écoute aucun son.
- Les transitions de mix ne doivent jamais dépasser huit voies transitoires et
  reviennent à quatre après nettoyage.

### État UI

- Utiliser un reducer client local au compositeur pour le brouillon et son état
  `dirty`, sans nouveau store tiers.
- Les mixes persistants restent exposés par le provider de préférences.
- Timer et Focus Mode demeurent dans la session audio et ne sont pas copiés dans
  les objets sauvegardés.

## Options considérées

### Une nouvelle ambiance générée dans le registre pour chaque mix

Écartée : le registre est statique et licencié, alors qu’un mix est local,
mutable et inconnu du serveur. Mélanger les deux affaiblirait validation, rendu
statique et maintenance.

### Une clé `localStorage` par mix

Écartée : les migrations, limites, reset et écritures partielles deviendraient
fragmentés. Un snapshot V2 borné reste suffisant pour 20 objets compacts.

### IndexedDB

Écartée : aucun blob ni volume de données ne le justifie. `localStorage` avec
validation et écriture coalescée reste proportionné ; IndexedDB sera réévalué si
des médias utilisateur entrent réellement dans le périmètre.

### Import audio et nombre illimité de pistes

Écartés : licences, décodage, mémoire, sécurité des fichiers et densité UI
changeraient la nature du produit. Quatre couches existantes couvrent la valeur à
tester tout en imposant une limite claire.

### Scene picker indépendant

Écarté pour 1.0 : partir d’une ambiance fournit une identité visuelle cohérente
et évite un second axe de configuration. Une nouvelle création peut partir d’une
autre scène.

### Store global tiers

Écarté : le provider existant, un reducer de brouillon et l’adaptateur audio
couvrent les responsabilités sans dépendance supplémentaire.

## Conséquences

- Le registre d’ambiances doit exposer une résolution sûre d’une référence globale.
- Le stockage passe à V2 et exige des tests de migration, corruption, quota,
  rollback et réinitialisation.
- Le moteur audio doit gérer des ensembles arbitraires bornés plutôt que trois
  couches d’une seule ambiance.
- Le compositeur devient une frontière client plus large, à mesurer séparément et
  à charger uniquement sur `/compose`.
- Un rollback vers 0.3 ignore V2 et revient temporairement aux défauts ; il ne doit
  ni planter ni supprimer la valeur. Le plan de rollback doit expliciter cette
  limite avant Gate E.
- Les médias restent ceux du catalogue et conservent leurs crédits existants.

## Critères de réévaluation

- Besoin validé de plus de quatre couches ou de plus de 20 mixes.
- Snapshot approchant 128 Kio ou écritures locales devenant perceptibles.
- Demande d’import, export, partage ou synchronisation.
- Écart mémoire supérieur au budget lors de transitions répétées.
- Besoin d’URLs partageables ou de rendu serveur d’un mix.
- Complexité du provider ou du moteur rendant leurs tests difficiles à isoler.

## Validation

ADR approuvée par LucasG0ld le 2026-08-11 avec le cadrage du Lot 22. Son
implémentation progressive commence au Lot 23 par le registre sonore, les
contrats de mix et la migration du stockage V1 vers V2.
