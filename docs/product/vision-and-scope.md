# Vision et périmètre produit

## Résumé

ATMOS aide une personne à installer en quelques secondes une ambiance visuelle et sonore adaptée à un moment de concentration, de lecture, de repos ou de sommeil. Le produit ne cherche pas à organiser une bibliothèque musicale : il transforme l’écran et plusieurs couches sonores en un environnement calme et cohérent.

## Problème

Les solutions audio existantes demandent souvent de chercher une piste, exposent trop de contrôles ou séparent complètement l’image du son. Cette friction et cette densité détournent l’utilisateur de son intention initiale : entrer dans un état d’esprit.

## Promesse

En moins de quelques secondes, l’utilisateur choisit une atmosphère, lance l’écoute et peut ajuster ses éléments essentiels sans apprendre une interface. L’expérience reste agréable même sans audio et s’efface lorsqu’il n’a plus besoin des contrôles.

## Utilisateurs principaux

### Persona primaire — concentration calme

Une personne travaillant ou étudiant sur ordinateur, sensible à son environnement, qui souhaite masquer les distractions sans écouter de musique structurée. Elle privilégie une mise en route immédiate et laisse l’application ouverte longtemps.

### Persona secondaire — rituel de détente

Une personne qui lit, se détend ou prépare son sommeil sur tablette ou mobile. Elle attend des contrôles accessibles au pouce, un timer et une extinction sonore progressive.

### Contexte portfolio

Le projet doit aussi démontrer une maîtrise front-end, UX, animation et audio sans que cette démonstration technique prenne le dessus sur l’expérience.

## Principes produit

1. **Less interface, more atmosphere.** Le vide et la retenue sont fonctionnels.
2. **Une intention par écran.** Choisir sur l’accueil, vivre et ajuster dans le player.
3. **L’image, le son et le mouvement forment un tout.** Un effet sans bénéfice immersif est supprimé.
4. **Contrôle sans complexité.** Les réglages sont directs, progressifs et réversibles.
5. **Calme inclusif.** Clavier, contraste, réduction du mouvement et responsive ne sont pas des finitions.
6. **Progression maîtrisée.** Une ambiance excellente vaut mieux qu’un catalogue moyen.

## Objectifs

- Faire comprendre la proposition et l’action principale sans tutoriel.
- Produire une expérience Rainy Apartment visuellement convaincante sur desktop et mobile.
- Permettre à terme la lecture simultanée et fluide de plusieurs couches audio.
- Rendre l’ajout d’une ambiance essentiellement déclaratif.
- Maintenir une interface rapide et stable sur un appareil mobile courant.

## Non-objectifs des versions 0.x

- Streaming musical, playlists ou recommandations algorithmiques.
- Authentification, profil, backend, base de données ou synchronisation cloud.
- Paiement, abonnement, publicité ou fonctions sociales.
- Application mobile native.
- WebGL, vidéo ou effets lourds sans validation préalable de leur valeur.
- Internationalisation ; l’interface initiale est en anglais.

## Extension 1.0

La version 1.0 étend le contrôle direct vers des mixes personnalisés composés
uniquement avec les couches licenciées du catalogue. Cette extension ne change
pas les exclusions structurelles : aucun compte, backend, cloud, import audio,
partage ou outil de production musicale.

## Indicateurs de réussite

Les cibles seront mesurées lors des tests du prototype :

| Axe           | Indicateur                                                   | Cible initiale                                                    |
| ------------- | ------------------------------------------------------------ | ----------------------------------------------------------------- |
| Compréhension | Participants identifiant choix, lecture et réglage sans aide | 5 sur 5 lors d’un test qualitatif court                           |
| Mise en route | Temps médian entre arrivée et activation de l’ambiance       | moins de 15 s                                                     |
| Fiabilité     | Sessions de test sans erreur bloquante                       | 100 % du parcours critique                                        |
| Accessibilité | Audit automatisé sur les pages clés                          | aucune violation critique ou sérieuse                             |
| Performance   | Core Web Vitals au 75e percentile, une fois mesurables       | LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1                              |
| Extensibilité | Ajout d’une ambiance                                         | données et actifs nouveaux, sans branchement spécifique dans l’UI |

Les métriques d’usage ne doivent pas nécessiter une collecte analytique avant qu’une décision explicite de confidentialité ne l’autorise.

## Hypothèses à valider

- Une photographie fixe enrichie de gradients et d’un grain suffit au MVP.
- Trois sliders visibles offrent assez de contrôle sans évoquer un mixer professionnel.
- Une transition lente mais inférieure à une seconde conserve une sensation de fluidité.
- Le mot « atmosphere » et les libellés anglais sont compris par la cible portfolio.
- Les utilisateurs acceptent que le son ne démarre qu’après une interaction, contrainte normale des navigateurs.

## Décisions produit ouvertes

- Source photographique définitive de Rainy Apartment.
- Famille typographique après essais visuels et mesure de performance.
- Présence du timer dès 0.1 ou uniquement en 0.3 : la roadmap retient 0.3.
- Niveau de persistance des volumes par ambiance en 0.3 : par couche et par ambiance, accepté dans l’ADR-0003.
- Politique analytique avant toute instrumentation.
