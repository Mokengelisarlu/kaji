# 05 — Standards de développement

> Ce document est propriétaire des sections **§44 à §59**. Le registre complet
> des sections figure dans `01-ai-workflow.md` §2. L'architecture est spécifiée
> dans `03-system-architecture.md`, le design dans `04-design-system.md`.
>
> **Portée** : ce document décrit des règles *applicables*, pas des intentions.
> Chaque section indique l'état réel du dépôt, la règle, et la raison. Quand le
> dépôt n'est pas conforme, c'est dit explicitement et l'écart est repris dans
> `06-progress-tracker.md`.

---

## §44 — Données de démonstration fictives

### 44.1 Règle

**Aucune donnée de démonstration n'est écrite ailleurs que dans
`src/lib/mock/`.** Un profil fictif écrit dans un composant, une page ou un test
est un défaut : il échappe à la revue, il se duplique, et il contamine le jeu de
données.

Le marqueur `⚠️ DONNÉES FICTIVES (§44)` est **obligatoire** en tête de chaque
fichier de `src/lib/mock/`, avec la mention qu'aucun profil réel ne doit y
entrer.

### 44.2 État actuel

`src/lib/mock/talents.ts` porte le marqueur et tient `MockTalentRecord` — un type
qui contient volontairement des champs internes absents de `PublicTalent`. C'est
exactement le dispositif voulu : la projection `toPublicTalent()` décide de ce qui
devient public, et c'est cette frontière qui empêche l'exposition de données
sensibles.

`src/lib/mock/referentials.ts` fournit les référentiels (villes, catégories,
domaines). **Il ne porte pas le marqueur**, parce que ce ne sont pas des données
personnelles : ce sont des listes de référence. Le marqueur s'applique aux
données qui représentent des personnes.

### 44.3 Ancre temporelle

`NOW = new Date()` au chargement du module, et `daysAgo(n)` construit les
fraîcheurs relatives. `MockTalentRecord` porte le résultat — une `Date` — et
non le nombre de jours : le record est une donnée auto-descriptive, et
`toPublicTalent()` ne dépend plus de l'ancre du fichier.

Conséquence assumée : la fraîcheur du vivier de démonstration dérive avec le
temps réel, et `REQUIRES_CONFIRMATION` finit par s'appliquer à tous les
profils. C'est **voulu** — c'est exactement l'état que l'on veut observer
avant d'avoir une vraie source. Une base réelle stockera des `Date`, pas des
nombres de jours : c'est ce que le repository attend désormais.

### 44.4 Interdits

- Écrire un profil fictif dans un composant, une page ou un test.
- Introduire une personne réelle, même anonymisée, dans le vivier.
- Présenter le vivier de démonstration comme un vivier réel (le site ne le fait
  pas ; l'interface ne parle jamais de « démonstration »).
- Réutiliser un profil fictif comme compte de test d'authentification.

---

## §45 — TypeScript

### 45.1 Configuration en vigueur

`tsconfig.json` applique :

| Option | Valeur | Raison |
|---|---|---|
| `strict` | `true` | Non négociable |
| `noUncheckedIndexedAccess` | `true` | `array[i]` est `T \| undefined` : c'est ce qui empêche les pannes d'indexation |
| `noImplicitOverride` | `true` | Un `override` doit être explicite |
| `noFallthroughCasesInSwitch` | `true` | Un `case` qui tombe est presque toujours un bug |
| `allowJs` | `false` | Pas de JavaScript non typé dans le dépôt |
| `isolatedModules` | `true` | Compatible avec les bundlers, impose `export type` |
| `target` | `ES2017` | Cible navigateur, pas de fonctionnalité exotique |
| `paths` | `@/*` → `./src/*` | Alias unique pour tout le projet |

### 45.2 Règles

1. **Aucune extension implicite.** Toutes les imports sont `./x` ou `@/lib/x`,
   jamais `./x.ts`. Le résolveur `bundler` gère l'extension.
2. **Alias `@/` pour tout `src/`.** Un import relatif qui remonte de plus de deux
   niveaux est illisible.
3. **`import type` pour les types.** Obligé par `isolatedModules`. Un import de
   type ne doit pas être un import de valeur déguisé.
4. **Types en lecture seule** sur les structures de domaine :
   `readonly x: T` plutôt que `x: T`. Le domaine ne se mute pas (§30.2).
5. **`satisfies` plutôt que `as const` quand une clé de type est nécessaire.**
   `POOL_KIND_LABEL` illustre le motif : `as const satisfies Record<PoolKind, string>`
   donne à la fois l'inférence littérale et la garantie qu'aucune valeur ne manque.
6. **Aucune affirmation de force** (`as`) pour faire passer une entrée non typée
   vers un type métier (§23.5).

### 45.3 État actuel

Conforme. Le dépôt ne contient aucun `@ts-ignore`, aucun `@ts-expect-error`, aucun
`eslint-disable`.

Les deux seules assertions `as` du dépôt sont dans `src/components/ui/slot.tsx` :
elles portent sur `ReactElement<Record<string, unknown>>`, le seul endroit où React
expose des props non typées. Elles sont bornées par un `isValidElement()` et ne
portent sur aucune donnée entrante. C'est le seul endroit où elles sont
acceptables.

---

## §46 — Interdiction de `any`

### 46.1 Règle

`any` est **interdit**, sans exception et sans « juste pour cette fois ». Le
repository ne contient aucune occurrence de `any`, sous aucune forme : ni
annotation, ni assertion, ni générique.

`any` désactive le compilateur. Il ne le remplace pas : il le convince de se taire.
L'alternative est toujours un travail de typage, et ce travail trouve des défauts
que `any` laisse passer.

### 46.2 Alternatives

| Besoin | Interdit | Écrire |
|---|---|---|
| Valeur inconnue à valider | `any` | `unknown` + Zod (`safeParse`) |
| Entrée utilisateur | `any` | type du schéma Zod, ou `unknown` |
| Conteneur à clés variables | `Record<string, T>` | `Record<string, T>` |
| Union ouverte | `any` | `unknown` + narrowing (`in`, `typeof`) |
| Surcharge d'une lib sans types | `any` | wrapper typé dans `src/lib/` |

### 46.3 État actuel

Zéro occurrence. Le dépôt utilise `unknown` aux frontières
(`slot.tsx: Record<string, unknown>`).

---

## §47 — Nommage et structure des fichiers

### 47.1 Structure

```
src/
  app/          routes App Router — une route = un dossier
  components/
    ui/         design system, agnostique produit
    layout/     en-tête, pied de page, navigation
    talent/     composants métier du vivier
    cta/        blocs de conversion
  lib/
    domain/         règles métier pures, aucune dépendance
    validation/     schémas d'entrée
    repositories/   contrats d'accès aux données + implémentations
    use-cases/      orchestration applicative
    mock/           données de démonstration (§44)
    site.ts         marque, navigation, CTA
    talent-directory-url.ts  sérialisation des filtres en URL
    utils.ts        cn()
```

Les règles de dépendance entre ces couches sont dans `03-system-architecture.md`
§30.2 et ne sont pas répétées ici.

### 47.2 Nommage

| Élément | Convention | Exemple |
|---|---|---|
| Dossier de route | minuscules, segments liés par `-` | `talents`, `[id]`, `entreprise/demandes` |
| Groupe de routes | `(nom)` entre parenthèses | `(espace)`, `(marketing)` |
| Fichier | `kebab-case.tsx` | `talent-filters.tsx` |
| Composant React | `PascalCase` | `TalentCard` |
| Type / interface | `PascalCase` | `PublicTalentProfile` |
| Variable, fonction | `camelCase` | `browseTalentDirectory` |
| Constante | `SCREAMING_SNAKE_CASE` | `POOL_KIND`, `PRIMARY_CTA` |
| Test | `*.test.ts` à côté du module | `matching.test.ts` |
| Route Handler | `route.ts` | `api/contact/route.ts` |

**Une exception** : `d'` (comme dans `d'interface`) n'est pas un tiret et ne
sépare pas. `CtaSection` est `CTA` en expansion, pas `Cta` par hasard.

### 47.3 Règles

- Un dossier de route ne contient que des fichiers special Next.js
  (`page`, `layout`, `loading`, `error`, `not-found`, `template`, `route`) et le
  code strictement propre à cette route. Si un composant est réutilisable, il
  remonte dans `components/`.
- Un test vit **à côté** du module qu'il teste, jamais dans un dossier `tests/`
  global. Le contexte est immédiat.
- Un fichier de page n'exporte que des éléments de l'API App Router
  (`default`, `metadata`, `generateMetadata`, `dynamic`, `revalidate`,
  `loading`, `error`). Toute fonction utilitaire va dans `lib/`. C'est
  exactement pourquoi `lib/talent-directory-url.ts` existe : la logique de
  sérialisation des filtres n'a rien à faire dans une page.

---

## §48 — Composants : serveur vs client

### 48.1 Règle

**Par défaut, un composant est un Server Component.** `"use client"` est une
exception qui doit se justifier.

Chaque directive `"use client"` crée une frontière : le composant et tout son
sous-arbre sont envoyés au navigateur. Le coût n'est pas le composant lui-même,
c'est son arbre.

### 48.2 Ce qui justifie un Client Component

| Besoin | Exemple dans le dépôt |
|---|---|
| État local d'interface | `SiteHeaderNav` : menu ouvert / fermé |
| Effet navigateur | verrouillage du défilement, écoute clavier (`Escape`) |
| Hook de navigation | `usePathname` pour la route active |
| Gestion d'erreur interactive | `talents/error.tsx` : `reset()` |

Le dépôt compte **deux** fichiers `"use client"` : `site-header-nav.tsx` et
`talents/error.tsx`. C'est le minimum correct.

### 48.3 Règles

1. **La frontière est le plus haut possible.** Ne pas marquer un parent pour
   éviter de descendre la directive vers l'enfant qui en a réellement besoin.
2. **La liste de liens reste serveur.** `PUBLIC_NAV` est importée d'un module
   serveur et passée au client comme constante de props : aucune donnée n'est
   reconstruite dans le bundle.
3. **Un Client Component ne lit jamais un repository.** Il reçoit des props
   sérialisables. Un composant client qui importe `@/lib/repositories/*` est un
   défaut d'architecture, pas de style.
4. **Les props traversant la frontière sont sérialisables** : pas de fonction, pas
   de `Date` non sérialisable, pas de composant passé en prop depuis le serveur
   sauf via `children`.
5. **`error.tsx` est obligatoirement un Client Component** dans l'App Router.
   Ce n'est pas un choix, c'est la contrainte du framework.
6. **`layout.tsx` et `page.tsx` restent serveur** tant que rien ne l'oblige.

### 48.4 Interdit

- `"use client"` en haut d'un `page.tsx` pour « accéder à `useState` sans
  y échapper ».
- Un composant client qui importe un composant serveur.
- Marquer un layout racine client « pour utiliser un contexte » sans besoin réel.

---

## §49 — Server Actions

### 49.1 État actuel

**Aucune Server Action n'existe.** Aucun `"use server"` dans le dépôt. Les seules
mutations possibles aujourd'hui sont les filtres en `GET` et le formulaire de
contact, qui ne soumet rien.

### 49.2 Règles pour le futur

1. `"use server"` en tête de fichier. Un fichier d'actions ne contient **que**
   des actions exportées — pas de composant, pas de helper non exporté.
2. **Les arguments sont sérialisables** : `string`, `number`, `boolean`, `Date`,
   `FormData`, objets simples. Aucune fonction, aucun composant.
3. **Une action est un point d'entrée public.** Tout ce qui y entre est non
   fiable : revalider (Zod) et réautoriser (`authorize()`) à l'intérieur, jamais
   faire confiance au composant appelant.
4. **Ordre imposé** (`03-system-architecture.md` §28.3) : lire la session →
   résoudre le rôle → valider → autoriser → appliquer la transition → écrire →
   journaliser → revalider.
5. **Retour structuré** : `{ ok: true, data }` ou `{ ok: false, error }`, jamais
   une exception, jamais un `any`.
6. **`updateTag(...)`** dans l'action elle-même pour le read-your-own-writes ;
   `revalidateTag(tag, "max")` pour un contenu tolérant au retard.
7. **`redirect()` en fin d'action**, jamais pendant un rendu.

### 49.3 Server Action ou Route Handler

| Besoin | Mécanisme |
|---|---|
| Mutation depuis un formulaire ou une interaction UI | Server Action |
| Lecture/écriture depuis un client non-React (webhook, intégrateur) | Route Handler |
| Affichage dans une page | Composant serveur qui appelle le use case |

Une route publique **n'appelle pas d'API interne pour afficher une page** : elle
appelle le use case. L'aller-retour HTTP interne n'apporte rien et coûte une
sérialisation.

---

## §50 — API et validation côté serveur

### 50.1 Règle

**Toute donnée entrante est non fiable** : paramètres d'URL, corps de requête,
en-têtes, données de formulaire, données de session. Aucune n'est consommée
directement. Valider, normaliser, puis seulement utiliser.

### 50.2 Emplacement

Toute validation vit dans `src/lib/validation/`, jamais dans un `page.tsx` ni
dans un composant.

| Fichier | Rôle | État |
|---|---|---|
| `validation/candidate-id.ts` | `CANDIDATE_ID_PATTERN` + `CANDIDATE_ID_MAX_LENGTH` | existant |
| `validation/talent-filters.ts` | schéma Zod des paramètres de l'annuaire | existant |

`CANDIDATE_ID_PATTERN` = `/^KJ-\d{4}-\d{4}$/`, longueur maximale 12. Volontairement
strict et ancré : un identifiant malformé ne doit pas atteindre la couche
repository. Ce pattern **n'est pas une autorisation** — c'est une garde d'allocation
et de format.

### 50.3 Ce qui est déjà en place

`parseTalentSearchParams()` :

1. réduit les paramètres répétés à la première occurrence, avec un message
   explicite ;
2. valide les énumérations contre les unions de `src/lib/domain/enums.ts` — liste
   blanche, pas liste noire ;
3. retombe sur des filtres neutres en cas d'échec, et remonte le motif dans
   `issues` ;
4. n'écoule **jamais** une exception : la page reste fonctionnelle.

Les `filterIssues` sont affichés via `Alert tone="warning"`. Un filtre ignoré est
dit à l'utilisateur, pas silencieusement avalé.

### 50.4 Interdit

- `any` sur une donnée entrante, ni une seule fois.
- `as` pour forcer une entrée non typée vers un type métier.
- Une valeur d'URL utilisée sans être passée par le validateur.
- Une exception pour « rejeter silencieusement » un paramètre invalide.
- Un `.max()` manquant sur un champ texte : c'est une garde d'allocation.

---

## §51 — Gestion des erreurs et logs

### 51.1 Deux canaux, jamais mélangés

| Ce qui | Destinataire | Contenu |
|---|---|---|
| Message d'erreur | L'utilisateur | Ce qui s'est passé, en français, et ce qu'il peut faire |
| Journal d'erreur | L'opérateur | L'erreur complète, le contexte, `error.digest` |

`error.digest` est fourni par Next.js en production. Il **n'est jamais affiché**
tel quel à l'utilisateur : c'est une référence d'identification, pas une
explication.

### 51.2 Règles

1. **Message utilisateur générique, détail journalisé.** L'erreur ne révèle ni la
   structure interne, ni les noms de table, ni les clés d'API.
2. **Jamais de stack trace à l'écran.**
3. **Toute erreur est journalisée au passage**, y compris un refus
   d'autorisation : c'est un signal d'audit, pas un bruit.
4. **Un `catch` qui avale l'erreur sans rien faire d'autre est interdit.** Si on
   intercepte, on journalise ou on relance.
5. **`console.error` est autorisé pour le journal d'erreur d'un `error.tsx`**, le
   seul endroit du dépôt qui l'utilise aujourd'hui
   (`talents/error.tsx:24`). Un `console.log` de débogage laissé en place est un
   défaut, pas une habitude.

### 51.3 Formulaires

Un formulaire qui échoue ne montre pas une alerte globale et ne vide pas les
saisies. Les erreurs sont par champ, rattachées par `aria-describedby`, et la
valeur saisie est conservée. Le détail est dans `04-design-system.md` §41.6.

---

## §52 — Accès base de données

### 52.1 État actuel

**Aucune persistance n'est installée.** Pas de `drizzle`, pas de
`drizzle.config.ts`, pas de variable `DATABASE_URL`, aucune migration. L'accès
passe par `MockTalentRepository`, en mémoire, à partir des constantes de
`src/lib/mock/talents.ts`.

### 52.2 Point de bascule

Un seul : `src/lib/repositories/index.ts`, qui exporte
`const talentRepository: TalentRepository = new MockTalentRepository()`. Le jour
du branchement PostgreSQL, **une seule ligne change** :

```ts
export const talentRepository: TalentRepository = new DrizzleTalentRepository(db);
```

Le fichier porte déjà ce commentaire en clair. Aucun autre fichier n'instancie un
repository : c'est la propriété à préserver.

### 52.3 Règles pour le futur

| Règle | Détail |
|---|---|
| Lecture seule dans les modules serveur | `src/lib/db/index.ts`, jamais un composant client |
| Un module d'accès par ressource | Pas de `queries.ts` généraliste fourre-tout |
| Requêtes typées | Drizzle, SQL explicite ; pas d'ORM caché ni de `sql` brut dans un composant |
| Migrations versionnées | Dans `drizzle/`, appliquées **avant** le déploiement applicatif |
| Déploiement additif | Ajouter une colonne, migrer, puis utiliser. Jamais supprimer une colonne dans le même déploiement que le code qui l'utilisait |
| `drizzle-kit` | Dépendance de développement, jamais de runtime |
| Contenu textuel | JSONB, pas une colonne par catégorie ou par compétence |
| UUID technique | La clé primaire est un UUID ; `candidateId` est l'identifiant exposé dans l'URL |

### 52.4 Contenu textuel

Les compétences, langues, expérience, formation et certifications sont un
**contenu structuré variable**, pas une colonne par cas. Un tableau JSONB par
entité est le bon choix ici : la forme varie par métier, et normaliser chaque
langue en table ne rapporterait rien.

---

## §53 — Sécurité applicative en code

### 53.1 Règle de posture

Ce produit manipule des données de personnes réelles : nom, métier, expérience,
localisation, documents, et plus tard des coordonnées. **La confidentialité est
une fonctionnalité, pas une option** (`02-product-vision.md` §9).

### 53.2 Ce qui est déjà garanti par construction

| Garantie | Mécanisme |
|---|---|
| Les coordonnées ne sont pas publiques | Absentes du type `PublicTalent`, par construction |
| Un identifiant malformé n'atteint pas la donnée | `CANDIDATE_ID_PATTERN` testé **avant** tout accès |
| Un profil non publiable ne fuit pas | `isPublishable()` dans le repository, `notFound()` dans la page |
| Le 404 est un vrai 404 | `notFound()` levé dans `generateMetadata` **et** dans le corps, sinon soft 404 |
| Un secret n'est pas versionné | `.env*` ignoré par `.gitignore` |
| Une ressource est inerte par défaut | `NONE` = absence d'entrée dans la matrice RBAC (§28.1) |

Le point est important : **le typage fait le travail**, pas la prudence. Un champ
qui n'existe pas dans le type ne peut pas être exposé par erreur. C'est la
différence entre une sécurité et une attention.

### 53.3 Ce qui manque et doit être traité avant la production

- **Aucune authentification.** En l'absence de Clerk, **aucune donnée privée
  réelle ne peut être stockée**. Ce n'est pas une limite technique, c'est une
  règle : les coordonnées et les documents n'existent pas en base tant que
  l'authentification n'est pas en place.
- **Aucun rate limiting** sur les routes d'écriture ni sur les formulaires.
- **Aucun en-tête CSP.** L'en-tête de sécurité est dans `next.config.ts` ou dans
  `proxy.ts` — il n'est pas écrit.
- **Aucune table d'audit.** `audit_event` est spécifié (§36) mais n'existe pas.
- **Protection CSRF** sur les Route Handler accessibles par cookie : Next.js la
  fournit sur les Server Actions, pas ailleurs.
- **Politique de confidentialité et mentions légales** en `PlaceholderPage`. Elles
  doivent être publiées avant l'ouverture des comptes.

Ces manques sont **visibles et assumés**. Ils ne sont pas des oublis de
documentation : ce sont des étapes non faites, et la page `/confidentialite`
l'annonce au visiteur plutôt que de laisser croire.

### 53.4 Interdit

- Logger une valeur d'environnement, même en développement au-delà du nom.
- Logger une coordonnée, un document, un salaire ou une note interne.
- Afficher une URL d'hôte de base de données ou une stack trace.
- Déclarer une donnée privée dans un type public, même « temporairement ».
- Utiliser un `PLACEHOLDER` de `PlaceholderPage` sans mentionner l'état réel
  dans `06-progress-tracker.md`.

---

## §54 — Authentification et autorisation en code

### 54.1 État actuel

**Ni Clerk, ni session, ni garde de route.** Toutes les pages sont publiques et le
code le dit comme telle. Aucun `proxy.ts` n'existe.

Conséquence directe : la matrice RBAC de `src/lib/domain/permissions.ts` (14
ressources × 5 actions × 6 rôles) est **écrite et testable, mais non branchée**.
Elle n'est consommée par aucun chemin d'exécution. C'est un travail avancé, pas
un travail terminé.

### 54.2 Règles pour le futur

1. **La matrice est l'unique source de vérité** (§28.1). Un composant ne décide
   jamais s'il affiche un bouton ; il appelle `can()` / `authorize()`.
2. **Le rôle vient de la session serveur, jamais de l'entrée** :
   `const { userId, orgId } = await auth()`.
3. **`authorize(role, action, resource)` avant toute écriture**, dans cet ordre
   exact : session → rôle → validation → autorisation → transition → écriture →
   journal → revalidation.
4. **Une absence d'entrée est un refus**, pas une permission par défaut.
   `NONE = []` rend une ressource inerte pour tout le monde tant qu'elle n'est pas
   explicitement accordée.
5. **L'agent ne modifie jamais `permissions.ts` sans justification écrite dans
   `03-system-architecture.md` §28.** C'est une règle de revue, pas une
   préférence.
6. **Les guards de route passent par `src/proxy.ts`** — `middleware.ts` est
   déprécié et renommé `proxy` dans Next.js 16. `proxy.ts` s'exécute sur le
   runtime **Node.js** par défaut, peut lire `process.env`, mais **ne peut pas
   appeler `revalidateTag` / `updateTag`** et n'importe rien de `domain/`, de
   `repositories/` ou de la base. Toute décision d'accès reste dans la page, le
   layout ou le use case.

### 54.3 Contrôle d'accès effectif aujourd'hui

Un seul contrôle d'accès existe, et il est réel : le repository vérifie
`isPublishable()` avant de renvoyer un profil, et la page appelle `notFound()`
sinon. C'est le seul endroit où une autorisation est appliquée à une donnée.

---

## §55 — Git

### 55.1 État actuel

**Aucun commit.** Le dépôt est entièrement non suivi (`git status` liste tous les
fichiers en `??`). `main` existe mais n'a pas d'histoire.

### 55.2 Règles

1. **Ne jamais committer un secret.** `.env*` est ignoré ; `.env.example` sans
   valeur est le seul fichier d'environnement versionnable — et il est lui-même
   ignoré par `.env*`. Le modifier ou l'exclure explicitement fait partie de la
   tâche.
2. **Un commit = une intention.** Un commit qui corrige trois choses sans rapport
   est impossible à relire et impossible à annuler.
3. **Le message dit pourquoi, pas quoi.** Le diff montre déjà le quoi.
4. **Jamais de `force-push` sur une branche partagée**, jamais de réécriture
   d'historique publiée.
5. **`.next/`, `node_modules/`, `/build`, `/out`** ne sont jamais commités — déjà
   ignorés.
6. **Les documents de contexte sont versionnés avec le code.** Un `§` du design
   system qui ne suit pas le code est un mensonge.

### 55.3 Ce qui doit être fait avant le premier commit

- [ ] Vérifier que `pnpm-lock.yaml` est bien présent et cohérent.
- [x] `hero01.png` et `section2.jpeg` ne sont plus importés depuis `public/` :
      les images **utilisées par un composant** vivent dans `src/assets/` et
      s'importent via `@/assets/...`. `public/` ne sert que pour les fichiers
      délivrés par URL (favicon, `robots.txt`, documents). Importer depuis
      `public/` force le bundler à embarquer l'asset et court-circuite
      `next/image`.
- [x] `public/*.svg` supprimés : les cinq assets par défaut de `create-next-app`
      (`next.svg`, `vercel.svg`, `globe.svg`, `window.svg`, `file.svg`) n'étaient
      référencés nulle part. `public/` est désormais vide et attend son premier
      fichier servi par URL (favicon, `robots.txt`).
- [x] `framer-motion` supprimé : déclaré en dépendance, importé nulle part.
- [x] `README.md` réel : stack vérifiable, commandes, sens de dépendance, les
      sept documents, et les six règles non négociables du dépôt.
- [ ] Écrire un `.env.example` sans valeur, en l'excluant explicitement de
      `.env*` si on veut le versionner.

---

## §56 — Environnement et secrets

### 56.1 Règle

Un secret vit **uniquement** dans l'environnement. Jamais dans un fichier
versionné, jamais dans un log, jamais dans un rapport d'agent, jamais dans une
capture d'écran.

Le contrat de variables est dans `03-system-architecture.md` §38.2. La règle
d'accès : lecture **uniquement** dans des modules serveur
(`src/lib/env.ts`, `src/lib/db/index.ts`, `src/lib/clerk.ts`,
`src/lib/mail.ts`). Un composant client ne lit jamais `process.env` directement ;
il reçoit une valeur via props depuis un composant serveur.

### 56.2 État actuel

Aucun fichier `.env*` n'existe. Aucune variable d'environnement n'est lue par le
code — ce qui est cohérent avec l'absence de Clerk, de base et de mail.

`.gitignore` contient `.env*`, ce qui ignore aussi `.env.example`. C'est
prudence, mais cela signifie qu'un `.env.example` ne peut pas être versionné
sans exception explicite.

### 56.3 Interdit

- Un secret dans un fichier versionné, même « pour tester ».
- Logger une valeur d'environnement ; le nom est loggable en développement, la
  valeur jamais.
- `NEXT_PUBLIC_` sur un secret : ce préfixe rend la variable publique par
  construction.
- Déclarer une variable dans le code sans la valider au démarrage — sinon le
  build n'échoue pas sur une variable manquante en production.

---

## §57 — Performance

### 57.1 Budgets

| Indicateur | Cible | Mesure |
|---|---|---|
| LCP (page publique) | < 2,0 s en 4G simulée | build de production |
| INP | < 200 ms | interaction filtre / menu |
| CLS | < 0,1 | bascule de page |
| Poids JS initial | < 120 kB gzip | rapport de build |
| Requêtes tierces sur page publique | 0 | aucune police ni script externe |

### 57.2 Décisions déjà appliquées

- **Typographie par `next/font`** : Fraunces (éditorial) et Plus Jakarta Sans
  (interface), auto-hébergées, `display: "swap"`, axes contrôlés. Aucune requête
  vers un service tiers au runtime.
- **Filtres dans l'URL** : l'annuaire est rendu côté serveur, partageable,
  indexable et fonctionnel sans JavaScript. Aucun état de filtre n'existe
  uniquement en mémoire.
- **`loading.tsx` et `error.tsx`** : squelette de structure et message
  actionnable, pas un spinner nu.
- **Zéro dépendance de données côté client** : pas de SWR, pas de React Query
  tant que le besoin n'existe pas. Une donnée d'annuaire se recharge par
  navigation.
- **Deux Client Components seulement** dans tout le dépôt.

### 57.3 Points de vigilance

- Le tri « pertinence » appelle le moteur de matching pour chaque profil filtré
  (`MockTalentRepository.sort`). En base, ce calcul doit être fait en SQL sur des
  colonnes indexées, ou borné — **jamais** en chargeant tout le vivier pour le
  trier en JavaScript.
- La pagination par offset se dégrade : prévoir le curseur avant ~5 000 profils.
- Les facettes sont recalculées à chaque appel : en base, elles deviennent une
  requête `GROUP BY` distincte avec sa propre période de fraîcheur.

### 57.4 Dépense à supprimer

`framer-motion` est installé (`^13.4.5`) et **n'est importé nulle part** dans
`src/`. C'est une dépendance morte : elle pèse dans le `node_modules`, dans le
verrou, et dans la tête de lecteur. Les transitions du design system sont faites
en CSS (`--ease-kaji`, `--default-transition-duration`). À supprimer, sauf
besoin identifié.

---

## §58 — Tests

### 58.1 État actuel — à lire avant tout le reste

**Runner installé, couche domaine couverte, reste du dépôt non testé.**

| Élément | État |
|---|---|
| Runner | `vitest@5.0.2`, config `vitest.config.mts`, `environment: "node"` |
| Intégration | `pnpm check` enchaîne `lint` → `test` → `typecheck` → `build` |
| Couvert | 108 tests, 7 fichiers, dans `src/` à côté des modules |
| Non couvert | `app/`, `components/`, `lib/use-cases/`, `lib/repositories/`, `lib/mock/` |

Les tests vivent à côté de leur module (`src/lib/domain/matching.test.ts`), sont
nommés d'après le comportement observé et n'importent rien hors de `domain/`.

Ce qui reste non testé est ce qui dépend d'un rendu, d'une requête ou d'un
repository : composants, use cases, repository mock. Ces couches exigent
`jsdom` et des doublures de test, et ne sont pas commencées. Ce n'est pas
assumé pour l'étape 2 : c'est le travail de l'étape 3 du tracker.

### 58.2 Ce qui doit être testé en premier

Par ordre de valeur, pas de volume :

| Priorité | Module | Pourquoi |
|---|---|---|
| 1 | `domain/status-transitions.ts` | Une transition non testée est une transition involontairement permise |
| 2 | `domain/availability.ts` | La disponibilité effective est une promesse faite à un recruteur |
| 3 | `domain/freshness.ts` | Une fraîcheur mal calculée affiche un profil périmé comme disponible |
| 4 | `domain/permissions.ts` | La matrice RBAC est la barrière de sécurité ; un `undefined` non testé est un trou |
| 5 | `domain/matching.ts` | Les poids sont un acte produit ; un test fixe l'intention |
| 6 | `validation/*` | Un validateur qui laisse passer est une faille d'entrée |

### 58.3 Règles

1. Un test vit **à côté** du module : `src/lib/domain/matching.test.ts`.
2. Un test de `domain/` n'importe **rien** d'autre que `domain/`. Ces modules
   doivent rester testables sans DOM, sans base, sans framework — c'est ce qui
   les rend vérifiables.
3. On teste un **résultat**, pas une implémentation. Un test qui casse quand une
   variable est renommée est un mauvais test.
4. Les cas limites sont le contenu : identifiant malformé, date aberrante,
   transition refusée, entrée absente dans la matrice, chaîne de caractères
   cyber-cassable.
5. Un bug trouvé devient un test avant d'être corrigé. Sans cela, il revient.

### 58.4 Ce qui ne se teste pas

- Le rendu visuel d'un composant de design system.
- Le texte d'un `metadata`.
- Une Route Handler sans logique métier propre.

---

## §59 — Accessibilité et responsive en code

### 59.1 Règle

Une page inaccessible est une page non livrée. Les règles complètes sont dans
`04-design-system.md` §43 et §42 ; ce qui suit est la part **code**.

### 59.2 Ce qui est en place

| Élément | Où |
|---|---|
| `lang="fr"` sur `<html>` | `app/layout.tsx` |
| Lien d'évitement `.skip-link` | `app/layout.tsx`, premier élément focusable |
| `:focus-visible` avec `outline` visible | `globals.css`, `@layer base` |
| `aria-current="page"` | en-tête et pagination |
| `aria-label` sur chaque `<nav>` | « Navigation principale », « Navigation mobile », « Pagination des talents » |
| `aria-expanded` / `aria-controls` sur le bouton menu | `SiteHeaderNav` |
| `Escape` referme le panneau mobile | `SiteHeaderNav`, `useEffect` |
| Verrouillage du défilement arrière-plan | `SiteHeaderNav`, `useEffect` |
| `role="status"` + `aria-live` + `aria-busy` sur `LoadingState` | `ui/states.tsx` |
| `role="alert"` sur `Alert tone="danger"` | `ui/alert.tsx` |
| Icônes décoratives `aria-hidden` | tous les composants |
| `prefers-reduced-motion` neutralisé globalement | `globals.css` |
| Cibles tactiles ≥ 44 px sur `Button` `md` et les champs | `ui/button.tsx`, `ui/input.tsx` |
| Mobile-first : le style de base est l'état mobile | tout le dépôt |

### 59.3 Règles de code

1. **Un `h1` par page**, dans l'ordre, sans saut de niveau. Les pages dont le `h1`
   vient d'un composant (`TalentProfileHeader`) le rendent une seule fois.
2. **Aucune information portée par la couleur seule.** Le ton d'un badge est
   toujours accompagné d'un libellé.
3. **Aucun `aria-*` qui contredit le comportement réel.** Un `aria-expanded="true"`
   sur un panneau qui n'est pas monté est un mensonge d'assistance.
4. **Les icônes seules ont un libellé `sr-only`.** Les icônes décoratives ont
   `aria-hidden`.
5. **Une valeur tronquée a toujours son équivalent complet** : `LanguageBadge`
   porte le code court dans `abbr` + `title` + version `sr-only`.
6. **Le rendu est vérifié en `prefers-reduced-motion: reduce`**, pas supposé.
7. **`focus-visible` n'est jamais supprimé.** Supprimer l'outline est un défaut,
   pas une préférence esthétique.

### 59.4 Interdit

- `outline: none` sans remplacement par un indicateur de focus **au moins aussi
  visible**.
- Un `tabIndex` positif (il casse l'ordre de tabulation natif).
- Un `placeholder` en remplacement d'un `<Label>` — un placeholder disparaît dès
  la saisie.
- Un tableau de données métier avec `overflow-x` sur mobile, à la place d'une
  conversion en liste.
- Une image sans texte alternatif, ou avec un texte alternatif qui est un mot-clé.
