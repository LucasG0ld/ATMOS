# Architecture du moteur audio

## Portée

Le moteur audio arrive après validation du prototype visuel. Il lit plusieurs boucles, règle leurs volumes, contrôle un gain global et effectue des fondus sans coupure. Il ne gère ni UI, ni navigation, ni persistance.

## Graphe audio

```text
Sources + gains de couches ─► Bus actif ────┐
                                            ├─► Master Gain ► destination
Sources + gains de couches ─► Bus entrant ──┘
```

Un `AudioContext` persiste dans le layout des routes player. Chaque bus possède
ses buffers, sources et gains de couches. Une transition ne dépasse jamais deux
bus ; chaque `AudioBufferSourceNode` arrêté est détruit, car il n’est pas
réutilisable.

## API de domaine indicative

```ts
type AudioEngine = {
  load(layers: readonly SoundLayer[]): Promise<void>;
  preload(layers: readonly SoundLayer[]): Promise<void>;
  cancelPreload(): void;
  transition(layers: readonly SoundLayer[]): Promise<void>;
  play(): Promise<void>;
  pause(): void;
  setLayerVolume(layerId: string, volume: number): void;
  setMasterVolume(volume: number): void;
  destroy(): Promise<void>;
};
```

L’implémentation peut évoluer, mais les intentions restent séparées des nœuds Web Audio.

L’implémentation vit dans `src/features/audio/audio-engine.ts`. Le provider
`audio-session.tsx` porte l’intention `idle → loading → playing ↔ paused`, avec
une branche `error → loading` pour le réessai. Le moteur reste indépendant de
React et reçoit ses créateurs de contexte et de requête comme dépendances
testables.

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
- En 0.2, ne précharger qu’une ambiance probable après l’essentiel visuel.

Depuis le Lot 14, le préchargement conserve au plus une cible sous forme
compressée (`ArrayBuffer`). Il ne crée pas d’`AudioContext` et ne décode aucun
buffer. Une nouvelle intention annule les fetchs précédents et remplace ce cache ;
une sélection explicite de la même cible réutilise les octets déjà reçus avant de
décoder. `Save-Data`, le mode hors ligne, `slow-2g`/`2g` et un débit annoncé sous
1,5 Mbit/s désactivent cette anticipation. Le cache HTTP immuable reste le second
niveau, sans service worker.

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

## Changement d’ambiance

L’ancien bus reste audible pendant le téléchargement et le décodage de la cible.
Quand le bus entrant est prêt, deux automations linéaires opposées de 1,8 seconde
sont planifiées, puis le bus sortant est arrêté et déconnecté. Une nouvelle
sélection annule le fetch obsolète ; si un crossfade a déjà commencé, le bus le
plus récent est stabilisé en 80 ms avant de préparer la nouvelle cible. Le visuel
utilise une couche d’opacité de 720 ms, réduite à 80 ms avec mouvement réduit.

Une couche cible en échec est désactivée sans bloquer les autres. Un échec total
ferme le master, conserve l’URL et la scène demandées, annonce l’erreur et expose
Retry. Quitter `/atmosphere/*` détruit le contexte et tous les bus.

## Fin de timer 0.3 proposée

Le contrôleur de session, pas le moteur, possède l’échéance du timer. Lorsqu’elle
est atteinte, il fixe d’abord l’intention utilisateur à Pause afin qu’une reprise
de visibilité ne rouvre pas le master. Il demande ensuite au moteur un fade-out
fonctionnel de cinq secondes, puis confirme l’état Pause.

Une échéance sans `AudioContext` se termine sans en créer. Remplacer ou annuler
un timer ne planifie aucune automation audio. Si le contexte est suspendu ou le
master déjà silencieux, la session confirme Pause sans attendre un fade
inaudible. Une action Play explicite pendant le fade l’annule et reprend avec la
rampe normale. Le moteur n’expose pas de compteur et reste indépendant de
`Date.now()`, de React et de `localStorage`.

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
