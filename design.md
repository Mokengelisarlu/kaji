# design.md — Écrans et parcours

> Ce document est propriétaire des sections **§60 et suivantes**. Il décrit les
> **écrans** et les **parcours**, pas le produit ni l'architecture :
>
> - le produit est dans `02-product-vision.md` ;
> - l'architecture est dans `03-system-architecture.md` ;
> - les composants et tokens sont dans `04-design-system.md` ;
> - les règles de code sont dans `05-development-standards.md` ;
> - l'avancement réel est dans `06-progress-tracker.md`.
>
> **Convention** : chaque écran porte un identifiant stable (`EC-01`, `EC-02`…)
> et un statut. Les parcours (`PA-01`…) sont des suites d'écrans. Un identifiant
> n'est jamais réutilisé.

---

## §60 — Cartographie des écrans

### 60.1 Vue d'ensemble

Le produit public tient en **12 écrans**, dont 3 réellement construits. Le reste
est annoncé honnêtement par `PlaceholderPage`.

| ID | Écran | Route | Statut | Notes |
|---|---|---|---|---|
| `EC-01` | Accueil | `/` | **Livré** | 7 blocs, statique |
| `EC-02` | Annuaire des talents | `/talents` | **Livré** | Dynamique (`searchParams`) |
| `EC-03` | Fiche publique talent | `/talents/[id]` | **Livré** | Dynamique, vrai 404 |
| `EC-04` | 404 | `not-found.tsx` | **Livré** | Ne dépend d'aucune donnée |
| `EC-05` | À propos | `/a-propos` | **Livré** | Contenu éditorial, `index: true` |
| `EC-06` | Créer mon profil | `/candidats` | Placeholder | **Parcours candidat, étape 2** |
| `EC-07` | Opportunités | `/opportunites` | **Livré** | Annonce l'absence d'opportunités, `noindex` |
| `EC-08` | Entreprises | `/entreprise` | **Livré** | Entrée du parcours entreprise vers `EC-11` |
| `EC-09` | Créer un compte entreprise | `/entreprise/inscription` | Placeholder | **Parcours entreprise, étape 2** |
| `EC-10` | Mes demandes de recrutement | `/entreprise/demandes` | Placeholder | Espace authentifié |
| `EC-11` | Contact / demande de profil | `/contact` | **Livré, livraison non branchée** | Formulaire validé ; transport absent |
| `EC-12` | Mentions légales | `/mentions-legales` | **Livré, mentions incomplètes** | `index: true` ; 24 champs à renseigner |
| `EC-13` | Politique de confidentialité | `/confidentialite` | **Livré** | `index: true` ; aligné sur le code réel |

### 60.2 Écrans non cartographiés

Troisfamilles d'écrans sont spécifiées dans `02-product-vision.md` mais n'ont pas
d'identifiant ici, parce qu'elles n'existent pas encore et dépendent toutes de
l'authentification :

| Famille | Contenu | Dépendance |
|---|---|---|
| Espace candidat | Profil éditable, disponibilité, documents, opportunités reçues, retrait de fiche | Clerk + base |
| Espace entreprise | Besoin déposé, suivi de demande, shortlist, demande d'accès profil, entretiens | Clerk + base |
| Espace RH / admin | Vérification, arbitrage, matrice RBAC, journal d'audit, paramètres | Clerk + base + audit |

Ces écrans seront cartographiés avec des identifiants `EC-14` et suivants au
moment où l'authentification sera branchée. Les identifiants sont réservés, pas
attribués.

### 60.3 Navigation

Navigation principale, en-tête (`site-header-nav.tsx`, libellés dans `site.ts`) :

| Libellé | Cible | Écran |
|---|---|---|
| Logo Kaji.com | `/` | `EC-01` |
| Talents | `/talents` | `EC-02` |
| Opportunités | `/opportunites` | `EC-07` |
| Entreprises | `/entreprise` | `EC-08` |
| À propos | `/a-propos` | `EC-05` |
| Contact | `/contact` | `EC-11` |
| **Je cherche un talent** (primaire) | `/entreprise/inscription` | `EC-09` |
| **Créer mon profil** (primaire) | `/candidats` | `EC-06` |

Les deux CTA primaires sont `PRIMARY_CTA.employer` (« Je cherche un talent » →
`/entreprise/inscription`) et `PRIMARY_CTA.candidate` (« Créer mon profil » →
`/candidats`) dans `src/lib/site.ts`. L'en-tête les utilise tous les deux, en
mobile comme en bureau.

Le hero de l'accueil utilise les deux également : action primaire « Découvrir le
vivier » → `/talents`, secondaire « Je cherche un talent » →
`PRIMARY_CTA.employer`, puis « Créer mon profil » → `PRIMARY_CTA.candidate` en
lien. **L'entreprise reste avant le candidat**, conformément au §12, et l'accueil
est cohérent avec l'en-tête.

Il n'existe plus de composant `CtaSection` : il a été supprimé avec la refonte
(`06-progress-tracker.md` §5 écart 8).

Le lien actif est déterminé par `pathname === href || pathname.startsWith(href + "/")`.

Pied de page, quatre colonnes (`FOOTER_NAV` + `LEGAL_NAV`) :

| Colonne | Entrées |
|---|---|
| Vivier | Annuaire des talents `EC-02` · Créer mon profil `EC-06` · Opportunités `EC-07` |
| Entreprises | Créer un compte entreprise `EC-09` · Déposer un besoin `EC-10` · Confier un recrutement `EC-08` |
| Kaji | À propos `EC-05` · Nous contacter `EC-11` · Comment ça marche `EC-02` |
| Légal | Mentions légales `EC-12` · Confidentialité `EC-13` |

Puis la mention d'opérateur : `Kaji.com — Talent & Professional Mediation
Platform`, `Operated by Mokengeli SARLU`.

**11 des 13 écrans sont déjà atteignables** par un lien. Seuls `EC-01` et `EC-03`
n'ont pas d'entrée directe dans la navigation, ce qui est normal : on arrive sur
l'accueil par l'URL ou le logo, et sur une fiche talent par l'annuaire ou un lien
externe.

L'en-tête et le pied de page sont des **composants communs**, pas des écrans. Ils
sont documentés ici parce que leur structure est une exigence produit (mentions
de marque, §27) et pas seulement une décision de rendu.

---

## §61 — Écran EC-01 : Accueil

### 61.1 Rôle

Faire comprendre en 30 secondes **ce qu'est le vivier**, **ce qui le rend
fiable**, et **où aller ensuite**. L'accueil est une page de conviction, pas une
fiche produit.

### 61.2 Structure réelle

Six blocs, dans cet ordre. La page est entièrement statique et prérendue.

| # | Bloc | Contenu |
|---|---|---|
| 1 | Hero | Badge « Vérification · Médiation · Mise en relation », H1 « Votre talent mérite les bonnes opportunités. », paragraphe, trois entrées — primaire « Découvrir le vivier » → `/talents`, secondaire « Je cherche un talent » → `PRIMARY_CTA.employer`, lien « Créer mon profil » → `PRIMARY_CTA.candidate` —, trois indicateurs calculés, image `@/assets/hero01.png` avec annotation manuscrite en SVG |
| 2 | « Notre plateforme » | `lg:grid-cols-[0.95fr_1.05fr]` : image `@/assets/section2.jpeg` à gauche, à droite `SectionHeading` « Un vivier encadré, pas une diffusion de masse » et une liste de 4 engagements (`Profils vérifiés`, `Disponibilités confirmées`, `Accompagnement humain`, `Données protégées`) |
| 3 | « Comment ça marche » | `SectionHeading` « Un parcours encadré, du besoin au placement » puis `<ol>` de 4 étapes (`MEDIATION_STEPS`) : Décrire le besoin → Analyser et qualifier → Arbitrer une shortlist → Présenter et organiser. Chaque étape renvoie à une étape de §18.2 |
| 4 | « Parcourez le vivier » | `lg:grid-cols-[minmax(15rem,0.8fr)_minmax(0,2.2fr)]` : `SectionHeading` + bouton « Explorer tout le vivier » → `/talents`, puis 4 cartes de catégories illustrées (webp) vers `/talents?category=<slug>` |
| 5 | « Quelques profils du vivier » | `getFeaturedTalents(6)` → cartes `TalentCard`, montage conditionnel `featuredTalents.length > 0`, bouton « Explorer le vivier » → `/talents` |
| 6 | « Pourquoi Kaji » | Fond `kaji-950` texte blanc, `SectionHeading` centré « La technologie organise, l'humain décide », schéma radial décoratif (`aria-hidden`) et les 4 `TRUST_POINTS` |

Le hero et le bloc 2 utilisent des `<section>` / `<Section>` distincts du
`SectionHeading` partagé ; le hero n'est pas un `Section` parce qu'il porte sa
propre bordure et son propre fond.

### 61.3 Les indicateurs du hero

Le hero affiche trois chiffres dans un `<dl>`. **Ils sont calculés, jamais écrits
en dur**, via `getTalentPoolStats()` (`src/lib/use-cases/talent.ts`), qui délègue à
`talentRepository.getDirectoryFacets()`.

| Indicateur | Source | Valeur actuelle |
|---|---|---|
| Profils publiés | `facets.totalPublished` | 14 |
| Part vérifiée | `facets.verifiedCount / totalPublished`, arrondi | 71 % |
| Disponibles maintenant | `facets.availableCount` | 9 |

Règle : un chiffre public qui n'est pas dérivé du vivier est une promesse que le
code ne peut pas tenir. Les compteurs de `TALENT_CATEGORIES` (`count: 148`…)
servironnent quand le vivier sera réel ; ils ne doivent pas être affichés avant,
sous peine d'annoncer 148 profils là où l'annuaire en renvoie 3.

Aucun délai de shortlist n'est affiché. Le seul engagement de service publié est
« 48 h ouvrées » pour une demande de profil (§16.2) : afficher « 10 j » ici
contredirait cet engagement sur la même page.

### 61.4 Règles

- **Une seule action primaire par bloc.** Le hero et le bloc 3 sont primaries ;
  les blocs 5 et 6 sont secondaires. Le hero porte trois entrées mais une seule
  primaire : c'est la contrainte de `04` §40.4, pas une décoration.
- **L'ordre des entrées est entreprise avant candidat** (§12). Le hero respecte
  cet ordre : vivier, puis « Je cherche un talent », puis « Créer mon profil ».
- **Toute promesse de la page doit renvoyer à une exigence de
  `02-product-vision.md` ou à une fonctionnalité existante.** C'est la règle qui
  a éliminé « Apprendre · Se former » et « un écosystème complet » : ni
  l'un ni l'autre ne renvoyait à quoi que ce soit. Elle s'applique aussi aux
  chiffres, qui sont calculés plutôt que rédigés (§61.3).
- Le bloc 5 ne montre que des profils publiables. Sélection par use case
  (`verifiedOnly: true`, tri `experience_desc`, exclusion de `UNAVAILABLE`), jamais
  par un filtre ad hoc dans la page. Sur le vivier de démonstration, 2 profils
  sur 15 passent : la grille à 3 colonnes laisse donc une rangée inachevée.
  C'est le comportement correct d'un filtre honnête, et un défaut d'apparence
  que seuls des profils réels corrigeront.
- Aucune coordonnée, aucun score de matching, aucun délai non tenu. Le seul
  engagement de service publié est « 48 h ouvrées » (§16.2).
- Le schéma radial du bloc 6 est `aria-hidden="true"` : il porte le sens, pas
  l'information. Les 4 `TRUST_POINTS` portent le texte.
- Les images sont importées depuis `@/assets/`, jamais depuis `public/`.
- La page ne dépend d'aucune donnée distante : `talentRepository` est statique
  pour l'instant, et le restera en cache pour une base réelle.

### 61.5 Historique des blocs retirés et réintroduits

La refonte de l'accueil a retiré trois blocs. Deux ont été réintroduits ou
supprimés depuis ; un reste à traiter.

| Bloc | Statut | Ce qu'il apportait |
|---|---|---|
| « Comment ça marche » — 4 étapes | **Réintroduit** (bloc 3) | Le seul endroit où le **processus** de médiation était explicite pour un visiteur |
| « Vous êtes candidat / Vous recrutez » | **Non rétabli** | L'articulation des deux viviers. Partiellement repris par `TRUST_POINTS` n° 3 (« Deux viviers distincts »), en une ligne |
| `CtaSection` final | **Supprimé** | La conversion de fin de page. Reporté dans le hero, qui porte les trois entrées |

Le composant `CtaSection` a été supprimé du dépôt : sans consommateur, c'était du
code mort. Inventaire `04` §40.3 ramené à 27 composants.

Le bloc « Comment ça marche » a été réintroduit en version compacte : les dix
étapes du cycle réel de §18.2 sont regroupées en quatre. C'est un tronc, pas une
variante — chaque étape de `MEDIATION_STEPS` renvoie à une étape de §18.2, et le
détail appartient à `EC-08` et à l'espace RH.

Le bloc « Vous êtes candidat / Vous recrutez » reste le manque le plus net. Il
n'a pas été rétabli parce que le hero porte désormais l'entreprise avant le
candidat (§61.4), et qu'un second bloc à deux colonnes aurait été redondant. À
reconsidérer quand `EC-08` existera.

### 61.6 Ce qui manque

- **Aucune preuve sociale** (témoignage, logo client, étude de cas). Volontaire :
  le vivier de démonstration ne peut pas servir de preuve, et un témoignage
  inventé serait pire que son absence.
- **L'articulation des deux viviers n'a plus son bloc dédié** (§61.5). Le bloc
  « Vous êtes candidat / Vous recrutez » n'a pas été rétabli ; `TRUST_POINTS` n° 3
  le tient en une ligne. Le candidat et l'entreprise sont maintenant traités
  côte à côte dans le hero, ce qui est plus direct mais perd l'explication parallèle des
  deux parcours. À reconsidérer avec `EC-08`.
- **`hero01.png` est un PNG de 1,8 Mo** pour un hero rendu à 464 px de large
  maximum (source 1199 × 1312). `next/image` sert une variante redimensionnée au
  navigateur, donc le coût visiteur est maîtrisé ; le coût restant est le poids
  du dépôt et le temps d'optimisation au build. Outil de conversion absent du
  dépôt : voir `06` §5 écart 12.

## §62 — Écran EC-02 : Annuaire des talents

### 62.1 Rôle

**La page qui vend le produit.** Si un visiteur ne trouve pas de profil crédible
ici, le reste du site ne sert à rien.

### 62.2 Structure réelle

```
┌───────────────────────────────────────────────────────────┐
│ En-tête de page : surtitre, H1, sous-titre               │
├──────────────┬────────────────────────────────────────────┤
│ Filtres      │ Alerte « Certains filtres ont été ignorés »│
│ (17rem)      │  seulement si filterIssues n'est pas vide  │
│              ├────────────────────────────────────────────┤
│ - Recherche  │ Filtres actifs (jetons, chacun retirable   │
│ - Catégorie  │  via son URL)                              │
│ - Domaine    ├────────────────────────────────────────────┤
│ - Ville      │ Grille : 1 / 2 / 3 colonnes                 │
│ - Expérience ├────────────────────────────────────────────┤
│ - Langues    │ Pagination : liens réels, fenêtre 5,        │
│ - Contrat    │  ellipses, rel=prev / rel=next             │
│ - Télétravail│                                            │
│ - [Réinit.]  │                                            │
└──────────────┴────────────────────────────────────────────┘
```

Colonne de gauche `h-fit` + `lg:sticky lg:top-20`. La grille de talents passe de
1 à 2 colonnes à `sm`, puis 3 à `lg` (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`),
alors que le décalage filtres/résultats n'apparaît qu'à `lg`.

### 62.3 Règles de fond

Ce sont des décisions produit, pas des détails d'implémentation.

1. **L'URL est l'état.** Chaque combinaison de filtres est une URL propre,
   partageable, indexable et fonctionnelle sans JavaScript. Soumission en `GET`.
2. **Aucun état de filtre n'existe uniquement en mémoire.** Un filtre qui
   disparaît au rechargement est un filtre cassé.
3. **Changer un filtre ramène à la page 1** (R14). Sans cela, on atterrit sur une
   page 4 vide.
4. **Un filtre ignoré est annoncé**, jamais silencieusement avalé. Le
   `Alert tone="warning"` liste ce qui a été rejeté et pourquoi.
5. **Les facettes sont des compteurs réels**, pas des approximations. Une ville
   affichant « 0 » ne doit pas être proposée.
6. **Le tri « pertinence » appelle le moteur de matching** (`scoreTalent`), le
   même que le scoring d'une future demande (§8). Divergence interdite.
7. **La pagination est une navigation**, pas un état : `<Link>` avec
   `rel="prev"` / `rel="next"`, `aria-current="page"`.

### 62.4 États obligatoires

| État | Condition | Rendu |
|---|---|---|
| Chargement | `loading.tsx` | Colonne filtres en `aria-hidden` (purement décorative) + `LoadingState rows={4}` |
| Vide avec filtres | 0 résultat | `EmptyState` + lien « Réinitialiser les filtres » |
| Vide sans filtres | 0 profil publiable | **Non implémenté** — voir `06` §5 écart 1 |
| Erreur | `error.tsx` | `ErrorState` + bouton « Réessayer » |

### 62.5 Ce qui manque

- **Distinction des deux vides** (`06` §5, écart 1). Le message actuel promet
  « le vivier grandit chaque semaine », y compris quand le vivier est vide.
- Tri par other criteria que la pertinence (date de mise à jour, localization
  déjà couverte par les facettes). Non nécessaire au MVP.
- Recherche textuelle côté serveur : la recherche actuelle est un `LIKE` ou une
  correspondance en mémoire, à revoir à l'échelle.

---

## §63 — Écran EC-03 : Fiche publique talent

### 63.1 Rôle

La page qui doit rendre crédible **sans rien céder sur la confidentialité**.
C'est un équilibre : montrer assez pour convaincre, ne rien montrer de privé.

### 63.2 Structure réelle

Colonne principale (ordre imposé par §14.1) :

1. **En-tête** — `candidateId` en mono, badge de vivier, nom, titre, disponibilité
   effective en grand, puis 4 faits : catégorie, localisation, expérience,
   nombre de langues
2. **Résumé professionnel**
3. **Disponibilité** — badge + explication + contrats recherchés + télétravail +
   mention « ne vaut pas engagement de recrutement »
4. **Expérience**
5. **Compétences** — libellés + niveaux auto-déclarés + mention « Kaji ne
   publie aucune note de valeur »
6. **Formation**
7. **Langues**
8. **Certifications**

Colonne latérale (§14.2) :

1. **Carte de conversion** — « Ce profil vous intéresse ? » → « Demander ce
   profil » + « Réponse habituelle sous 48 h ouvrées »
2. **Alerte de confidentialité** — liste explicite de ce qui n'est **pas** publié
3. **Carte secondaire** — « Vous recrutez pour ce type de profil ? »
4. **Mention d'opérateur**

### 63.3 Règles de fond

1. **Aucune coordonnée, jamais.** Ni téléphone, ni email, ni adresse exacte, ni
   document, ni note interne, ni historique. Garanti **par le type**
   (`PublicTalentProfile`), pas par la prudence.
2. **Les coordonnées ne sont pas « masquées ».** Elles ne sont pas présentes dans
   le type. La distinction importe : une donnée absente ne peut pas fuiter par
   oubli de condition.
3. **Un profil non publiable renvoie un vrai 404.** `notFound()` dans
   `generateMetadata` **et** dans le corps — sinon soft 404, et la page
   resterait indexable après retrait.
4. **Chaque section vide affiche une ligne explicite** (« Aucune expérience
   détaillée n'est publiée »), jamais un bloc blanc.
5. **Le niveau de compétence est auto-déclaré**, jamais présenté comme une
   évaluation Kaji. Le libellé le dit, et le `title` du badge le répète.
6. **Le code langue est toujours doublé** : `abbr` + `title` + version `sr-only`.
   « EN » seul n'est jamais l'information lue.
7. **Aucun score de matching n'est affiché publiquement.** Le score est un
   correspondance avec les critères d'un poste, pas une note de valeur d'une
   personne (R9, R10).

### 63.4 Ce qui manque

- **Statut de vérification.** `verificationStatus` existe dans la donnée interne
  (10 `VERIFIED`, 3 `PARTIAL`, 1 `IN_REVIEW`, 1 `UNVERIFIED`) et n'est pas projeté.
  L'en-tête annonce un badge « Vérifié » dans la spec (§14.1) qui n'a pas de
  source de vérité branchée (`06` §5, écart 4).
- Galerie photo. Non nécessaire, et probablement jamais : le produit vend un
  profil professionnel, pas un visage.
- Version imprimable / PDF. Demandé par les recruteurs en interne, pas
  implémenté.

---

## §64 — Écrans EC-04 à EC-13

### 64.1 EC-04 — 404

`src/app/not-found.tsx`. Ne dépend d'aucune donnée — c'est une contrainte : cette
page doit s'afficher même quand la source de données est le problème. Surtitre
« Erreur 404 », message qui distingue le lien obsolète du profil retiré, deux
actions : parcourir les talents, revenir à l'accueil.

### 64.2 EC-05, EC-08, EC-07 — Pages de contenu

`/a-propos`, `/entreprise`, `/opportunites`. Contenu éditorial : la
démonstration du modèle, le refus du vocabulaire « marketplace », les
catégories d'opportunités. En `PlaceholderPage` aujourd'hui.

`/entreprise` est la **page d'entrée du parcours entreprise** : elle doit
expliquer le modèle et refuser le vocabulaire « marketplace ». L'écart est
assumé : la règle est écrite, l'écran qui devrait l'appliquer n'existe pas.

### 64.3 EC-06, EC-09 — Création de compte et de profil

Points d'entrée des deux parcours. Aucun des deux n'est construit, et aucun ne
peut l'être sans Clerk.

| Écran | Parcours | Contenu attendu |
|---|---|---|
| `EC-06` | Candidat, étape 2 | Création de compte puis formulaire de profil : identité, métier, compétences, langues, expérience, formation, visibilité |
| `EC-09` | Entreprise, étape 2 | Création de compte puis déclaration de société |

Point critique du formulaire candidat : le choix de visibilité
(`PUBLIC` / `ON_REQUEST` / `PRIVATE`) doit être explicite et compréhensible. Le
candidat doit comprendre les conséquences de chaque option, pas cocher une case.

### 64.4 EC-10 — Mes demandes de recrutement

Espace authentifié entreprise. Liste des demandes déposées, avec leur état dans le
workflow de recrutement (§17), la shortlist en cours, les entretiens planifiés.
Non constructible avant l'authentification **et** la persistance.

### 64.5 EC-11 — Contact et demande de profil

> **État : livré le 2026-03-15, livraison non branchée.** Le formulaire existe,
> est validé et affiche honnêtement qu'aucun canal n'est configuré. Les
> constats ci-dessous décrivent l'état *avant* livraison ; ils sont conservés
> pour tracer ce que la page doit garantir.

**Le blocage fonctionnel principal.** La page est un `PlaceholderPage` : un
visiteur qui veut agir ne peut pas.

Trois entrées y conduisent aujourd'hui :

| Origine | Libellé | Cible |
|---|---|---|
| `EC-03` | « Demander ce profil » | `/contact?objet=demande-profil&candidat=<candidateId>` |
| En-tête | « Contact » | `/contact` |
| Pied de page | « Nous contacter » | `/contact` |

**Le contrat de pré-remplissage existe déjà dans le code** et la page l'ignore :
la fiche talent construit
`/contact?objet=demande-profil&candidat=${encodeURIComponent(talent.candidateId)}`.
L'écran doit donc lire ces deux paramètres, pré-sélectionner l'objet « Demande de
profil », rattacher la demande au bon `candidateId`, et afficher le nom du profil
concerné. C'est le seul endroit du site où une URL porte un identifiant métier,
et c'est justifié : c'est une demande, pas une navigation.

À noter : les deux CTA primaires de l'en-tête et de l'accueil ne mènent **pas**
ici mais à `/entreprise/inscription` et `/candidats`, tous deux placeholders
également. Les trois CTA principaux du site mènent donc à des pages vides.

Contenu attendu :

| Élément | Exigence |
|---|---|
| Formulaire de besoin | Poste ou mission, compétences, localisation, urgence, contrat, budget |
| Demande de profil | Depuis `EC-03` : profil concerné + motif + urgence |
| Délai annoncé | 48 h ouvrées, engageant (§16.2) |
| Choix du canal | E-mail ou téléphone, mais **jamais les coordonnées du candidat** |
| Confirmation | Réponse immédiate à l'utilisateur, plus un accusé de réception |

Règle structurante : ce formulaire crée une **demande**, il n'envoie pas un
candidat. Le vocabulaire de l'interface est « déposer un besoin », « demander ce
profil », jamais « publier une annonce ».

### 64.6 EC-12, EC-13 — Pages légales

`/mentions-legales` et `/confidentialite`. **Bloquants production** : les
obligations d'information doivent être publiées avant l'ouverture des comptes
(§39.4).

> **État : livrées le 2026-03-15**, avec `robots: { index: true, follow: true }`.
> `placeholderMetadata()` n'est plus utilisé sur ces deux routes.

Les deux pages étaient en `PlaceholderPage`, qui déclare
`robots: { index: false, follow: true }`. C'est le bon comportement pour un
placeholder ; `index: false` a été levé à la livraison.

`placeholderMetadata()` impose le `noindex` à toutes les pages placeholder. Ne pas
l'oublier à l'inverse : une page légale réelle **doit** être indexable, sinon elle
n'est pas opposable.

**Ce qui reste bloquant :** les mentions obligatoires sont inconnues de
l'opérateur (siège, RCCM, capital, directeur de publication, contacts,
hébergeur). Elles sont affichées « à compléter » via `src/lib/legal.ts` plutôt
qu'inventées, conformément à `02` §27.4.3. La page est rédigée, pas
conforme.

---

## §65 — Parcours

### 65.1 PA-01 — Découverte entreprise (partiellement construit)

Deux variantes, parce que l'interface en propose deux.

**Par le CTA primaire** — c'est le chemin principal, celui qu'un visiteur
d'entreprise suit spontanément :

```
EC-01 /                        « Je cherche un talent » (primaire)
      ↓
EC-09 /entreprise/inscription  Créer un compte entreprise   ← BLOQUÉ
```

**Par la découverte** — le chemin qu'un visiteur prend s'il veut d'abord voir :

```
EC-08 /entreprise          Comprendre le modèle
      ↓
EC-01 /                    Le vivier, les engagements, les profils
      ↓
EC-02 /talents             Filtrer le vivier
      ↓
EC-03 /talents/:id         Fiche publique
      ↓
EC-11 /contact?objet=…     Demander ce profil        ← formulaire livré
```

Le second chemin va plus loin : l'entreprise peut lire, décider qu'un profil
l'intéresse et le demander. Le formulaire est désormais construit et
pré-rempli ; il s'arrête là où commence l'étape 5, faute de transport.

**Depuis l'accueil**, l'entreprise dispose de sa propre entrée : le hero porte
« Je cherche un talent » en secondaire, avant « Créer mon profil ». L'accueil et
l'en-tête sont donc cohérents, et l'ordre du §12 est respecté des deux côtés.

**Aucun des chemins ne va au bout.** C'est la conversion perdue : les deux
s'arrêtent sur des pages vides.

### 65.2 PA-02 — Découverte candidat (partiellement construit)

```
EC-01 /              Comprendre le produit, section candidat
      ↓
EC-06 /candidats     « Créer mon profil » (primaire)   ← BLOQUÉ
```

Variante indirecte : `EC-02` → `EC-03` pour voir des profils du même métier, puis
retour au CTA. S'arrête dans les deux cas à `EC-06`.

**Écart notable** : un candidat est incité à créer un compte depuis l'accueil
alors que le seul contenu qui le concerne — des profils de son métier — est
déjà public et gratuit. `EC-06` doit donc expliquer ce que le compte apporte
avant de le demander, sinon l'étape est une friction sans contrepartie (voir
§65.6).

### 65.3 PA-03 — Recrutement complet (spécifié, non construit)

```
EC-09 /entreprise/inscription              Compte entreprise
      ↓
EC-11 /contact (mode « besoin »)           Dépôt du besoin
      ↓
[Espace RH] Analyse, qualification, reformulation
      ↓
[Espace RH] Constitution de la shortlist (3 à 5 profils)
      ↓
[Espace entreprise] Réception de la shortlist argumentée
      ↓
[Espace entreprise] Demande d'accès à un profil
      ↓
[Espace RH] Vérification de la disponibilité en cours
      ↓
[Espace candidat] Information AVANT contact   ← invariant §15.2
      ↓
EC-03 /talents/:id   Fiche publique (déjà construite)
      ↓
[Espace RH] Planification, relances, comptes rendus
      ↓
[Espace entreprise] Sélection ou refus
      ↓
[Espace RH] Formalisation, placement
```

**Aucun écran de cet espace n'existe.** Seuls `EC-03` et `EC-11` sont communs.
Ce parcours est spécifié dans `02-product-vision.md` §17 et entièrement non
construit.

### 65.4 PA-04 — Vie du profil candidat (spécifié, non construit)

```
[Espace candidat] Création et complétion du profil
      ↓
[Espace candidat] Choix de visibilité
      ↓
[Espace candidat] Déclaration de disponibilité
      ↓
[Espace RH] Vérification des justificatifs → VERIFIED
      ↓
[Espace candidat] Actualisation périodique (≤ 30 jours)
      ↓
[Espace RH] Alerte en cas de péremption → RECONFIRMATION
      ↓
[Espace candidat] Retrait de la fiche, à tout moment, sans justification
```

### 65.5 Points de rupture du parcours

| Rupture | Effet | Priorité |
|---|---|---|
| `EC-09` est un placeholder | « Je cherche un talent », entrée principale de l'entreprise sur l'accueil et dans l'en-tête, mène à une page vide | **Critique** |
| Pas d'authentification | `EC-06`, `EC-09`, `EC-10` non constructibles | Critique |
| Pas de persistance | Aucune écriture possible | Critique |
| `EC-11` sans transport | Le formulaire est là, mais la demande n'atteint personne. La page l'affiche ; l'étape 5 doit fournir la persistance et le canal | **Critique** |
| `EC-12` mentions incomplètes | Page rédigée et indexable, mais non conforme : 24 mentions obligatoires manquent | Élevé |
| Vide indistingué dans `EC-02` | Un visiteur sans résultat ne sait pas pourquoi | Moyen |
| Badge « Vérifié » sans source dans `EC-03` | La donnée `isVerified` existe, mais aucun workflow ne la produit (`verify.ts` absent) | Moyen |
| `verificationStatus` non projeté | L'écart vérifié / déclaré est invisible | Moyen |

Résolues depuis la dernière révision : `EC-11` n'est plus un placeholder, son
pré-remplissage fonctionne (objet, `candidateId` et nom du profil sont
affichés), et `EC-12` / `EC-13` sont rédigées et indexables.

Les cinq premières lignes sont celles qui empêchent encore le site de
fonctionner. Trois dépendent de l'étape 5 — authentification, persistance,
transport — et une dépend de l'opérateur : les mentions légales.

Le vide indistingué dans `EC-02` a également été traité (étape 3).

### 65.6 Règle de conception des parcours

**Aucun parcours ne doit avoir d'étape dont la raison d'être n'est pas visible.**
Si une étape existe pour une contrainte technique et pas pour l'utilisateur, elle
est une friction, et la friction se supprime.

Corollaire pour `EC-06` : demander une inscription pour « voir plus » alors que
l'annuaire est déjà public serait une étape sans justification. L'inscription sert
à publier un profil, pas à consulter.

---

## §66 — Cohérence des écrans

### 66.1 Règles transversales

| Règle | Application |
|---|---|
| Un `h1` par écran | `page.tsx` × 2, `not-found.tsx`, et `talent-profile-sections.tsx` pour la fiche |
| Même structure d'alerte de confidentialité | `EC-03` uniquement, pour l'instant |
| Même libellé de CTA pour la même action | `Confier un recrutement`, `Demander ce profil` |
| Aucun état vide sans action | `EC-02` le fait ; `EC-03` le fait par section |
| Aucune coordonnée en clair | `EC-03` uniquement, garantie par le type |
| Mention d'opérateur sur tout écran public | Pied de page global, systématique |
| Aucune donnée sensible dans une URL | `EC-02` : les filtres sont publics par nature |

### 66.2 Vocabulaire imposé

| Concept | Terme dans l'interface | Terme interdit |
|---|---|---|
| Recrutement | Déposer un besoin, Confier un recrutement, Je cherche un talent | Publier une annonce, Répartir une offre, Recruter sur une marketplace |
| Place de marché | Vivier, Talents, Prestataires | Marketplace, Plateforme d'offres, Annuaire d'emplois |
| Relation entreprise | L'entreprise mandate, Kaji rend un résultat | Le client achète un candidat, Accès au vivier |
| Score | Correspondance avec les critères du poste | Note, Évaluation, Qualité du candidat, Pourcentage de succès |
| Disponibilité | Disponibilité effective, à reconfirmer | Disponible (sans réserve), Immédiatement disponible |
| Inscription | Créer mon profil, Créer un compte entreprise | S'inscrire, Postuler, S'abonner |
| Demande | Demander ce profil, Déposer un besoin, Demande de recrutement | Candidature, Postulation, Requête |

Les libellés existants, vérifiés dans `site.ts` : `Je cherche un talent`,
`Créer mon profil`, `Déposer un besoin`, `Confier un recrutement`,
`Annuaire des talents`, `Créer un compte entreprise`, `Nous contacter`.

Deux tensions à trancher plus tard, signalées sans être tranchées ici :

- **« Je cherche un talent »** est un libellé de recherche d'emploi, pas un
  libellé de mandat. Il est plus clair que « Confier un recrutement » pour un
  premier visiteur, et il admet la lecture d'un emploi. Il est aujourd'hui la
  seule entrée entreprise de l'accueil, ce qui rend sa formulation structurante
  : à trancher avec `EC-08`, pas avant.
- **« Déposer un besoin »** mène à `/entreprise/demandes` dans le pied de page,
  écran qui n'existera qu'après authentification. Un utilisateur non connecté
  clique et découvre une page vide. Le pied de page devrait viser `EC-11` tant
  que `EC-10` n'existe pas.

### 66.3 Ce qui fait la cohérence

1. **Un seul design system**, importé partout. Aucun style local dans une page.
2. **Les mêmes mots pour la même chose** : la disponibilité effective porte le
   même libellé sur la carte, sur la fiche et dans les filtres, parce que les
   trois lisent `AVAILABILITY_PRESENTATION`.
3. **Le même ordre d'arguments** : entreprise d'abord, candidat ensuite.
4. **La même honnêteté** : une page non construite le dit, un état vide
   l'explique, un délai est annoncé et tenu.

### 66.4 Cette cohérence se vérifie

| Vérification | Où |
|---|---|
| Un seul `primary` par écran | `04` §40.4 |
| États obligatoires présents | `04` §41.1 |
| Mobile-first, mobile navigable | `04` §42 |
| Clavier, focus, lecteur d'écran | `04` §43 |
| Cohérence de vocabulaire | §66.2 ci-dessus |
| Écran sans étape inexpliquée | §65.6 |

---

## §67 — Feuille de route des écrans

Dépend de `06-progress-tracker.md` §7. Cet ordre n'est pas négociable : livrer un
écran authentifié sans persistance, ou un formulaire sans page légale, crée un
état incohérent.

| Ordre | Écran | Prérequis | Pourquoi cet ordre |
|---|---|---|---|
| 1 | `EC-11` Contact | Zéro | Débloque les deux parcours. Aucun prérequis technique. |
| 2 | `EC-12` Mentions légales | Zéro | Obligation réglementaire. |
| 3 | `EC-13` Confidentialité | Zéro | Obligation réglementaire. |
| 4 | `EC-05` À propos | Zéro | Répond aux questions de confiance. |
| 5 | `EC-08` Entreprises | Zéro | Point d'entrée du parcours entreprise. |
| 6 | `EC-09` Compte entreprise | Clerk + base | Écriture réelle. |
| 7 | `EC-06` Profil candidat | Clerk + base | Idem. |
| 8 | `EC-10` Mes demandes | Clerk + base + workflow | Le plus dépendant. |
| 9 | Espaces RH / admin | Clerk + base + audit | Le plus risqué. |
| 10 | `EC-07` Opportunités | Tout le workflow | Le plus tardif. |

**Trois écrans sans prérequis technique existent déjà** (`EC-11`, `EC-12`,
`EC-13`). Aucun prérequis technique : ils sont les plus rentables et les plus
urgents.

---

## §68 — Réserve

Rien dans ce document n'est une intention produit nouvelle. Les décisions de
contenu appartiennent à `02-product-vision.md`, les contraintes techniques à
`03-system-architecture.md`, et l'état réel à `06-progress-tracker.md`. Si une
ligne ici contredit l'un de ces trois documents, c'est **ce document** qui a
tort.

Un écran décrit ici n'existe que s'il est dans `06-progress-tracker.md` avec un
statut réel. Un écran specifié sans être construit est un placeholder, et il le
reste jusqu'à ce que le code le dise autrement.
