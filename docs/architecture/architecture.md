# Architecture technique

## Objectifs

- Garder le prototype simple tout en permettant plusieurs ambiances.
- Isoler les APIs navigateur (audio, stockage, horloge) du rendu serveur.
- Rendre les composants visuels indépendants de l’implémentation audio.
- Garantir nettoyage des ressources, testabilité et dégradation progressive.

## Contexte

ATMOS est une application Next.js sans backend au MVP. Les routes et le contenu statique peuvent être rendus côté serveur ; les interactions et APIs navigateur vivent dans des îlots clients. Les médias sont servis comme actifs statiques ou depuis un hébergement explicitement autorisé plus tard.

```text
Utilisateur
    │
    ▼
Next.js App Router ──────► données d’ambiances validées
    │                                  │
    ├── UI serveur                     ├── visuels
    └── îlots clients                  └── définitions audio
          │
          ├── état de session
          ├── Web Audio API
          └── localStorage (à partir de 0.3)
```

## Structure cible

La structure exacte sera créée avec le scaffold ; cette cible guide les responsabilités :

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── not-found.tsx
│   └── atmosphere/[slug]/page.tsx
├── components/
│   ├── atmosphere/
│   ├── controls/
│   └── shared/
├── features/
│   ├── audio/
│   ├── clock/
│   └── preferences/
├── data/
│   └── atmospheres/
├── lib/
├── styles/
└── types/
public/
├── audio/
└── images/
```

Ne pas créer tous les dossiers à vide. Une frontière apparaît lorsqu’un premier fichier réel la justifie.

## Responsabilités

### Routes

- Résolvent le slug et produisent les métadonnées.
- Fournissent les données à une composition de page.
- Appellent `notFound()` pour un slug inconnu.
- Ne contiennent ni logique audio ni état de contrôle.

### Données d’ambiance

- Décrivent identité, contenu, thème, image et couches audio.
- Sont validées à la construction ou au chargement.
- N’importent aucun composant React.
- Emploient des identifiants stables destinés à la persistance future.

### Composants visuels

- Reçoivent état et callbacks.
- N’accèdent pas directement à l’`AudioContext` ou au stockage.
- Gardent les primitives accessibles, particulièrement pour les sliders et boutons.

### Feature audio

- Possède le cycle de vie de l’`AudioContext`, des buffers, sources et gains.
- Expose une API d’intention : charger, jouer, pauser, régler, détruire.
- Ne connaît ni routes ni mise en page.

### État

Pour le prototype, l’état local et un hook de composition suffisent. Un Context ciblé peut partager l’état du player. Zustand n’est introduit que si les interactions entre changement d’ambiance, timer, Focus Mode et persistance rendent le Context objectivement difficile à maintenir.

Éviter un store global unique. Distinguer :

- état de données : ambiance sélectionnée ;
- état de contrôle : volumes demandés, play/pause ;
- état moteur : idle, loading, ready, playing, paused, error ;
- état UI : valeur révélée, menu ouvert ;
- préférences persistées : seulement en 0.3.

## Frontière serveur/client

Composants serveur par défaut. Ajouter `"use client"` au niveau le plus bas qui nécessite :

- état ou effet React ;
- événements de contrôle ;
- heure locale ;
- Web Audio API ;
- `localStorage` ;
- Motion côté client.

Ne pas rendre tout le player client si la structure éditoriale peut rester serveur. Aucune API navigateur ne doit être accédée à l’import ou pendant le rendu serveur.

## Flux principal

```text
Route résout Atmosphere
        │
        ▼
Page rend scène + données initiales
        │
        ▼
Player client reçoit layers/volumes
        │
        ├── interaction slider ──► état demandé ──► gain layer
        └── interaction play ────► init/load ─────► master gain
```

L’UI reflète l’intention confirmée par le moteur. Une erreur moteur doit revenir à un état stable et explicable.

## Thème

La route applique les tokens d’ambiance comme propriétés CSS sur le conteneur de scène. Les composants consomment uniquement les rôles `--atmos-*`. Les transitions de thème futures sont orchestrées au niveau de la scène, pas composant par composant.

## Erreurs

- Slug inconnu : 404.
- Image : gradient de repli silencieux.
- Couche audio : erreur locale, autres couches disponibles.
- Moteur audio : état `error` récupérable et action de nouvelle tentative.
- Stockage corrompu futur : ignorer l’entrée, utiliser les défauts et réécrire seulement lors d’une action suivante.

Une Error Boundary peut isoler le player si un cas réel le justifie ; ne pas l’ajouter sans stratégie de récupération.

## Dépendances

Avant ajout : vérifier maintenance, taille client, compatibilité, licence et valeur par rapport aux APIs natives. Les dépendances directes cibles sont limitées au framework, à Motion, aux icônes et éventuellement à un validateur de schéma si la validation manuelle devient fragile.

## Observabilité

Le MVP utilise : erreurs console en développement, erreurs de build/test et contrôles de déploiement. Aucune télémétrie utilisateur n’est installée implicitement. Avant une solution distante, documenter finalité, données, rétention, consentement et coût performance.

## Évolution

- 0.2 : cache de buffers borné, orchestration de crossfade et préchargement de la prochaine ambiance.
- 0.3 : couche de préférences versionnée.
- v1 : schéma de mix personnalisé et migrations locales.

Ces évolutions doivent prolonger les contrats existants, pas être anticipées par des abstractions vides.

Le cadrage 0.2 est détaillé dans l’[ADR-0002](decisions/0002-catalogue-transitions-and-preloading.md) : registre ordonné, session persistante limitée au player, un seul contexte audio avec deux bus et préchargement d’une cible maximum.
