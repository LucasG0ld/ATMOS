# Actifs audio Rainy Apartment

## Sources retenues

Les trois enregistrements sont hébergés sur Wikimedia Commons et ont été explicitement placés dans le domaine public par leurs auteurs. Les liens ci-dessous ciblent les révisions contrôlées le 2026-08-10 ; les empreintes SHA-256 empêchent le script de préparation d’accepter silencieusement un fichier source remplacé.

| Couche          | Source                                                                                                                                              | Auteur | Déclaration                                                                                   | SHA-256 de l’original                                              |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Rain            | [Rain (1).ogg, révision 899302123](<https://commons.wikimedia.org/w/index.php?title=File:Rain_(1).ogg&oldid=899302123>)                             | ezwa   | domaine public, usage sans condition accordé si la renonciation n’est pas reconnue localement | `31efcbe952a3989a9276774e2d7be61a2dc98fdd785a94d1435fc19cda9a84d1` |
| Window Rain     | [Rain against the window.ogg, révision 897888791](https://commons.wikimedia.org/w/index.php?title=File:Rain_against_the_window.ogg&oldid=897888791) | cori   | domaine public, usage sans condition accordé si la renonciation n’est pas reconnue localement | `85be295e9936fbf003ae5dbc0e106b77e60854ea4b19bfb7b232420f291a737e` |
| Distant Thunder | [Rain and thunder.ogg, révision 1129569613](https://commons.wikimedia.org/w/index.php?title=File:Rain_and_thunder.ogg&oldid=1129569613)             | Caesar | domaine public, usage sans condition accordé si la renonciation n’est pas reconnue localement | `cbfd7b7504bc4e53d6e56ac8d933ba56f97cc28f15a46800c74c2d8eccb3fa89` |

Cette page et les liens de révision permanents constituent la preuve de provenance archivée dans le dépôt. Le registre central reste `ASSET_CREDITS.md`.

## Préparation reproductible

`npm run audio:prepare` télécharge les originaux dans `.cache/audio`, vérifie leur empreinte, puis produit les fichiers MP3 mono 44,1 kHz à 96 kbit/s dans `public/audio`. FFmpeg est une dépendance de développement uniquement ; son binaire n’est pas livré au navigateur.

- Rain : source presque complète, jointure cyclique avec fondu croisé de 3 s, cible −24 LUFS et true peak maximal −3 dBTP.
- Window Rain : extrait de 70 s à partir de 5 s, jointure cyclique avec fondu croisé de 4 s, même cible de niveau.
- Distant Thunder : événement de 18,8 s atténué de 6 dB, fondus de 2 s et 4 s, puis silence jusqu’à une boucle de 60 s. L’intervalle limite la répétition du tonnerre et la jointure se fait dans le silence.
- Les métadonnées sont retirées à l’export ; les originaux ne sont ni versionnés ni servis.

## Sorties contrôlées

| Fichier               |   Durée |    Taille | Niveau mesuré         | SHA-256                                                            |
| --------------------- | ------: | --------: | --------------------- | ------------------------------------------------------------------ |
| `rain.mp3`            | 41,95 s | 492,0 Kio | −23,8 LUFS, −6,4 dBTP | `e05437a05b632965eb28df4e8b2951c04ed94c4580233fa547f58989dfd498bb` |
| `window-rain.mp3`     | 66,04 s | 774,2 Kio | −24,4 LUFS, −3,2 dBTP | `b54070d405d1e1a53eaebc8c77b0546b254e0f237156ba74c50ebc4c6ca2eaf3` |
| `distant-thunder.mp3` | 60,03 s | 703,8 Kio | −30,7 LUFS, −6,5 dBTP | `776b0aab3eda02f8e1c6a5bc22dc5ba66a1bb27df93abcb32d6738053b790249` |

Total : 1,92 Mio sur un budget de 8 Mio. Le tonnerre est volontairement plus bas que les lits de pluie ; son contrôle démarre aussi à 15 % dans l’interface.

## Critères de validation

- Les sorties doivent être décodables en MP3, durer respectivement environ 41,9 s, 66 s et 60 s, être mono à 44,1 kHz, et rester sous le budget audio total de 8 Mo.
- Une écoute au casque de dix minutes minimum doit confirmer l’absence de clic ou de jointure évidente avant chaque release audio.
- Le contrôle manuel cible les versions courantes de Chrome, Firefox et Safari, desktop et mobile. Le chargement ne devra commencer qu’après un geste utilisateur lors du Lot 6.
