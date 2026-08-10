# Fiche de recette manuelle — Gate B ATMOS 0.1

## Cible

- URL : `https://lucasg0ld.github.io/ATMOS/`
- Tester depuis une fenêtre privée ou après vidage du cache.
- Utiliser si possible un casque puis les haut-parleurs de l’appareil.
- Noter appareil, version du système et version du navigateur.

## Résultats à transmettre

Pour chaque session, répondre avec ce format :

```text
Appareil / système :
Navigateur / version :
Résultat : OK ou ÉCHEC
Étape concernée :
Comportement observé :
Capture ou vidéo, si utile :
```

## Résultats reçus

| Contrôle                           | Résultat           | Détail                                            |
| ---------------------------------- | ------------------ | ------------------------------------------------- |
| Zoom 200 %                         | Validé             | Fonctionnel, aucun problème signalé               |
| Chrome Android réel                | Validé             | Fonctionnel, aucun problème signalé               |
| Safari sur iOS réel                | Validé             | Fonctionnel, aucun problème signalé               |
| Écoute de 10 minutes               | Validé             | Fonctionnelle, aucun problème signalé             |
| Lecteurs d’écran desktop et mobile | Validé             | Fonctionnels, aucun problème signalé              |
| Texte agrandi et contraste élevé   | Validé             | Fonctionnels, aucun problème signalé              |
| Safari macOS réel                  | Exception acceptée | Aucun appareil disponible ; couverture iOS/WebKit |

Les modèles d’appareil et versions du système/navigateur n’ont pas été fournis ; ils pourront être ajoutés ultérieurement sans remettre en cause ces validations.

Safari macOS réel reste couvert partiellement par Safari iOS réel et par la
matrice WebKit desktop automatisée. LucasG0ld a explicitement accepté cette
compensation comme risque résiduel pour la release 0.1.

## Écoute longue — au moins dix minutes

- [x] Aucun clic, blanc, coupure ou variation brutale aux jointures.
- [x] Rain reste la couche principale sans fatigue évidente.
- [x] Window Rain reste distincte et naturelle aux volumes faibles et forts.
- [x] Distant Thunder reste espacé et ne domine pas le mix par défaut.
- [x] Les trois sliders réagissent pendant la lecture sans interrompre les autres couches.
- [x] Pause puis reprise rapide ne doublent pas le son et ne créent pas de clic.

## Safari macOS réel

- [ ] L’accueil et le player s’affichent sans débordement.
- [ ] Play démarre les trois couches après le geste utilisateur.
- [ ] Pause, reprise et sliders fonctionnent.
- [ ] Masquer l’onglet pendant dix secondes coupe le son ; le retour reprend proprement.
- [ ] VoiceOver annonce liens, sliders, valeurs, Play/Pause et éventuel Retry.
- [ ] Zoom navigateur à 200 % : contenu et contrôles restent utilisables.
- [ ] Contraste augmenté et réduction des animations restent lisibles.

## Safari iOS réel

- [x] Tester en portrait puis paysage, avec attention aux safe areas.
- [x] Play, pause, reprise, sliders et changement d’onglet fonctionnent.
- [x] Verrouiller puis déverrouiller brièvement l’écran : aucun son doublé ou interface bloquée.
- [x] VoiceOver permet d’atteindre et d’actionner tous les contrôles dans un ordre logique.
- [x] Taille de texte augmentée au maximum raisonnable : aucun contrôle essentiel n’est perdu.

## Chrome Android réel

- [x] Tester en portrait puis paysage, avec navigation tactile uniquement.
- [x] Les cibles sont faciles à toucher et aucun geste ne provoque de scroll horizontal.
- [x] Play, pause, reprise, sliders, onglet masqué et retour fonctionnent.
- [x] TalkBack annonce les noms, valeurs et changements d’état.
- [x] Taille de police et contraste élevé restent utilisables.
- [x] Après dix minutes, noter toute chauffe, consommation ou saccade inhabituelle.

## Décision

Gate B validée le 2026-08-10. Aucun défaut critique ou majeur n’est ouvert. L’exception Safari macOS est acceptée et documentée pour la release 0.1.
