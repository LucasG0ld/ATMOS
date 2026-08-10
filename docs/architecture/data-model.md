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
  backgroundAlt: string;
  focalPoint: {
    x: number;
    y: number;
  };
  fallbackBackground: string;
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

Un composant qui branche sur un slug pour choisir contenu, style ou comportement
viole le critère de sortie 0.2. Un futur besoin d’image mobile distincte pourra
étendre `AtmosphereVisuals` après preuve par les actifs réels, pas avant.

## Invariants à valider

- `id` et `slug` non vides, uniques et conformes à `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
- Noms et descriptions non vides.
- Couleurs dans un format CSS autorisé.
- Coordonnées `focalPoint.x` et `focalPoint.y` comprises entre 0 et 100.
- Au moins une couche sonore lorsque l’audio est activé.
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

## Persistance future

À partir de 0.3, utiliser une clé versionnée unique :

```ts
type StoredPreferencesV1 = {
  version: 1;
  favoriteAtmosphereIds: AtmosphereId[];
  layerVolumes: Record<AtmosphereId, Record<SoundLayerId, number>>;
};
```

- Lire dans un `try/catch`, valider puis appliquer.
- Limiter taille et fréquence des écritures.
- Ne jamais stocker état de chargement, erreur ou timer actif sans décision précise.
- Une migration transforme une version connue ; une version inconnue est ignorée sans crash.
- Une suppression d’ambiance ne doit pas rendre le stockage illisible.
