# Journal des changements

Tous les changements notables du projet sont consignés ici. Le format s’inspire de Keep a Changelog et le projet utilisera le versionnage sémantique à partir de sa première version publiée.

## Non publié

### Ajouté

- Cadrage du catalogue 0.2 : exigences, matrice des ambiances et UX de navigation.
- ADR pour la session audio persistante, les crossfades et le préchargement borné.
- Lots 8 à 15, budgets 0.2, risques associés et checklist Gate C.
- Stratégie de branches protégeant la production 0.1 pendant le développement 0.2.
- Registre ordonné de quatre ambiances et génération statique de leurs routes et métadonnées.
- Fallbacks CSS de Quiet Coffee Shop, Deep Forest et Fireplace, sans média non licencié.
- État générique et accessible pour de futures ambiances dont les couches audio seraient encore en préparation.
- Accueil éditorial à quatre destinations avec preview visuelle au focus et après intention de survol.
- Dialogue natif `Atmospheres` dans le player avec liens réels, ambiance courante, gestion d’`Escape` et restauration du focus.
- Parcours catalogue, navigation, historique et absence d’audio avant Play couverts sur desktop et mobile.
- Identités visuelles originales des quatre ambiances, avec exports WebP desktop/mobile.
- Rendu responsive par `<picture>`, points focaux mobiles et fallback CSS conservé en cas d’échec média.
- Provenance IA, prompts, conditions, transformations, empreintes et crédits archivés pour les visuels 0.2.
- Contrôle CI des dimensions et du budget image, références visuelles et contraste des nouveaux thèmes.
- Neuf couches audio licenciées pour Quiet Coffee Shop, Deep Forest et Fireplace, avec boucles, filtrage et mastering reproductibles.
- Mixages par défaut alignés à 1,5 LU, validation des jointures, true peaks et budgets du catalogue en CI.
- Recette d’écoute longue des trois nouvelles ambiances validée sur desktop et mobile.

## [0.1.0] — 2026-08-10

### Ajouté

- Documentation initiale du produit, du design, de l’architecture, de la qualité et de la maintenance.
- Fondation Next.js avec App Router, React, TypeScript strict et Tailwind CSS.
- Motion et Lucide comme dépendances produit initiales.
- ESLint, Prettier, Vitest et Testing Library pour la qualité locale.
- Workflow CI exécutant formatage, lint, typecheck, tests et build.
- Page d’attente accessible, page 404 et favicon typographique provisoire.
- Instrument Sans Variable auto-hébergée avec sa licence OFL 1.1.
- Tokens visuels, typographiques, responsive, safe areas et mouvement réduit.
- Modèle d’ambiance validé et définition initiale de Rainy Apartment.
- Primitive de scène responsive avec fallback atmosphérique CSS original.
- Tests des invariants, contrastes et propriétés thématiques de la scène.
- Accueil éditorial avec salutation locale et fallback sûr pour l’hydratation.
- Destination Rainy Apartment accessible à la souris, au toucher et au clavier.
- Preview de scène progressive avec variante sans mouvement.
- Route Rainy Apartment minimale garantissant un parcours sans lien cassé.
- Route `/atmosphere/[slug]` pilotée par le catalogue, avec métadonnées statiques et 404 stricte.
- Player visuel Rainy Apartment avec composition responsive et navigation de retour.
- Horloge locale hydratée sans exposer une heure serveur incorrecte.
- Entrées progressives avec Motion et respect de la préférence de mouvement réduit.
- Génération explicite des types de routes avant le typecheck.
- `AtmosSlider` natif et accessible avec piste personnalisée et valeur contextuelle.
- Volumes indépendants en état local pour Rain, Window Rain et Distant Thunder.
- Contrôle play/pause simulé avec transition Motion et nom accessible dynamique.
- Layout du player étendu aux contrôles sur desktop, tablette et mobile.
- Nettoyage automatique du DOM entre les tests de composants.
- Trois boucles audio Rainy Apartment issues du domaine public, compressées et documentées.
- Préparation audio reproductible avec contrôle d’empreinte des sources, caractéristiques, jointures et budget.
- Moteur Web Audio multi-couches initialisé uniquement après le premier geste utilisateur.
- Fondus du master, rampes de volumes, pause/reprise et suspension lorsque l’onglet est masqué.
- Tolérance aux erreurs par couche, réessai global accessible et nettoyage idempotent sous Strict Mode.
- Recette Playwright sur Chromium, Firefox, WebKit et profils mobiles, avec audits axe WCAG 2.2 AA.
- En-têtes CSP, anti-framing, confidentialité, permissions et cache audio pour le build de production.
- Contrôle automatisé des budgets JS, CSS et fonts ainsi que références visuelles desktop/mobile.
- Métadonnées sociales minimales, 404 navigateur et matrice de release 0.1.
- Export statique et déploiement continu sur GitHub Pages sous `/ATMOS`.
- Smoke test reproductible du parcours de production, cache désactivé et médias réels.
- Mesures Lighthouse mobile et desktop de l’accueil et du player.
- Signalement privé de vulnérabilité GitHub documenté.
- Délai de récupération lorsque le contexte Web Audio reste suspendu.
