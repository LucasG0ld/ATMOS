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

### Mesure des identités visuelles — Lot 11

| Ambiance          | Desktop 1536 × 864 | Mobile 640 × 1024 |     Total |
| ----------------- | -----------------: | ----------------: | --------: |
| Rainy Apartment   |           52,8 Kio |          46,8 Kio |  99,6 Kio |
| Quiet Coffee Shop |           44,3 Kio |          24,6 Kio |  68,9 Kio |
| Deep Forest       |          220,8 Kio |          89,5 Kio | 310,3 Kio |
| Fireplace         |           60,3 Kio |          37,3 Kio |  97,6 Kio |

Les huit exports totalisent 576,4 Kio. Une page ne sélectionne qu’une variante
via `<picture>` ; le fallback CSS reste visible avant ou en cas d’échec. Chaque
fichier demeure sous la cible de 500 Kio et le contrôle `npm run images:check`
est exécuté en CI.

### Mesure des actifs audio — Lot 12

| Ambiance          | Couches | Taille totale | Budget par ambiance |
| ----------------- | ------: | ------------: | ------------------: |
| Rainy Apartment   |       3 |      1,92 Mio |            3,00 Mio |
| Quiet Coffee Shop |       3 |      1,93 Mio |            3,00 Mio |
| Deep Forest       |       3 |      0,99 Mio |            3,00 Mio |
| Fireplace         |       3 |      0,97 Mio |            3,00 Mio |

Le catalogue totalise 5,81 Mio sur 12 Mio. Aucun fichier n’est demandé avant
Play. `npm run audio:check` vérifie format, durée, jointure, budget par ambiance,
true peak et cohérence des quatre mixages par défaut.

### Empreinte de transition — Lot 13

Le player pèse 53,8 Kio de JavaScript applicatif gzip après ajout de la session,
contre un budget de 140 Kio appliqué par le contrôle actuel. Le moteur conserve
un seul contexte et au plus deux bus. À partir des durées mono 44,1 kHz, la pire
paire de buffers PCM du catalogue est estimée à 56,6 Mio pour Rainy Apartment et
Quiet Coffee Shop, sous la cible provisoire de 64 Mio. Cette estimation est
complétée ci-dessous par une mesure mémoire navigateur sur dix transitions.

### Préchargement et mesures — Lot 14

Le build de production local respecte les plafonds avec 9,7 Kio de JavaScript
applicatif gzip sur l’accueil, 54,7 Kio sur le player, 7,3 Kio de CSS par route
et 29,4 Kio de police WOFF2. La police variable n’embarque plus que le
sous-ensemble latin. Avant Play, seule une image responsive peut être anticipée ;
après Play, une seule ambiance audio compressée peut l’être, sans contexte ni
décodage.

`npm run performance:runtime` a enchaîné dix transitions dans Chromium sur le
build de production : un `AudioContext`, 33 requêtes audio dont 12 URL uniques,
et un tas JavaScript passant de 4 847 498 à 6 275 357 octets après collecte, soit
+1 427 859 octets (1,36 Mio). Le test unitaire vérifie en complément qu’un seul
bus reste vivant après le retrait des bus sortants.

Lighthouse 13.4.1 local, avec throttling mobile simulé, donne les résultats
suivants. Tous les profils desktop obtiennent 100 en performance, accessibilité,
bonnes pratiques et SEO, avec un LCP compris entre 0,44 et 0,52 s.

| Route mobile      | Performance | Accessibilité | Bonnes pratiques | SEO | FCP    | LCP    | TBT   | CLS |
| ----------------- | ----------: | ------------: | ---------------: | --: | ------ | ------ | ----- | --: |
| Accueil           |          97 |           100 |              100 | 100 | 0,92 s | 2,65 s | 21 ms |   0 |
| Rainy Apartment   |          99 |           100 |              100 | 100 | 0,90 s | 2,26 s | 46 ms |   0 |
| Quiet Coffee Shop |          99 |           100 |              100 | 100 | 0,90 s | 2,11 s | 29 ms |   0 |
| Deep Forest       |          97 |           100 |              100 | 100 | 0,90 s | 2,55 s | 31 ms |   0 |
| Fireplace         |          99 |           100 |              100 | 100 | 0,90 s | 2,26 s | 33 ms |   0 |

Ces résultats locaux ne sont pas directement comparables à la baseline 0.1
mesurée sur GitHub Pages : l’accueil et Deep Forest dépassent de 0,15 s et
0,05 s la cible simulée de 2,5 s. La Gate C conserve donc ouverte la comparaison
Lighthouse de production, à refaire avec la candidate déployée. Les rapports JSON
sont régénérables dans `.cache/lighthouse` avec
`npm run performance:lighthouse` ; ce dossier n’est pas versionné.

### Stabilisation de la candidate — Lot 15

La répétition complète du 2026-08-11 confirme les mêmes tailles de bundles et
un seul `AudioContext`. Après dix transitions et collecte, le tas varie de
+1 406 456 octets (1,34 Mio). Le smoke du build de production visite les quatre
routes avec cache désactivé, puis vérifie Rainy Apartment → Deep Forest sans
requête audio dupliquée.

Lighthouse local reste à 100 pour accessibilité, bonnes pratiques et SEO sur les
dix audits. Tous les profils desktop atteignent 100 en performance, avec un LCP
de 0,44 à 0,64 s. Sur mobile : Rainy Apartment 98/2,26 s, Quiet Coffee Shop
99/2,11 s, Deep Forest 97/2,55 s et Fireplace 99/2,26 s. L’accueil varie davantage
et mesure 92/3,33 s lors de cette passe. Cette valeur ouvre un contrôle Gate C
sur l’URL HTTPS de candidate ; elle ne justifie pas seule une exception, car la
baseline 0.1 a été mesurée dans un environnement différent.

### Lighthouse en production — Gate C

Lighthouse 13.4.1 a été exécuté le 2026-08-11 sur
`https://lucasg0ld.github.io/ATMOS/`, après réussite du déploiement GitHub Pages,
avec cache froid et profils mobile/desktop.

| Route / profil            | Performance | Accessibilité | Bonnes pratiques | SEO | FCP    | LCP    | TBT    | CLS |
| ------------------------- | ----------: | ------------: | ---------------: | --: | ------ | ------ | ------ | --: |
| Accueil mobile            |          96 |           100 |              100 | 100 | 0,86 s | 2,21 s | 177 ms |   0 |
| Accueil desktop           |         100 |           100 |              100 | 100 | 0,23 s | 0,38 s | 0 ms   |   0 |
| Rainy Apartment mobile    |         100 |           100 |              100 | 100 | 0,78 s | 1,81 s | 34 ms  |   0 |
| Rainy Apartment desktop   |         100 |           100 |              100 | 100 | 0,32 s | 0,54 s | 0 ms   |   0 |
| Quiet Coffee Shop mobile  |         100 |           100 |              100 | 100 | 0,77 s | 1,50 s | 58 ms  |   0 |
| Quiet Coffee Shop desktop |         100 |           100 |              100 | 100 | 0,23 s | 0,30 s | 0 ms   |   0 |
| Deep Forest mobile        |         100 |           100 |              100 | 100 | 0,78 s | 1,51 s | 38 ms  |   0 |
| Deep Forest desktop       |         100 |           100 |              100 | 100 | 0,22 s | 0,37 s | 0 ms   |   0 |
| Fireplace mobile          |          99 |           100 |              100 | 100 | 0,78 s | 1,51 s | 114 ms |   0 |
| Fireplace desktop         |         100 |           100 |              100 | 100 | 0,22 s | 0,37 s | 0 ms   |   0 |

La première mesure de l’accueil mobile dépasse ponctuellement la baseline 0.1
de 1,8 s de LCP et 90 ms de TBT. Trois répétitions donnent respectivement des
scores de 99, 100 et 98, des LCP de 1,96 s, 1,66 s et 1,66 s, et des TBT de
50 ms, 29 ms et 149 ms. Leur médiane — 99, LCP 1,66 s, TBT 50 ms — ne montre
aucune régression stable supérieure à 10 %. Rainy Apartment améliore le LCP et
le TBT mobiles face au player 0.1 ; les trois nouveaux players respectent les
cibles. Les rapports JSON restent locaux dans `.cache/lighthouse-production`.

## Budgets du MVP 0.3

Le MVP 0.3 n’ajoute aucun média. Les plafonds bloquants 0.2 restent applicables,
avec des contraintes incrémentales pour éviter qu’une petite persistance ne
justifie un store ou une bibliothèque disproportionnée.

| Ressource ou activité                | Cible 0.3                        | Plafond bloquant   |
| ------------------------------------ | -------------------------------- | ------------------ |
| JavaScript accueil attribuable à 0.3 | ≤ 5 Kio gzip supplémentaires     | 8 Kio              |
| JavaScript player attribuable à 0.3  | ≤ 10 Kio gzip supplémentaires    | 15 Kio             |
| CSS attribuable à 0.3                | ≤ 4 Kio gzip supplémentaires     | 8 Kio              |
| Snapshot `atmos.preferences`         | < 8 Kio pour le catalogue actuel | 32 Kio             |
| Écritures pendant un drag continu    | regroupées après interaction     | ≤ 5 par seconde    |
| Scheduler sans timer                 | aucun                            | 0 timeout/interval |
| Scheduler avec timer                 | une échéance + rendu borné       | 1 échéance métier  |

- Aucun package produit supplémentaire n’est attendu.
- La lecture du stockage ne déclenche ni image, ni audio, ni contexte Web Audio.
- Les listeners `visibilitychange`/`pageshow` et timeouts sont nettoyés au démontage.
- Dix cycles timer/focus et vingt changements de volumes ne doivent pas produire de croissance mémoire continue.
- Lighthouse est rejoué sur l’accueil et les quatre players avant Gate D.

### Mesure du socle de préférences — Lot 17

Le build de production passe de 9,7 à 10,9 Kio de JavaScript applicatif gzip sur
l’accueil et de 54,7 à 55,9 Kio sur le player, soit +1,2 Kio sur chaque route,
sous les cibles incrémentales. Le CSS reste à 7,3 Kio et les fonts à 29,4 Kio.

Le snapshot est limité à 32 Kio avant `setItem`. Les mutations du provider sont
regroupées sur 250 ms et un seul snapshot en attente est conservé. Le démontage
annule le timeout puis effectue au plus un flush synchrone ; sans mutation, aucun
timer, listener, accès réseau ou contexte audio n’est créé.

### Mesure des favoris et volumes — Lot 18

Le build de production mesure 11,7 Kio de JavaScript applicatif gzip sur
l’accueil et 57,1 Kio sur le player, soit respectivement +0,8 Kio et +1,2 Kio
depuis le Lot 17. Le CSS atteint 8,4 Kio (+1,1 Kio) et les fonts restent à
29,4 Kio. Ces incréments restent sous les cibles 0.3 et aucun média, package ou
scheduler supplémentaire n’est introduit.

### Mesure du timer — Lot 19

Le build de production mesure 11,7 Kio de JavaScript applicatif gzip sur
l’accueil et 58,6 Kio sur le player. Le timer ajoute donc 1,5 Kio au player et
rien à l’accueil depuis le Lot 18. Le CSS atteint 8,9 Kio (+0,5 Kio) et les fonts
restent à 29,4 Kio. Il n’existe aucun polling en l’absence de timer ; pendant une
session, un timeout métier vise l’échéance et un rafraîchissement visuel borné
met à jour le texte sans annonce live.

### Mesure de la lecture de fond — Lot 19b

Le build de production mesure 11,7 Kio de JavaScript applicatif gzip sur
l’accueil et 58,8 Kio sur le player, soit +0,2 Kio sur le player depuis le Lot 19. Le CSS reste à 8,9 Kio et les fonts à 29,4 Kio. L’automation anticipée
n’ajoute ni polling, ni média, ni package ; elle réutilise le `GainNode` master
et est annulée lors d’un remplacement, d’une annulation ou d’une Pause.
