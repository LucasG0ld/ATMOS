# Stratégie de tests

## Objectif

Protéger les parcours visibles et les zones risquées — responsive, accessibilité, cycle audio et médias — sans figer prématurément l’implémentation.

## Pyramide adaptée

### Vérifications statiques

À chaque changement : formatage, lint, TypeScript strict et build Next.js. Ce niveau détecte les contrats brisés, imports serveur/client invalides et erreurs de rendu.

### Tests unitaires

Cibler la logique pure :

- salutation selon l’heure ;
- normalisation et validation des ambiances ;
- bornage/conversion des volumes ;
- transitions de la machine d’état audio ;
- migrations de stockage futures ;
- calcul du timer futur.

### Tests de composants

Tester le comportement observable :

- slider nommé, valeur et clavier ;
- play/pause, loading, retry et disabled ;
- horloge sans annonce intempestive ;
- fallback visuel ;
- mode réduction des animations lorsque testable.

Éviter les snapshots volumineux de classes. Interroger par rôle, nom et texte comme un utilisateur.

### Tests end-to-end

Parcours critiques :

1. accueil → Rainy Apartment → retour ;
2. navigation clavier complète ;
3. réglage des trois sliders ;
4. play/pause et erreur audio simulée ;
5. accès direct et slug inconnu ;
6. viewport mobile et mouvement réduit.

Utiliser des médias de test minuscules et déterministes. Le test automatisé confirme l’orchestration ; la qualité sonore reste une validation humaine.

### Tests visuels

Captures de référence après Gate A pour :

- accueil desktop et mobile ;
- player desktop, mobile et fallback image ;
- focus clavier ;
- état réduit des animations si visuellement distinct.

Tolérances contrôlées ; stabiliser heure et animations afin d’éviter les faux positifs.

## Tests manuels indispensables

- Écoute de plusieurs cycles de chaque boucle au casque et sur haut-parleur.
- Glissement rapide des volumes, pause/reprise répétées et onglet masqué.
- Clavier seul et lecteur d’écran sur le parcours critique.
- Toucher réel sur mobile, safe areas et orientation paysage.
- Réseau lent, cache vide et médias en erreur.
- Zoom navigateur 200 % et taille de texte augmentée.

## Matrice cible

- Chromium courant desktop et Android.
- Firefox courant desktop.
- Safari courant macOS et iOS.
- Viewports de référence : 320, 375, 768, 1024 et 1440 px.

Les versions exactes sont relevées à chaque release, pas figées ici.

La candidate 0.1 automatise cinq projets Playwright : Chromium desktop, Firefox desktop, WebKit desktop, Chromium mobile émulé et WebKit mobile émulé. Le binaire WebKit Playwright sous Windows ne fournit pas `AudioContext` : il valide donc l’état récupérable sans audio. La lecture réelle reste automatisée sous Chromium et Firefox ; Safari macOS/iOS réel demeure obligatoire à la Gate B.

## CI attendue

Sur toute pull request : install verrouillée, lint, typecheck, tests unitaires/composants et build. Les E2E critiques s’exécutent avant fusion dès leur mise en place. Les audits lourds ou multi-navigateurs peuvent être programmés et sont obligatoires avant release.

État 0.1 : la CI exécute également `audio:check`, `budget:check`, puis 30 cas Playwright sur les cinq projets. Deux contrôles d’ordre clavier sont explicitement reportés pour WebKit, dont le réglage Safari par défaut exclut les liens de la tabulation ; 28 validations sont automatisées. axe-core bloque toute violation automatisable critique ou sérieuse avec les tags WCAG 2 A/AA, 2.1 AA et 2.2 AA.

## Données et isolation

- Pas de dépendance à des URLs média tierces dans les tests.
- Horloge et timers contrôlés par une fake clock.
- Adapter Web Audio injecté ou simulé pour la logique ; vrais navigateurs pour l’intégration.
- Nettoyer stockage, contextes, listeners et mocks entre tests.

## Politique de défauts

- Critique : crash, son impossible, navigation inaccessible — bloque fusion/release.
- Majeur : parcours principal fortement dégradé, contraste ou responsive bloquant — bloque release.
- Mineur : défaut cosmétique local sans perte d’usage — peut être planifié avec issue.
