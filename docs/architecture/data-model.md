# Modèle de données

## Principes

- Les données sont la source de vérité des ambiances.
- Les identifiants et slugs sont stables et uniques.
- Les valeurs persistables sont sérialisables.
- Les composants n’inventent pas de défauts propres à une ambiance.
- Une donnée externe ou éditée doit être validée avant usage.

## Contrats cibles

```ts
type AtmosphereId = string;
type SoundLayerId = string;

type AtmosphereTheme = {
  background: string;
  foreground: string;
  muted: string;
  accent: string;
  surface: string;
  overlay: string;
  focus: string;
};

type AtmosphereVisuals = {
  backgroundSrc?: string;
  mobileBackgroundSrc?: string;
  backgroundAlt: string;
  focalPoint: {
    x: number;
    y: number;
  };
  mobileFocalPoint?: {
    x: number;
    y: number;
  };
  fallbackBackground: string;
  texture?: "rain";
};

type SoundLayer = {
  id: SoundLayerId;
  name: string;
  src: string;
  defaultVolume: number;
};

type Atmosphere = {
  id: AtmosphereId;
  slug: string;
  name: string;
  displayName: readonly string[];
  description: string;
  theme: AtmosphereTheme;
  visuals: AtmosphereVisuals;
  sounds: readonly SoundLayer[];
};
```

`defaultVolume` est compris entre 0 et 1 dans le domaine audio. L’UI peut convertir en pourcentage. `displayName` autorise une composition visuelle sur plusieurs lignes sans altérer le nom accessible. `fallbackBackground` garantit une scène complète avant ou sans photographie. Pour une image purement atmosphérique sans information, `backgroundAlt` doit être vide ; le titre fournit alors le contexte.

`mobileBackgroundSrc` est une variante réellement recadrée, pas une miniature dupliquée. Elle exige `backgroundSrc` et peut disposer d’un point focal propre. `texture` réserve les effets décoratifs à l’ambiance qui les déclare ; aucune pluie ne doit apparaître implicitement sur les autres scènes.

## Exemple Rainy Apartment

```ts
const rainyApartment = {
  id: "rainy-apartment",
  slug: "rainy-apartment",
  name: "Rainy Apartment",
  displayName: ["Rainy", "Apartment"],
  description: "A quiet evening while the city disappears behind the rain.",
  theme: {
    background: "#0d141c",
    foreground: "#f4f0e8",
    muted: "#b9c0c5",
    accent: "#c99d68",
    surface: "rgb(8 14 20 / 42%)",
    overlay: "rgb(4 9 14 / 48%)",
    focus: "#f4d8a8",
  },
  visuals: {
    backgroundAlt: "",
    focalPoint: { x: 68, y: 42 },
    fallbackBackground: "radial-gradient(...), linear-gradient(...)",
  },
  sounds: [
    { id: "rain", name: "Rain", src: "/audio/rain.mp3", defaultVolume: 0.65 },
    {
      id: "window-rain",
      name: "Window Rain",
      src: "/audio/window-rain.mp3",
      defaultVolume: 0.4,
    },
    {
      id: "distant-thunder",
      name: "Distant Thunder",
      src: "/audio/distant-thunder.mp3",
      defaultVolume: 0.15,
    },
  ],
} as const satisfies Atmosphere;
```

Les chemins et formats ci-dessus sont illustratifs jusqu’à sélection des actifs.

## Catalogue 0.2

Le tableau `atmospheres` est le registre unique. Son ordre définit l’index
éditorial `01–04` ; aucun champ `order` dupliqué n’est nécessaire. Le thème et
`visuals` existants alimentent aussi les previews : ne pas créer un second objet
de présentation qui pourrait diverger du player.

L’ajout d’une ambiance exige uniquement :

1. une définition conforme à `Atmosphere` ;
2. son export dans le registre ;
3. ses médias locaux validés et crédités.

Pendant les Lots 9 à 11, `sounds: []` représente explicitement une ambiance
dont les actifs audio ne sont pas encore intégrés. Le player affiche alors un
état indisponible non interactif et n’initialise jamais le moteur. Une entrée
destinée à la release 0.2 contient trois couches validées au Lot 12.

Un composant qui branche sur un slug pour choisir contenu, style ou comportement
viole le critère de sortie 0.2. Un futur besoin d’image mobile distincte pourra
étendre `AtmosphereVisuals` après preuve par les actifs réels, pas avant.

## Invariants à valider

- `id` et `slug` non vides, uniques et conformes à `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
- Noms et descriptions non vides.
- Couleurs dans un format CSS autorisé.
- Coordonnées `focalPoint.x` et `focalPoint.y` comprises entre 0 et 100.
- Aucune couche autorisée pendant la préparation ; deux ou trois couches requises pour une ambiance activée en 0.2.
- IDs de couches uniques dans une ambiance.
- Volumes finis et compris entre 0 et 1.
- Chemins média locaux absolus depuis `/` ; une origine distante demanderait une décision explicite.

## État de session

```ts
type AudioEngineStatus =
  "idle" | "loading" | "ready" | "playing" | "paused" | "error";

type PlayerState = {
  atmosphereId: AtmosphereId;
  status: AudioEngineStatus;
  requestedVolumes: Record<SoundLayerId, number>;
  errorMessage: string | null;
};
```

Éviter plusieurs booléens tels que `isLoading`, `isPlaying` et `hasError` capables de former des combinaisons impossibles.

## Persistance 0.3 acceptée

Le Lot 16 retient une clé stable unique `atmos.preferences`, dont la valeur porte
sa propre version :

```ts
type StoredPreferencesV1 = {
  version: 1;
  favoriteAtmosphereIds: AtmosphereId[];
  layerVolumes: Record<AtmosphereId, Record<SoundLayerId, number>>;
};
```

- Lire dans un `try/catch`, valider puis appliquer.
- Filtrer les IDs inconnus et borner chaque volume entre 0 et 1.
- Limiter le snapshot à 32 Kio et regrouper les écritures après interaction.
- Ne jamais stocker état de chargement, erreur, Play/Pause, Focus Mode ou timer actif.
- Une migration transforme une version connue ; une version inconnue est ignorée sans crash.
- Une suppression d’ambiance ne doit pas rendre le stockage illisible.
- `Reset saved preferences` supprime la clé entière et restaure les défauts du catalogue.

Le modèle éphémère du timer reste dans la session du player :

```ts
type SessionTimer = {
  endsAt: number;
  durationMinutes: 15 | 30 | 45 | 60 | 90;
  status: "running" | "fading";
};
```

`endsAt` est une échéance absolue issue de `Date.now()`. Le restant n’est jamais
la source de vérité et peut être recalculé après throttling ou changement de
visibilité. Le timer et l’état `focusMode` sont détruits en quittant les routes
du player.

Le Lot 17 implémente le schéma V1 dans
`features/preferences/preferences-storage.ts`. La lecture filtre doublons, IDs
inconnus, valeurs non finies et volumes hors de `[0, 1]`. JSON invalide et
version inconnue donnent un snapshot vide sans réécriture automatique. L’accès
refusé, le quota et une suppression impossible basculent le provider en état
`unavailable`, tout en conservant les changements de la session en mémoire.

## Composition 1.0 acceptée

L’ADR-0005 retient une référence de couche par ambiance et ID local,
sans recopier son nom, son chemin ou sa licence dans les données utilisateur :

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

type StoredPreferencesV2 = {
  version: 2;
  favoriteAtmosphereIds: AtmosphereId[];
  layerVolumes: Record<AtmosphereId, Record<SoundLayerId, number>>;
  savedMixes: SavedMixV1[];
};
```

Un mix valide contient une scène connue, un ID opaque, un nom de 1 à 40
caractères et de une à quatre références distinctes dont les volumes sont finis
et bornés. La collection contient au plus 20 mixes et le snapshot complet reste
sous 128 Kio. Ces contrats sont acceptés par l’ADR-0005.

Le Lot 23 implémente ces contrats dans `types/mix.ts`, le registre dérivé dans
`data/sounds/index.ts` et la validation dans l’adaptateur de préférences. Une
lecture V1 reconstruit un snapshot V2 validé, conserve favoris et volumes, puis
tente une unique écriture atomique. Un échec d’écriture conserve le résultat en
mémoire et signale le stockage indisponible. Une V2 existante n’est pas réécrite
au chargement ; une version inconnue reste intacte et donne les défauts sûrs.
