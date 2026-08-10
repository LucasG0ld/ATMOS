# Actifs visuels — ATMOS 0.2

## Provenance et droits

Les quatre scènes ont été générées le 2026-08-10 avec l’outil intégré OpenAI
`imagegen`, à partir de prompts originaux rédigés pour ATMOS et sans image de
référence tierce. Elles sont déclarées comme contenus générés par IA, jamais
comme photographies humaines.

Les [conditions OpenAI applicables dans l’EEE](https://openai.com/en-GB/policies/oct-2024-eu-terms/)
indiquent qu’entre l’utilisateur et OpenAI, et dans la mesure permise par le
droit applicable, l’utilisateur possède la sortie. Elles rappellent aussi que
les sorties peuvent ne pas être uniques. Vérification effectuée le 2026-08-10 ;
le responsable du projet reste chargé de réévaluer les conditions avant un
usage commercial ou une release majeure.

## Prompts finaux

### Rainy Apartment

```text
Use case: photorealistic-natural
Asset type: immersive full-viewport website atmosphere background
Primary request: an original quiet city apartment interior during steady evening rain, intimate and contemplative rather than dramatic
Scene/backdrop: a modest lived-in apartment at night with a large rain-covered window, softly blurred city lights beyond the glass, a simple chair or low sofa, and one warm practical lamp
Subject: the wet window and the contrast between cool rain outside and warm shelter inside; no people
Style/medium: photorealistic cinematic interior photography, natural low-light texture, restrained film grain, not glossy stock photography
Composition/framing: wide landscape establishing shot; preserve a meaningful central-right vertical crop for mobile containing wet glass, warm lamp glow and part of the room; leave calm dark negative space across the left-center for light interface typography; keep all important objects away from extreme edges
Lighting/mood: blue-black rainy evening outside, muted amber interior light, quiet retreat, soft reflections on glass, detailed shadows without crushed blacks
Color palette: deep blue-black, slate gray, desaturated amber, warm muted cream
Materials/textures: believable rain droplets and streaks on glass, matte plaster, worn fabric, subtle wood, soft city bokeh
Constraints: no text, no logos, no trademarks, no watermark, no people, no readable signs or screens, no luxury penthouse styling
Avoid: thunderstorm spectacle, neon cyberpunk colors, oversized moon, staged real-estate showroom, generic close-up of raindrops only, excessive orange-and-teal grading, perfect symmetry
```

### Quiet Coffee Shop

```text
Use case: photorealistic-natural
Asset type: immersive full-viewport website atmosphere background
Primary request: an original quiet coffee shop interior on a slow morning, intimate and contemplative rather than commercial
Scene/backdrop: a small independent café with warm wood, cream plaster, a softly lit side window, a few empty tables, subtle signs of recent human presence but no visible people
Subject: one simple wooden table with an unbranded ceramic cup and softly blurred café depth
Style/medium: photorealistic cinematic editorial photography, natural texture, restrained film grain, not glossy stock photography
Composition/framing: wide landscape establishing shot; preserve a visually meaningful central vertical crop for mobile; keep generous calm negative space across the left-center for light interface typography; no dominant object at the extreme edges
Lighting/mood: soft lateral morning light, warm and quiet, gentle shadow falloff
Color palette: beige, dark walnut brown, cream, muted burnt orange
Materials/textures: honest wood grain, matte ceramic, slightly imperfect plaster, soft window haze
Constraints: no text, no logos, no trademarks, no menus with readable writing, no watermark, no recognizable faces, no staged lifestyle scene
Avoid: busy crowd, brand signage, symmetrical showroom composition, excessive orange grading, fantasy lighting, generic coffee advertisement
```

### Deep Forest

```text
Use case: photorealistic-natural
Asset type: immersive full-viewport website atmosphere background
Primary request: an original deep temperate forest interior that feels cool, calm and slightly mysterious without fantasy imagery
Scene/backdrop: old forest understory after light moisture, layered trunks, moss, ferns and a narrow natural path disappearing into atmospheric depth
Subject: the quiet path and moving-looking canopy, no people or animals
Style/medium: photorealistic cinematic landscape photography, natural detail, restrained film grain, not glossy stock photography
Composition/framing: wide landscape establishing shot; preserve a visually meaningful central vertical crop for mobile with the path remaining visible; leave calm darker negative space across the left-center for light interface typography; depth rather than a single hero tree
Lighting/mood: cool diffuse daylight filtered through leaves, soft mist in the distance, contemplative and grounded
Color palette: deep forest green, moss, muted khaki, dark wet brown, a subtle cool gray-green haze
Materials/textures: damp bark, layered leaves, soft moss and earth rendered naturally
Constraints: no text, no logos, no trademarks, no watermark, no people, no structures, no artificial lights
Avoid: fantasy glow, magical particles, oversaturated emerald colors, dramatic sunbeams, tropical jungle, perfect symmetrical path, generic desktop wallpaper polish
```

### Fireplace

```text
Use case: photorealistic-natural
Asset type: immersive full-viewport website atmosphere background
Primary request: an original quiet winter room shaped by fireplace light, intimate and contemplative rather than a generic close-up of flames
Scene/backdrop: a modest dark living room in winter with a real wood fireplace, charcoal plaster, a low chair and a side window suggesting cold weather outside
Subject: the fireplace as a warm light source within the room, not filling the frame; no people
Style/medium: photorealistic cinematic interior photography, natural low-light texture, restrained film grain, not glossy stock photography
Composition/framing: wide landscape establishing shot; preserve a meaningful central vertical crop for mobile with part of the hearth and room visible; keep calm dark negative space across the left-center for light interface typography; fireplace positioned around center-right with breathing room
Lighting/mood: low amber firelight against a cool dark winter room, still and comforting, soft shadows without crushed black detail
Color palette: charcoal, deep brown, muted amber and restrained orange
Materials/textures: matte plaster, aged wood, wool fabric, natural stone or dark brick, realistic small flames
Constraints: no text, no logos, no trademarks, no watermark, no people, no holiday decorations, no readable labels
Avoid: close-up fire stock photo, luxury showroom, oversized flames, Christmas imagery, excessive orange grading, perfect symmetry, fantasy glow
```

## Transformations

- Sources générées : PNG RGB, 1536 × 1024.
- Desktop : recadrage 1536 × 864, WebP qualité 78, métadonnées retirées.
- Mobile : recadrage vertical 640 × 1024, WebP qualité 78, métadonnées retirées.
- Outil : `ffmpeg-static@5.3.0`, encodeur `libwebp`.
- Aucun agrandissement et aucune retouche générative après sélection.

## Empreintes SHA-256

| Ambiance          | Source PNG générée                                                 | Desktop WebP                                                       | Mobile WebP                                                        |
| ----------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Rainy Apartment   | `4b4ff7b0ebfd7fd8d74a9bb714dde1e70406a5858dca7f8372f36c15ea791437` | `5cacafcdea79e79167daf6982c6f74daaba6f53227820fa9cf82be35cef1ec5b` | `f487f3d56ab6fe0f5a2e20441866d2bacb841a0a339775fc7f02c2797a3dd61e` |
| Quiet Coffee Shop | `a003abc5131e6d17ed5c2427acc309fb611ea2285aa489b6e37ea7899ed0dc9e` | `10257a1772e8199fa3cc920bbf917f97632e654eb2d97beab567a4974f555532` | `39d15e74199a56c3ca679297e7bb2a87f2100e2ab447b65e4efe2313d4e0955b` |
| Deep Forest       | `07d53552537c1bd1f23c9371f3bb4648f35ab2fda25e035877e81809752290b0` | `4f817af352ae7d0de6fe20fe31babc5089fb345ae3e40e2f74ac84e25514d7e3` | `11738485514458d4fce17d55126ec4ea7d0a6242f47706d9397812a6847c70d5` |
| Fireplace         | `d26b974b6decfae64f23755ca594d22468cdaaf9d42cc4f950b4f8a1a483d8bf` | `2f3ce72f66e337f946238cbd3b830646c889a6b92eb4683e67cb46cc1fe0600e` | `dc433e1864661a367fb8c567d1bf1ea1281fd69ede71864296b276d021d31b7c` |

`npm run images:check` vérifie les huit exports, leurs dimensions et le plafond de
500 Kio par fichier. Les fichiers WebP versionnés sont les masters de diffusion ;
les empreintes des PNG permettent de vérifier une archive source externe si elle
doit être réutilisée.
