# Matrice des ambiances — ATMOS 0.2

## Règles communes

- Les textes visibles restent en anglais, courts et concrets.
- Chaque scène fonctionne d’abord avec son fallback CSS.
- Les médias ci-dessous sont des besoins créatifs, pas des autorisations de téléchargement.
- Aucun fichier image ou audio n’entre dans Git avant validation et archivage de sa licence.
- Les voix identifiables, marques et extraits musicaux sont exclus.
- Deux ou trois couches audio suffisent ; une quatrième exige une justification perceptible.

## Catalogue

| Ordre | Ambiance          | Description éditoriale                                                                | Moment  | Intention                      |
| ----: | ----------------- | ------------------------------------------------------------------------------------- | ------- | ------------------------------ |
|     1 | Rainy Apartment   | A quiet evening while the city disappears behind the rain.                            | Soirée  | retrait, pluie, lumière chaude |
|     2 | Quiet Coffee Shop | A slow morning held together by warm light and the quiet rhythm of the café.          | Matin   | chaleur, bois, rythme discret  |
|     3 | Deep Forest       | Cool air, moving leaves, and a path that seems to continue beyond the trees.          | Journée | fraîcheur, calme, mystère      |
|     4 | Fireplace         | A winter evening shaped by firelight, still rooms, and the weather beyond the window. | Soirée  | chaleur, hiver, confort        |

## Quiet Coffee Shop

### Direction visuelle

- Palette : beige chaud, brun bois, crème, orange désaturé.
- Lumière naturelle latérale ; aucune enseigne ou marque lisible.
- Présence humaine seulement suggérée par la composition, sans visage reconnaissable.
- Fallback : lumière crème diffuse, bois sombre et ombres douces.

### Couches proposées

| ID               | Nom UI           | Volume initial | Rôle                                      |
| ---------------- | ---------------- | -------------: | ----------------------------------------- |
| `cafe-room`      | Café Room        |           0,55 | lit intérieur stable sans conversation    |
| `soft-clatter`   | Cups & Porcelain |           0,24 | événements rares, non rythmiques          |
| `morning-street` | Morning Street   |           0,14 | extérieur doux, sans klaxon ni voix nette |

## Deep Forest

### Direction visuelle

- Palette : vert profond, mousse, kaki et brun sombre.
- Sous-bois frais avec profondeur atmosphérique ; éviter l’imagerie fantasy.
- Point focal ouvert laissant respirer le titre.
- Fallback : strates vertes, ombre verticale et halo froid diffus.

### Couches proposées

| ID               | Nom UI         | Volume initial | Rôle                                |
| ---------------- | -------------- | -------------: | ----------------------------------- |
| `forest-air`     | Forest Air     |           0,58 | lit naturel principal               |
| `moving-leaves`  | Moving Leaves  |           0,30 | mouvement léger et irrégulier       |
| `distant-stream` | Distant Stream |           0,18 | profondeur stable, jamais dominante |

## Fireplace

### Direction visuelle

- Palette : charbon, brun foncé, orange et ambre.
- Feu comme source lumineuse, sans gros plan générique de banque d’images.
- Pièce calme et sombre ; conserver de l’espace négatif hors du foyer.
- Fallback : halo ambre bas, centre charbon et vignette chaude.

### Couches proposées

| ID            | Nom UI      | Volume initial | Rôle                                |
| ------------- | ----------- | -------------: | ----------------------------------- |
| `fire`        | Fire        |           0,64 | crépitement principal, non agressif |
| `winter-wind` | Winter Wind |           0,18 | extérieur grave et discret          |
| `quiet-room`  | Quiet Room  |           0,12 | présence intérieure très légère     |

## Statut des actifs

| Ambiance          | Fallback CSS | Visuel licencié | Audio licencié | Mix validé | Intégrable |
| ----------------- | ------------ | --------------- | -------------- | ---------- | ---------- |
| Rainy Apartment   | validé       | validé Lot 11   | validé         | validé     | oui        |
| Quiet Coffee Shop | validé Lot 9 | validé Lot 11   | validé Lot 12  | validé     | oui        |
| Deep Forest       | validé Lot 9 | validé Lot 11   | validé Lot 12  | validé     | oui        |
| Fireplace         | validé Lot 9 | validé Lot 11   | validé Lot 12  | validé     | oui        |

## Gate créative

La gate visuelle du Lot 11 est validée : palette, description, fallback,
composition desktop/mobile, provenance et absence de cliché ont été revus
séparément. La gate audio du Lot 12 est validée : chaque source, licence, couche,
durée, jointure, niveau et intention de mix est archivée, puis les trois nouvelles
ambiances ont passé la recette d’écoute longue sur desktop et mobile.
