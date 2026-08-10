# Budget et stratégie de performance

## Objectif

L’atmosphère doit apparaître rapidement, puis s’enrichir. Le texte et les contrôles priment sur l’image haute définition ; l’image prime sur l’audio ; l’audio n’est chargé qu’après une intention utilisateur ou une stratégie future mesurée.

## Cibles utilisateur

Au 75e percentile en conditions réelles lorsque les données existent :

- LCP ≤ 2,5 s ;
- INP ≤ 200 ms ;
- CLS ≤ 0,1.

En laboratoire sur mobile médian et réseau simulé, aucun décalage visible au chargement de la font, de l’horloge ou du background.

## Budgets initiaux par page, compressés

| Ressource                                    |    Accueil | Player avant Play |                               Après activation audio |
| -------------------------------------------- | ---------: | ----------------: | ---------------------------------------------------: |
| JavaScript applicatif initial hors framework | 100 KB max |        140 KB max |                   180 KB max si module audio différé |
| CSS                                          |  50 KB max |         60 KB max |                                            identique |
| Images initiales                             | 500 KB max |        900 KB max |                                            identique |
| Fonts                                        | 120 KB max |        120 KB max |                                            identique |
| Audio                                        |       0 KB |              0 KB | cible 8 MB total, plafond temporaire 15 MB documenté |

Ces budgets servent d’alarme, pas de permission de remplir la limite. Toute exception précise la raison, la durée et le plan de réduction.

## Images

- Utiliser le composant image du framework lorsque compatible avec la composition.
- Fournir tailles responsives, dimensions et priorité uniquement au vrai LCP.
- AVIF/WebP avec repli géré par l’outil ; qualité contrôlée visuellement.
- Conserver un gradient ou placeholder léger immédiatement visible.
- Stocker le point focal dans les données.
- Ne pas charger les autres ambiances en 0.1.

## Fonts

- Auto-héberger avec l’intégration Next.js.
- Une famille variable et les sous-ensembles nécessaires.
- Éviter deux fontes tant que leur valeur n’est pas démontrée.
- Précharger seulement les fichiers utilisés au premier écran et utiliser une métrique de fallback adaptée.

## Audio

- Aucun fetch audio avant interaction dans le MVP 0.1 sonore.
- Compresser à un débit validé à l’écoute ; stéréo seulement si elle apporte une spatialité utile.
- Préparer les boucles afin d’éviter de compenser par des fichiers inutilement longs.
- Charger en parallèle avec limite raisonnable et possibilité d’annulation.
- Cache mémoire borné lors de l’arrivée de plusieurs ambiances.

## Animation et rendu

- Favoriser `transform` et `opacity`.
- Éviter l’animation de grandes surfaces avec `filter`, `backdrop-filter` ou blur.
- Grain statique et petit.
- Ne pas mettre à jour React à chaque frame d’un effet pointeur.
- Mesurer les animations sur appareil médian, DevTools ouverts et fermés.
- Désactiver les effets coûteux en mouvement réduit ou sous capacité limitée si nécessaire.

## JavaScript

- Composants serveur par défaut.
- Frontières client étroites.
- Import différé du moteur audio et des fonctions non utilisées avant Play.
- Lucide importé icône par icône.
- Pas de bibliothèque pour une primitive bien couverte par la plateforme.

## Mesure

Avant chaque jalon :

- build de production et analyse des chunks ;
- Lighthouse ou outil équivalent sur accueil et player ;
- waterfall réseau cache vide puis chaud ;
- mesure des Core Web Vitals en preview ;
- profil performance lors d’une entrée, d’un drag et de play/pause ;
- contrôle mémoire après plusieurs montages/démontages du moteur.

Une régression dépassant 10 % sur une métrique ou franchissant un budget est expliquée et corrigée avant release, sauf exception acceptée.

## Mesure de la candidate 0.1

Mesure locale du build de production le 2026-08-10, taille gzip pour JS/CSS et taille déjà compressée pour les fonts :

| Route / ressource                        |   Mesuré |    Budget | Résultat |
| ---------------------------------------- | -------: | --------: | -------- |
| Accueil — JavaScript applicatif d’entrée |  7,8 Kio |   100 Kio | conforme |
| Player — JavaScript applicatif d’entrée  | 50,9 Kio |   140 Kio | conforme |
| CSS par route                            |  6,4 Kio | 50/60 Kio | conforme |
| Fonts WOFF2                              | 40,3 Kio |   120 Kio | conforme |
| Audio après Play                         | 1,92 Mio |     8 Mio | conforme |

`npm run budget:check` reproduit les quatre premières mesures depuis les manifests Next.js et bloque la CI en cas de dépassement. `npm run audio:check` couvre le dernier budget. Le parcours Playwright confirme qu’aucune requête `/audio/` ne part avant Play.

Le moteur Web Audio léger reste dans le chunk du player afin que la création et la reprise du contexte commencent pendant le geste utilisateur, notamment pour Safari. Les buffers et les 1,92 Mio de médias restent différés. Ce compromis sera réévalué si le chunk player approche de son budget.

## Lighthouse en production — Gate B

Mesure de laboratoire Lighthouse 13.4.1 le 2026-08-10 sur
`https://lucasg0ld.github.io/ATMOS/`, avec cache froid et profils mobile/desktop :

| Route / profil  | Performance | Accessibilité | Bonnes pratiques | SEO | FCP   | LCP   | TBT    | CLS   |
| --------------- | ----------: | ------------: | ---------------: | --: | ----- | ----- | ------ | ----- |
| Accueil mobile  |          99 |           100 |              100 | 100 | 1,1 s | 1,8 s | 90 ms  | 0,005 |
| Accueil desktop |         100 |           100 |              100 | 100 | 0,3 s | 0,4 s | 0 ms   | 0,004 |
| Player mobile   |          99 |           100 |              100 | 100 | 1,1 s | 2,0 s | 110 ms | 0     |
| Player desktop  |         100 |           100 |              100 | 100 | 0,3 s | 0,4 s | 0 ms   | 0     |

Les résultats satisfont les cibles de la candidate. Ils ne constituent pas des Core Web Vitals terrain ; ceux-ci nécessitent un volume suffisant de visites réelles.

## Budgets du MVP 0.2

La baseline 0.1 reste la référence. Les plafonds existants de page ne sont pas
multipliés par le nombre d’ambiances : seul le média actif et une cible bornée
peuvent entrer dans le parcours immédiat.

| Ressource                                  | Cible 0.2                          | Plafond bloquant |
| ------------------------------------------ | ---------------------------------- | ---------------- |
| JavaScript accueil initial                 | ≤ 110 Kio gzip hors framework      | 120 Kio          |
| JavaScript player avant Play               | ≤ 150 Kio gzip hors framework      | 170 Kio          |
| CSS par route                              | ≤ 65 Kio gzip                      | 75 Kio           |
| Visuel actif adapté au viewport            | ≤ 500 Kio                          | 700 Kio          |
| Preview visuelle préchargée                | une cible, ≤ 500 Kio               | 700 Kio          |
| Audio compressé d’une ambiance             | ≤ 3 Mio                            | 5 Mio            |
| Audio compressé total des quatre ambiances | ≤ 12 Mio                           | 16 Mio           |
| Audio préchargé après Play                 | une cible, ≤ 3 Mio                 | 5 Mio            |
| Buffers PCM décodés                        | actif + cible, estimation ≤ 64 Mio | 80 Mio           |

- Accueil et player ne chargent aucun audio avant Play.
- `Save-Data` ou connexion classée lente désactivent le préchargement audio.
- Les images non actives restent hors chemin critique, à l’exception d’une preview.
- Une régression de plus de 10 % de LCP, TBT ou taille JS par rapport à 0.1 exige correction ou exception documentée.
- Le test mémoire mesure au minimum dix changements successifs et vérifie le retour au régime actif + cible.
