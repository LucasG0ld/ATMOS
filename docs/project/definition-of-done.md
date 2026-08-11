# Définition de terminé

Une tranche est terminée lorsque tous les points applicables sont vrais.

## Produit

- Le résultat correspond à une exigence ou décision acceptée.
- Les critères d’acceptation sont démontrables.
- Les états chargement, vide, erreur et récupération sont traités.
- Aucun élément hors périmètre n’a été ajouté implicitement.

## Design et UX

- Le comportement est cohérent avec la spécification UX et le système de design.
- Mobile, tablette et desktop ont été inspectés.
- Le contenu reste utilisable à 320 px, en paysage pertinent et à 200 % de zoom.
- Le mouvement renforce la continuité et possède une variante réduite.
- Une modification visuelle dispose de captures ou d’une référence de validation.

## Accessibilité

- Structure sémantique, ordre de lecture et noms accessibles sont corrects.
- Tout le parcours fonctionne au clavier avec focus visible.
- Les cibles tactiles et contrastes respectent les critères retenus.
- Les tests automatisés ne signalent aucune violation critique ou sérieuse.
- Les contrôles personnalisés ont été vérifiés avec une technologie d’assistance sur les parcours importants.

## Technique

- TypeScript strict, lint, formatage et build passent.
- Tests adaptés au risque ajoutés et réussis.
- Aucune erreur ou avertissement inattendu en console.
- Effets, événements, timers, fetchs et ressources audio sont nettoyés.
- Pas de dépendance ou abstraction non justifiée.
- Les erreurs réseau et APIs navigateur indisponibles ne font pas crasher la page.
- Toute donnée persistée possède schéma, version, validation, défaut sûr et méthode de suppression testés.
- Timers, listeners et écritures différées restent bornés et sont nettoyés au démontage.

## Performance

- Aucun actif non nécessaire n’est chargé sur le parcours.
- Images et audio respectent les budgets ou une exception est documentée.
- Les animations ont été observées sur mobile médian et avec throttling pertinent.
- La modification ne dégrade pas sensiblement Core Web Vitals ou taille JavaScript.

## Sécurité, vie privée et droits

- Aucun secret ni donnée sensible dans le code client ou l’historique.
- Les entrées et URLs sont validées selon leur frontière de confiance.
- Aucun nouveau tracker ou transfert tiers non documenté.
- La finalité et la suppression de toute donnée locale sont compréhensibles depuis l’interface.
- Chaque actif possède une entrée complète dans `ASSET_CREDITS.md`.
- Les dépendances ajoutées ont une licence compatible et aucun avis critique non traité.

## Documentation et livraison

- Documentation et ADR mis à jour si comportement ou architecture changent.
- `CHANGELOG.md` mis à jour pour un changement notable.
- Installation et commandes restent reproductibles.
- La préproduction a été vérifiée sur le parcours concerné.
- Le retour arrière est simple ou décrit si la modification est risquée.
