# 03 — Architecture système : Kaji.com

> **Numérotation** : ce document est propriétaire des sections **§23 à §39**, à
> l'exception de **§27** (mentions de marque et opérateur), qui appartient à
> `02-product-vision.md` §1.2.
> Le registre complet des `§` du projet est dans `01-ai-workflow.md` §2.
> `§1` à `§22` et `§27` appartiennent à `02-product-vision.md` ; `§40` et
> suivants à `04-design-system.md`.

**Version de référence** : `next@16.3.6`, `react@19.2.8`, `typescript@5`,
`tailwindcss@4`, `pnpm@11.13.1`.
**Source de vérité Next.js** : la documentation embarquée dans
`node_modules/next/dist/docs/`. En cas de divergence entre ce document et cette
documentation, **la documentation embarquée gagne** ; ce document doit alors être
corrigé dans la même passe.

---

## §23 — Validation des entrées

### 23.1 Principe

**Toute donnée entrant dans le système est non fiable.** Cela vaut pour les
paramètres d'URL, les corps de requête, les en-têtes, les données de formulaire et
les données de session. Aucune de ces sources n'est consommée directement.

Règle : **valider, normaliser, puis seulement utiliser**. Un paramètre invalide
n'est jamais « silencieusement ignoré » — il est rejeté explicitement et l'effet du
rejet est annoncé à l'utilisateur.

### 23.2 Emplacement

Toute validation vit dans `src/lib/validation/`, jamais dans un `page.tsx` ni dans
un composant. Un fichier de page n'exporte que des éléments de l'API App Router.

| Fichier | Rôle |
|---|---|
| `validation/candidate-id.ts` | Format d'identifiant candidat `KJ-AAAA-NNNN` + longueur maximale |
| `validation/talent-filters.ts` | Schéma Zod des paramètres de l'annuaire |

### 23.3 Règles appliquées

1. **Liste blanche, pas liste noire.** Les valeurs d'énumération sont validées
   contre les unions de `src/lib/domain/enums.ts`. Une valeur inconnue est
   rejetée : elle ne peut pas produire une combinaison de filtres infinie.
2. **Zod pour les structures.** `rawSearchParamsSchema` (Zod 4) parse l'objet
   `searchParams` déjà normalisé. Un échec `safeParse` retombe sur des filtres
   neutres et produit un message utilisateur, jamais une exception.
3. **Longueurs bornées.** Chaque champ texte a un `.max()`. Un identifiant
   candidat est borné en longueur : c'est aussi une garde d'allocation.
4. **Normalisation déterministe.** Les paramètres répétés sont réduits à la
   première occurrence, avec un message explicite (« reçu plusieurs fois ; la
   première valeur est retenue »).
5. **Le fallback est visible.** Un filtre ignoré remonte dans
   `TalentDirectoryResult.filterIssues` et s'affiche via un `Alert tone="warning"`.
   L'utilisateur voit le résultat, pas l'erreur de syntaxe.

### 23.4 Validation à plusieurs frontières

| Frontière | Mécanisme | Conséquence en cas d'échec |
|---|---|---|
| URL → page | `parseTalentSearchParams()` | Filtres neutres + message |
| URL → identifiant | `CANDIDATE_ID_PATTERN` | `notFound()` avant tout accès aux données |
| Page → repository | Type `TalentFilters` déjà validé | Erreur de développement (`tsc`) |
| Formulaire → Server Action | Schéma Zod dédié + `authorize()` | `fieldErrors` renvoyées au formulaire |
| Route Handler → service | Schéma Zod + contrôle de rôle | `400` / `403` avec corps typé |

### 23.5 Interdit

- `any` sur une donnée entrante, y compris « juste pour cette fois » (§46).
- `as` pour forcer le passage d'une entrée non typée à un type métier.
- Une valeur d'URL utilisée sans être passée par le validateur.

---

## §24 — Modèle de données et relations

### 24.1 Deux mondes séparés : enregistrement interne et projection publique

C'est la décision structurante du modèle. Un `MockTalentRecord` (futur : une ligne
SQL) contient des coordonnées, une adresse, un salaire, des notes internes, un
historique. Une `PublicTalent` n'en contient **aucune**.

```
MockTalentRecord  ──toPublicTalent()──▶  PublicTalent  ──(+ parcours)──▶  PublicTalentProfile
   (interne)                                (annuaire)                        (fiche publique)
   coordonnées ✓                           coordonnées ✗                    coordonnées ✗
   notes RH ✓                              notes RH ✗                        notes RH ✗
   salaire espéré ✓                        salaire ✗                          salaire ✗
   statut réel ✓                           statut effectif (dérivé)           statut effectif
   profil complet ✓                        résumé public ✓                   expérience / formation / certifs ✓
```

**L'absence du champ dans le type est la garantie**, pas la présence d'un champ
`private`. Ajouter un champ à `PublicTalent` est donc un acte de revue : chaque
ajout doit être justifié dans ce document (la consigne est déjà écrite dans
`src/lib/domain/talent.ts`).

### 24.2 Entités cibles

Le schéma de référence ci-dessous est celui du futur modèle relationnel. Il est
décrit ici pour fixer les **noms, les relations et les contraintes**, pas pour être
codé avant la phase (§25).

| Entité | Rôle | Liens |
|---|---|---|
| `candidate` | Identité interne d'un candidat | `1–1` `candidate_profile`, `1–1` `candidate_private_data`, `1–n` `candidate_document`, `1–n` `audit_event` (acteur), `1–n` `availability_confirmation` |
| `candidate_profile` | Le profil publiable : titre, résumé, compétences, langues, expérience, formation, certifications | `n–1` `candidate`, `1–n` `experience`, `1–n` `education`, `1–n` `certification`, `1–n` `candidate_skill`, `1–n` `candidate_language` |
| `candidate_private_data` | Coordonnées, adresse exacte, salaire espéré | `1–1` `candidate`. **Jamais** jointe par une projection publique |
| `candidate_document` | Pièces justificatives (type MIME, stockage objet) | `1–n` `candidate` |
| `availability_confirmation` | Historique des reconfirmations de disponibilité | `1–n` `candidate`, source (`SELF`, `RH`) |
| `talent_category` / `talent_domain` / `talent_location` | Référentiels, remplacés par les tables de `src/lib/mock/referentials.ts` | référencés par `candidate_profile` |
| `company` | Entreprise vérifiée | `1–n` `company_member`, `1–n` `job_request` |
| `company_member` | Utilisateur rattaché à une entreprise, avec un rôle | `n–1` `company`, `n–1` `user` |
| `job_request` | Besoin de recrutement | `1–n` `company`, `1–n` `application`, `1–n` `shortlist`, `1–n` `interview`, `1–1` `placement` |
| `application` | Candidature interne à une demande | `n–1` `job_request`, `n–1` `candidate`, statut de la demande |
| `shortlist` | Sélection argumentée présentée au client | `n–1` `job_request`, `n–n` `candidate`, motif, rang |
| `interview` | Entretien planifié | `n–1` `job_request`, `n–1` `candidate`, compte rendu interne |
| `placement` | Issue finale : `PLACED` ou `REJECTED` | `1–1` `job_request`, `1–n` `candidate` |
| `profile_request` | Demande d'accès à un profil (« demande de profil », §9.3) | `n–1` `company`, `n–1` `candidate`, décision RH |
| `audit_event` | Journal immuable des accès et actions sensibles | `n–1` acteur, cible, ressource, horodatage |
| `user` | Compte applicatif, rôle et rattachement (`public_metadata.role`) | Clerk (`user_id` externe) |

### 24.3 Contraintes non négociables

- **Aucune suppression en cascade sur `candidate`**, `company` ou `job_request` :
  la suppression est un état (`ARCHIVED`) ou un filtre logique. L'historique de
  médiation doit rester lisible (§9.4).
- **Un identifiant public ≠ un identifiant interne.** `candidateId`
  (`KJ-AAAA-NNNN`) est l'identifiant exposé dans l'URL ; la clé primaire
  technique est un UUID. Le format est validé par `CANDIDATE_ID_PATTERN`.
- **Timestamps en UTC**, calcul de fraîcheur sur des journées calendaires UTC
  (`startOfUtcDay`), pour que la fraîcheur d'un profil ne dépende pas du fuseau
  du visiteur.
- **Données de démonstration** : `src/lib/mock/` ne décrit que la forme, jamais la
  production. Elles sont marquées comme fictives (§44).

---

## §25 — Persistance : Neon + Drizzle

### 25.1 État actuel

**Aucune persistance n'est installée.** Il n'existe ni `drizzle-orm`, ni
`@neondatabase/serverless`, ni fichier `drizzle.config.ts`, ni variable
`DATABASE_URL`. Le MVP public est alimenté par `MockTalentRepository`, en mémoire.

C'est un choix assumé : le but de l'architecture actuelle est de valider les règles
métier, la confidentialité et les parcours **avant** d'introduire une base.

### 25.2 Cible

| Élément | Choix | Raison |
|---|---|---|
| Base | **Neon** (PostgreSQL serverless) | Pooling HTTP, branchement direct, compatible Vercel sans serveur persistant |
| Client | `drizzle-orm` + `@neondatabase/serverless` | SQL typé, migrations versionnées, pas d'ORM caché |
| Schéma | `src/lib/db/schema.ts` | Un seul endroit décrit les tables |
| Migrations | `drizzle-kit` | `pnpm db:generate` puis `pnpm db:migrate` |
| Accès | Un module unique `src/lib/db/index.ts` | Aucun `new Client()` dispersé |

### 25.3 Le point de bascule

Le basculement est déjà préparé et ne doit pas être dilué :

```ts
// src/lib/repositories/index.ts — l'unique ligne qui change
export const talentRepository: TalentRepository = new DrizzleTalentRepository(db);
```

L'interface `TalentRepository` (`repositories/talent-repository.ts`) est le contrat.
`MockTalentRepository` et, plus tard, `DrizzleTalentRepository` l'implémentent
**toutes les deux**. Aucun composant, aucun use case, aucune page ne connaît la
source.

### 25.4 Règles de migration

1. `DrizzleTalentRepository` est écrit **à côté** du mock, pas à sa place.
2. Les deux implémentations sont comparées sur les mêmes cas de test manuels
   (mêmes filtres → mêmes résultats, mêmes facettes, mêmes totaux).
3. Le passage se fait en une modification de `repositories/index.ts`, suivi de
   `pnpm check`.
4. Les noms de colonnes reprennent les noms de types de `src/lib/domain/` pour que
   la correspondance soit lisible (`availability` → `effective_availability`,
   `is_verified` → `is_verified`).
5. Aucune requête SQL dans un composant, un use case ou un `page.tsx`.

### 25.5 Contraintes de performance attendues

- Index sur `candidate_profile.category_slug`, `candidate_profile.city_slug`,
  `candidate.effective_availability`, `candidate.is_verified`,
  `candidate.last_profile_update_at`.
- Filtres à liste blanche translates en `WHERE` + `IN` ou `= ANY($n)`.
- Pagination par offset tant que le vivier est sous ~5 000 profils ; au-delà,
  pagination par curseur (§13, `02-product-vision.md` §22.1).

---

## §26 — Authentification : Clerk

### 26.1 État actuel

**Clerk n'est pas installé.** Aucune route n'est authentifiée. Toutes les pages sont
publiques et le lisent comme telles. La matrice RBAC existe et est testée
(`src/lib/domain/permissions.ts`), mais **aucun écran ne l'exerce encore** : il
n'existe pas de session dont le rôle pourrait être lu.

### 26.2 Cible

Clerk fournit l'authentification et l'identité ; **Kaji reste maître du rôle**.

| Besoin | Qui le porte | Pourquoi |
|---|---|---|
| Identité, session, magic link, OAuth | Clerk | Ne pas réécrire l'authentification |
| Rôle métier (`CANDIDATE`, `EMPLOYER`, `RH`, `ADMIN`, `SUPER_ADMIN`) | `public_metadata.role` | Doit être inscriptible par un Super Admin, pas par l'utilisateur |
| Rattachement à une entreprise | `organizationMembership` de Clerk, ou table `company_member` | Une entreprise = un tenant |
| Rôle d'un candidat dans l'espace candidat | Table `candidate` | Le candidat du vivier est aussi le titulaire du compte |

### 26.3 Règles

1. **Le rôle n'est jamais lu côté client.** Ni `metadata`, ni en-tête, ni corps de
   requête, ni `searchParams`. Il provient exclusivement de la session serveur
   (`auth()` + `publicMetadata`), et `can()` est toujours rejoué côté serveur
   avant toute action.
2. **`SUPER_ADMIN` n'est jamais auto-attribuable.** Aucun parcours public ne crée
   un compte `ADMIN` ou `SUPER_ADMIN`.
3. **Un candidat ne se vérifie pas lui-même.** `VERIFIED` est posé par RH via un
   use case, jamais par une action de profil.
4. **Une session ne remplace pas une autorisation.** Être connecté à un espace
   candidat n'autorise pas à voir `CANDIDATE_PRIVATE_DATA` d'un autre candidat.
5. **Les mappings Clerk sont des clés étrangères, pas des données métier.** Le
   `userId` Clerk est stocké, mais le profil, la disponibilité et les documents
   vivent dans les tables Kaji.

### 26.4 Points d'intégration Next.js 16

- `auth()` est **asynchrone** : `const { userId, orgId } = await auth()`.
- Les guards de route passent par `src/proxy.ts` (le fichier `middleware.ts` est
  **déprécié**, renommé `proxy` dans Next.js 16). `proxy.ts` ne doit faire que de
  la redirection rapide et de la lecture de cookie ; **toute décision d'accès
  reste dans la page, le layout ou le use case**, parce que `proxy` s'exécute hors
  du graphe de rendu et ne doit pas partager de module métier.
- `proxy.ts` s'exécute sur le runtime **Node.js** par défaut (l'option `runtime` y
  lève une erreur) et peut lire `process.env`. Il n'a en revanche **pas le droit
  d'appeler `revalidateTag` / `updateTag`**, qui ne fonctionnent que dans des
  Server Functions et des Route Handlers, et n'importe rien de `domain/`,
  `repositories/` ou de la base.
- Le rendu authentifié utilise `layout.tsx` + un `layout` de groupe de routes
  (ex. `(espace)`) plutôt qu'un `if` dans chaque page.

---

## §28 — Autorisation et RBAC technique

### 28.1 Source de vérité

`src/lib/domain/permissions.ts` est la **matrice unique**. Elle est consommée par
les use cases, jamais par un composant pour décider d'afficher un bouton.

- `RESOURCE` : 14 ressources.
- `ACTION` : `READ`, `CREATE`, `UPDATE`, `DELETE`, `MANAGE`.
- `PERMISSIONS[role][resource]` : liste d'actions autorisées, `Partial<Record<…>>`.
- `NONE` est l'**absence d'entrée** : refus par défaut. Ajouter une ressource à
  `RESOURCE` la rend inerte pour tout le monde tant qu'elle n'est pas
  explicitement accordée. Toute modification de la liste doit être justifiée dans
  ce document.

### 28.2 Contrat des fonctions

| Fonction | Usage | Ne fait pas |
|---|---|---|
| `can(role, action, resource)` | Test booléen | Ne donne pas de raison |
| `canManage(role, resource)` | Test `MANAGE` | — |
| `authorize(role, action, resource)` | Use case : `{ allowed: true }` ou `{ allowed: false, reason }` | N'écrit rien, ne journalise rien |
| `isAdminRole(role)` | Affiner l'accès à l'admin | Ne remplace pas `can()` |

### 28.3 Point de contrôle obligatoire

Toute Server Action, tout route handler et tout use case d'écriture suit le même
ordre :

```
1. lire la session serveur           (await auth())
2. résoudre le rôle                 (jamais depuis l'entrée)
3. valider l'entrée                 (Zod)
4. authorize(role, action, resource)
5. appliquer la transition d'état    (assertCandidateTransition / assertJobRequestTransition)
6. écrire                            (repository)
7. journaliser                      (audit_event)
8. revalider                        (updateTag / revalidateTag)
```

Inverser cet ordre est une régression de sécurité, même si le test passe.

### 28.4 Ce qui est explicitement refusé

| Cas | Traitement |
|---|---|
| `EMPLOYER` → `CANDIDATE_PRIVATE_DATA` | `[]` — refus. Choix produit, pas oubli |
| `EMPLOYER` → `CANDIDATE_DOCUMENTS` | `[]` — refus |
| `EMPLOYER` → `AUDIT_LOG` | `[]` — refus |
| `RH` → `AUDIT_LOG` | `READ` seulement, jamais `MANAGE` |
| `ADMIN` → `SETTINGS` | `READ` seulement |
| Réanimation d'un profil `ARCHIVED` | `SUPER_ADMIN` uniquement, transition dédiée |
| Transition de statut non listée | Refusée avec raison journalisable |

---

## §29 — Fichiers et stockage

### 29.1 Arborescence actuelle

```
src/
  app/                     routes App Router (une route = un dossier)
  components/
    ui/                    design system (agnostique produit)
    layout/                header, footer, navigation
    talent/                composants métier du vivier
    cta/                   blocs de conversion
  lib/
    domain/                règles métier pures (aucune dépendance)
    validation/            schémas d'entrée
    repositories/          contrats d'accès aux données + implémentations
    use-cases/             orchestration applicative
    mock/                  données de démonstration (§44)
    site.ts                marque, navigation, CTA
    talent-directory-url.ts  sérialisation des filtres en URL
    utils.ts               cn()
```

### 29.2 Stockage de fichiers

**Aucun stockage objet n'est installé.** Les documents candidats n'existent pas
encore (`CANDIDATE_DOCUMENTS` est `FULL` pour le candidat dans la matrice, mais la
table n'existe pas).

Cible :

- Upload via Server Action → URL signée vers un bucket (le bucket n'est **jamais**
  public) ;
- métadonnées en base : type MIME, taille, date, statut de vérification ;
- téléchargement autorisé : le contrôle RBAC s'exécute avant de produire l'URL
  signée, jamais après ;
- types de fichiers acceptés en liste blanche (PDF, images) avec contrôle de taille ;
- suppression différée possible pour respecter un droit à l'effacement, tant que
  l'obligation de conservation ne s'y oppose pas.

### 29.3 Politique de nommage

| Élément | Convention | Exemple |
|---|---|---|
| Dossier de route | minuscules, un segment lié par `-` | `talents`, `[id]`, `entreprise/demandes` |
| Groupe de routes | `(nom)` entre parenthèses | `(espace)`, `(marketing)` |
| Fichier | `kebab-case.tsx` | `talent-filters.tsx` |
| Type | `PascalCase` | `PublicTalentProfile` |
| Valeur / clé | `camelCase` ; constantes en `SCREAMING_SNAKE` | `POOL_KIND`, `PRIMARY_CTA` |
| Test | `*.test.ts` à côté du module | `matching.test.ts` |
| Handler | `route.ts` | `api/contact/route.ts` |

---

## §30 — Architecture en couches

### 30.1 Les quatre couches

```
┌──────────────────────────────────────────────────────────────┐
│ Présentation        app/**  ·  components/**                  │
│ composants, metadata, états d'interface                      │
└───────────────────────────┬──────────────────────────────────┘
                            │ appelle uniquement des use cases
┌───────────────────────────▼──────────────────────────────────┐
│ Application           lib/use-cases/**                        │
│ orchestration, validation du cas d'usage, composition de DTO │
└───────────────────────────┬──────────────────────────────────┘
                            │ appelle uniquement des repositories
┌───────────────────────────▼──────────────────────────────────┐
│ Domaine              lib/domain/**                           │
│ règles pures : statuts, disponibilité, fraîcheur, matching,  │
│ RBAC, transitions, formes de données                          │
└───────────────────────────┬──────────────────────────────────┘
                            │ implémente l'interface
┌───────────────────────────▼──────────────────────────────────┐
│ Accès aux données   lib/repositories/**                       │
│ interface + implémentations (mock aujourd'hui, Drizzle demain)│
└──────────────────────────────────────────────────────────────┘
```

### 30.2 Règles de dépendance

Les flèches ne se remontent **jamais**.

| Couche | Peut importer | Interdit |
|---|---|---|
| `domain/` | rien du projet (aucune dépendance externe) | React, Next, repositories, mock |
| `use-cases/` | `domain/`, `repositories/` | composants, JSX, SQL |
| `repositories/` | `domain/` | composants, use cases, JSX |
| `app/`, `components/` | `use-cases/`, `domain/` (types purs) | un repository autre que `talentRepository` |

- `domain/` est **pur** : fonctions sans effet de bord, testables sans DOM, sans
  base, sans framework. C'est ce qui rend les règles métier vérifiables.
- Un composant ne reçoit jamais un enregistrement brut : il reçoit un type de
  `domain/`.
- Un `page.tsx` n'exporte que des éléments de l'API App Router (`default`,
  `metadata`, `generateMetadata`, `dynamic`, `revalidate`, `loading`, `error`).
  Toute fonction utilitaire va dans `lib/` — c'est exactement pour cela que
  `lib/talent-directory-url.ts` existe.

### 30.3 Pourquoi des use cases pour un site public

Ce n'est pas de la sur-ingénierie : c'est le moyen de faire respecter §9.
`getTalentProfile()` renvoie un `PublicTalentProfile`. Le jour où un use case
`getTalentProfileForEmployer()` existera, il vérifiera le rôle et la demande de
profil avant d'appeler un repository privé. La page n'aura pas à le savoir.

### 30.4 Point de bascule des données

Un seul point de bascule dans tout le dépôt : `src/lib/repositories/index.ts`.
Il est domination d'un module unique ; aucun autre fichier n'instancie un
repository.

---

## §31 — Déploiement et environnement

### 31.1 Cible

Déploiement sur **Vercel** (Next.js natif), base **Neon** en région la plus proche
des utilisateurs (RDC / Cameroun / Europe de l'Ouest — à confirmer à l'ouverture).

### 31.2 Environnements

| Environnement | Données | Authentification | Usage |
|---|---|---|---|
| `local` | `src/lib/mock/` | aucune | développement de l'UI et des règles |
| `preview` | base Neon de préprod, données fictives | Clerk test | revue de Pull Request |
| `production` | base Neon de production | Clerk production | service public |

**Règle absolue** : les données de `preview` et de `local` sont fictives. Aucune
donnée candidate réelle ne doit exister ailleurs que sur la base de production, et
aucune donnée de production ne doit être copiée vers un autre environnement.

### 31.3 Chaîne de livraison

```bash
pnpm install --frozen-lockfile
pnpm lint        # eslint
pnpm typecheck   # next typegen && tsc --noEmit
pnpm build       # next build
```

`pnpm check` enchaîne les trois. Une Pull Request n'est pas mergeable si l'un des
trois échoue. Le build Next.js 16 avec Turbopack sert de garde-fou : il échoue si
une API dépréciée est utilisée, si un type de route est invalide, ou si une
`metadata` est mal formée.

### 31.4 Migration de base

- Migrations Drizzle versionnées dans le dépôt (`drizzle/`), appliquées **avant** le
  déploiement applicatif, jamais pendant.
- Déploiement **additif** : ajouter une colonne, migrer, puis utiliser. Jamais de
  suppression de colonne dans le même déploiement que le code qui l'utilisait.
- `drizzle-kit` en dépendance de développement, jamais en dépendance de runtime.

---

## §32 — Performance et évolutivité

### 32.1 Budgets

| Indicateur | Cible | Mesure |
|---|---|---|
| LCP (page publique) | < 2,0 s en 4G simulée | build de production |
| INP | < 200 ms | interaction filtre / menu |
| CLS | < 0,1 | bascule de page |
| Poids JS initial | < 120 kB gzip | rapport build |
| Requêtes tierces sur page publique | 0 | aucune police ni script externe hors `next/font` |

### 32.2 Décisions déjà prises

- **Typographie par `next/font`** : Fraunces (éditorial) et Plus Jakarta Sans
  (interface), auto-hébergées, `display: "swap"`, axes contrôlés. Aucune requête
  vers un service tiers au runtime.
- **Filtres dans l'URL** : l'annuaire est renderable côté serveur, partageable et
  indexable. Aucun état de filtre n'existe uniquement en mémoire côté client.
- **`loading.tsx` et `error.tsx`** : squelette de structure et message d'erreur
  actionnable, pas un spinner nu.
- **Zéro dépendance de données côté client** : pas de SWR, pas de React Query tant
  que le besoin n'existe pas. Une donnée d'annuaire se recharge par navigation.

### 32.3 Points de vigilance

- Le tri « pertinence » appelle le moteur de matching pour chaque profil
  filtré (`MockTalentRepository.sort`). En base, ce calcul doit être fait en SQL
  (colonnes de filtrage indexées) ou borné, jamais en chargeant tout le vivier
  pour le trier en JavaScript.
- La pagination par offset se dégrade : prévoir le curseur avant ~5 000 profils.
- Les facettes sont recalculées à chaque appel : en base, elles deviennent une
  requête `GROUP BY` distincte avec sa propre période de fraîcheur.

---

## §33 — API : routes handlers et Server Actions

### 33.1 Règle de choix

| Besoin | Mécanisme | Exemple |
|---|---|---|
| Mutation depuis un formulaire ou une interaction UI | **Server Action** | soumettre un besoin, demander un profil |
| Lecture/écriture appelable depuis un client non-React (webhook, intégrateur) | **Route Handler** `route.ts` | webhook Clerk, API partenaires |
| Lecture affichée dans une page | **Composant serveur** | annuaire, fiche publique |

Une route publique n'appelle pas d'API interne pour afficher une page : elle appelle
directement le use case. Le aller-retour HTTP interne n'apporte rien.

### 33.2 Contrat Server Action (Next.js 16)

- `"use server"` en tête de fichier ; arguments **sérialisables** uniquement.
- Le corps de l'action est une frontière de confiance : il refait la validation et
  l'autorisation (§28.3). Une action est un point d'entrée public.
- Retour d'action : un objet discriminant (`{ ok: true, data }` /
  `{ ok: false, error }`), jamais une exception, jamais un `any`.
- Après une écriture, `updateTag(...)` pour le read-your-own-writes dans l'action
  elle-même ; `revalidateTag(tag, "max")` pour un contenu tolérant au retard.
- `redirect()` en fin d'action, jamais pendant un rendu.

### 33.3 Contrat Route Handler

```ts
// src/app/api/<domaine>/route.ts
export async function POST(request: Request): Promise<Response> {
  // 1. auth (await auth())  2. Zod  3. authorize  4. service  5. audit
  // 6. réponse typée, code HTTP explicite
}
```

- Un handler ne contient **aucune** logique métier : il valide, délègue, répond.
- Codes : `400` entrée invalide, `401` non authentifié, `403` non autorisé,
  `404` inexistant ou non publiable, `409` transition d'état refusée, `429` quota,
  `500` défaut serveur (message générique, détail en journal).
- Chaque réponse d'erreur a la même forme. Le client n'a pas à deviner.

### 33.4 Webhooks

Les webhooks Clerk et Neon arrivent sur des routes dédiées, jamais sur une Server
Action. Ils vérifient la signature, sont **idempotents** (dédupliqués par
identifiant d'événement) et n'effectuent aucune écriture métier synchrone.

---

## §34 — Moteur de matching côté serveur

### 34.1 Position

`src/lib/domain/matching.ts` est **pur, déterministe et sans dépendance**. Il
tourne déjà côté serveur : le tri « pertinence » de l'annuaire
(`MockTalentRepository.sort`) et le scoring d'une future demande utilisent le même
`scoreTalent()`.

Invariant : **le tri de l'annuaire et le classement d'une demande ne doivent jamais
diverger**. Ils appellent le même moteur, avec la même liste de règles
(`MATCHING_RULES`), les poids étant normalisés par `scoreTalent`.

### 34.2 Règles actuelles

| Règle | Poids | Applicable si |
|---|---|---|
| `skills` | 3 | le poste exige des compétences |
| `category` | 3 | le poste exige une catégorie |
| `experience` | 2 | une fourchette d'expérience est donnée |
| `languages` | 2 | le poste exige des langues |
| `contract` | 1,5 | le poste exige un type de contrat |
| `location` | 1 | le poste exige des localisations |
| `remote` | 1 | télétravail exigé |
| `keywords` | 1 | au moins 2 caractères de recherche |

### 34.3 Garde-fous

- Le score est une **correspondance avec les critères du poste** (0–100), jamais
  une note de qualité d'une personne. Libellé imposé à l'affichage : «
  Correspondance avec les critères du poste ».
- Aucune règle ne compare deux personnes entre elles, aucune ne se normalise sur la
  population, aucune n'utilise de ML.
- `detail` est produit par chaque règle : un score sans explication n'est pas
  publiable devant un recruteur.
- Ajouter un critère = ajouter une règle dans `MATCHING_RULES`, sans toucher à
  l'orchestrateur. Changer un poids est un acte produit : il se documente ici.

### 34.4 Passage en base

Le moteur reste le même ; seule l'exécution change. Pour un volume important, les
règles pondérées deviennent une expression SQL sur des colonnes indexées, et
`breakdown` est recalculé à la demande pour les 3 à 5 candidats de la shortlist,
jamais pour toute la population.

---

## §35 — Notifications

### 35.1 État actuel

Aucune notification. Aucun e-mail, aucun centre de notifications. Rien n'est
promis dans l'interface sur ce point.

### 35.2 Cible

Canal e-mail d'abord, notification in-app ensuite. Aucun SMS au MVP.

| Événement | Destinataire | Contrainte |
|---|---|---|
| Demande de profil reçue | RH | Immédiat |
| Candidature présélectionnée | Candidat | Immédiat |
| Candidat présenté à l'entreprise | Candidat | Immédiat, avant l'envoi à l'entreprise |
| Shortlist acceptée | Candidat et entreprise | Immédiat |
| Entretien planifié | Candidat et entreprise | Immédiat |
| Vérification de disponibilité à 31 et 61 jours | Candidat | Créé par un job planifié, jamais à la visite |
| Refus de demande | Entreprise | Immédiat |

### 35.3 Règles

- **Aucun modèle d'e-mail ne contient de donnée privée** tant que le destinataire
  n'est pas le candidat concerné ou un RH autorisé.
- Chaque envoi est journalisé (destinataire, type, horodatage) sans le contenu
  sensible.
- L'envoi n'est jamais bloquant pour l'action métier : une action réussie n'est jamais
  annulée par un échec d'envoi. L'échec est journalisé et rejouable.
- Le consentement à recevoir des messages de recrutement est explicite,
  révocable, et tracé.

---

## §36 — Journal d'audit

### 36.1 Objet

Le journal répond à une seule question : **qui a accédé à quoi, et quand**. Il ne
montre pas « ce que l'entreprise a lu », il montre les accès (lecture de profil
autorisée, ouverture de coordonnées, refus, décision).

### 36.2 Règles

1. **Écriture unique.** Un `audit_event` n'est jamais modifié ni supprimé.
2. **Append-only.** Aucune mise à jour de table d'audit n'est autorisée par le
   code applicatif.
3. **Le journal ne contient pas la donnée sensible**, seulement sa référence :
   `actor`, `action`, `resource`, `resource_id`, `reason`, `occurred_at`.
4. **Rétention** : durée définie et publiée dans la politique de confidentialité.
5. **Consultation** : `RH` en lecture, `ADMIN` en lecture, `SUPER_ADMIN` en
   gestion. Aucune lecture depuis l'espace entreprise.

### 36.3 Événements à journaliser au minimum

- lecture d'un profil au-delà de la fiche publique (demande de profil accordée) ;
- ouverture de `CANDIDATE_PRIVATE_DATA` ;
- changement de statut candidat ou de demande, avec transition appliquée ;
- vérification, refus de vérification, archivage, réanimation ;
- refus d'autorisation (avec rôle et ressource) ;
- modification de la matrice RBAC et des paramètres ;
- création, modification et suppression de document.

---

## §37 — Cache et revalidation

### 37.1 Règle par défaut

**Ne pas mettre en cache ce qui n'a pas été pensé.** Le site public actuel ne
déclare aucun segment de cache et ne dépend d'aucune donnée distante : tout est
recalculé au rendu, ce qui est correct pour un vivier de démonstration.

### 37.2 Ce qui sera cacheable, et sous quelle condition

| Donnée | Stratégie | Condition |
|---|---|---|
| Annuaire filtré | `use cache` + `cacheTag("annuaire")` + `cacheLife` courte | invalidation à chaque publication, retrait, changement de disponibilité |
| Fiche publique | `use cache` + `cacheTag("talent:<id>")` | invalidée à chaque modification du profil |
| Facettes | `use cache` + `cacheTag("facettes")` | invalidée avec l'annuaire |
| Référentiels (catégories, domaines, villes) | `cacheLife` longue | invalidation manuelle uniquement |

### 37.3 API Next.js 16 — signatures exactes

```ts
import { revalidateTag, updateTag } from "next/cache";

revalidateTag(tag: string, profile: string | { expire?: number }): void;
updateTag(tag: string): void; // Server Actions uniquement
```

- `updateTag` : **uniquement** dans une Server Action. Invalide immédiatement et
  la requête suivante attend des données fraîches. C'est le choix pour
  read-your-own-writes.
- `revalidateTag(tag, "max")` : sert du contenu périmé pendant la revalidation
  (stale-while-revalidate). Le second argument est **obligatoire** ; l'appel à un
  argument est déprécié.
- `revalidateTag` / `updateTag` ne fonctionnent **ni** dans un Client Component,
  **ni** dans `proxy.ts`.
- `cacheTag` et `cacheLife` ne s'appliquent qu'à des fonctions ou composants
  marquées `'use cache'` (ou via `fetch` avec `next.tags`).
- Une revalidation est déclenchée **par une requête** : les pages ne se revalident
  pas toutes en même temps, elles se revalident à leur visite.

### 37.4 Interdits

- `unstable_cache` : API **remplacée** par `use cache` dans Next.js 16. Elle
  fonctionne encore, mais elle vit hors du modèle Cache Components. La cible est
  `'use cache'`, qui suppose d'activer `cacheComponents: true` dans
  `next.config.ts`. Ce drapeau n'est pas activé aujourd'hui : le MVP n'a aucune
  donnée distante à mettre en cache. L'activer change la sémantique de rendu, pas
  seulement les performances — `cacheComponents` active le **Partial Prerendering
  par défaut** dans l'App Router, même si la récupération de données reste dynamique
  par défaut et que rien n'est mis en cache sans `'use cache'`. C'est un choix à
  faire en connaissance de cause, au moment où il y a de la donnée distante.
- Cacher une page contenant une donnée dépendant du rôle. Une page authentifiée
  est soit dynamique, soit segmentée par utilisateur — jamais un cache partagé.
- Servir une fiche retirée depuis un cache périmé. Le retrait invalide le tag
  **avant** de répondre, sinon la politique « un profil retiré sort de l'index »
  n'est pas respectée.

---

## §38 — Variables d'environnement

### 38.1 Règles

- Un secret vit **uniquement** dans l'environnement. Jamais dans un fichier
  versionné, jamais dans un log, jamais dans un rapport d'agent, jamais dans une
  capture.
- `.env*` est ignoré par `.gitignore` (`.env*`). Seul un `.env.example` sans
  valeur peut être versionné.
- Toute variable utilisée dans le code est déclarée et validée au démarrage
  (Zod sur `process.env`), sinon le build échoue.
- Les variables `NEXT_PUBLIC_*` sont publiques par construction : **aucun secret
  ne porte ce préfixe**.

### 38.2 Variables attendues

| Variable | Secrète | Usage |
|---|---|---|
| `DATABASE_URL` | oui | Chaîne de connexion Neon (`postgres://…`) |
| `CLERK_SECRET_KEY` | oui | Clerk côté serveur |
| `CLERK_PUBLISHABLE_KEY` | non | clé publique (`NEXT_PUBLIC_` non requise) |
| `CLERK_WEBHOOK_SIGNING_SECRET` | oui | Validation des webhooks Clerk |
| `CLERK_SIGN_IN_URL` | non | URL de redirection |
| `RESEND_API_KEY` | oui | Envoi d'e-mails (futur) |
| `EMAIL_FROM` | non | Expéditeur |
| `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | oui / oui / oui | Stockage objet (futur) |
| `NODE_ENV` | non | Géré par la plateforme |

Ces noms sont des **conventions d'architecture**, pas des décisions produit déjà
prises. Le fournisseur d'e-mails (Resend ou équivalent), le stockage objet
(compatible S3 ou équivalent) et la région Neon sont à confirmer à l'ouverture
(§31.1) ; les variables suivent le choix, pas l'inverse.

### 38.3 Accès

- Lecture uniquement dans des modules serveur : `src/lib/env.ts`,
  `src/lib/db/index.ts`, `src/lib/clerk.ts`, `src/lib/mail.ts`.
- Un composant client ne lit jamais `process.env` directement ; il reçoit une
  valeur via props depuis un composant serveur.
- Aucune valeur d'environnement n'est journalisée en production. En développement,
  le nom de la variable peut être journalisé, jamais sa valeur.

---

## §39 — Sécurité applicative

### 39.1 Posture

Ce produit manipule des données de personnes réelles : nom, métier, expérience,
localisation, documents, et plus tard des coordonnées. La confidentialité est une
fonctionnalité, pas une option (§9).

### 39.2 Surface de référence

| Surface | Traitement |
|---|---|
| Paramètres d'URL | Zod, liste blanche (§23) |
| Identifiant candidat | Regex stricte + 404 avant tout accès (§24.3) |
| Formulaires | Zod côté serveur, aucune validation client considérée comme fiable |
| Rôle | Session serveur uniquement (§26.3) |
| Autorisation | `authorize()` avant toute écriture (§28.3) |
| Transitions d'état | Table unique, refus par défaut (§28.4) |
| Données privées | Absentes des types publics, par construction (§24.1) |
| Fichiers | URL signées, bucket non public, contrôle avant signature (§29.2) |
| Webhooks | Signature vérifiée, idempotence (§33.4) |
| Secrets | Environnement uniquement (§38) |
| Erreurs | Message utilisateur générique, détail journalisé, `error.digest` en production |

### 39.3 En-têtes et transport

- HTTPS obligatoire, HSTS en production.
- `Content-Security-Policy` explicite, sans `unsafe-eval`. Aucune ressource tierce
  non listée. Les polices sont auto-hébergées par `next/font`, donc aucune
  connexion à un domaine de polices externe.
- `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
  `X-Frame-Options: DENY`.
- Protection CSRF : Next.js la fournit sur les Server Actions ; ne pas la
  contourner, et exiger une vérification d'origine sur toute Route Handler
 accessible par cookie.
- Limitation de débit sur les routes d'écriture et sur tout futur formulaire
  public, avec réponse `429` explicite.

### 39.4 Vie privée

- Le produit est francophone et l'opérateur est identifiable : les obligations de
  déclaration et d'information s'appliquent. La politique de confidentialité doit
  être publiée **avant** l'ouverture des comptes.
- Le consentement est explicite, révocable, et sa trace conservée.
- Le droit d'accès, de rectification et d'effacement est implémenté dans
  l'espace candidat, pas seulement dans la politique.
- Durée de conservation définie par type de donnée et publiée.
- Aucune donnée de démonstration n'est présentée comme réelle, et aucun profil
  réel n'est utilisé dans un environnement de démonstration (§44).

### 39.5 Ce qui n'est pas encore en place, et le dit

Risques ouverts, à traiter avant la production, listés dans
`06-progress-tracker.md` :

- aucune authentification → **aucune** donnée privée réelle ne peut être stockée
  aujourd'hui ;
- aucun rate limiting ;
- aucun en-tête CSP ;
- aucune table d'audit ;
- politique de confidentialité et mentions légales en `PlaceholderPage`.

Ces manques sont le motif pour lequel le MVP reste un vivier public. Ils ne sont
pas des oubli de documentation : ce sont des étapes non faites, visibles.
