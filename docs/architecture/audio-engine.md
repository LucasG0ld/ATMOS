# Architecture du moteur audio

## Portée

Le moteur audio arrive après validation du prototype visuel. Il lit plusieurs boucles, règle leurs volumes, contrôle un gain global et effectue des fondus sans coupure. Il ne gère ni UI, ni navigation, ni persistance.

## Graphe audio cible

```text
BufferSource Rain ─────────► Gain Rain ─────────┐
BufferSource Window Rain ─► Gain Window ───────┼► Master Gain ► destination
BufferSource Thunder ─────► Gain Thunder ──────┘
```

Un `AudioContext` partagé par le player suffit. Chaque lecture crée de nouveaux `AudioBufferSourceNode`, car une source arrêtée n’est pas réutilisable. Les `AudioBuffer` décodés peuvent être réutilisés.

## API de domaine indicative

```ts
type AudioEngine = {
  load(layers: readonly SoundLayer[]): Promise<void>;
  play(): Promise<void>;
  pause(): void;
  setLayerVolume(layerId: string, volume: number): void;
  setMasterVolume(volume: number): void;
  destroy(): Promise<void>;
};
```

L’implémentation peut évoluer, mais les intentions restent séparées des nœuds Web Audio.

L’implémentation 0.1 vit dans `src/features/audio/audio-engine.ts`. `VisualControls` porte la machine d’états UI `idle → loading → playing ↔ paused`, avec une branche `error → loading` pour le réessai. Le moteur reste indépendant de React et reçoit ses créateurs de contexte et de requête comme dépendances testables.

## Cycle de vie

1. **idle** — aucun contexte nécessaire avant interaction.
2. **loading** — après Play, créer/reprendre le contexte, récupérer et décoder les fichiers.
3. **ready** — buffers et graphe préparés.
4. **playing** — sources actives, master ouvert progressivement.
5. **paused** — master à zéro ; stratégie de suspension ou arrêt/recréation documentée après test.
6. **error** — ressources partielles nettoyées, réessai possible.

Les appels concurrents partagent une promesse de chargement. Une nouvelle demande invalide proprement la précédente via un jeton ou `AbortController` pour les fetchs.

## Autoplay et initialisation

Ne jamais promettre une lecture automatique à l’arrivée. Le contexte est créé ou repris à la suite d’un geste utilisateur. Si `resume()` reste bloqué, l’UI demeure en pause et propose une nouvelle action explicite.

## Chargement

- Charger seulement les trois couches actives en 0.1.
- Vérifier `response.ok` avant lecture du corps.
- Décoder hors du chemin de rendu React.
- Signaler l’échec par couche afin de conserver les autres.
- En 0.2, borner le cache de buffers et ne précharger qu’une ambiance probable après l’essentiel visuel.

Le choix final de format dépend de tests navigateur. Fournir plusieurs sources uniquement si le gain de compatibilité le justifie ; documenter codecs et licences.

La version 0.1 utilise les MP3 mono 44,1 kHz préparés au Lot 5. Une couche en échec est écartée et son slider désactivé ; les autres commencent normalement. Si les trois couches échouent, le graphe partiel est fermé et une nouvelle action reconstruit un contexte propre.

## Boucles

Les actifs doivent être préparés pour une boucle imperceptible : coupe aux passages adaptés, absence de silence parasite et niveau cohérent. `source.loop = true` est nécessaire mais ne corrige pas un mauvais montage. Des points `loopStart` et `loopEnd` peuvent être stockés plus tard si les fichiers l’exigent.

## Volumes et fondus

- Borner toute entrée entre 0 et 1.
- Utiliser des rampes d’automation sur les `GainNode`, jamais une succession de timers JavaScript.
- Annuler ou stabiliser l’automation précédente avant une nouvelle cible.
- Rampe d’un slider : environ 20–80 ms pour éviter les clics sans sensation de retard.
- Play/pause : environ 250–500 ms, à régler à l’écoute.
- Fin de timer future : fade-out plus long, puis arrêt/suspension confirmée.

La perception du volume n’est pas linéaire. Le MVP peut commencer par une courbe simple documentée ; tester une conversion exponentielle si les faibles valeurs manquent de précision.

La version 0.1 conserve une courbe linéaire : valeur UI divisée par 100. Les gains de couche utilisent une rampe de 50 ms et le master une rampe de 350 ms.

## Pause

Deux options seront comparées :

1. garder les sources en cours et réduire le master à zéro, simple mais consommant des ressources ;
2. mémoriser l’offset, arrêter les sources et les recréer à la reprise, plus complexe.

Pour le MVP, privilégier la première pendant les pauses courtes et suspendre le contexte lorsque l’onglet ou la session l’exige, après vérification Safari/Chromium/Firefox. Documenter le comportement retenu dans un ADR si des compromis apparaissent.

Choix 0.1 : les sources continuent pendant une pause visible et le master converge vers zéro. Lorsque la page devient masquée, le master est fermé et le contexte suspendu, y compris si la lecture était déjà en pause. Au retour, le contexte ne reprend automatiquement que si l’intention utilisateur est toujours `playing`, avec un nouveau fondu d’entrée.

## Changement d’ambiance futur

Deux graphes coexistent temporairement : sortie de l’ancien master vers zéro et entrée du nouveau vers sa cible. Ne pas réutiliser des IDs de couche pour partager implicitement des nœuds. Le visuel et l’audio reçoivent une même intention de transition mais restent découplés pour gérer un chargement audio lent.

## Nettoyage

Au démontage, changement annulé ou erreur :

- interrompre les fetchs ;
- arrêter et déconnecter les sources ;
- déconnecter les gains ;
- supprimer les références et listeners ;
- fermer le contexte si le moteur le possède et n’est plus réutilisé.

Les opérations de nettoyage doivent être idempotentes pour supporter le comportement de développement de React Strict Mode.

## Tests

- Unitaire : bornage, transitions d’état, appels concurrents, automation et nettoyage avec adaptateur audio simulé.
- Intégration navigateur : Play après geste, volumes indépendants, pause/reprise, erreur réseau, démontage.
- Manuel audio : qualité des boucles, clics, niveaux, écoute longue et changement d’onglet.
- Matrice minimale : versions courantes Chromium, Firefox et Safari, plus iOS Safari.
