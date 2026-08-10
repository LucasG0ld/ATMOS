# ADR-0002 — Catalogue, transitions et préchargement 0.2

- Statut : accepté le 2026-08-10
- Date : 2026-08-10

## Contexte

ATMOS 0.2 ajoute trois ambiances, une navigation interne, des crossfades et un
préchargement limité. Le player 0.1 possède son moteur audio localement ; un
changement de route le détruit. Une transition sonore continue exige donc une
frontière persistante, sans transformer toute l’application en client ni créer
plusieurs `AudioContext` concurrents.

## Décision

### Catalogue

- Le tableau validé `atmospheres` reste le registre unique et son ordre définit l’ordre éditorial.
- Les routes restent statiques et pilotées par `slug`.
- Aucun modèle de catégorie, recherche ou CMS n’est ajouté en 0.2.
- Le contrat `Atmosphere` reste suffisant ; aucun champ de preview dupliqué n’est ajouté tant qu’un besoin réel ne l’impose.

### Session persistante

- Introduire une frontière cliente persistante limitée aux routes `/atmosphere/*`.
- Elle possède l’intention de lecture, l’ambiance active, la cible de transition et l’orchestrateur audio.
- Les pages continuent de rendre titre, description, métadonnées et fallback côté serveur.
- L’URL reste la source de vérité de la destination ; la session ne crée pas de route parallèle en mémoire.

### Graphe audio

- Utiliser un seul `AudioContext`.
- Créer deux bus d’ambiance reliés au master : bus actif et bus entrant.
- Chaque bus contient les gains et sources de ses couches.
- Le crossfade automatise les deux gains de bus, puis détruit le bus sortant.
- Deux sélections rapides invalident la préparation précédente via identifiant d’opération et `AbortController`.
- Les buffers décodés sont bornés à l’ambiance active et à la cible en préparation.

### Préchargement

- Avant Play : visuel uniquement, une cible maximum, zéro audio.
- Après Play : une cible audio compressée maximum si `Save-Data` n’est pas actif et si la connexion n’est pas classée lente.
- Le décodage n’a lieu qu’à l’approche d’une transition explicite.
- Une action explicite est prioritaire et peut réutiliser le téléchargement préchargé.
- Ne pas ajouter de service worker en 0.2 ; s’appuyer sur le cache HTTP et un cache mémoire borné.

### Transition visuelle

- Une couche de transition persistante conserve brièvement la scène sortante pendant la navigation.
- Les thèmes restent des propriétés CSS ; la couche anime principalement opacité et luminosité.
- Ne pas adopter une API expérimentale de transition de vue comme dépendance critique.

## Alternatives écartées

### Un `AudioContext` par ambiance

Écarté : consommation supérieure, limitations Safari et nettoyage plus fragile.

### Player entièrement client avec routage simulé

Écarté : URLs, métadonnées et rendu statique deviendraient plus complexes sans bénéfice nécessaire.

### Précharger les quatre ambiances

Écarté : transfert et mémoire non bornés, particulièrement coûteux sur mobile.

### Store global tiers

Écarté : un provider de session ciblé suffit ; réévaluer seulement si 0.3 rend cette frontière difficile à maintenir.

## Conséquences

- Le moteur 0.1 devra être refactoré vers des bus sans changer les contrôles publics avant validation.
- Les tests devront couvrir annulation, cible lente, couche partielle, mémoire et navigation rapide.
- Le crossfade nécessite temporairement deux ambiances décodées ; le budget mémoire devient un critère de Gate C.
- Les routes hors player ne portent pas le moteur audio.
- La stratégie reste compatible avec l’export statique GitHub Pages.

## Validation

ADR approuvée par le responsable du projet le 2026-08-10. Son implémentation
progressive commence avec le registre du Lot 9 ; le moteur de transition reste
planifié au Lot 13.
