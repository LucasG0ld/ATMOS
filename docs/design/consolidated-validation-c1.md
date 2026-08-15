# C1 — Validation consolidée de la révision

**Statut :** validé et clôturé le 15 août 2026

**Branche :** `design/revision-foundations`

**Périmètre :** baselines B1 à B4, sans nouvelle fonction ni nouvelle direction
graphique

## Objectif

Vérifier que les quatre variantes validées forment une seule expérience avant
leur intégration dans `main`. C1 recherche des incohérences transversales ; elle
n'ouvre pas une cinquième exploration visuelle.

## Revue visuelle consolidée

| Axe              | Accueil B2            | Player B1                 | Compositeur B3                   | Dialogues B4             | Verdict   |
| ---------------- | --------------------- | ------------------------- | -------------------------------- | ------------------------ | --------- |
| Hiérarchie       | question puis index   | scène puis Play           | scène puis couches               | titre, contexte, actions | cohérent  |
| Action dominante | entrée dans une scène | Play                      | Play, puis sauvegarde secondaire | action finale bornée     | cohérent  |
| Rythme mobile    | index respirant       | lecture verticale directe | liste éditoriale compacte        | format selon longueur    | cohérent  |
| Typographie      | display et labels     | display et labels         | display et labels                | titre réduit et labels   | cohérent  |
| Profondeur       | image plein cadre     | image plein cadre         | image plein cadre                | surface dense sur scène  | cohérent  |
| Garde-fous       | aucune carte SaaS     | aucun lecteur classique   | aucune DAW                       | aucun dashboard          | respectés |

La revue des vingt références officielles desktop/mobile ne relève aucun défaut
visuel bloquant. Le compositeur multi-scènes devient naturellement plus long sur
mobile mais conserve une lecture verticale, sans navigation bidimensionnelle.

## Couverture automatisée

- Références déterministes en 1440 × 900 et 375 × 812.
- Géométrie critique à 320 et 375 px.
- Reflow à 720 × 450, équivalent CSS d'un viewport desktop 1440 × 900 à 200 %.
- `prefers-reduced-motion: reduce` et `prefers-contrast: more` sur le parcours
  consolidé.
- axe-core sur Timer, nommage et bibliothèque dans ce reflow.
- Parcours fonctionnels, stockage local, audio, timer, Focus Mode et CRUD des
  mixes couverts par la matrice Playwright existante.

Résultats du 15 août 2026 :

- format, lint et TypeScript strict : validés ;
- 153 tests unitaires et composants sur 25 fichiers : validés ;
- build de production : validé ;
- budgets : Home 13,0 Kio, Player 61,9 Kio, Composer 25,7 Kio, CSS 10,0 Kio
  et fontes 29,4 Kio, tous sous leurs plafonds ;
- 120 cas Playwright sur cinq profils : 116 réussites et les quatre reports
  WebKit historiques attendus ;
- aucun défaut critique ou majeur relevé par la revue consolidée.

## Recette manuelle

La recette a été validée par le responsable du dépôt sur desktop et mobile réel
le 15 août 2026. Elle couvrait :

1. Accueil → Rainy Apartment → Play → Timer → retour à l'accueil.
2. Accueil → Create a mix → ajout d'un son → sauvegarde → renommage → suppression.
3. Zoom navigateur 200 % : aucune action coupée, aucun défilement horizontal.
4. Texte agrandi et contraste élevé : labels, pistes, focus et dialogues lisibles.
5. Mouvement réduit : aucune transition gênante ou perte de contexte.
6. Clavier ou lecteur d'écran : ordre logique et focus restauré après chaque
   dialogue.

## Critère de clôture

La matrice automatisée est verte, la recette manuelle est confirmée et aucun
défaut majeur n'est ouvert. C1 est clôturée ; la révision peut passer à la
clôture documentaire puis à la PR de la branche vers `main`.
