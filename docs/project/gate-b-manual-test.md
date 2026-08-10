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

## Écoute longue — au moins dix minutes

- [ ] Aucun clic, blanc, coupure ou variation brutale aux jointures.
- [ ] Rain reste la couche principale sans fatigue évidente.
- [ ] Window Rain reste distincte et naturelle aux volumes faibles et forts.
- [ ] Distant Thunder reste espacé et ne domine pas le mix par défaut.
- [ ] Les trois sliders réagissent pendant la lecture sans interrompre les autres couches.
- [ ] Pause puis reprise rapide ne doublent pas le son et ne créent pas de clic.

## Safari macOS réel

- [ ] L’accueil et le player s’affichent sans débordement.
- [ ] Play démarre les trois couches après le geste utilisateur.
- [ ] Pause, reprise et sliders fonctionnent.
- [ ] Masquer l’onglet pendant dix secondes coupe le son ; le retour reprend proprement.
- [ ] VoiceOver annonce liens, sliders, valeurs, Play/Pause et éventuel Retry.
- [ ] Zoom navigateur à 200 % : contenu et contrôles restent utilisables.
- [ ] Contraste augmenté et réduction des animations restent lisibles.

## Safari iOS réel

- [ ] Tester en portrait puis paysage, avec attention aux safe areas.
- [ ] Play, pause, reprise, sliders et changement d’onglet fonctionnent.
- [ ] Verrouiller puis déverrouiller brièvement l’écran : aucun son doublé ou interface bloquée.
- [ ] VoiceOver permet d’atteindre et d’actionner tous les contrôles dans un ordre logique.
- [ ] Taille de texte augmentée au maximum raisonnable : aucun contrôle essentiel n’est perdu.

## Chrome Android réel

- [ ] Tester en portrait puis paysage, avec navigation tactile uniquement.
- [ ] Les cibles sont faciles à toucher et aucun geste ne provoque de scroll horizontal.
- [ ] Play, pause, reprise, sliders, onglet masqué et retour fonctionnent.
- [ ] TalkBack annonce les noms, valeurs et changements d’état.
- [ ] Taille de police et contraste élevé restent utilisables.
- [ ] Après dix minutes, noter toute chauffe, consommation ou saccade inhabituelle.

## Décision

Gate B est validée lorsque chaque ligne applicable est cochée et qu’aucun défaut critique ou majeur n’est ouvert. Un défaut doit inclure l’appareil, la version, les étapes, le résultat attendu et le résultat observé.
