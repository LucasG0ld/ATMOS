# Actifs audio ATMOS

## Sources retenues

Les trois enregistrements sont hébergés sur Wikimedia Commons et ont été explicitement placés dans le domaine public par leurs auteurs. Les liens ci-dessous ciblent les révisions contrôlées le 2026-08-10 ; les empreintes SHA-256 empêchent le script de préparation d’accepter silencieusement un fichier source remplacé.

| Couche          | Source                                                                                                                                              | Auteur | Déclaration                                                                                   | SHA-256 de l’original                                              |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Rain            | [Rain (1).ogg, révision 899302123](<https://commons.wikimedia.org/w/index.php?title=File:Rain_(1).ogg&oldid=899302123>)                             | ezwa   | domaine public, usage sans condition accordé si la renonciation n’est pas reconnue localement | `31efcbe952a3989a9276774e2d7be61a2dc98fdd785a94d1435fc19cda9a84d1` |
| Window Rain     | [Rain against the window.ogg, révision 897888791](https://commons.wikimedia.org/w/index.php?title=File:Rain_against_the_window.ogg&oldid=897888791) | cori   | domaine public, usage sans condition accordé si la renonciation n’est pas reconnue localement | `85be295e9936fbf003ae5dbc0e106b77e60854ea4b19bfb7b232420f291a737e` |
| Distant Thunder | [Rain and thunder.ogg, révision 1129569613](https://commons.wikimedia.org/w/index.php?title=File:Rain_and_thunder.ogg&oldid=1129569613)             | Caesar | domaine public, usage sans condition accordé si la renonciation n’est pas reconnue localement | `cbfd7b7504bc4e53d6e56ac8d933ba56f97cc28f15a46800c74c2d8eccb3fa89` |

Cette page et les liens de révision permanents constituent la preuve de provenance archivée dans le dépôt. Le registre central reste `ASSET_CREDITS.md`.

## Sources retenues pour le catalogue 0.2

Les neuf nouvelles couches utilisent les transcodes MP3 officiels de Wikimedia
Commons comme entrées reproductibles. Leur SHA-256 est vérifié avant tout
traitement ; la page de fichier et sa révision permanente restent la preuve de
licence de l’œuvre source.

| Couche           | Source et révision                                                                                                                                                                  | Auteur        | Licence        | SHA-256 de l’entrée pipeline                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | -------------- | ------------------------------------------------------------------ |
| Café Room        | [Cafe ambiance.ogg, révision 1110300114](https://commons.wikimedia.org/w/index.php?title=File:Cafe_ambiance.ogg&oldid=1110300114)                                                   | Marble Toast  | CC0 1.0        | `0de35986939e84d918bcd0ce893660472ac5bb9f5ef05cb2dbc659ab44fbd5c5` |
| Cups & Porcelain | [Binging glass.ogg, révision 824355607](https://commons.wikimedia.org/w/index.php?title=File:Binging_glass.ogg&oldid=824355607)                                                     | hugh          | domaine public | `707167a966aee2137c52a10b6699ccbcf1eab53b183fb1c1c8792c2ccb344d6e` |
| Morning Street   | [Sunday in the city street noise3.ogg, révision 1110023157](https://commons.wikimedia.org/w/index.php?title=File:Sunday_in_the_city_street_noise3.ogg&oldid=1110023157)             | cori          | domaine public | `3af0bf9630992f4086374236a3bad68df740feae0511d4f32a36c3b23d7cb340` |
| Forest Air       | [20090610 0 ambience.ogg, révision 750327185](https://commons.wikimedia.org/w/index.php?title=File:20090610_0_ambience.ogg&oldid=750327185)                                         | nille         | domaine public | `f438752983df422c2fecd9efd0c590b1d7bd93c9c3573465e32e39c9ad2cfb20` |
| Moving Leaves    | [Rustling leaves (Gravity Sound).wav, révision 1115433477](<https://commons.wikimedia.org/w/index.php?title=File:Rustling_leaves_(Gravity_Sound).wav&oldid=1115433477>)             | Gravity Sound | CC BY 4.0      | `ed4f1f1d40e0593f09b0d5cd4a4c03b532e5b6cd47a8e99961f763063336cbd7` |
| Distant Stream   | [Shallow small river with stony riverbed.ogg, révision 722698574](https://commons.wikimedia.org/w/index.php?title=File:Shallow_small_river_with_stony_riverbed.ogg&oldid=722698574) | stephan       | domaine public | `65807549920d1d860bc00cd48b4fe0b548870ee388a4de360768dee486402e15` |
| Fire             | [Dry grass burning in open fireplace.ogg, révision 1213718930](https://commons.wikimedia.org/w/index.php?title=File:Dry_grass_burning_in_open_fireplace.ogg&oldid=1213718930)       | ezwa          | domaine public | `39aad0442716c9a28c34174a8a949af2a164081616610e320227c4d53c7b0e70` |
| Winter Wind      | [Howling wind.ogg, révision 508965737](https://commons.wikimedia.org/w/index.php?title=File:Howling_wind.ogg&oldid=508965737)                                                       | Tvabutzku1234 | CC0 1.0        | `8568e8b82cfbe98f8213717eaf3afcec55b50819e9605c707652c70899cfd514` |
| Quiet Room       | [Cooker hood.ogg, révision 868026451](https://commons.wikimedia.org/w/index.php?title=File:Cooker_hood.ogg&oldid=868026451)                                                         | ezwa          | domaine public | `abf089cd40478b8d86334a61995cd192df36986a63c29a4b46376d82ff59d60d` |

L’attribution « Moving Leaves — Gravity Sound, CC BY 4.0 » est conservée dans
le registre central. Les autres œuvres ont été dédiées au domaine public ou
placées sous CC0 par leurs auteurs.

## Préparation reproductible

`npm run audio:prepare` télécharge les entrées contrôlées dans `.cache/audio`,
vérifie leur empreinte, puis produit les fichiers MP3 mono 44,1 kHz à 96 kbit/s
dans `public/audio`. FFmpeg est une dépendance de développement uniquement ;
son binaire n’est pas livré au navigateur.

- Rain : source presque complète, jointure cyclique avec fondu croisé de 3 s, cible −24 LUFS et true peak maximal −3 dBTP.
- Window Rain : extrait de 70 s à partir de 5 s, jointure cyclique avec fondu croisé de 4 s, même cible de niveau.
- Distant Thunder : événement de 18,8 s atténué de 6 dB, fondus de 2 s et 4 s, puis silence jusqu’à une boucle de 60 s. L’intervalle limite la répétition du tonnerre et la jointure se fait dans le silence.
- Les métadonnées sont retirées à l’export ; les originaux ne sont ni versionnés ni servis.
- Les lits continus 0.2 utilisent 3 ou 4 s de fondu croisé cyclique, un filtrage
  correctif léger et une normalisation adaptée au mix final.
- Cups & Porcelain conserve un groupe d’événements de 8 s puis du silence sur
  une boucle de 60 s afin d’éviter un rythme fatigant.
- Le lit Café Room est limité à 1,6 kHz : les voix restent une texture diffuse,
  sans parole intelligible au niveau par défaut.

## Sorties contrôlées

| Fichier               |   Durée |    Taille | Niveau mesuré         | SHA-256                                                            |
| --------------------- | ------: | --------: | --------------------- | ------------------------------------------------------------------ |
| `rain.mp3`            | 41,95 s | 492,0 Kio | −23,8 LUFS, −6,4 dBTP | `e05437a05b632965eb28df4e8b2951c04ed94c4580233fa547f58989dfd498bb` |
| `window-rain.mp3`     | 66,04 s | 774,2 Kio | −24,4 LUFS, −3,2 dBTP | `b54070d405d1e1a53eaebc8c77b0546b254e0f237156ba74c50ebc4c6ca2eaf3` |
| `distant-thunder.mp3` | 60,03 s | 703,8 Kio | −30,7 LUFS, −6,5 dBTP | `776b0aab3eda02f8e1c6a5bc22dc5ba66a1bb27df93abcb32d6738053b790249` |

Total Rainy Apartment : 1,92 Mio. Le tonnerre est volontairement plus bas que
les lits de pluie ; son contrôle démarre aussi à 15 % dans l’interface.

### Sorties du catalogue 0.2

| Fichier              |   Durée |    Taille | Niveau mesuré          | SHA-256                                                            |
| -------------------- | ------: | --------: | ---------------------- | ------------------------------------------------------------------ |
| `cafe-room.mp3`      | 54,05 s | 633,7 Kio | −21,9 LUFS, −5,8 dBTP  | `355a49f04b3c8e8753ca82b37e52dbd8fd7baa0816f4210bafddd37e24ea9dcb` |
| `soft-clatter.mp3`   | 60,03 s | 703,8 Kio | −25,1 LUFS, −6,2 dBTP  | `822aef5a3d65074577ee67992677ca774a7146398708d25e5eb1bbecf7a08305` |
| `morning-street.mp3` | 54,05 s | 633,7 Kio | −22,9 LUFS, −3,5 dBTP  | `e228ae6e632a3b93f8044f8e2032873219163032c8603adc3d614ef5c6d802b5` |
| `forest-air.mp3`     | 54,05 s | 633,7 Kio | −23,4 LUFS, −5,9 dBTP  | `7dac5a7320194741857960e51104d5f14bf7ce2d99bcc1e604c2f9a8ba470713` |
| `moving-leaves.mp3`  | 18,05 s | 211,9 Kio | −24,6 LUFS, −3,2 dBTP  | `32046dd226e96d095d9d4f48b9907cd303c9c028181e948037d95928ab95fd69` |
| `distant-stream.mp3` | 14,03 s | 164,7 Kio | −24,7 LUFS, −6,8 dBTP  | `abb3c4b938fe17f6c4e0933cb6e04bf53cccd59f3fdcc2191068ba7fbe901cbd` |
| `fire.mp3`           | 21,03 s | 246,8 Kio | −24,3 LUFS, −3,4 dBTP  | `176496f0ddcf30bb54316d952ddb902e6cdcf7d624739366647f6e06388e1750` |
| `winter-wind.mp3`    | 54,05 s | 633,7 Kio | −24,3 LUFS, −9,8 dBTP  | `71c360977ea779b088a713d026ed652d6f31eea872fdf5966bc214fac1832ff9` |
| `quiet-room.mp3`     | 10,03 s | 117,9 Kio | −24,9 LUFS, −10,0 dBTP | `d2e898757e53c4bb99ba9c66b47a842090bfce73cefb17adaeea991c0c510039` |

### Mesure des mixages par défaut

Mesure EBU R128 sur 60 s, avec les volumes réellement exposés dans l’interface :

| Ambiance          | Niveau intégré |  True peak | Taille des actifs |
| ----------------- | -------------: | ---------: | ----------------: |
| Rainy Apartment   |     −26,2 LUFS | −10,0 dBTP |          1,92 Mio |
| Quiet Coffee Shop |     −26,9 LUFS | −11,0 dBTP |          1,93 Mio |
| Deep Forest       |     −27,2 LUFS | −10,4 dBTP |          0,99 Mio |
| Fireplace         |     −27,7 LUFS |  −6,9 dBTP |          0,97 Mio |

L’écart maximal est de 1,5 LU. Le catalogue complet représente 5,81 Mio sur un
budget de 12 Mio ; chaque ambiance reste sous son plafond de 3 Mio.

## Critères de validation

- Les douze sorties doivent être décodables en MP3 mono 44,1 kHz, respecter
  leurs durées déclarées, rester sous 3 Mio par ambiance et 12 Mio au total.
- `npm run audio:check` vérifie aussi la jointure PCM, la fenêtre de −29 à
  −24 LUFS des mixes, un true peak inférieur à −1 dBTP et un écart maximal de
  2 LU entre les quatre valeurs par défaut.
- Une écoute au casque de dix minutes minimum doit confirmer l’absence de clic ou de jointure évidente avant chaque release audio.
- Le contrôle manuel cible les versions courantes de Chrome, Firefox et Safari, desktop et mobile. Le chargement ne devra commencer qu’après un geste utilisateur lors du Lot 6.
