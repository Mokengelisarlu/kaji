# 06 — Progress tracker

> Source unique de l'avancement réel. Un jalon n'est marqué `[x]` que s'il est
> vérifiable dans le code. Une intention n'est pas une livraison.
>
> **Dernière validation** : `pnpm check` (lint + typecheck + build) réussi,
> Next.js 16.3.6, 13 routes — 11 statiques, 2 dynamiques.
>
> Documents liés : `02-product-vision.md` §21 (périmètre MVP),
> `03-system-architecture.md` §39.5 (risques ouverts),
> `05-development-standards.md` §58 (état des tests).

---

## 1. État du dépôt

| Élément | Valeur |
|---|---|
| Framework | Next.js 16.3.6 (App Router, Turbopack) |
| React | 19.2.8 |
| Langage | TypeScript 5, `strict`, `noUncheckedIndexedAccess` |
| Style | Tailwind CSS v4 (`@theme` dans `globals.css`) |
| Paquet | pnpm 11.13.1 |
| Fichiers source | 120 fichiers `.ts` / `.tsx` |
| Volume source | ~12 900 lignes (hors tests) |
| Routes | 25 fichiers `page.tsx` (dont pages candidat authentifiées) |
| Commits git | 12 — historique initialisé |
| Tests | **198** tests Vitest dans 15 fichiers `.test.ts` |
| Base de données | Drizzle ORM + `@neondatabase/serverless` (`candidate_profiles`) |
| Authentification | Clerk (`@clerk/nextjs`) — session serveur, RBAC branché sur les actions candidat |

### Validation

```bash
pnpm lint        # eslint                       → 0 erreur
pnpm typecheck   # next typegen && tsc --noEmit → 0 erreur
pnpm test        # vitest run                   → 198 tests, 15 fichiers
pnpm build       # next build (Turbopack)       → succès
```

`pnpm check` enchaîne lint, test, typecheck et build. Une Pull Request n'est pas
mergeable si l'un des quatre échoue.

---

## 2. Jalons produit

Statuts : `[x]` livré et vérifié · `[~]` partiellement livré · `[ ]` non commencé.

### Phase 1 — Socle public

- [x] **M1 — Page d'accueil** (`src/app/page.tsx`)
  Hero illustré avec CTA vers les opportunités et la création de profil,
  présentation de la plateforme, catégories illustrées, talents en vedette et
  section « Pourquoi Kaji ». Les panneaux candidats/entreprises et le CTA final
  ont été retirés. Prérendue en statique.

- [x] **M2 — Annuaire des talents** (`src/app/talents/page.tsx`)
  Filtres en `GET` dans l'URL, validation Zod, facettes, tri « pertinence »,
  pagination en liens réels, états vide et d'erreur. Route dynamique (`ƒ`) :
  elle dépend de `searchParams`.

- [x] **M3 — Fiche publique talent** (`src/app/talents/[id]/page.tsx`)
  En-tête, 7 sections (résumé, expérience, formation, certifications, langues,
  compétences, disponibilité), colonne de conversion, garde de confidentialité.
  `notFound()` levé dans `generateMetadata` **et** dans le corps → vrai 404.
  Route dynamique.

- [x] **M4 — Couche domaine** (`src/lib/domain/`, 10 modules)
  `enums.ts`, `status-transitions.ts`, `availability.ts`, `freshness.ts`,
  `matching.ts`, `permissions.ts`, `talent.ts`, `person-name.ts`, `period.ts`,
  `visibility.ts`.
  Aucun import externe, aucun React, aucune base. Testable sans DOM.

- [x] **M5 — Design system** (`src/components/ui/`, 11 fichiers)
  Tokens `@theme` (3 échelles de marque + 4 sémantiques, 15 tailles de police,
  6 rayons, 5 ombres), 28 composants documentés dans `04-design-system.md` §40.3.

- [x] **M6 — En-tête, pied de page, mentions de marque**
  `Kaji.com` en marque, `Mokengeli SARLU` en opérateur. Lien d'évitement,
  navigation responsive, pied de page à 4 colonnes.

### Phase 2 — À livrer avant la production

- [x] **M7 — Pages légales et institutionnelles** — *partiellement livré*
  Livré : `/mentions-legales`, `/confidentialite` (en `index: true`),
  `/a-propos`, `/entreprises`, `/opportunites`.
  Restent en `PlaceholderPage` : `/candidats`, `/entreprise/inscription`,
  `/entreprise/demandes` — les deux derniers supposent l'authentification et la
  persistance de l'étape 5, pas une rédaction.
  Les mentions obligatoires sont **rendues visibles comme manquantes** via
  `src/lib/legal.ts` (24 champs « à compléter »), et non inventées : siège,
  RCCM, capital, directeur de publication, contacts, hébergeur. La page est
  donc rédigée mais **non conforme** tant que l'opérateur ne les renseigne pas.
  Le pied de page « Déposer un besoin » pointe désormais sur `/contact` plutôt
  que sur l'espace entreprise non fonctionnel.

- [x] **M8 — Contact / demande de profil** (`/contact`) — *formulaire livré, livraison non branchée*
  Le formulaire existe et est validé (`src/lib/validation/contact.ts`, 27 tests) :
  dépôt d'un besoin et demande de profil, avec le pré-remplissage
  `?objet=demande-profil&candidat=<candidateId>` produit par `EC-03` — objet,
  identifiant et nom du profil sont effectivement affichés.
  **Aucun canal de livraison n'est configuré.** La soumission renvoie donc
  `unconfigured` et l'interface l'affiche : aucune confirmation d'envoi n'est
  montrée, ce qui serait un mensonge puisque l'étape 5 doit encore apporter la
  persistance et les notifications. Un `?objet` inconnu retombe sur le dépôt de
  besoin ; une demande de profil sans `candidateId` valide renvoie 404.

### Phase 3 — Hors MVP, spécifié non implémenté

- [~] Espaces authentifiés — *espace candidat livré, entreprise/RH/admin non commencés*
- [ ] Workflow de recrutement (§17) et registre des demandes
- [ ] Opportunités publiées
- [ ] Documents et pièces justificatives
- [ ] Notifications (e-mail, in-app)
- [x] Persistance (Neon + Drizzle) — schéma, migrations `0001`–`0003` appliquées, `DrizzleTalentRepository` actif
- [x] Authentification (Clerk) — session serveur + rôles issus des *claims*, RBAC branché

---

## 3. Exigences métier

Les 18 exigences transverses de `02-product-vision.md` §19.3, avec leur source
réelle dans le code.

| # | Exigence | Source dans le code | État |
|---|---|---|---|
| R1 | Avoir un compte ≠ être disponible | `availability.ts` | `[x]` |
| R2 | La disponibilité affichée est la disponibilité **effective** | `availability.ts`, `availability-presentation.ts` | `[x]` |
| R3 | Un profil de plus de 30 jours n'affiche jamais « Disponible » | `FRESHNESS_THRESHOLDS_DAYS` | `[x]` |
| R4 | Seuls `VERIFIED`, `AVAILABLE`, `OPEN_TO_OPPORTUNITIES` sont présentables | `PRESENTABLE_STATUSES` | `[x]` |
| R5 | Toute transition non listée est refusée | `status-transitions.ts` | `[x]` |
| R6 | `PLACED` est un état final | `status-transitions.ts` | `[x]` |
| R7 | Une fiche non publiable renvoie un vrai 404 | `notFound()` dans `generateMetadata` | `[x]` |
| R8 | Aucune coordonnée dans une route publique | `PublicTalent` par construction | `[x]` |
| R9 | Aucune note de valeur d'un candidat n'est publiée | `matching.ts` | `[x]` |
| R10 | Le score n'est jamais un pourcentage de qualité | `matching.ts`, textes §14 | `[x]` |
| R11 | Le refus par défaut est la règle en autorisation | `permissions.ts` (`[]` = refus), consommée par `auth/guard.ts` (`requirePermission`) et branchée dans les actions candidat | `[x]` |
| R12 | Le rôle vient exclusivement de la session serveur | `auth/session.ts` + `auth/role.ts` (`sessionClaims.metadata.role`, repli `CANDIDATE`) | `[x]` |
| R13 | Toute URL de filtre est validée par liste blanche | `talent-filters.ts` | `[x]` |
| R14 | Changer un filtre ramène à la page 1 | `buildDirectoryHref()` | `[x]` |
| R15 | Kaji.com = marque, Mokengeli SARLU = opérateur | `BRAND`, footer | `[x]` |
| R16 | Les données de démonstration sont marquées | `src/lib/mock/` | `[x]` |
| R17 | Un profil retiré reste consultable par l'équipe qui l'a retiré | §9.4 | `[ ]` pas de statut `ARCHIVED` ni de workflow de retrait |
| R18 | Le refus de RH est définitif sans arbitrage humain | `verify.ts` à créer | `[ ]` `use-cases/verify.ts` n'existe pas |
| R19 | Identité structurée Nom/Postnom/Prénom, postnom facultatif, affichage « Nom Postnom Prénom » | `person-name.ts`, `schema.ts` (`last_name`/`post_name`/`first_name`), formulaires onboarding & édition | `[x]` |
| R20 | Dates de parcours au mois et à l'année, jamais de jour, fin ≥ début | `period.ts`, `candidate-profile.ts` (validation), formulaires | `[x]` |
| R21 | Inscription candidat guidée en 10 étapes, brouillon local restauré, retour automatique à l'étape en erreur | `src/app/candidat/onboarding/candidate-profile-form.tsx`, `candidate-profile-draft.ts` | `[x]` |

**19 exigences livrées, 0 partiellement, 2 non commencées.** Les 2 « non commencées »
(R17, R18) ne sont pas des bugs : ce sont des étapes non faites, et elles sont
nommées ici plutôt que laissées en attente.

---

## 4. Risques ouverts

Repris de `03-system-architecture.md` §39.5, avec le statut réel.

| Risque | Gravité | Statut | Condition de levée |
|---|---|---|---|
| Aucune authentification | **Bloquant production** | Partiellement traité | Session serveur + RBAC branchés sur les actions candidat ; attribution des rôles (métadonnée Clerk) et espaces entreprise/RH/admin restants |
| Aucune persistance | **Bloquant production** | Traité | Neon + Drizzle actifs (`DrizzleTalentRepository`), migrations `0001`–`0003` appliquées |
| Aucun test | Élevé | Traité | 198 tests Vitest, intégrés à `pnpm check` |
| Aucun rate limiting | Élevé | Non traité | Limiteur sur les routes d'écriture et les formulaires |
| Aucun en-tête CSP | Moyen | Non traité | CSP + `nosniff` + `DENY` en production |
| Aucune table d'audit | Moyen | Non traité | `audit_event` créée et alimentée |
| Pages légales en placeholder | **Bloquant production** | Partiellement traité | Pages rédigées et indexables, mais 24 mentions obligatoires restent à renseigner par l'opérateur |
| Formulaire de contact absent | **Bloquant fonctionnel** | Partiellement traité | M8 (formulaire + validation) livré ; canal de livraison à configurer |
| `framer-motion` inutilisé | Faible | À nettoyer | Dépendance supprimée ou besoin identifié |
| Assets `create-next-app` non utilisés | Faible | À nettoyer | `public/*.svg` supprimés |
| `README.md` par défaut | Faible | À nettoyer | README réel |
| Repository sans commit | Moyen | Traité | 12 commits |

**2 blocages durs** : pages légales (mentions à renseigner) et livraison du
formulaire de contact. L'authentification est partiellement traitée et n'est plus
un blocage de code. Aucun de ces points n'est un défaut de code — ce sont des
étapes non faites.

---

## 5. Écarts de qualité identifiés

Découverts pendant la rédaction des documents, vérifiés dans le code.

| # | Écart | Où | Correction proposée |
|---|---|---|---|
| 1 | L'annuaire ne distingue pas « vivier vide » et « aucun résultat pour ces filtres » ; le message promet « le vivier grandit chaque semaine » dans les deux cas | `app/talents/page.tsx:95` | **Fait** : deux `EmptyState` distincts, avec titre, description et icône différents (`Users` pour un vivier vide, `SearchX` pour un filtrage sans résultat). L'action « Réinitialiser les filtres » n'apparaît que dans le second cas, où elle a un sens. Vérifié en HTTP : `?category=inexistant` affiche « Aucun profil ne correspond », jamais « Le vivier est en cours de constitution ». Cette seconde branche reste inatteignable tant que le vivier de démonstration contient 14 profils — elle le sera au démarrage d'un déploiement réel |
| 2 | `R11` — la matrice RBAC (14 ressources × 5 actions × 6 rôles) n'est consommée par aucun chemin d'exécution | `lib/domain/permissions.ts` | **Fait** : `auth/guard.ts` expose `requirePermission(action, resource)`, qui consomme `authorize()` et refuse par défaut. Branché dans les actions candidat (mise à jour/suppression de profil, édition de blocs) ; le rôle provient de `auth/session.ts` |
| 3 | M4 est annoncé « testé manuellement » dans `02-product-vision.md`, mais aucun test n'existe | `02-product-vision.md` §21.1 | **Fait** : 108 tests Vitest (`src/**/*.test.ts`), intégrés à `pnpm check` ; `02` §21.1 reformulé en conséquence |
| 4 | Le champ `verificationStatus` existe dans `MockTalentRecord` (10 `VERIFIED`, 3 `PARTIAL`, 1 `IN_REVIEW`, 1 `UNVERIFIED`) mais n'est **pas** projeté dans `PublicTalent` : l'écart entre « vérifié par Kaji » et « déclaré par le candidat » n'est jamais affiché | `lib/mock/talents.ts`, `lib/domain/talent.ts` | Décider : projeter un statut de vérification, ou documenter que seul le statut de présence est public |
| 5 | `daysSinceProfileUpdate` est stocké en **nombre de jours** puis converti en `Date` par `daysAgo()` au moment de la projection (`talents.ts:867`) : le calcul de fraîcheur dépend donc du module entier, et non du repository | `lib/mock/talents.ts:40-47` | **Fait** : `MockTalentRecord` porte désormais `lastProfileUpdateAt: Date` et `lastAvailabilityConfirmationAt: Date`. Les 15 records sont inchangés, `toPublicTalent()` ne connaît plus l'ancre temporelle. `05` §44.3 mis à jour |
| 6 | Le dépôt n'a aucun commit, alors que `pnpm-lock.yaml` est prêt | git | **Fait** : commit `1021ab5`, 81 fichiers |
| 7 | **Corrigé** — la landing affichait `700+ profils`, `60% vérifiés`, `10 j pour une shortlist` et `{category.count}` (148 pour l'informatique) alors que le vivier contient 14 profils publiés, dont 3 en informatique. Le CTA primaire menait aussi à `/opportunites`, placeholder hors MVP | `app/page.tsx` | **Fait** : `getTalentPoolStats()` calcule les trois chiffres depuis `getDirectoryFacets()` ; compteurs par catégorie retirés ; CTA primaire → `/talents` ; délai de shortlist retiré (l'engagement publié reste 48 h ouvrées) |
| 8 | `CtaSection` n'était plus monté nulle part depuis la refonte de l'accueil : code mort | `components/cta/cta-section.tsx` | **Fait** : composant et dossier `src/components/cta/` supprimés ; inventaire `04` §40.3 ramené à 27 composants. Le hero porte désormais lui-même les trois entrées (§12) |
| 9 | `hero01.png` (1,8 Mo) et `section2.jpeg` (377 Ko) importés via `../../public/` : convention contraire à `05` §47, et bundling d'assets destinés à être servis par URL | `app/page.tsx` | **Fait** : images déplacées dans `src/assets/`, imports via `@/assets/` |
| 10 | Le hero annonçait « Apprendre · Se former · Réussir » et « un écosystème complet pour votre réussite », sans aucune fonctionnalité de formation dans le produit | `app/page.tsx` | **Fait** : badge → « Vérification · Médiation · Mise en relation » ; titre → « Un vivier encadré, pas une diffusion de masse » ; description recentrée sur la vérification, la disponibilité et l'interlocuteur |
| 11 | Le hero n'offrait plus d'entrée entreprise : `PRIMARY_CTA.employer` n'était plus appelé que par l'en-tête, en contradiction avec l'ordre « entreprise avant candidat » du §12 | `app/page.tsx` | **Fait** : « Je cherche un talent » restauré en secondaire du hero, « Créer mon profil » en lien tertiary |
| 12 | `hero01.png` fait 1,8 Mo en PNG sans perte pour un hero rendu à 464 px de large maximum (source 1199 × 1312) | `assets/hero01.png` | **Non fait, faute d'outil** : ni `cwebp`, ni ImageMagick, ni `sharp` dans le dépôt. `next/image` sert une variante WebP/AVIF redimensionnée au navigateur, donc le coût pour le visiteur est maîtrisé ; le coût restant est le poids du dépôt et le temps d'optimisation au build. Re-exporter en WebP à la source, ou ajouter `sharp` comme dépendance de développement |
| 13 | La validation de `searchParams` est globale et non par champ : un seul paramètre fautif (`?sort=inconnu`) vide **tous** les filtres, y compris une catégorie valide. Comportement conforme au commentaire du module, mais l'utilisateur perd son filtre métier sans que l'interface le dise | `lib/validation/talent-filters.ts:130` | Décider : validation par champ avec fusion des valeurs valides, ou affichage explicite de l'avertissement déjà produit par `issues`. Verrouillé par un test dans `talent-filters.test.ts` |
| 14 | `AvailabilityInput.lastAvailabilityConfirmationAt` est déclaré et documenté, mais jamais lu : la disponibilité effective se fonde sur la seule mise à jour du profil. `freshness.ts:22` affirme que `resolveEffectiveAvailability` traite ce champ séparément — il ne le fait pas | `lib/domain/availability.ts:24` | Soit l'utiliser comme seconde source de fraîcheur, soit le retirer du type et corriger le commentaire. Une reconfirmation explicite plus récente que la mise à jour du profil n'a aujourd'hui aucun effet |
| 15 | Les mentions légales obligatoires sont inconnues (siège, RCCM, capital, directeur de publication, contacts, hébergeur) : `/mentions-legales` les affiche donc comme « à compléter » | `src/lib/legal.ts`, `app/mentions-legales/page.tsx` | **Bloquant production**. Renseigner `OPERATOR` ; `PENDING_LEGAL_FIELDS` est exporté pour que la liste vide soit vérifiable. Une mention inventée engagerait une entité réelle (`02` §27.4.3), d'où l'affichage explicite plutôt qu'une valeur plausible |
| 16 | `/contact` valide et affiche la demande mais ne la livre à personne : aucun transport n'est configuré, donc la soumission renvoie `unconfigured` | `lib/use-cases/contact.ts`, `app/contact/actions.ts` | **Bloquant fonctionnel**. Remplacer `unconfiguredTransport` par un transport réel (étape 5 : persistance + notifications). Tant que ce n'est pas fait, aucune confirmation d'envoi n'est affichée — c'est délibéré : un accusé de réception sans destinataire serait un mensonge |
| 17 | `/opportunites` est en `noindex` : elle ne décrit que des catégories et l'absence d'opportunités publiées | `app/opportunites/page.tsx` | Passer en `index: true` quand de vraies opportunités existent. Tant que la page annonce une absence, l'indexer n'apporte rien et occupe un emplacement de résultats sur une promesse non tenue |

Les écarts 7, 9, 10 et 11 ont été corrigés le jour de la refonte de l'accueil.
Ils formaient une seule famille : **des promesses publiques que le code ne peut
pas tenir**. Trois sous-formes, à surveiller séparément parce qu'elles ne se
ressemblent pas :

| Forme | Exemple | Détection |
|---|---|---|
| Chiffre écrit en dur | `700+ profils`, `148 profils` | Simple : comparer à `getDirectoryFacets()` |
| Chiffre lu depuis un référentiel de démonstration | `category.count` | Simple : le référentiel est dans `src/lib/mock/` |
| Promesse en texte | « Apprendre · Se former », « 10 j pour une shortlist » | **Difficile** : il n'y a pas de test qui la rattache à une fonctionnalité |

La troisième forme est la plus coûteuse, parce qu'aucune erreur de compilation ne
la signale et qu'elle se glisse dans une refonte graphique. La règle à appliquer
avant de valider une refonte de landing : **chaque promesse de la page doit
renvoyer à une exigence de `02-product-vision.md` ou à une fonctionnalité
existante.** Si elle ne renvoie à rien, c'est une fausse promesse, même écrite
élégamment.

Reste l'écart 12 (`hero01.png`), seul item non résolu : il demande un outil de
conversion d'image que le dépôt ne contient pas.

L'écart 4 est le plus intéressant : le jeu de données distingue réellement le
niveau de vérification (10 `VERIFIED`, 3 `PARTIAL`, 1 `IN_REVIEW`,
1 `UNVERIFIED`) de la visibilité (14 `PUBLIC`, 1 `ON_REQUEST`), et 1 profil est
`ARCHIVED`. La répartition des statuts (5 `AVAILABLE`, 2 `OPEN_TO_OPPORTUNITIES`,
2 `VERIFIED`, 2 `PREQUALIFIED`, 1 `NEW`, 1 `CONTACTED`, 1 `IN_PROCESS`,
1 `UNAVAILABLE`) et des fraîcheurs (3 à 134 jours) est riche et cohérente avec ce
que le moteur de disponibilité doit produire.

---

## 6. Décisions prises, à confirmer

Décisions d'architecture documentées mais non arbitrées. Elles ne bloquent rien
aujourd'hui ; elles le feront à l'ouverture.

| Décision | Valeur retenue par défaut | Où c'est dit | À confirmer par |
|---|---|---|---|
| Fournisseur d'e-mails | `RESEND_API_KEY` (ou équivalent) | `03` §38.2 | l'équipe, avant notification |
| Stockage objet | Compatible S3 (ou équivalent) | `03` §38.2 | l'équipe, avant documents |
| Région Neon | Plus proche des utilisateurs (RDC / Cameroun / Europe de l'Ouest) | `03` §31.1 | l'équipe, à l'ouverture |
| Plateforme de déploiement | Vercel | `03` §31.1 | l'équipe, à l'ouverture |
| Fournisseur de tests | Aucun pour l'instant | `05` §58 | l'équipe, avant M7 |

---

## 7. Ordre de travail recommandé

Séquence proposée. Chaque étape est petite, vérifiable, et laisse le dépôt dans
un état valide.

### Étape 1 — Débloquer la production sans dépendance externe

1. ~~Supprimer `framer-motion` (dépendance morte) et `public/*.svg` (assets
   par défaut).~~ **Fait** — `pnpm remove framer-motion`, cinq SVG supprimés,
   `pnpm check` au vert. Dépendances restantes : 8, dont 7 importées
   directement ; `react-dom` n'est importée nulle part mais reste requise comme
   peer dependency de React 19 par Next.js.
2. ~~Remplacer `README.md` par un README réel.~~ **Fait** — stack, commandes,
   structure, sens de dépendance, sept documents, règles non négociables.
   Chaque affirmation vérifiable du README a été confrontée au code.
3. ~~Premier commit.~~ **Fait** — `1021ab5`, 81 fichiers, premier commit de
   l'historique. L'arbre est propre.

### Étape 2 — Tests sur la couche domaine

4. ~~Installer un runner (`vitest`) et ajouter le script à `pnpm check`.~~
   **Fait** — `vitest@5.0.2`, scripts `test` / `test:watch`, `check` devient
   `lint && test && typecheck && build`. Config `vitest.config.mts` en
   `environment: "node"` : un test qui demanderait `jsdom` ne testerait pas le
   domaine. `@types/node` monté de `^20` à `^24`, exigé par vitest 5 ;
   `pnpm peers check` est propre et `pnpm typecheck` reste vert.
5. ~~Couvrir dans l'ordre de valeur de `05` §58.2.~~ **Fait** — 108 tests,
   7 fichiers, dans cet ordre :

   | Priorité | Module | Tests |
   |---|---|---|
   | 1 | `domain/status-transitions.ts` | 16 |
   | 2 | `domain/availability.ts` | 15 |
   | 3 | `domain/freshness.ts` | 16 |
   | 4 | `domain/permissions.ts` | 16 |
   | 5 | `domain/matching.ts` | 20 |
   | 6 | `validation/candidate-id.ts` | 8 |
   | 6 | `validation/talent-filters.ts` | 17 |

   Total 108, relevé sur la sortie de `vitest`, pas compté à la main.

   `enums.ts` et `talent.ts` ne sont pas testés : le premier ne contient que
   des constantes, le second que des types.
6. ~~Corriger `M4`.~~ **Fait** — `02` §21.1 annonce désormais « 108 tests
   Vitest » et nomme ce qui n'est pas couvert.

### Étape 3 — Corriger les écarts de qualité

7. ~~Deux `EmptyState` distincts sur l'annuaire (écart 1).~~ **Fait.**
8. ~~Rendre la fraîcheur calculable hors du module mock (écart 5).~~ **Fait.**
9. Décider du sort de `verificationStatus` (écart 4) et documenter.
   **Décision produit requise** — les deux options ont un coût différent.
10. ~~Rendre visible ou assumer l'état de la matrice RBAC (écart 2).~~ **Fait** —
    `requirePermission` consomme la matrice dans les actions candidat.

### Étape 4 — Contenu et parcours

11. Livrer M8 (formulaire de contact + demande de profil). C'est le levier
    produit le plus rentable : sans lui, le site ne convertit pas.
12. Livrer M7 (pages légales). Prérequis réglementaire, pas une option.
13. Écrire les pages institutionnelles (`/a-propos`, `/entreprises`,
    `/opportunites`) pour qu'ils cessent d'être des placeholders.

### Étape 5 — Infrastructure

14. ~~Clerk : intégration, session, `proxy.ts`, branchement de la matrice RBAC.~~
    **Fait (partiel)** — session serveur (`auth/session.ts`), rôles (`auth/role.ts`),
    gardes (`auth/guard.ts`) et branchement RBAC des actions candidat. Restent :
    attribution des rôles via la métadonnée Clerk et espaces entreprise/RH/admin.
15. ~~Neon + Drizzle : schéma, migrations, `DrizzleTalentRepository`, bascule dans
    `repositories/index.ts`.~~ **Fait.**
16. `audit_event` + rate limiting + en-têtes CSP.
17. Notifications e-mail.

**Ne pas commencer l'étape 5 avant l'étape 2.** Brancher une base sans tests sur
la couche domaine revient à écrire des requêtes SQL qu'aucun test ne protège.

---

## 8. Comment mettre à jour ce fichier

1. À la fin de chaque tâche, vérifier ce qui a réellement changé.
2. Cocher `[x]` uniquement si le code le prouve.
3. Ajouter l'écart si la tâche crée une dette visible.
4. Réordonner la section 7 si la priorité change.
5. Ne pas gonfler le périmètre : un jalon hors MVP reste hors MVP, il ne devient
   pas un objectif.

Le suivi de l'avancement des documents de contexte lui-même est dans
`01-ai-workflow.md`. Celui du produit est ici.
