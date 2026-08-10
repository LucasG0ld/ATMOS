# Système de design

Ce document fixe les règles, pas une maquette définitive. Les valeurs finales seront ajustées après prototype tout en conservant les rôles sémantiques.

## Direction

Minimaliste, immersive, cinématographique et légèrement organique. La photographie et la lumière portent l’émotion ; la typographie établit la structure ; les contrôles se révèlent par l’usage. Le résultat ne doit évoquer ni dashboard, ni interface gaming, ni lecteur musical traditionnel.

## Wordmark

`ATMOS` en capitales, sans symbole dans le MVP. Utiliser une graisse sobre et un tracking légèrement ouvert. Le wordmark sert aussi de lien vers l’accueil dans le player.

## Typographie

La famille retenue est **Instrument Sans Variable**, auto-hébergée via Fontsource. Son dessin plus éditorial et légèrement organique soutient mieux les grands titres atmosphériques que Geist, tout en restant lisible pour les labels. Le MVP utilise l’axe de graisse 400–700 et une seule famille afin de limiter le poids et de garder une identité cohérente.

Échelle fluide indicative :

| Rôle    | Taille                        | Interligne | Usage                   |
| ------- | ----------------------------- | ---------- | ----------------------- |
| Display | `clamp(3.5rem, 9vw, 9rem)`    | 0,84–0,92  | nom de l’ambiance       |
| Clock   | `clamp(2rem, 4vw, 4.5rem)`    | 1          | heure                   |
| Lead    | `clamp(1.5rem, 3vw, 3.5rem)`  | 1,05       | question accueil        |
| Body    | `clamp(1rem, 1.2vw, 1.25rem)` | 1,5        | description             |
| Label   | 0,75–0,875 rem                | 1,3        | commandes et navigation |

- Limiter les graisses à deux ou trois valeurs.
- Éviter les capitales pour les paragraphes.
- Contrôler les retours du titre explicitement lorsque la composition le demande, sans casser la lecture accessible.

## Espacement

Base de 4 px avec une échelle volontairement courte : `4, 8, 12, 16, 24, 32, 48, 64, 96, 128`. Les espacements de composition peuvent être fluides avec `clamp()`. Le vide n’est pas un espace à remplir.

## Couleurs sémantiques

Les composants consomment des rôles, jamais des couleurs propres à une ambiance :

```css
:root {
  --atmos-background: #10161d;
  --atmos-foreground: #f2f0ea;
  --atmos-muted: #b6bcc1;
  --atmos-accent: #c49a64;
  --atmos-surface: rgb(9 13 18 / 36%);
  --atmos-overlay: rgb(5 9 14 / 45%);
  --atmos-focus: #f4d8a8;
}
```

Valeurs initiales Rainy Apartment à tester :

| Rôle       | Intention                                           |
| ---------- | --------------------------------------------------- |
| Background | bleu-noir profond, jamais noir pur                  |
| Foreground | ivoire doux                                         |
| Muted      | gris bleu suffisamment contrasté                    |
| Accent     | ambre désaturé de lumière intérieure                |
| Overlay    | gradient sombre assurant la lisibilité              |
| Focus      | teinte claire distincte, visible sur toute la scène |

Les changements de thème futurs interpoleront ces variables. Le contraste doit être mesuré sur la composition finale, y compris image et overlays, et pas seulement entre hexadécimaux.

## Couches du background

Ordre de composition recommandé :

1. couleur ou gradient de repli ;
2. image responsive ;
3. gradient de lisibilité localisé ;
4. voile colorimétrique thématique ;
5. grain très subtil et non interactif ;
6. contenu.

Le grain ne doit pas dégrader la compression, le contraste ou la performance. Utiliser une petite texture répétée ou du CSS mesuré ; désactiver l’animation du grain.

## Forme et profondeur

- Rayons limités et cohérents : petit 6 px, moyen 12 px, rond pour les contrôles circulaires.
- Pas de grande carte arrondie autour de chaque groupe.
- Délimiter par espace, alignement, transparence et lumière.
- Ombres diffuses et rares ; pas de glow coloré excessif.
- Blur réservé aux couches petites et justifiées, après mesure sur mobile.

## Icônes

Lucide est la source unique initiale. Taille et épaisseur cohérentes ; chaque bouton icône reçoit un nom accessible. Ne pas utiliser une icône lorsque le mot est plus clair. Play et Pause peuvent combiner icône et libellé selon l’espace.

## Contrôles

### Slider

- Piste visuelle fine, zone interactive haute.
- Portion active via couleur de foreground/accent.
- Pouce discret au repos, plus présent au focus et au drag.
- Valeur révélée à l’interaction.

### Boutons

- Variantes minimales : texte, icône et action principale sobre.
- Taille tactile minimale 44 × 44 px.
- États hover, focus, pressé, disabled et loading distincts.
- L’état focus n’est jamais supprimé sans remplacement visible.

## Mouvement

Tokens indicatifs :

```css
--duration-instant: 120ms;
--duration-control: 200ms;
--duration-reveal: 480ms;
--duration-scene: 720ms;
--ease-out: cubic-bezier(0.22, 1, 0.36, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
```

Limiter les propriétés animées à `opacity` et `transform` lorsque possible. L’animation de filtres et grandes zones floutées exige une mesure. Sous réduction du mouvement, `--duration-reveal` et `--duration-scene` sont raccourcies et les translations supprimées.

## Imagerie Rainy Apartment

Rechercher une scène sombre avec vitre mouillée, ville floue et lumière intérieure chaude. L’image doit laisser un espace négatif exploitable, ne pas imposer un sujet ou un visage, et fonctionner en recadrage large et portrait. Prévoir un point focal par donnée afin que le recadrage reste pilotable.

## Anti-patterns

- Grille uniforme de cartes avec badges et ombres.
- Glassmorphism généralisé.
- Néons, gradients arc-en-ciel et palette cyberpunk.
- Animations à ressort ou rebondissantes.
- Bordures visibles autour de chaque groupe.
- Texte marketing, métriques ou fonctionnalités empilées sur l’accueil.
- Contrôles toujours plus visibles que la scène.
