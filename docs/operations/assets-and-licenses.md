# Gestion des actifs et licences

## Règle

Aucun média ou fichier de police ne peut entrer en production sans provenance, licence exacte et preuve. Une mention « free », « royalty-free » ou un résultat de recherche n’est pas une autorisation suffisante.

## Sources acceptables

- Création originale avec droits détenus.
- Domaine public ou CC0 avec preuve.
- Creative Commons compatible avec l’usage, les modifications et l’attribution prévues.
- Licence commerciale ou de banque d’actifs dont les conditions autorisent explicitement le projet et sa diffusion.
- Font sous licence libre compatible, par exemple OFL, avec texte conservé si requis.

Refuser les extractions YouTube, Spotify, réseaux sociaux, œuvres dont l’auteur n’est pas identifiable ou licences interdisant les dérivés si une boucle/édition est nécessaire.

## Procédure d’intégration

1. Ouvrir la source originale et lire la licence complète.
2. Vérifier usage commercial éventuel, attribution, dérivés, redistribution et restrictions de plateforme.
3. Télécharger ou archiver une preuve datée de la page et du texte de licence.
4. Ajouter l’entrée complète dans `ASSET_CREDITS.md`.
5. Conserver un nom local stable et descriptif, sans données personnelles inutiles.
6. Éditer et optimiser une copie de travail ; conserver la provenance de l’original hors bundle si nécessaire.
7. Vérifier que les crédits visibles ou mentions de licence obligatoires sont livrés.

## Audio

- Inspecter absence de voix identifiable ou contenu tiers accidentel.
- Conserver format source, fréquence, canaux, transformations et paramètres d’export.
- Normaliser avec prudence pour que les couches se combinent sans saturation.
- Écouter les jointures de boucle au casque.
- Préférer un identifiant de crédit par layer, même si plusieurs viennent du même auteur.

## Images et vidéos

- Éviter visages reconnaissables, marques et propriétés privées problématiques sans autorisation.
- Conserver cadrage original et point focal utile.
- Supprimer les métadonnées inutiles lors de l’export web.
- Ne pas agrandir artificiellement une source insuffisante.
- Déclarer explicitement toute génération par IA, archiver prompt, outil, date, empreintes et conditions applicables ; ne jamais la présenter comme une création photographique humaine.

## Fonts et icônes

- Conserver les fichiers de licence exigés par les packages ou fonts.
- Utiliser Lucide selon sa licence et documenter la version via le lockfile.
- Ne pas ajouter Satoshi tant que licence, origine et auto-hébergement ne sont pas vérifiés.

## Retrait

Si la licence devient incertaine : retirer l’actif du bundle et du déploiement, utiliser le fallback, documenter les versions concernées puis remplacer l’actif. L’historique Git public peut conserver le fichier ; éviter donc tout commit avant validation des droits.
