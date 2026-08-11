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

La candidate 0.1 automatise cinq projets Playwright : Chromium desktop, Firefox desktop, WebKit desktop, Chromium mobile émulé et WebKit mobile émulé. Le binaire WebKit Playwright sous Windows ne fournit pas `AudioContext` : il valide donc l’état récupérable sans audio. La lecture réelle reste automatisée sous Chromium et Firefox. Safari iOS réel a été validé à la Gate B. Safari macOS réel n’a pas pu être exécuté faute d’appareil ; sa couverture compensatoire par Safari iOS et WebKit desktop a été acceptée comme risque résiduel pour 0.1.

Le Lot 12 applique la même frontière au catalogue 0.2 : Chromium et Firefox
décodent réellement les trois nouvelles couches après Play ; WebKit vérifie le
fallback récupérable et sert séparément les trois MP3 avec le bon type MIME. La
recette d’écoute longue des trois nouveaux mixes a été validée sur desktop et
mobile le 2026-08-10. Le navigateur mobile n’ayant pas été consigné, la ligne
Safari iOS réel de la Gate C reste à contrôler lors de la recette de release.

Le Lot 13 ajoute des tests unitaires du graphe à deux bus, du retrait du bus
sortant, des couches partielles et de l’annulation d’une cible lente. Les tests
de session couvrent la continuité React, une cible lente et le Retry. La matrice
Playwright compte désormais 50 scénarios : 48 validations et les 2 reports
clavier WebKit existants. Chromium, Firefox et le profil Chromium mobile
confirment Rainy Apartment → Deep Forest → Fireplace avec un seul `AudioContext` ;
WebKit conserve sa dégradation récupérable sous Windows.

La recette utilisateur du Lot 13 a validé les crossfades et la continuité de
session sur desktop et mobile le 2026-08-10, sans problème signalé. Les
navigateurs exacts n’ont pas été consignés ; cette recette ne remplace donc pas
les lignes Safari iOS et Android Chrome de la Gate C.

Le Lot 14 porte la suite à 82 tests unitaires/composants. Elle couvre la politique
`Save-Data`/connexion, le remplacement d’une preview responsive, l’absence de
décodage anticipé, la réutilisation d’un téléchargement, l’annulation d’une cible
obsolète et dix transitions avec un seul contexte et un seul bus final. La
matrice Playwright du Lot 15 compte 60 scénarios. Sous Windows : 56 validations
et 4 reports WebKit documentés. Sur le runner Linux : 55 validations et 5 reports,
car Firefox ne décode pas les MP3 dans cet environnement. Un scénario réseau
confirme zéro audio avant Play, la
réutilisation de la cible préchargée et le blocage sous `Save-Data`.

Le Lot 15 ajoute la dégradation d’une couche réelle : sous Chromium, Firefox
Windows et Chromium mobile, le mix continue, le slider concerné devient
indisponible et les deux autres restent réglables. Les deux profils WebKit ainsi
que Firefox sur le runner Ubuntu reportent ce scénario faute de décodage MP3 ; le
fallback récupérable et les tests unitaires restent obligatoires dans ces
environnements.

La recette finale de la candidate 0.2 a été validée le 2026-08-11 sur desktop,
Chrome Android réel et Safari iOS réel. Elle couvre aussi le zoom 200 %, le texte
agrandi, le contraste élevé et les lecteurs d’écran desktop/mobile. Aucun défaut
critique ou majeur n’a été signalé. Safari macOS réel reste le risque résiduel
explicitement accepté pour cette release.

## Matrice prévue pour le MVP 0.3

Le Lot 16 ajoute les axes suivants sans réduire la matrice 0.2 :

- adaptateur de préférences : absence, V1 valide, JSON invalide, version inconnue, IDs obsolètes, volumes hors bornes, quota et reset ;
- hydratation : HTML serveur stable, préférence appliquée après montage et aucun audio/réseau déclenché ;
- favoris/volumes : navigation entre quatre ambiances, rechargement et retour aux défauts ;
- timer avec fausse horloge : cinq durées, remplacement, annulation, pause, navigation, `visibilitychange`, délai fortement retardé et fade final ;
- lecture de fond : aucune suspension volontaire, automation Web Audio réarmée et refus de reprise ramené à Pause ;
- Focus Mode : ordre clavier, éléments masqués, `Escape`, restauration du focus, erreur audio et fin du timer ;
- E2E : stockage injecté avant chargement, rechargement réel, onglet masqué et absence de reprise sonore.

Le temps restant visible n’est pas testé par attente réelle de 15 minutes :
l’unitaire contrôle l’échéance avec horloge simulée et le navigateur valide une
durée injectée courte réservée aux tests. La Gate D conserve une session manuelle
longue et les appareils réels.

Le Lot 17 porte la suite à 98 tests unitaires/composants. Ses 16 scénarios ciblés
couvrent le schéma V1, les limites de confiance du stockage, le budget de 32 Kio,
le rendu serveur sans accès navigateur, l’hydratation sans réécriture, les
mutations en mémoire, la coalescence à 250 ms, le reset, le flush au démontage et
l’absence de fetch ou d’`AudioContext`. La matrice Playwright passe à 65 cas : le
nouveau scénario de stockage invalide réussit sur les cinq profils, conserve la
valeur inconnue sans réécriture et confirme les volumes par défaut sans requête
audio.

Le Lot 18 porte la suite à 103 tests unitaires/composants et la matrice Playwright
à 70 cas. Les nouveaux contrôles couvrent la restauration d’un volume, son
application au moteur, le retour immédiat au défaut pendant une session active,
le toggle `aria-pressed`, le marqueur `Saved`, l’ordre inchangé et le dialogue
avec reset, retour du focus et dégradation mémoire. Le parcours E2E dédié passe
sur les cinq profils avec un vrai rechargement et vérifie aussi la suppression de
la clé. Quatre skips WebKit connus restent limités au décodage audio et à la
politique de tabulation Safari.

La recette manuelle du Lot 18 confirme également les favoris, les volumes
distincts, leur restauration et le reset sur desktop et mobile.

Le Lot 19 porte la suite à 112 tests unitaires/composants et la matrice Playwright
à 80 cas. Les tests à horloge simulée couvrent les cinq durées, échéance absolue,
remplacement, annulation, Pause, navigation, réveil de visibilité, fade de cinq
secondes, priorité de Play et expiration sans contexte. Deux parcours navigateur
passent sur les cinq profils : dialogue/navigation/rechargement sans requête
audio, puis avance murale de quinze minutes en un saut sans création
d’`AudioContext`. Le compte à rebours n’est jamais placé dans une région live.

Le Lot 19b ajoute les cas d’automation anticipée, d’annulation/réarmement, de
portion de fade restante, de suspension imposée par la plateforme et de refus de
reprise. Le parcours navigateur vérifie sur les cinq profils qu’un masquage de
page ne provoque aucun appel volontaire à `AudioContext.suspend()`. Les résultats
automatisés portent la suite à 117 tests unitaires/composants et la matrice à 85
cas Playwright : 81 passent et les quatre skips WebKit connus restent inchangés.
Ils ne remplacent pas la recette sur desktop, Android et iOS réels.

Le Lot 20 porte la suite à 120 tests unitaires/composants et la matrice à 90 cas
Playwright. Les tests couvrent entrée et sortie, retrait des contrôles
secondaires, focus initial, restauration, `Escape`, changement d’ambiance,
erreur audio et timer arrivé à échéance. Le parcours Focus Mode et axe passe sur
les cinq profils ; les quatre skips WebKit historiques restent inchangés. Le
profil 320 px avec mouvement réduit confirme aussi la sortie visible et l’absence
de débordement horizontal.

Le Lot 21 rejoue la candidate après `npm ci`. Les 120 tests et la matrice de 90
cas réussissent ; les quatre reports WebKit historiques restent explicites. Un
timeout Firefox reproductible uniquement sous cinq workers provenait d’une
attente `load` trop large sur un test de navigation : l’attente
`DOMContentLoaded`, suffisante pour les assertions DOM, supprime la flake sans
réduire les contrôles de médias couverts ailleurs. Le smoke 0.3 ajoute favoris,
volume, timer et Focus Mode au parcours de quatre routes, transition audio et 404.

## CI attendue

Sur toute pull request : install verrouillée, lint, typecheck, tests unitaires/composants et build. Les E2E critiques s’exécutent avant fusion dès leur mise en place. Les audits lourds ou multi-navigateurs peuvent être programmés et sont obligatoires avant release.

État 0.2 : la CI exécute également `audio:check`, `budget:check`, puis la matrice Playwright sur cinq projets. Deux contrôles d’ordre clavier sont explicitement reportés pour WebKit, dont le réglage Safari par défaut exclut les liens de la tabulation. axe-core bloque toute violation automatisable critique ou sérieuse avec les tags WCAG 2 A/AA, 2.1 AA et 2.2 AA.

## Données et isolation

- Pas de dépendance à des URLs média tierces dans les tests.
- Horloge et timers contrôlés par une fake clock.
- Adapter Web Audio injecté ou simulé pour la logique ; vrais navigateurs pour l’intégration.
- Nettoyer stockage, contextes, listeners et mocks entre tests.

## Politique de défauts

- Critique : crash, son impossible, navigation inaccessible — bloque fusion/release.
- Majeur : parcours principal fortement dégradé, contraste ou responsive bloquant — bloque release.
- Mineur : défaut cosmétique local sans perte d’usage — peut être planifié avec issue.
