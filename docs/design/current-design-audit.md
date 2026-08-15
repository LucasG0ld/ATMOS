# Audit du design actuel face au corpus de références

**Statut :** audit initial ; assainissement visuel P0 réalisé, sans décision de redesign  
**Date :** 15 août 2026  
**Version observée :** ATMOS 1.0.0, branche `design/revision-foundations`  
**Corpus :** [moodboard multi-sources](reference-moodboard.md)

## Conclusion exécutive

ATMOS possède déjà une direction reconnaissable et pertinente. La photographie
plein cadre, Instrument Sans, les noirs colorés, les accents propres aux scènes
et le peu de chrome placent le produit nettement au-dessus d'un mixeur sonore
utilitaire. L'accueil, le player et surtout le Focus Mode sont cohérents avec les
références directrices du corpus.

La révision ne doit donc pas repartir de zéro. Elle doit résoudre deux défauts
de fondation, puis renforcer trois points : l'évidence du premier Play, la
respiration mobile et la cohérence des couches secondaires.

### Bilan synthétique

| Axe                   | État                      | Conclusion                                                                                   |
| --------------------- | ------------------------- | -------------------------------------------------------------------------------------------- |
| Identité              | Fort                      | Cinématographique, calme et distincte d'un dashboard.                                        |
| Immersion             | Fort                      | La scène demeure le premier matériau, particulièrement en Focus Mode.                        |
| Hiérarchie            | Bon mais inégal           | Très éditoriale sur l'accueil ; plus dispersée dans le player et le compositeur.             |
| Action principale     | À renforcer               | Play est parfois moins visible que le titre, l'horloge ou les contrôles.                     |
| Mobile                | Fonctionnel mais comprimé | Le parcours tient ; le débordement masqué du player relevé pendant l'audit a été corrigé.    |
| Système de composants | À consolider              | Les dialogues sont proches visuellement, mais leur placement et leurs espacements divergent. |
| Accessibilité         | Fondations solides        | Sémantique, focus, réduction du mouvement et cibles tactiles sont déjà traités.              |

## Méthode

L'audit combine :

1. les captures historiques dans `docs/quality/references` ;
2. une capture de la build de production en 1440 × 900 et 375 × 812 ;
3. les états accueil, player, Focus Mode, compositeur, bibliothèque sonore,
   menu d'ambiances, préférences, timer, nommage, mixes, suppression et 404 ;
4. une lecture des composants et feuilles CSS correspondants ;
5. une confrontation aux niveaux A à D du corpus de références.

Les notes `P0`, `P1` et `P2` expriment l'ordre recommandé de traitement :

- **P0** : défaut de fondation ou contenu visiblement coupé ;
- **P1** : amélioration structurante de hiérarchie ou d'usage ;
- **P2** : finition et cohérence secondaire.

## Défauts transversaux relevés avant toute exploration

### P0 corrigé — Token d'espacement absent

`--space-5` est appelé à neuf endroits mais n'est pas défini dans
`src/app/globals.css`. Une déclaration CSS contenant cette variable sans valeur
de repli devient invalide.

Effets visibles :

- `Timer` et `Focus` sont collés dans le compositeur ;
- `Your mixes` et `Back to scene` perdent leur espacement prévu ;
- `Cancel` et `Save`, puis `Cancel` et `Delete mix`, se touchent ;
- le bouton principal de sauvegarde perd son padding horizontal et devient une
  pastille trop étroite ;
- certains contenus de préférences et lignes de mixes perdent leur respiration.

Cette anomalie faussait l'évaluation esthétique du compositeur et des dialogues.
Les neuf appels ont été remplacés par le token existant `--space-6`, cohérent
avec l'échelle documentée, sans introduire un nouveau palier spéculatif.

### P0 corrigé — Débordement masqué du player mobile

Sur un viewport de 375 px, la capture instrumentée mesure une largeur de document
de 375 px, mais le header et la scène du player atteignent 398 px. Le
`overflow-x: clip` de la scène masque le défaut : il n'existe pas de scrollbar,
mais `Back`, la fin de la description, les sliders et le label `Audio` sont
partiellement coupés.

Le problème vient de la combinaison entre la grille, le padding de
`.safe-area-frame`, les largeurs `100%` de la scène et un header d'actions sans
stratégie mobile suffisante. Le test d'absence de scrollbar ne détecte donc pas
le problème visuel.

La grille accepte désormais la réduction de ses enfants, la scène ne dépasse
plus son conteneur et le header s'adapte aux petites largeurs. Une assertion
Playwright vérifie les boîtes réelles des éléments critiques à 320 et 375 px,
au lieu de se limiter à `scrollWidth <= clientWidth`.

### P1 corrigé — Captures de référence devenues obsolètes

Les captures historiques de Quiet Coffee Shop, Deep Forest et Fireplace
affichent encore l'état `Unavailable` antérieur aux actifs audio définitifs. Elles
ne représentaient plus la version 1.0. Les dix références desktop et mobile ont
été régénérées après correction et redeviennent la baseline de la révision.

## Audit écran par écran

### 1. Accueil — desktop

**Verdict : très bonne base, à affiner plutôt qu'à recomposer.**

#### À préserver

- La liste verticale agit comme un index éditorial, conformément à Elektra et
  Rhythm Dialogues.
- L'aperçu change avec le focus clavier comme avec la souris ; la scène n'est
  pas réservée au hover.
- La question d'ouverture apporte une intention humaine sans bloc marketing.
- Les séparateurs, numéros et flèches structurent sans produire des cartes.
- La photographie conserve assez de présence malgré quatre destinations.

#### Écarts

- Le titre d'introduction et le premier item ont presque le même poids ; le
  regard hésite brièvement entre promesse et choix.
- `Four places / one quiet moment` est élégant mais isolé, petit et purement
  décoratif.
- Avec `Your mixes`, `Preferences` et le contexte, le header commence à devenir
  une barre d'outils alors que le reste de l'écran reste très éditorial.

#### Recommandation P1

Conserver exactement le principe d'index. Tester seulement une hiérarchie où la
question s'efface légèrement après l'entrée et où les utilitaires du header sont
regroupés sans devenir un menu opaque.

### 2. Accueil — mobile

**Verdict : clair et fonctionnel, mais trop de texte réduit l'effet de lieu.**

#### À préserver

- Le premier choix arrive sans écran intermédiaire.
- Chaque ligne reste une grande cible tactile et contient une description.
- La photographie portrait fonctionne et les contrastes restent convaincants.

#### Écarts

- Quatre titres et quatre descriptions occupent presque tout le premier écran ;
  la scène devient un fond plutôt qu'une destination.
- Les descriptions de trois lignes créent une cadence uniforme et dense.
- L'absence des numéros sur petit écran simplifie, mais retire un repère
  éditorial sans proposer de remplacement.

#### Recommandation P1

Tester une version mobile avec titre et micro-description plus courte, sans
cacher d'information derrière un hover. La scène active doit récupérer une zone
de respiration visible avant ou autour de l'index.

### 3. Player — desktop

**Verdict : signature visuelle forte, hiérarchie fonctionnelle trop dispersée.**

#### À préserver

- Le titre monumental inscrit immédiatement le lieu.
- Le dégradé local rend le texte lisible sans assombrir uniformément la scène,
  conformément aux observations Typewolf.
- Les sliders natifs sont fins mais utilisables.
- `Create a mix` reste secondaire et n'interrompt pas l'écoute simple.

#### Écarts

- Horloge, titre et colonne de contrôles forment trois pôles de poids comparable.
- Le Play en contour est plus discret que l'horloge et les trois sliders, alors
  qu'il constitue l'action attendue à l'arrivée.
- `Atmospheres`, `Preferences` et `Back` offrent plusieurs sorties de poids
  identique. Le wordmark est déjà un retour vers l'accueil.
- Le label `Audio` n'apporte pas d'état ou d'action et concurrence légèrement le
  bouton Play.

#### Recommandation P1

Faire de Play la seule action dominante du premier regard, réduire le poids de
l'horloge et simplifier la navigation supérieure. Dark Noise fournit ici le
meilleur principe : comprendre et démarrer immédiatement, puis laisser
l'interface s'effacer.

### 4. Player — mobile

**Verdict : composition pertinente ; débordement corrigé.**

#### À préserver

- L'ordre heure, titre, description, mixage et Play reste compréhensible.
- Les sliders occupent une largeur confortable.
- Favorite, Timer et Focus sont secondaires mais accessibles.

#### Écarts

- Le défaut P0 coupait plusieurs éléments sur le bord droit avant assainissement.
- Le header ne peut pas accueillir wordmark, Atmospheres, Preferences et Back
  sur une seule ligne à 375 px.
- Play arrive après les trois sliders ; l'utilisateur doit parcourir les réglages
  avant l'action la plus fréquente.
- L'écran cumule heure, eyebrow, titre, description, lien de composition,
  sliders, actions personnelles, Play et label Audio.

#### Recommandation P1

Après correction géométrique, tester Play avant les sliders sur mobile, avec un
accès progressif aux réglages. Garder toutes les fonctions accessibles sans
introduire de panneau permanent ni de barre de player musical.

### 5. Focus Mode

**Verdict : écran le plus proche de la direction cible.**

#### À préserver

- La scène, le nom, Play et Timer sont les seuls éléments fonctionnels visibles.
- La composition ressemble à une fenêtre sonore et non à un outil.
- La version mobile est immédiatement compréhensible.
- L'entrée, la sortie par Échap et la restauration du focus sont traitées.

#### Écart P2

Le bouton `Exit focus` utilise le safe area puis ajoute à nouveau le gutter, ce
qui le place plus loin du bord que les autres contrôles. L'effet reste élégant,
mais il n'est pas aligné au système général.

#### Recommandation

Employer Focus Mode comme référence interne pour le futur player : même calme,
même priorité donnée à la scène et même nombre réduit d'actions visibles.

### 6. Compositeur — desktop

**Verdict : concept réussi ; rythme restauré après correction du token manquant.**

#### À préserver

- Le découpage éditorial/composition évite l'apparence d'une DAW.
- Le Play plein est clairement identifiable.
- La limite `3 of 4`, les origines et les actions Add/Save restent explicites.
- La scène demeure visible entre et derrière les deux zones.

#### Écarts

- Le grand titre et la colonne de trois pistes produisent deux écrans presque
  indépendants plutôt qu'une seule atmosphère ajustable.
- L'origine `Rainy Apartment` répétée sur les trois lignes ajoute du bruit quand
  toutes les couches viennent de la même scène.
- Les boutons Remove sont visuellement très faibles face aux sliders.
- Plusieurs espacements étaient cassés par `--space-5` avant assainissement.

#### Recommandation P1

Rapprocher visuellement le titre et la composition, puis n'afficher l'origine au
niveau de chaque couche que lorsqu'un mix réunit plusieurs scènes. Garder la
limite de quatre et la liste verticale.

### 7. Compositeur — mobile

**Verdict : utilisable mais long et plus technique que le reste du produit.**

#### À préserver

- Play est visible avant le premier scroll.
- Chaque couche conserve un slider large et une cible Remove de 44 px.
- Add et Save restent textuels et explicites.

#### Écarts

- Save se trouve après toutes les couches, parfois sous la ligne de flottaison.
- La répétition origine/nom/slider/suppression allonge fortement l'écran.
- `Back to scene` se replie sur deux lignes et renforce la densité du header.
- La scène est moins perceptible sous la quantité de contenu.

#### Recommandation P1

Tester des lignes plus compactes et une zone d'actions stable mais non flottante
en permanence. L'objectif n'est pas de tout faire tenir sans scroll, mais de
préserver la sensation de scène pendant l'édition.

### 8. Bibliothèque sonore

**Verdict : bonne architecture de contenu, traitement desktop incohérent.**

#### À préserver

- Le groupement par ambiance est plus évocateur qu'une taxonomie technique.
- Les sons ajoutés sont clairement marqués et désactivés.
- Aucun preview ne démarre au focus ou au survol.
- Le plein écran mobile est lisible et conforme à la spécification.

#### Écarts

- Sur desktop, les dialogues du compositeur s'ouvrent au coin supérieur gauche,
  car leur style n'emploie pas le `margin: auto` des autres dialogues. Le
  résultat ressemble à un side panel accidentel.
- La bibliothèque est nécessairement dense ; la hiérarchie repose presque
  uniquement sur des filets et des capitales espacées.
- La cohérence entre dialogue centré, side sheet et plein écran n'est pas
  formalisée.

#### Recommandation P1

Choisir explicitement un modèle : panneau latéral assumé pour la bibliothèque et
dialogues centrés pour les tâches courtes, ou dialogue centré pour tous. Le
modèle hybride actuel ne paraît pas intentionnel.

### 9. Menu Atmospheres

**Verdict : dialogue le plus abouti après le timer.**

#### À préserver

- La liste courte, le repère Current et la grande typographie reprennent bien
  l'accueil sans le dupliquer.
- Le fond reste perceptible mais suffisamment atténué.
- Le mobile ne dépend d'aucun geste ou hover.

#### Ajustement P2

Sur mobile, `Current` crée une seconde ligne uniquement pour l'item actif. Tester
un marqueur plus compact sans retirer son annonce accessible.

### 10. Préférences

**Verdict : calme et compréhensible, mais encore peu structuré.**

#### À préserver

- Le stockage local est expliqué clairement.
- L'état vide et l'action de réinitialisation ne sont pas transformés en
  dashboard de réglages.
- Le dialogue garde une largeur confortable.

#### Écarts

- Le token manquant colle visuellement le résumé à la description et supprime
  une partie du rythme prévu.
- `Reset saved preferences` reste présent lorsque rien n'est sauvegardé, ce qui
  donne du poids à une action sans effet utile.

#### Recommandation P2

Réévaluer l'état vide après correction des espacements, puis masquer ou
désaccentuer davantage l'action de reset lorsqu'elle n'a aucune donnée à retirer.

### 11. Timer

**Verdict : excellente clarté et faible charge cognitive.**

#### À préserver

- Le choix est immédiat et ne demande aucun champ.
- Les cinq durées ont une surface tactile généreuse.
- La scène reste lisible comme contexte secondaire.

#### Ajustement P2

La grille mobile `3 + 2` laisse une cellule vide implicite dans le coin inférieur
droit. Tester une dernière durée étendue, une grille `2 + 2 + 1`, ou une rangée
horizontale scrollable seulement si son accessibilité est démontrée.

### 12. Nommage, liste et suppression des mixes

**Verdict : structure correcte, défaut visuel majeur causé par le token absent.**

#### À préserver

- Les libellés sont explicites et les confirmations expliquent la conséquence.
- `Your mixes` reste une liste et non une grille de cartes.
- La vue mobile plein écran laisse de la place aux noms longs futurs.

#### Écarts

- Cancel/Save et Cancel/Delete se touchent actuellement.
- Le bouton Save perd son padding et ressemble à une petite pastille.
- Sur desktop, le positionnement supérieur gauche diffère des autres dialogues.
- Avec un seul mix, le plein écran mobile paraît très vide ; ce vide est
  acceptable, mais les actions ont besoin d'un meilleur rythme horizontal.

#### Recommandation P0 puis P2

Corriger d'abord le token. Harmoniser ensuite les dialogues courts avec le timer
et réserver le plein écran mobile à la bibliothèque et à la liste potentiellement
longue.

### 13. Page 404

**Verdict : claire, accessible et cohérente typographiquement, peu immersive.**

#### À préserver

- Un seul message et un seul chemin de retour.
- Grande respiration et excellent comportement mobile.

#### Ajustement P2

La page abandonne entièrement le langage photographique. Une texture ou un
gradient thématique très léger pourrait la rattacher au produit sans télécharger
une scène complète ni théâtraliser l'erreur.

## Confrontation directe au corpus

| Principe du corpus                                     | État ATMOS                                                   | Décision d'audit                                      |
| ------------------------------------------------------ | ------------------------------------------------------------ | ----------------------------------------------------- |
| Index éditorial — Elektra, Rhythm Dialogues            | Déjà présent sur l'accueil et le menu.                       | Préserver ; alléger seulement le mobile.              |
| Destination avant outil — Portal, Earth.fm             | Fort en player et Focus, plus faible en compositeur.         | Renforcer la présence de la scène pendant l'édition.  |
| Démarrage immédiat — Dark Noise                        | Play existe partout mais manque de dominance dans le player. | Priorité de redesign.                                 |
| Mixage compréhensible — Noisli, A Soft Murmur, Moodist | Très clair avec trois ou quatre sliders.                     | Préserver la limite et réduire les répétitions.       |
| Continuité de session — Calm, Headspace, Tide          | Flux court, timer persistant et Focus cohérent.              | Préserver ; travailler surtout l'ordre visuel mobile. |
| Couches perceptibles — EXPO 58                         | Réussi dans menu, préférences et timer.                      | Formaliser les variantes de dialogue du compositeur.  |
| Texte sur photographie — Typewolf                      | Gradients localisés efficaces.                               | Préserver et mesurer scène par scène.                 |
| Absence de spectacle technique                         | Aucun waveform, WebGL, score ou gamification.                | Garde-fou respecté, à maintenir.                      |

## Ordre recommandé pour la révision

### Étape A — Assainissement visuel (réalisée le 15 août 2026)

1. Toutes les utilisations de `--space-5` ont été remplacées.
2. Le débordement du player mobile est corrigé et couvert par une assertion géométrique.
3. Les captures de référence 1.0 sont rafraîchies.
4. Les contrôles automatisés couvrent 320 px, 375 px et la réduction du mouvement ;
   le contrôle manuel à 200 % et en contraste élevé reste à confirmer avant le redesign.

### Étape B — Variantes ciblées

1. Player : dominance de Play, horloge secondaire et navigation simplifiée.
2. Accueil mobile : index plus respirant avec scène plus présente.
3. Compositeur : lignes plus calmes, origine conditionnelle et actions mieux
   rythmées.
4. Dialogues : système explicite centré / panneau / plein écran.

### Étape C — Validation avant implémentation

Comparer deux ou trois variantes sur les mêmes contenus et viewports. La
direction retenue devra améliorer l'accès à Play et la respiration mobile sans
réduire la lisibilité, supprimer une fonction ou transformer ATMOS en lecteur
musical classique.

## Hors périmètre de cet audit

- aucune modification visuelle n'est approuvée par ce document ;
- aucune nouvelle ambiance, fonction, authentification ou donnée distante ;
- aucune modification du moteur audio ;
- aucune adoption automatique d'une tendance ou d'un composant observé dans le
  corpus.
