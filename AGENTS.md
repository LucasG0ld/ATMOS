# Instructions de travail — ATMOS

## Portée

Ces règles s’appliquent à l’ensemble du dépôt.

## Ordre de travail

1. Inspecter le code et les documents concernés.
2. Confirmer la phase active et rester dans son périmètre.
3. Proposer ou choisir l’architecture minimale adaptée.
4. Implémenter une seule tranche cohérente.
5. Vérifier types, lint, tests, build, responsive et accessibilité.
6. Résumer les choix importants et les limites restantes.

## Garde-fous produit

- Commencer par le prototype visuel Rainy Apartment ; ne pas anticiper le moteur audio profond.
- Ne pas générer toute l’application en une seule passe.
- Ne pas transformer l’interface en dashboard, lecteur musical classique ou grille de cartes SaaS.
- Préserver le vide, la sobriété, la hiérarchie typographique et le rythme lent.
- Ne pas ajouter d’authentification, backend, paiement, fonctions sociales ou cloud sans décision explicite.

## Garde-fous techniques

- Next.js App Router, React, TypeScript strict et composants serveur par défaut ; utiliser un composant client seulement lorsqu’une API navigateur ou une interaction l’exige.
- Données d’ambiance validées et indépendantes de l’UI.
- Web Audio et `localStorage` uniquement côté client, avec nettoyage systématique des ressources.
- Accessibilité et `prefers-reduced-motion` font partie de chaque fonctionnalité.
- Aucun média sans licence compatible et crédit documenté.
- Éviter la sur-ingénierie et les abstractions spéculatives.

## Documentation de référence

Commencer par [docs/README.md](docs/README.md). Toute décision structurante doit être consignée dans un ADR.
