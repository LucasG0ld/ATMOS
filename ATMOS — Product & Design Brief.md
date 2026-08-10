# ATMOS — Product & Design Brief

## 1. Présentation du projet

**Nom de travail : Atmos**

Atmos est une application web immersive permettant de créer et d'écouter des **ambiances sonores personnalisées** destinées à accompagner différents moments de la journée :

- travailler ;
- lire ;
- se détendre ;
- dormir ;
- réfléchir ;
- étudier ;
- simplement créer une atmosphère agréable.

L'application ne doit pas être pensée comme un lecteur audio classique ou une alternative à Spotify.

L'idée principale est de proposer une **expérience visuelle et sonore immersive**, où l'interface elle-même participe à l'ambiance.

Chaque environnement sonore possède :

- sa propre identité visuelle ;
- ses sons ;
- son éclairage ;
- ses couleurs ;
- ses animations ;
- son atmosphère.

Le projet est avant tout un projet **front-end orienté design, UX, animations et micro-interactions**.

---

# 2. Objectifs principaux

Atmos doit permettre de travailler particulièrement les compétences suivantes :

### Front-end

- React ;
- Next.js ;
- TypeScript ;
- gestion d'état ;
- composants réutilisables ;
- responsive design ;
- Web Audio API ;
- persistance locale.

### Design

- direction artistique ;
- typographie ;
- systèmes de couleurs ;
- layouts immersifs ;
- animation d'interface ;
- transitions ;
- interactions ;
- micro-interactions ;
- responsive design.

### Expérience utilisateur

L'application doit donner une impression de :

- calme ;
- immersion ;
- fluidité ;
- simplicité ;
- qualité ;
- modernité.

L'utilisateur ne doit jamais avoir l'impression d'utiliser un tableau de bord complexe.

---

# 3. Philosophie du produit

Atmos doit suivre une règle fondamentale :

> Less interface, more atmosphere.

Le produit doit éviter d'afficher trop d'informations simultanément.

L'utilisateur doit pouvoir comprendre très rapidement ce qu'il peut faire.

L'interface doit privilégier :

- les grands espaces ;
- les éléments visuels immersifs ;
- les interactions directes ;
- les contrôles simples ;
- les animations douces.

Le produit ne doit surtout pas ressembler à :

- Spotify ;
- YouTube Music ;
- un dashboard SaaS ;
- un panneau de contrôle domotique ;
- une application mobile générique remplie de cartes.

---

# 4. Direction artistique

## Style général

Atmos doit avoir une identité :

**minimaliste + immersive + cinématographique + légèrement organique.**

L'application peut s'inspirer de certains principes présents dans :

- les interfaces Apple ;
- les sites éditoriaux premium ;
- les portfolios créatifs ;
- les interfaces de méditation ;
- les expériences WebGL minimalistes ;
- les applications de bien-être modernes.

Il ne faut cependant reproduire directement aucune interface existante.

---

# 5. Identité visuelle

Le design doit reposer principalement sur les ambiances elles-mêmes.

La couleur globale de l'application change donc dynamiquement selon l'environnement sélectionné.

Exemples :

### Rainy Apartment

Palette :

- bleu nuit ;
- gris ardoise ;
- noir légèrement bleuté ;
- lumière chaude provenant d'une fenêtre ou d'une lampe.

Atmosphère :

- calme ;
- pluie ;
- soirée ;
- appartement chaleureux.

---

### Quiet Coffee Shop

Palette :

- beige ;
- brun ;
- crème ;
- orange très légèrement désaturé.

Atmosphère :

- chaleureuse ;
- matin ;
- lumière naturelle ;
- bois ;
- café.

---

### Deep Forest

Palette :

- vert profond ;
- mousse ;
- kaki ;
- brun sombre.

Atmosphère :

- fraîche ;
- calme ;
- naturelle ;
- légèrement mystérieuse.

---

### Ocean Night

Palette :

- bleu marine ;
- bleu pétrole ;
- gris bleuté ;
- reflets argentés.

Atmosphère :

- nuit ;
- vagues ;
- profondeur ;
- lenteur.

---

### Fireplace

Palette :

- charbon ;
- brun foncé ;
- orange ;
- ambre.

Atmosphère :

- hiver ;
- chaleur ;
- soirée ;
- confort.

---

### Tokyo Rain

Palette :

- noir ;
- bleu électrique très atténué ;
- magenta ;
- violet.

Important :

Le résultat ne doit pas devenir une interface cyberpunk ou gaming.

Les couleurs doivent rester élégantes, profondes et relativement désaturées.

---

# 6. Typographie

L'interface devra utiliser peu de styles typographiques.

Objectif :

- une typographie principale moderne et élégante ;
- éventuellement une seconde typographie pour les petits labels ou éléments éditoriaux.

Privilégier des polices gratuites disponibles via Google Fonts ou Fontsource.

Quelques pistes à tester :

- Inter ;
- Manrope ;
- Geist ;
- DM Sans ;
- Instrument Sans ;
- Satoshi si la licence et la méthode d'intégration conviennent.

La hiérarchie typographique doit être très marquée.

Exemple :

```text
10:32

Rainy
Apartment

A quiet place
while the city sleeps.
```

Le titre d'une ambiance peut devenir un véritable élément graphique.

---

# 7. Expérience principale

Lorsqu'un utilisateur arrive sur Atmos, il doit découvrir une page extrêmement simple.

Exemple :

```text
ATMOS

Good morning.

What atmosphere
do you need today?
```

Puis plusieurs ambiances sont proposées.

Exemple :

```text
Rainy Apartment
Quiet Coffee Shop
Deep Forest
Fireplace
Ocean Night
Tokyo Rain
```

Les ambiances doivent apparaître sous forme de grandes cartes ou d'une navigation visuelle immersive.

---

# 8. Écran d'ambiance

Lorsqu'une ambiance est sélectionnée, l'application passe dans un environnement entièrement dédié.

Exemple :

```text
10:32

RAINY
APARTMENT

──────────

Rain                 65%
Thunder              15%
Window               40%
Fireplace            25%

──────────

Pause

60 min
```

L'interface ne doit cependant pas ressembler à un mixer audio professionnel.

Les contrôles doivent rester discrets.

---

# 9. Architecture sonore

Une ambiance est composée de plusieurs **layers audio**.

Par exemple :

## Rainy Apartment

- pluie principale ;
- pluie sur fenêtre ;
- tonnerre distant ;
- bruit urbain léger ;
- feu de cheminée.

## Coffee Shop

- conversations lointaines ;
- machine à café ;
- tasses ;
- pluie extérieure ;
- musique très légère éventuellement.

## Forest

- vent ;
- feuilles ;
- oiseaux ;
- ruisseau ;
- pluie légère.

Chaque layer dispose d'un volume indépendant.

---

# 10. Audio Mixer

Créer un composant central :

`AudioMixer`

Il devra être capable de :

- charger plusieurs fichiers audio ;
- jouer plusieurs pistes simultanément ;
- modifier indépendamment leur volume ;
- mettre toute l'ambiance en pause ;
- reprendre la lecture ;
- effectuer des transitions audio progressives ;
- boucler les pistes.

Éviter les coupures audio brutales.

Utiliser idéalement :

**Web Audio API**

avec notamment :

- AudioContext ;
- GainNode ;
- éventuellement AudioBufferSourceNode.

L'utilisation de simples balises `<audio>` reste possible pour un prototype, mais l'architecture doit permettre une évolution vers Web Audio API.

---

# 11. Contrôle du volume

Éviter les sliders HTML standards sans personnalisation.

Créer un composant :

`AtmosSlider`

Exemple :

```text
Rain

────────────●──────

65
```

Lorsqu'on déplace le curseur :

- animation légère ;
- valeur mise à jour en temps réel ;
- modification instantanée du layer audio.

La valeur peut disparaître lorsque le contrôle n'est plus actif afin de garder l'interface minimaliste.

---

# 12. Animation générale

Les animations sont extrêmement importantes dans ce projet.

Utiliser :

**Motion / Framer Motion**

pour :

- changement d'ambiance ;
- apparition des éléments ;
- transitions de page ;
- hover ;
- sliders ;
- menus ;
- panels ;
- changement de couleurs.

Les animations doivent être :

- lentes ;
- naturelles ;
- fluides ;
- discrètes.

Éviter les animations trop rebondissantes.

Préférer :

- opacity ;
- blur ;
- scale très légère ;
- translation lente ;
- crossfade.

---

# 13. Transition entre les ambiances

Lorsque l'utilisateur passe par exemple de :

Rainy Apartment

à

Deep Forest

ne pas changer instantanément tout l'écran.

Créer une transition de quelques centaines de millisecondes :

1. légère baisse de luminosité ;
2. changement progressif du background ;
3. crossfade de l'image ;
4. transition audio ;
5. apparition du nouveau titre.

Le changement d'ambiance doit devenir une partie importante de l'expérience.

---

# 14. Background

Le background est l'élément visuel principal.

Plusieurs approches peuvent être testées.

### Version MVP

Utiliser :

- photographie ;
- gradient ;
- overlays ;
- blur ;
- grain subtil.

### Version avancée

Ajouter :

- parallaxe ;
- vidéo très légère ;
- canvas ;
- shaders ;
- WebGL ;
- particules.

Mais ne pas utiliser WebGL simplement pour démontrer une compétence technique.

L'effet doit améliorer l'immersion.

---

# 15. Grain visuel

Ajouter éventuellement un très léger grain/noise sur l'écran.

Objectifs :

- éviter les backgrounds trop numériques ;
- apporter une texture ;
- accentuer l'aspect cinématographique.

Le grain doit être presque imperceptible.

---

# 16. Horloge

Afficher une grande horloge.

Exemple :

```text
22:47
```

Elle doit utiliser l'heure locale de l'utilisateur.

Option intéressante :

adapter certains éléments de l'interface selon l'heure.

Exemple :

```text
05:00 – 11:59
Good morning

12:00 – 17:59
Good afternoon

18:00 – 04:59
Good evening
```

L'heure peut également légèrement influencer la luminosité de certaines ambiances dans une évolution future.

---

# 17. Focus Mode

Prévoir un mode :

**Focus**

Lorsque l'utilisateur l'active :

la majorité de l'interface disparaît.

Il reste uniquement :

- background ;
- ambiance ;
- heure ;
- bouton pause minimal.

Exemple :

```text
22:47


Rainy Apartment


             ||
```

Un mouvement de souris peut faire réapparaître progressivement les contrôles.

---

# 18. Timer

Ajouter un timer optionnel.

Exemples :

- 15 min ;
- 30 min ;
- 45 min ;
- 60 min ;
- 90 min.

À la fin :

le volume diminue progressivement jusqu'à zéro.

Pas d'arrêt audio brutal.

---

# 19. Favoris

L'utilisateur pourra ajouter une ambiance aux favoris.

Stockage :

`localStorage`

Pas besoin de compte utilisateur pour le MVP.

---

# 20. Ambiances personnalisées

Fonctionnalité à prévoir dans une phase ultérieure.

L'utilisateur pourra créer son propre mix.

Exemple :

```text
My Sunday Morning

Rain                30
Coffee Shop         45
Fireplace           20
Birds               10
```

Puis sauvegarder la configuration.

---

# 21. Structure des pages

Architecture proposée :

```text
/
    Home

/atmosphere/[slug]
    Atmosphere Player

/library
    Browse atmospheres

/saved
    Saved mixes / favorites

/about
    About Atmos
```

Pour le premier MVP :

```text
/
    Home

/atmosphere/[slug]
    Atmosphere Player
```

suffisent.

---

# 22. Home Page

Structure possible :

```text
Header

ATMOS                     Browse    About

Hero

Good morning.

What atmosphere
do you need today?

Atmosphere selector

[ Rainy Apartment ]

[ Coffee Shop ]
[ Deep Forest ]

[ Fireplace ]
[ Ocean Night ]

Footer minimal
```

Éviter une succession classique de sections marketing.

Atmos est une application, pas une landing page SaaS.

---

# 23. Navigation entre les ambiances

Créer une navigation permettant de découvrir les environnements sans forcément retourner à la homepage.

Possibilité :

une liste verticale accessible depuis un bouton discret.

```text
Atmospheres

01 Rainy Apartment
02 Coffee Shop
03 Deep Forest
04 Fireplace
05 Ocean Night
06 Tokyo Rain
```

Au hover :

- preview de l'ambiance ;
- changement léger de background.

---

# 24. Composants principaux

Architecture de composants possible :

```text
components/

AtmosphereCard
AtmosphereGrid
AtmosphereBackground
AtmospherePlayer
AtmosSlider

AudioMixer
AudioLayer

Clock
Timer

FocusMode
Navigation
AtmosphereMenu

IconButton
TextButton

NoiseOverlay
GradientOverlay
```

---

# 25. Structure des données

Les ambiances doivent être définies dans des objets et non directement codées dans les composants.

Exemple conceptuel :

```ts
type Atmosphere = {
  id: string
  slug: string
  name: string
  description: string

  visuals: {
    background: string
    accent: string
    foreground: string
  }

  sounds: SoundLayer[]
}

type SoundLayer = {
  id: string
  name: string
  src: string
  defaultVolume: number
}
```

Exemple :

```ts
const rainyApartment = {
  id: "rainy-apartment",
  slug: "rainy-apartment",

  name: "Rainy Apartment",

  description:
    "A quiet evening while the city disappears behind the rain.",

  sounds: [
    {
      id: "rain",
      name: "Rain",
      src: "/audio/rain.mp3",
      defaultVolume: 0.7
    },

    {
      id: "thunder",
      name: "Thunder",
      src: "/audio/thunder.mp3",
      defaultVolume: 0.15
    }
  ]
}
```

Cette architecture doit permettre d'ajouter facilement une nouvelle ambiance sans modifier la logique de l'application.

---

# 26. État global

Éviter une architecture inutilement complexe.

Commencer avec :

- React state ;
- Context API ;

ou éventuellement :

**Zustand**

si la gestion des layers audio devient plus complexe.

État possible :

```text
currentAtmosphere
isPlaying
masterVolume
layers
timer
focusMode
favorites
```

---

# 27. Stack recommandée

### Framework

Next.js

### Langage

TypeScript

### Styling

Tailwind CSS

avec éventuellement CSS Modules ou CSS custom properties pour certains effets complexes.

### Animation

Motion / Framer Motion

### State

React Context ou Zustand

### Icons

Lucide

### Audio

Web Audio API

### Storage

localStorage

### Deployment

Vercel

---

# 28. CSS variables dynamiques

Les ambiances doivent pouvoir modifier le thème global.

Exemple :

```css
--atmos-background
--atmos-foreground
--atmos-muted
--atmos-accent
--atmos-overlay
```

Lorsqu'une ambiance change :

ces variables changent progressivement.

Cela évite de créer un thème CSS complètement différent pour chaque environnement.

---

# 29. Responsive design

Le site doit fonctionner parfaitement sur :

- desktop ;
- laptop ;
- tablette ;
- mobile.

Mais la direction artistique principale peut être développée d'abord pour desktop.

Desktop :

interface immersive occupant tout l'écran.

Mobile :

contrôles accessibles au pouce, par exemple dans une bottom sheet.

---

# 30. Accessibilité

Même si Atmos est très graphique, conserver :

- navigation clavier ;
- focus visibles ;
- contrastes suffisants ;
- aria-labels ;
- boutons accessibles ;
- sliders utilisables au clavier.

Supporter :

`prefers-reduced-motion`

pour réduire certaines animations.

---

# 31. Gestion des performances

L'expérience doit rester fluide.

Faire attention particulièrement à :

- taille des images ;
- fichiers audio ;
- vidéos ;
- animations ;
- blur CSS ;
- filtres ;
- WebGL éventuel.

Utiliser :

- lazy loading ;
- preload de l'ambiance suivante ;
- formats modernes d'image ;
- compression audio raisonnable.

---

# 32. Audio et droits

Utiliser uniquement des sons :

- libres de droits ;
- Creative Commons compatibles ;
- domaine public ;
- créés spécifiquement pour le projet.

Conserver éventuellement un fichier indiquant la source et la licence des sons.

Ne pas récupérer directement des pistes provenant de YouTube ou de services commerciaux.

---

# 33. MVP

Le premier MVP ne doit pas chercher à implémenter toutes les idées.

Objectif :

avoir rapidement une expérience extrêmement propre autour d'UNE ambiance.

### MVP 0.1

Créer uniquement :

**Rainy Apartment**

Fonctionnalités :

- homepage ;
- sélection Rainy Apartment ;
- écran immersif ;
- background ;
- titre ;
- heure ;
- 3 layers audio ;
- contrôle individuel des volumes ;
- play/pause ;
- animations ;
- responsive.

---

# 34. MVP 0.2

Ajouter :

- Coffee Shop ;
- Forest ;
- Fireplace.

Implémenter les transitions entre les ambiances.

---

# 35. MVP 0.3

Ajouter :

- Focus Mode ;
- Timer ;
- favoris ;
- localStorage.

---

# 36. Version 1

Ajouter :

- création d'ambiances personnalisées ;
- sauvegarde des mixes ;
- bibliothèque d'ambiances ;
- meilleure gestion audio ;
- transitions audio avancées.

---

# 37. Fonctionnalités à NE PAS développer immédiatement

Ne pas ajouter pour le moment :

- authentification ;
- base de données ;
- backend ;
- abonnement ;
- paiement ;
- système social ;
- commentaires ;
- profil complexe ;
- synchronisation cloud ;
- application mobile native.

Ces fonctionnalités détourneraient le projet de son objectif principal.

---

# 38. Priorités de développement

Ordre recommandé :

### Étape 1

Créer le projet et définir :

- fonts ;
- spacing ;
- couleurs ;
- reset ;
- layout principal.

### Étape 2

Créer la homepage.

Se concentrer uniquement sur :

- composition ;
- typographie ;
- animations.

### Étape 3

Créer Rainy Apartment.

### Étape 4

Implémenter le système audio.

### Étape 5

Ajouter les contrôles de volume.

### Étape 6

Ajouter les transitions.

### Étape 7

Créer les autres ambiances.

### Étape 8

Ajouter Focus Mode.

### Étape 9

Ajouter Timer.

### Étape 10

Effectuer le polish final.

---

# 39. Règles de design

Pendant tout le développement, respecter ces règles.

### Règle 1

Ne pas remplir les espaces simplement parce qu'ils sont vides.

Le vide fait partie du design.

### Règle 2

Éviter les cartes génériques.

Chaque élément doit avoir une raison d'exister.

### Règle 3

Éviter les bordures visibles partout.

Utiliser plutôt :

- spacing ;
- contraste ;
- transparence ;
- lumière.

### Règle 4

Les coins arrondis doivent rester cohérents.

Éviter le style SaaS avec chaque élément placé dans une grande carte `border-radius: 24px`.

### Règle 5

Les animations doivent renforcer l'impression de calme.

### Règle 6

Éviter les effets gratuits.

Pas de :

- glow excessif ;
- néons ;
- gradients arc-en-ciel ;
- glassmorphism partout ;
- animations rebondissantes.

### Règle 7

Chaque ambiance doit avoir une personnalité distincte tout en restant clairement dans l'univers Atmos.

---

# 40. Micro-interactions à explorer

Quelques idées :

### Play

Lorsqu'on active une ambiance :

le bouton Play se transforme lentement en Pause.

### Slider

Le nom du son devient légèrement plus lumineux pendant la modification.

### Navigation

Le background peut commencer à prévisualiser l'ambiance survolée.

### Timer

Une ligne circulaire ou horizontale très discrète indique le temps restant.

### Focus

Les contrôles disparaissent progressivement.

### Souris

Un très léger déplacement de certaines couches du background peut suivre la souris.

Amplitude très faible.

---

# 41. Page Rainy Apartment — proposition de layout

Desktop :

```text
ATMOS                                      ···



10:32


RAINY
APARTMENT

A quiet evening while the city
disappears behind the rain.



                     Rain
                     ──────────●──

                     Window
                     ───────●─────

                     Thunder
                     ──●──────────



                     Pause     60 min
```

Le background occupe tout l'écran.

Une grande partie de l'écran reste volontairement vide.

---

# 42. Direction photographique

Les images doivent montrer davantage une **atmosphère** qu'un sujet précis.

Exemple Rainy Apartment :

Éviter :

une simple photographie nette d'un appartement.

Préférer :

- fenêtre mouillée ;
- ville floue ;
- lumière chaude intérieure ;
- profondeur de champ ;
- environnement sombre.

L'image doit laisser de l'espace pour le texte.

---

# 43. Logo

Pour commencer, utiliser simplement :

**ATMOS**

en typographie.

Pas besoin de symbole.

Possibilité de jouer légèrement sur :

- tracking ;
- graisse ;
- taille.

L'identité doit être suffisamment forte pour que le wordmark suffise.

---

# 44. Ton rédactionnel

Les textes doivent être très courts.

Atmos ne doit pas beaucoup parler.

Exemples :

```text
Good evening.

Find your atmosphere.
```

ou :

```text
A quiet evening
behind the rain.
```

ou :

```text
Slow down.
Nothing else matters right now.
```

Éviter le vocabulaire marketing.

Pas de :

```text
Boost your productivity with our revolutionary sound experience.
```

---

# 45. Langue

Pour le projet portfolio, utiliser principalement **l'anglais**.

Cela permet :

- une identité plus universelle ;
- des textes plus courts ;
- une meilleure présentation portfolio.

L'internationalisation n'est pas nécessaire pour le MVP.

---

# 46. Critères de réussite

Le projet sera considéré réussi si :

### Visuellement

Une capture d'écran de l'application donne immédiatement envie d'interagir avec elle.

### UX

Un nouvel utilisateur comprend en quelques secondes :

- qu'il peut choisir une ambiance ;
- lancer le son ;
- modifier les éléments.

### Technique

L'ajout d'une nouvelle ambiance ne nécessite quasiment aucune modification des composants.

### Animation

Les transitions restent fluides et cohérentes.

### Audio

Plusieurs layers peuvent fonctionner simultanément sans coupure.

### Responsive

L'expérience reste agréable sur mobile.

---

# 47. Première ambiance à développer

Commencer impérativement avec :

## Rainy Apartment

Concept :

Il est tard.

L'utilisateur se trouve dans un appartement calme.

La pluie tombe sur les fenêtres.

La ville est visible derrière la vitre mais complètement floue.

Une lumière chaude éclaire légèrement la pièce.

Les sons disponibles :

```text
Rain
Window Rain
Distant Thunder
```

Éventuellement plus tard :

```text
Fireplace
City
Vinyl
```

---

# 48. Première mission de développement

Commencer par créer uniquement le **prototype visuel de Rainy Apartment**.

Ne pas commencer immédiatement par le moteur audio.

Créer d'abord :

1. structure Next.js ;
2. fonts ;
3. layout ;
4. background ;
5. navigation minimale ;
6. horloge ;
7. titre ;
8. description ;
9. trois sliders visuels ;
10. bouton play/pause ;
11. premières animations.

Les sliders et boutons peuvent dans un premier temps être fonctionnels visuellement sans être connectés à l'audio.

Une fois l'expérience visuelle convaincante, implémenter le moteur sonore.

---

# 49. Manière de travailler avec Codex

Ne pas générer toute l'application d'un seul coup.

Avancer progressivement.

Pour chaque étape :

1. analyser l'existant ;
2. proposer l'architecture nécessaire ;
3. implémenter uniquement la fonctionnalité concernée ;
4. tester ;
5. vérifier TypeScript ;
6. vérifier le responsive ;
7. éviter les abstractions prématurées ;
8. expliquer brièvement les choix importants.

Lorsqu'un choix visuel est incertain, privilégier la solution :

- la plus minimaliste ;
- la plus élégante ;
- la moins générique.

Ne pas transformer spontanément l'application en dashboard.

---

# 50. Instruction initiale pour Codex

Je souhaite développer le projet Atmos décrit dans ce document.

Ton rôle est de m'accompagner dans sa conception et son développement progressivement, pas de générer arbitrairement toute l'application en une seule fois.

Avant d'ajouter une fonctionnalité importante :

- inspecte le code existant ;
- conserve une architecture simple ;
- réutilise les composants existants lorsque c'est pertinent ;
- évite la sur-ingénierie ;
- garde une excellente qualité TypeScript ;
- fais particulièrement attention au responsive et à l'accessibilité.

La priorité absolue du projet est son expérience visuelle.

Atmos doit être minimaliste, immersif, cinématographique et extrêmement soigné.

Lorsque tu proposes une interface, évite systématiquement les patterns génériques de dashboards SaaS.

Le développement doit commencer par un prototype visuel complet de l'ambiance **Rainy Apartment** avant de travailler en profondeur sur l'audio.

Stack souhaitée :

- Next.js ;
- React ;
- TypeScript ;
- Tailwind CSS ;
- Motion / Framer Motion ;
- Lucide Icons ;
- Web Audio API à terme.

Commence par analyser le projet actuel s'il existe.

S'il n'existe pas encore, propose-moi uniquement la structure initiale pertinente et la première étape permettant de construire le prototype visuel de Rainy Apartment.