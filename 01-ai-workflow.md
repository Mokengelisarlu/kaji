# 01 — Workflow de l'agent

Document de référence pour tout agent (ou personne) qui travaille sur **Kaji.com**.
Il décrit **comment** travailler dans ce dépôt, pas **quoi** construire : le quoi
est réparti entre `02-product-vision.md` (le produit), `03-system-architecture.md`
(la technique), `04-design-system.md` (le design), `05-development-standards.md`
(les règles), `design.md` (les écrans) et `06-progress-tracker.md` (l'avancement).

---

## 0. Principes directeurs

1. **La règle métier est écrite avant le code.** Si une décision de produit n'est
   pas dans `02-product-vision.md`, elle n'existe pas encore. Si elle n'est pas
   encodée dans `src/lib/domain/`, elle n'est pas appliquée.
2. **Le type est la barrière de sécurité.** Une donnée ne franchit pas une couche
   parce qu'un développeur a été prudent : elle ne franchit pas parce que le type
   l'interdit (`PublicTalent` ne contient aucun champ de contact, par construction).
3. **Une URL d'annuaire doit être partageable, indexable et fonctionnelle sans
   JavaScript.** Ce n'est pas une préférence : c'est un choix produit, et il
   contraint la façon dont l'interface de recherche est écrite.
4. **Aucune modification massive non vérifiée.** Une écriture qui touche plus de
   ~5 fichiers ou qui supprime une logique métier existante exige un plan explicite
   et une validation intermédiaire.
5. **Le repository ne contient aucun secret.** Les secrets vivent dans
   l'environnement, jamais dans un fichier versionné, jamais dans un message de
   journal, jamais dans une capture d'écran de rapport.
6. **La documentation fait partie du livrable.** Elle est écrite dans la même passe
   que le code, jamais « plus tard ».

---

## 1. Workflow obligatoire

```text
Understand  →  Inspect  →  Plan  →  Implement  →  Validate  →  Document  →  Update Progress
```

Aucune étape ne peut être sautée. En particulier, `Document` et
`Update Progress` sont **obligatoires** : un changement livré sans documentation à
jour est un changement inachevé.

### 1.1 Understand — comprendre la demande

Avant d'écrire quoi que ce soit :

- reformuler la demande en une phrase vérifiable (« après cette tâche, X est
  possible et Y est vrai ») ;
- identifier la **phase** du projet concernée (`06-progress-tracker.md`) ;
- identifier les **règles métier** susceptibles d'être touchées, en cherchant les
  références `§` dans le code existant (`grep -rn "§" src/`) ;
- identifier les **contraintes** : sécurité, confidentialité, RGPD-like,
  accessibilité, langue (le produit est **français**, `lang="fr"`), ton de marque.

Sortie attendue : la reformulation et la liste des `§` concernés.

### 1.2 Inspect — inspecter avant de décider

Toujours, dans cet ordre :

```bash
# 1. Le dépôt a-t-il changé ?
git status --short && git log --oneline -10

# 2. Le module existe-t-il déjà ?
find src -type f -name '*.ts*' | sort

# 3. Une règle métier est-elle déjà encodée ici ?
grep -rn "§" src/

# 4. Le composant existe-t-il déjà dans le design system ?
find src/components/ui -type f | sort

# 5. Un type de route existe-t-il déjà ?
find src/app -name 'page.tsx' -o -name 'route.ts' | sort
```

Puis **lire** les fichiers concernés en entier, pas seulement la signature. Ce dépôt
porte l'essentiel de ses décisions dans des commentaires en tête de fichier : les
lire fait partie de l'inspection.

Règles d'inspection :

- ne jamais supposer qu'un composant existe parce qu'il est « évident » — vérifier ;
- ne jamais supposer qu'un type est absent parce qu'on ne l'a pas importé — chercher ;
- si un comportement existe déjà, **étendre** au lieu de du réécrire.

### 1.3 Plan — planifier avant modification

Avant la première écriture, produire un plan court (5 à 15 lignes) contenant :

1. **Fichiers touchés** (créations / modifications), avec la raison pour chacun.
2. **Couche(s) concernée(s)** : `domain` / `application` / `data` / `ui` / `route`.
3. **Types introduits ou modifiés**, et où ils vivent.
4. **Règles `§` appliquées**.
5. **États d'interface** traités : loading, empty, error, success, disabled (§41).
6. **Validation prévue** : quelles commandes, quel critère de succès.

Si le plan dépasse 15 lignes ou touche plus de 5 fichiers, le detailing est obligatoire.

### 1.4 Implement — implémenter progressivement

Ordre d'implémentation imposé (du domaine vers l'affichage) :

```text
1. enums / types du domaine        (src/lib/domain/)
2. logique métier pure              (src/lib/domain/)
3. validation des entrées           (src/lib/validation/)
4. interface repository             (src/lib/repositories/*.repository.ts)
5. implémentation repository        (mock → drizzle)
6. use cases                        (src/lib/use-cases/)
7. composants de présentation       (src/components/<module>/)
8. composants design system         (src/components/ui/)  ← avant si absent
9. route (page / layout / actions)  (src/app/)
10. états loading / error / not-found (src/app/<route>/)
11. métadonnées, sitemap, robots
```

Règles d'implémentation :

- **Une étape à la fois.** Compiler/linter après chaque étape, pas à la fin.
- **Pas de modification non vérifiée au-delà de 5 fichiers** sans validation
  intermédiaire (`pnpm typecheck`).
- **Pas de duplication.** Si un comportement existe, il est étendu ou déplacé, pas
  recopié. Un `countActiveFilters` existe déjà dans deux endroits dans l'état
  initial du dépôt : c'est un défaut à corriger, pas un modèle à suivre.
- **Pas de `any`.** Jamais. Voir `05-development-standards.md` §46.
- **Pas de couleur, d'espacement ou de rayon hors tokens** (§41, §42). Les
  utilities Tailwind arbitraires (`top-[13px]`, `text-[15px]`) sont interdites
  au profit de l'échelle.
- **Pas de dépendance ajoutée** sans justification écrite dans le rapport et sans
  vérifier qu'elle n'existe pas déjà dans `node_modules`.
- **Pas de `"use client"`** tant que le composant n'a pas besoin d'état, d'effet ou
  de gestionnaire d'événement. Le client est le coût par défaut ; le serveur est le
  choix par défaut.

### 1.5 Validate — valider

Commandes, dans cet ordre. Une tâche n'est **pas** terminée tant que les quatre
n'ont pas été passées :

```bash
pnpm typecheck   # next typegen && tsc --noEmit
pnpm lint        # eslint (flat config)
pnpm build       # next build (Turbopack)
pnpm check       # les trois d'affilée
```

Puis validation manuelle, obligatoire pour tout changement visuel ou fonctionnel :

- [ ] la page s'affiche sans erreur console ;
- [ ] le clavier atteint tous les éléments interactifs (tabulation complète) ;
- [ ] le focus est visible à chaque arrêt ;
- [ ] le rendu est correct à 375 px, 768 px et 1280 px ;
- [ ] l'écran loading, empty et error sont présents quand ils s'appliquent (§41) ;
- [ ] aucune information privée n'apparaît dans le HTML rendu (voir §9 / §24) ;
- [ ] `prefers-reduced-motion: reduce` neutralise les animations.

Critères de refus automatique :

| Symptôme | Verdict |
|---|---|
| `pnpm typecheck` échoue | non livré |
| `pnpm lint` échoue | non livré |
| `pnpm build` échoue | non livré |
| champ de contact dans un composant public | non livré, blocage sécurité |
| couleur hors tokens | non livré |
| `PlaceholderPage` sur une route annoncée comme livrée | non livré |

### 1.6 Document — mettre à jour la documentation

Toujours, avant de conclure. Le fichier à mettre à jour dépend de la nature du
changement :

| Changement | Fichiers à mettre à jour |
|---|---|
| nouvelle règle métier | `02-product-vision.md` **et** `src/lib/domain/` |
| nouveau composant de design system | `04-design-system.md` §40 |
| nouvel écran ou parcours | `design.md` (+ `04-design-system.md` si nouveaux composants) |
| nouvelle route | `03-system-architecture.md` §30 et `design.md` |
| nouvelle règle d'écriture de code | `05-development-standards.md` |
| nouvelle décision technique | `03-system-architecture.md` (+ plan de migration) |
| avancement d'une tâche | `06-progress-tracker.md` |
| référence `§` résolue différemment | `01-ai-workflow.md` §2 (registre) |

Une section de documentation qui décrit un comportement absent du code est fausse.
Une section qui décrit un code absent de la documentation est invisible. Les deux
sont des défauts.

### 1.7 Update Progress — mettre à jour le progress tracker

Dernière action, jamais optionnelle :

1. Passer la tâche à l'état approprié : `[ ]` → `[-]` → `[x]`, ou `[!]`.
2. Ne **jamais** mettre `[x]` sans validation réelle (§1.5 exécutée et réussie).
3. `[!]` (bloqué) doit être accompagné d'une ligne expliquant le blocage et la
   condition de levée.
4. Si la tâche a révélé une tâche manquante, l'ajouter à la phase appropriée plutôt
   que de l'absorber silencieusement.

---

## 2. Registre des sections `§`

Le code source référence des exigences par leur numéro (`// §13`). Ce registre est
la table de résolution unique. Toute référence `§` du code **doit** pointer vers une
section existante de ce registre.

| `§` | Document propriétaire | Sujet |
|---|---|---|
| §1 | `02-product-vision.md` | Produit, marque, opérateur |
| §2 | `02-product-vision.md` | Positionnement et promesse |
| §3 | `02-product-vision.md` | Le vivier de talents |
| §3.1 | `02-product-vision.md` | Disponibilité |
| §3.2 | `02-product-vision.md` | Fraîcheur du profil |
| §3.3 | `02-product-vision.md` | Statut du candidat |
| §3.4 | `02-product-vision.md` | Deux viviers distincts |
| §4 | `02-product-vision.md` | Données du candidat |
| §4.1 | `02-product-vision.md` | Projection publique |
| §4.2 | `02-product-vision.md` | Visibilité contrôlée par le candidat |
| §4.3 | `02-product-vision.md` | Données privées |
| §5 | `02-product-vision.md` | Utilisateurs et personas |
| §6 | `02-product-vision.md` | Processus de recrutement (machine à états) |
| §7 | `02-product-vision.md` | Entretiens |
| §8 | `02-product-vision.md` | Moteur de matching |
| §9 | `02-product-vision.md` | Confidentialité et publication |
| §10 | `02-product-vision.md` | Acquisition et sources |
| §11 | `02-product-vision.md` | Modèle économique et prestations |
| §12 | `02-product-vision.md` | Conversion |
| §13 | `02-product-vision.md` | Annuaire et filtres |
| §14 | `02-product-vision.md` | Fiche publique talent |
| §15 | `02-product-vision.md` | Parcours candidat |
| §16 | `02-product-vision.md` | Parcours entreprise |
| §17 | `02-product-vision.md` | Parcours administrateur / RH |
| §18 | `02-product-vision.md` | Processus de médiation |
| §19 | `02-product-vision.md` | Règles métier transverses |
| §20 | `02-product-vision.md` | Rôles et autorisations |
| §21 | `02-product-vision.md` | MVP : périmètre |
| §22 | `02-product-vision.md` | Fonctionnalités futures |
| §23 | `03-system-architecture.md` | Validation des entrées |
| §24 | `03-system-architecture.md` | Modèle de données et relations |
| §25 | `03-system-architecture.md` | Persistance : Neon + Drizzle |
| §26 | `03-system-architecture.md` | Authentification : Clerk |
| §27 | `02-product-vision.md` | Mentions de marque et opérateur |
| §28 | `03-system-architecture.md` | Autorisation et RBAC technique |
| §29 | `03-system-architecture.md` | Fichiers et stockage |
| §30 | `03-system-architecture.md` | Architecture en couches |
| §31 | `03-system-architecture.md` | Déploiement et environnement |
| §32 | `03-system-architecture.md` | Performance et évolutivité |
| §33 | `03-system-architecture.md` | API : routes handlers et Server Actions |
| §34 | `03-system-architecture.md` | Moteur de matching côté serveur |
| §35 | `03-system-architecture.md` | Notifications |
| §36 | `03-system-architecture.md` | Journal d'audit |
| §37 | `03-system-architecture.md` | Cache et revalidation |
| §38 | `03-system-architecture.md` | Variables d'environnement |
| §39 | `03-system-architecture.md` | Sécurité applicative |
| §40 | `04-design-system.md` | Catalogue de composants |
| §41 | `04-design-system.md` | États d'interface |
| §42 | `04-design-system.md` | Responsive |
| §43 | `04-design-system.md` | Accessibilité et mouvement |
| §44 | `05-development-standards.md` | Données de démonstration fictives |
| §45 | `05-development-standards.md` | TypeScript |
| §46 | `05-development-standards.md` | Interdiction de `any` |
| §47 | `05-development-standards.md` | Nommage et structure des fichiers |
| §48 | `05-development-standards.md` | Composants : serveur vs client |
| §49 | `05-development-standards.md` | Server Actions |
| §50 | `05-development-standards.md` | API et validation côté serveur |
| §51 | `05-development-standards.md` | Gestion des erreurs et logs |
| §52 | `05-development-standards.md` | Accès base de données |
| §53 | `05-development-standards.md` | Sécurité applicative en code |
| §54 | `05-development-standards.md` | Authentification et autorisation en code |
| §55 | `05-development-standards.md` | Git |
| §56 | `05-development-standards.md` | Environnement et secrets |
| §57 | `05-development-standards.md` | Performance |
| §58 | `05-development-standards.md` | Tests |
| §59 | `05-development-standards.md` | Accessibilité et responsive en code |
| §60 | `design.md` | Cartographie des écrans (`EC-01` à `EC-13`) et navigation |
| §61 | `design.md` | Écran `EC-01` : accueil |
| §62 | `design.md` | Écran `EC-02` : annuaire des talents |
| §63 | `design.md` | Écran `EC-03` : fiche publique talent |
| §64 | `design.md` | Écrans `EC-04` à `EC-13` |
| §65 | `design.md` | Parcours `PA-01` à `PA-04` et points de rupture |
| §66 | `design.md` | Cohérence des écrans et vocabulaire imposé |
| §67 | `design.md` | Feuille de route des écrans |
| §68 | `design.md` | Réserve et primauté des autres documents |

**Convention** : les numéros `§` sont stables. Un numéro n'est jamais réutilisé pour
un autre sujet ; si une exigence disparaît, le numéro devient « retiré » et n'est pas
réattribué.

---

## 3. Analyse d'une tâche — grille de décision

Répondre à ces six questions avant de coder. Si une réponse est incertaine,
l'incertitude elle-même est le premier élément du plan.

| Question | Conséquence sur l'implémentation |
|---|---|
| Quelle couche est concernée ? | Détermine l'ordre d'implémentation (§1.4) |
| Une règle métier est-elle nouvelle ou déjà codée ? | Si déjà codée : étendre `src/lib/domain/`, ne pas recalculer dans la page |
| Des données privées sont-elles accessibles ? | Vérifier le type, pas la prudence. Voir §9 |
| Un rôle est-il impliqué ? | Vérifier `src/lib/domain/permissions.ts` avant d'écrire l'accès |
| L'écran a-t-il des états multiples ? | loading / empty / error / success sont obligatoires (§41) |
| La route est-elle publique ou authentifiée ? | Déterminer `metadata`, `robots`, le layout, les guards |

---

## 4. Gestion des erreurs et des blocages

### 4.1 Erreur de compilation ou de typage

1. Lire l'erreur en entier, message et fichier.
2. Ne **jamais** contourner par `any`, `@ts-ignore`, `@ts-expect-error` non documenté,
   ni par un `as` non justifié.
3. Si l'erreur révèle un vrai défaut de conception (type trop large, couche traversée),
   corriger la conception et le documenter. C'est le bon moment, pas le mauvais.
4. Si l'erreur est Due à Next.js 16 (API asynchrone, `proxy`, `cacheComponents`),
   lire `node_modules/next/dist/docs/` — voir §5.

### 4.2 Erreur d'exécution

1. Reproduire et obtenir une trace lisible.
2. Distinguer : erreur de données, erreur de code, erreur d'infrastructure.
3. Si l'erreur est dans la couche données, la propager jusqu'à `error.tsx` avec un
   état d'erreur utile (§41) plutôt que d'afficher une page blanche.
4. Ne jamais afficher à l'utilisateur un message technique, un nom de table, une
   URL d'hôte de base de données ou une stack trace. `error.digest` va dans les
   journaux, jamais dans l'interface.

### 4.3 Blocage

Marquer la tâche `[!]` dans `06-progress-tracker.md`, écrire la cause, la condition de
levée, et continuer sur la partie non bloquée du travail. Un blocage n'autorise pas à
sauter une étape de validation pour le reste.

---

## 5. Contexte Next.js obligatoire

Ce dépôt utilise **Next.js 16.3.6** avec Turbopack par défaut. Le bloc géré dans
`AGENTS.md` est là pour une raison : **la documentation embarquée dans
`node_modules/next/dist/docs/` fait autorité et contredit les habitudes
d'apprentissage habituelles.**

Avant d'écrire du code Next.js dans ce dépôt, lire le document pertinent :

```text
node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md
```

Les points suivants sont les pièges les plus fréquents :

| Sujet | Règle Next 16 |
|---|---|
| `params`, `searchParams` | **Promesses.** Toujours `await params` / `await searchParams` |
| `cookies()`, `headers()`, `draftMode()` | **Asynchrones** (`await`) |
| Middleware | `middleware.ts` déprécié → `proxy.ts`, runtime **Node.js obligatoire** |
| `runtime: 'edge'` | Déprécié |
| `next lint` | **Supprimé** — utiliser le CLI ESLint |
| `revalidateTag(tag)` | Exige un 2ᵉ argument (`'max'`, `'hours'`, …) |
| `next/image` | `priority` déprécié → `loading="eager"` / `fetchPriority="high"` ; `qualities` par défaut `[75]` |
| `experimental.dynamicIO` / `useCache` / `ppr` | **Supprimés** → `cacheComponents` |
| Types de route | `PageProps<"/route">`, `LayoutProps<"/route">`, `RouteContext<'/api/x'>` globaux, générés par `next typegen` |
| Caching `fetch` | **Non mis en cache par défaut** dans l'App Router |
| Cache Components | Désactivé dans ce dépôt. Toute donnée runtime hors `<Suspense>` est permise |
| `error.tsx` | Doit être Client Component. `reset()` ré-affiche sans re-fetcher |
| `global-error.tsx` | Ne reçoit ni styles globaux ni polices. Ne peut pas exporter `metadata` |
| Concurrence | `next dev` écrit dans `.next/dev`, `next build` dans `.next` — les deux peuvent tourner ensemble |
| `serverActions.bodySizeLimit` | 1 Mo par défaut, en-têtes et boundaries multipart inclus (pertinent pour les téléversements §29) |
| `next dev` | Charge la config **une fois** : `process.argv` ne contient plus `'dev'`. Utiliser `NODE_ENV` |

---

## 6. Anti-patterns interdits

| Anti-pattern | Pourquoi | Alternative |
|---|---|---|
| Écrire un `console.log` de debug et le laisser | fuite de données, bruit | suppression avant livraison ; logs structurés si justifié (§51) |
| Recalculer une règle métier dans une page | divergence entre affichages | use case dans `src/lib/use-cases/` |
| Ajouter un champ à `PublicTalent` | brise la confidentialité par construction (§4.1) | type séparé + justification écrite dans `03-system-architecture.md` |
| `any`, `@ts-ignore`, `as unknown as X` | effondre la barrière de sécurité | `unknown` + narrowing, ou type correct |
| `"use client"` en haut d'un composant de page | envoie toute la page au client | isoler le composant interactif |
| Filtrer en JavaScript ce qui peut être filtré en SQL | performance | `WHERE` + index (§25) |
| Couleur/espacement/rayon en dur | casse la cohérence et le thème | tokens `@theme` (§40) |
| `PlaceholderPage` laissée sur une route « terminée » | promet une page inexistante | livrer la page, ou laisser la route en `[ ]` |
| Marquer `[x]` sans build vert | fausse traçabilité | `pnpm check` obligatoire |
| Marge de sécurité dans une URL de filtre | combinaisons de filtres infinies | liste blanche d'enums (§23) |
| Publier coordonnées, documents ou notes internes | violation de confidentialité | passer par une demande de profil arbitrée (§9) |
| Écrire des données fictives hors `src/lib/mock/` | contamination du jeu de données | tout est marqué `⚠️ DONNÉES FICTIVES` (§44) |
| Secret dans un fichier versionné ou un log | incident de sécurité | variables d'environnement (§38, §56) |

---

## 7. Format des rapports

Chaque fin de tâche produit un rapport court et factuel :

```text
✓/✗ Understand — reformulation, § concernés
✓/✗ Inspect   — fichiers lus
✓/✗ Plan      — fichiers touchés, justification
✓/✗ Implement — ce qui a été écrit
✓/✗ Validate  — typecheck / lint / build + vérification manuelle
✓/✗ Document  — fichiers de doc mis à jour
✓/✗ Progress  — tâches passées à [x] / [-] / [!]
```

Si une étape a échoué, l'indiquer. Un rapport qui prétend `✓` sur une étape non
exécutée est plus grave qu'un rapport honnête signalant un échec : il désoriente
l'agent suivant.
