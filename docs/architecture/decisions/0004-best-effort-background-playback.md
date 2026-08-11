# ADR-0004 — Lecture en arrière-plan best effort

- Statut : accepté le 2026-08-11
- Date : 2026-08-11
- Décideur : LucasG0ld
- Complète : ADR-0003

## Contexte

ATMOS coupait volontairement le master et suspendait l’`AudioContext` dès que la
page devenait masquée. Cette politique était économe et prévisible, mais elle
réduisait fortement l’utilité principale d’une ambiance destinée au travail, à
la lecture ou au repos. Le timer 0.3 doit parallèlement rester fiable lorsque les
timeouts JavaScript sont ralentis en arrière-plan.

Une application web ne peut pas garantir qu’un navigateur ou un OS mobile
laissera Web Audio actif après changement d’application ou verrouillage. ATMOS
doit donc améliorer le cas autorisé sans promettre un comportement natif.

## Décision

- ATMOS ne suspend plus volontairement Web Audio sur `document.hidden`.
- La lecture continue en arrière-plan lorsque la plateforme l’autorise.
- La promesse produit reste explicitement « best effort » ; aucune garantie
  n’est faite pour le verrouillage d’écran ou les politiques système mobiles.
- Lorsqu’un timer est actif et que l’audio joue, le moteur programme directement
  sur le master le début du fade à `endsAt`, puis sa fin cinq secondes plus tard.
- Remplacer ou annuler le timer annule l’automation précédente. Pause l’annule ;
  un nouveau Play la réarme depuis le temps mural restant.
- Le timeout de session et les événements `visibilitychange`/`pageshow` restent
  la source de vérité UI. Une exécution tardive récupère le temps de fade encore
  réellement programmé dans le contexte audio.
- Au retour au premier plan, l’échéance est évaluée avant toute tentative de
  reprise. Une session expirée ne peut donc jamais rouvrir le master.
- Si la plateforme a suspendu le contexte avant l’échéance, ATMOS tente une
  reprise. Un refus ramène l’interface à Pause, l’explique et exige un nouveau
  geste Play.
- Aucun `AudioContext`, média ou timer persistant n’est créé avant Play.

## Alternatives écartées

### Continuer à couper toute page masquée

Écartée : sûre mais contraire à l’usage central d’une ambiance longue.

### Promettre une lecture garantie écran verrouillé

Écartée : un site statique ne contrôle pas les politiques d’énergie et de média
des navigateurs et OS. Une telle garantie nécessiterait au minimum une étude PWA
ou une application native séparée.

### Se fier uniquement au timeout JavaScript

Écartée : le throttling peut retarder le fade et laisser le son dépasser
l’échéance. L’automation Web Audio est programmée à l’avance quand le contexte
est disponible.

## Conséquences

- L’usage desktop et les plateformes mobiles permissives gagnent une vraie
  écoute en arrière-plan.
- La consommation de ressources peut continuer tant que l’utilisateur maintient
  explicitement Play ; Pause et la sortie du player restent les arrêts certains.
- Les tests distinguent suspension volontaire, suspension imposée et expiration
  pendant une page masquée.
- La recette réelle doit couvrir desktop, Android et iOS, sans transformer un
  succès local en garantie universelle.

## Validation

Plan approuvé par LucasG0ld le 2026-08-11 après validation fonctionnelle du Lot 19. L’implémentation est portée par le Lot 19b avant Focus Mode.
