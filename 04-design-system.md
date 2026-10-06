# 04 — Design system

> Ce document est propriétaire des sections **§40 à §43**. Les tokens ne sont pas
> définis ici : ils vivent dans `src/app/globals.css`, et ce document est leur
> spécification. Toute divergence entre les deux est un bug, dans un sens ou dans
> l'autre.
>
> Le registre complet des sections figure dans `01-ai-workflow.md` §2.
> Le vocabulaire produit vient de `02-product-vision.md`.

---

## §40 — Catalogue de composants

### 40.1 Principe

Trois règles, dans cet ordre de priorité.

1. **Le design system est agnostique produit.** `src/components/ui/` ne connaît
   ni Kaji, ni un métier, ni une règle de disponibilité. Il ne sait pas ce qu'est
   un talent. Un composant qui a besoin de le savoir vit dans
   `src/components/talent/`, `src/components/cta/` ou `src/components/layout/`.
2. **Pas de valeur en dur.** Couleur, espacement, rayon, taille de police et
   ombre sortent des tokens `@theme` de `globals.css`. Un composant qui écrit
   `oklch(...)`, `#hex`, `p-[13px]` ou `text-[15px]` en ligne est un défaut, même
   si la valeur est « juste pour ce cas ».
3. **L'accessibilité est la valeur par défaut, pas une option.** Un composant est
   utilisable au clavier, lisible au contraste requis et restitué par un
   lecteur d'écran, sans travail supplémentaire du consumer.

Le catalogue existant est **complet pour le MVP public**. Ajouter un composant est
un acte documenté (§1.4) : la checklist d'ajout est en §40.8.

### 40.2 Arborescence

```
src/components/
  ui/            design system — agnostique produit
    alert.tsx        Alert
    badge.tsx        Badge
    button.tsx       Button
    card.tsx         Card, CardHeader, CardTitle, CardDescription,
                     CardContent, CardFooter
    input.tsx        Input, Select, Textarea, Label, SearchInput
    layout.tsx       Container, Section, SectionHeading
    pagination.tsx   Pagination
    placeholder-page.tsx  PlaceholderPage, placeholderMetadata
    slot.tsx         Slot
    states.tsx       EmptyState, ErrorState, LoadingState
    toaster.tsx      Toaster (notifications temporaires)
  layout/        site-header.tsx, site-header-nav.tsx, site-footer.tsx
  talent/        availability-badge, availability-presentation, language-badge,
                 skill-badge, talent-card, talent-filters, talent-grid,
                 talent-profile-sections
  cta/           cta-section.tsx
```

### 40.3 Inventaire

| Composant | Fichier | Variantes | Sert à |
|---|---|---|---|
| `Button` | `ui/button.tsx` | `primary`, `accent`, `secondary`, `ghost`, `link`, `danger` × `sm`/`md`/`lg` × `block` | Action déclenchant une mutation ou une navigation |
| `Badge` | `ui/badge.tsx` | `neutral`, `brand`, `accent`, `success`, `warning`, `danger`, `info`, `solid` × `sm`/`md` | Étiquette courte, non interactive |
| `Card` | `ui/card.tsx` | — | Conteneur de contenu structuré |
| `Input` | `ui/input.tsx` | — | Saisie texte |
| `Select` | `ui/input.tsx` | — | Choix dans une liste fermée |
| `Textarea` | `ui/input.tsx` | — | Saisie multiligne |
| `Label` | `ui/input.tsx` | — | Étiquette de champ, liée par `htmlFor` |
| `SearchInput` | `ui/input.tsx` | `onClear` | Recherche avec icône et réinitialisation |
| `Alert` | `ui/alert.tsx` | `info`, `success`, `warning`, `danger`, `neutral` | Message contextuel lié à la page |
| `Container` | `ui/layout.tsx` | `default` (`max-w-6xl`), `wide` (`max-w-7xl`), `narrow` (`max-w-3xl`) | Largeur et gouttières |
| `Section` | `ui/layout.tsx` | `spacing`: `sm`/`md`/`lg` × `divider` | Bloc vertical de page |
| `SectionHeading` | `ui/layout.tsx` | `align`, `eyebrow`, `as` | Surtitre + titre + sous-titre |
| `Pagination` | `ui/pagination.tsx` | — | Navigation par pages, en liens réels |
| `Slot` | `ui/slot.tsx` | — | Polymorphisme (`asChild`) |
| `EmptyState` | `ui/states.tsx` | — | Liste vide |
| `ErrorState` | `ui/states.tsx` | — | Erreur bloquante d'un écran |
| `LoadingState` | `ui/states.tsx` | `rows` | Chargement, structure réservée |
| `PlaceholderPage` | `ui/placeholder-page.tsx` | — | Route annoncée mais non construite |
| `Toaster` | `ui/toaster.tsx` | — | Confirmation temporaire globale, montée dans le layout (§40.7) |
| `AvailabilityBadge` | `talent/availability-badge.tsx` | par disponibilité effective | Disponibilité calculée (§3.1) |
| `SkillBadge` | `talent/skill-badge.tsx` | — | Compétence auto-déclarée |
| `LanguageBadge` | `talent/language-badge.tsx` | auto-déclaré vs non | Langue et niveau auto-déclarés |
| `TalentCard` | `talent/talent-card.tsx` | — | Fiche condensée dans une grille |
| `TalentGrid` | `talent/talent-grid.tsx` | — | Grille de cartes, 1/2/3 colonnes |
| `TalentFiltersForm` | `talent/talent-filters.tsx` | — | Filtres en `GET` (§13) |
| `SiteHeader` | `layout/site-header.tsx` | — | En-tête public, marque + opérateur |
| `SiteHeaderNav` | `layout/site-header-nav.tsx` | bureau / mobile | Navigation principale |
| `SiteFooter` | `layout/site-footer.tsx` | — | Pied de page, mentions légales (§27) |

### 40.4 Buttons

| Variante | Usage | Interdite pour |
|---|---|---|
| `primary` | Action principale d'un écran, une seule fois par écran | Tout le reste |
| `accent` | Action principale sur fond sombre (bloc CTA) | Fond clair |
| `secondary` | Action secondaire, action de retour | Action principale |
| `ghost` | Action tertiaire, navigation discrète, icône | Action principale |
| `link` | Lien qui ressemble à un bouton | Navigation standard — utiliser un `<Link>` nu |
| `danger` | Action de suppression, confirmée | Tout le reste |

Règles :

- **Un seul `primary` par écran.** Deux boutons primaires sont deuxpriorités
  concurrentes, donc un défaut de hiérarchie.
- **Taille** : `sm` (36 px) pour les actions en ligne dense (barre d'outils,
  pagination), `md` (44 px) par défaut, `lg` (48 px) pour l'action principale
  d'un bloc de conversion. La taille est choisie par la distance à l'œil, pas
  par l'importance du métier.
- **`asChild` pour tout ce qui navigue.** Un bouton qui déclenche une navigation
  est un `<Link>` stylé par `<Button asChild>`, jamais un `<button>` avec un
  `onClick` de redirection. Raison : le clic droit, le ouvrir dans un nouvel
  onglet, le copier de lien et le rendu sans JavaScript doivent fonctionner.
- **`danger` exige une confirmation** avant l'action. Un bouton rouge qui supprime
  en un clic est un défaut, pas un style.

### 40.5 Badges

Le badge est une **étiquette d'état**, pas un bouton et pas un lien. Il ne reçoit
jamais de `onClick`.

| Ton | Signification | Exemple dans le produit |
|---|---|---|
| `neutral` | Information sans valence | Compétence, langue non fluide |
| `brand` | Information Kaji | Vivier de talents |
| `accent` | Mise en valeur éditoriale | Surtitre de section |
| `success` | Disponibilité favorable | « Disponible » |
| `warning` | Information à surveiller | « Disponibilité à reconfirmer » |
| `danger` | Refus, erreur, inaccessibilité | Statut terminal, refus |
| `info` | Information neutre transmise | Confirmation de soumission |
| `solid` | Accent plein, action de marque rare | Rare — vérifier l'alternative |

**Le ton est choisi par `domain/`, jamais dans le composant appelant.** Le cas
concret : `AvailabilityBadge` ne décide pas de sa couleur. Il lit le ton dans
`AVAILABILITY_PRESENTATION`, lui-même indexé par `EFFECTIVE_AVAILABILITY`
(`src/lib/domain/enums.ts`). Un composant qui mapte une valeur métier vers un ton
directement a dupliqué une règle de présentation hors de sa source unique.

Corollaire : `AVAILABLE` et `AVAILABLE_WITH_DELAY` partagent le ton `success` mais
pas le même libellé, et `REQUIRES_CONFIRMATION` est `warning` — jamais
`success`. Cette nuance est le cœur de l'honnêteté du produit (§3.2) ; la
présenter comme un simple choix de couleur détruit sa portée.

### 40.6 Cartes, conteneurs et mise en page

- `Card` est un `<div>` : il n'a pas de sémantique propre. Un contenu qui doit
  être identifié porte son propre titre (`CardTitle` rend un `h3`).
- `Container` fixe les largeurs. **Une largeur qui n'est ni `default`, ni
  `wide`, ni `narrow` n'a pas sa place dans une section publique.** Le texte
  courant ne dépasse pas `max-w-3xl` pour rester lisible.
- `Section` porte le vide vertical. Une section sans respiration n'est pas une
  section : c'est un bloc cassé. Utiliser `spacing="sm"` au début de page,
  `md` par défaut, `lg` pour les ruptures de rythme.
- **Une seule grille principale par page.** La grille de l'annuaire
  (`lg:grid-cols-[17rem_1fr]`) est un layout de page, pas un composant : elle vit
  dans la page, pas dans `ui/`.

### 40.7 Toasts

Le toast est une **confirmation temporaire**, pas un conteneur de contenu.

- **Un seul `Toaster`**, monté dans `app/layout.tsx`. Une page ne monte jamais
  le sien : le conteneur vit à la racine, donc le toast survit à la navigation.
- **Ce qu'il porte** : un résultat déjà produit — « Profil créé. », « Demande
  enregistrée. » — qui disparaît de lui-même.
- **Ce qu'il ne porte jamais** : une erreur de champ (§41.6 — l'erreur vit sous
  le champ, dans le flux du formulaire), l'unique information d'un écran, ni une
  décision qui engage l'utilisateur : une couleur seule ne dit rien (§43.5).
- **Tons** : `toast.success` / `toast.info` / `toast.warning` / `toast.error`,
  sur la même palette que `Alert` (`success-*`, `info-*`, `warning-*`,
  `danger-*`). Les variables de thème de la bibliothèque sont redéfinies avec
  les tokens dans `globals.css` (section « Toasts ») : aucun toast ne porte une
  couleur en dehors de l'échelle.
- **Déclenchement** côté client uniquement : `import { toast } from "sonner"`,
  depuis un Client Component.
- **Annonce** : le conteneur expose `aria-live="polite"` et le libellé
  « Notifications » ; le bouton de fermeture porte `closeButtonAriaLabel`.

**Une action serveur ne peut pas déclencher de toast.** Elle se termine par un
`redirect()`, et le client n'apprend jamais le résultat. Le signal voyage dans
l'URL — `?profil=cree`, consommé par `ProfileCreatedToast`
(`components/talent/profile-created-toast.tsx`) — puis est retiré de
`history.replaceState` : un rechargement ne répète pas le message.

### 40.8 Ajouter un composant : la checklist

Un composant n'est dans `ui/` que si les sept points sont satisfaits. Sinon, il
reste dans son dossier métier.

1. Il ne dépend d'aucun concept produit.
2. Toutes ses valeurs viennent des tokens.
3. Il est utilisable au clavier seul, avec un focus visible.
4. Il a un rôle ARIA ou un élément sémantique correct (`role="alert"`,
   `role="status"`, `<nav>`, `<label>`).
5. Il gère son état désactivé, ou n'en a pas besoin (alors il ne l'expose pas).
6. Il accepte `className` et le fusionne via `cn()`.
7. Il est typé sans `any` et sans assertion de force (§46).

Le composant est ensuite décrit dans le tableau §40.3, avec son fichier et ses
variantes. Un composant non documenté ici n'existe pas pour les agents suivants.

### 40.9 Ce qui n'existe pas, et pourquoi

| Absent | Décision |
|---|---|
| Bibliothèque de composants tierce (Radix, shadcn, MUI) | `Slot` couvre le besoin `asChild` sans dépendance. Le reste est trop spécifique pour être loué. |
| Thème sombre | Non demandé par le produit, non implémenté. Les tokens le permettraient ; ce n'est pas une raison pour le construire. |
| Système de design « dynamique » (tokens pilotés par l'API) | L'identité ne varie pas par client. |
| Bibliothèque d'icônes maison | `lucide-react` suffit ; les icônes sont décoratives (`aria-hidden`). |
| Storybook | Coût de maintenance disproportionné pour 28 composants stables. La doc est ce livrable. |

---

## §41 — États d'interface

### 41.1 Principe

**Tout écran qui dépend de données déclare ses états.** Un écran qui peut être
vide, lent ou en erreur ne rend pas « rien » dans ces cas : il rend un état
explicite, actionnable, et il ne ment jamais sur ce qui se passe.

Les cinq états obligatoires :

| État | Condition | Composant | Règle |
|---|---|---|---|
| `loading` | Données en cours | `LoadingState` ou squelette de page | La **structure** est réservée, pas un spinner seul |
| `empty` | Requête valide, zéro résultat | `EmptyState` | Explique pourquoi, propose la suite |
| `error` | Échec | `ErrorState` | Message utilisateur, jamais la pile d'appels |
| `success` | Données présentes | — | Le cas nominal, pas un composant |
| `disabled` | Action impossible | `disabled` natif | Accompagné d'une raison visible |

### 41.2 Loading

- Un **squelette** (`LoadingState`) est préféré à un spinner. Il annonce la
  forme du contenu : l'utilisateur sait s'il attend trois cartes ou un formulaire.
- Un squelette de page passe par `loading.tsx` (App Router), pas par un état
  local. L'annuaire en a un (`src/app/talents/loading.tsx`).
- `LoadingState` est annoncé : `role="status"`, `aria-live="polite"`,
  `aria-busy="true"`, plus un libellé `sr-only`. Un squelette non annoncé est un
  silence pour un lecteur d'écran.
- Un chargement qui dure plus de ~1 s sans retour visuel est un défaut. Si
  l'opération dépasse ce seuil, ajouter un `Alert` de progression.

### 41.3 Empty

Un état vide n'est pas une erreur. C'est l'absence de résultat, qui a sa propre
explication.

- Titre : ce qui manque, en français, en une phrase.
- Description : pourquoi c'est vide, et sous quelles conditions ce n'est pas un
  bug.
- Action : le moyen de sortir de l'état vide, quand il existe.

`EmptyState` ne prend pas d'icône obligatoire, mais l'annuaire en fournit une
(`SearchX`) : une icône décorative (`aria-hidden`) rend le bloc lisible d'un
coup d'œil sans être lue.

L'annuaire n'a qu'un seul `EmptyState`, dont l'action dépend du contexte : le lien
« Réinitialiser les filtres » n'apparaît que si des filtres sont actifs. C'est
volontaire — la cause la plus fréquente d'un résultat vide est un filtre trop
restrictif — mais c'est insuffisant : distinguer « aucun talent pour ces
critères » de « le vivier est vide » est un **amélioration à faire**, listée dans
`06-progress-tracker.md`. Le message actuel promet « le vivier grandit chaque
semaine », ce qui n'est vrai que si le vivier n'est pas vide.

### 41.4 Error

- **Ce que voit l'utilisateur** : un message en français, qui dit ce qui s'est
  passé et ce qu'il peut faire. « L'annuaire n'a pas pu être chargé.
  Réessayez dans un instant ; si le problème persiste, contactez-nous. »
- **Ce qui va dans les journaux** : l'erreur complète et `error.digest`. Le
  `digest` n'est **jamais** affiché tel quel à l'utilisateur.
- `ErrorState` est rendu dans un `error.tsx`, qui est un **Client Component**
  obligatoire dans l'App Router. Il reçoit `{ error, reset }` ; `reset()`
  re-rend sans re-fetcher toute l'application.
- Un `error.tsx` **ne dépend d'aucune donnée distante** : il doit s'afficher
  même quand la source de données est précisément le problème.
- `global-error.tsx` est le filet de sécurité du layout racine. Il ne reçoit ni
  styles globaux ni polices, et ne peut pas exporter `metadata`.

### 41.5 Disabled

Un élément désactivé sans raison est un défaut. L'utilisateur ne sait pas s'il
a raté une étape, si l'action est interdite, ou si le chargement est en cours.

- `disabled` natif sur `<button>`, `<input>`, `<select>`, `<textarea>`.
- `Button` porte déjà `disabled:opacity-50 disabled:pointer-events-none`.
- La raison est donnée **à côté** : un texte, une infobulle, ou un `Alert`.
- Un bouton désactivé n'est pas un tooltip : on ne déclenche pas un `onClick`
  pour apprendre pourquoi on ne peut pas cliquer.

### 41.6 Erreurs de formulaire

Un formulaire qui échoue ne montre pas une alerte globale et ne vide pas les
saisies.

- Les erreurs sont **par champ**, rattachées au `Input` par `aria-describedby`, et
  rendues sous le champ.
- Le message est **actionnable** : « L'adresse e-mail n'est pas valide », pas
  « Erreur de validation ».
- Les valeurs saisies sont conservées. Tout effacer est une faute.
- L'erreur de validation d'un filtre d'URL est un cas particulier : elle
  devient un `Alert tone="warning"` listant les filtres ignorés (`filterIssues`),
  jamais une exception. La page continue de fonctionner (§23.3).

### 41.7 Table de correspondance

| Contexte | Loading | Empty | Error |
|---|---|---|---|
| Annuaire `/talents` | `talents/loading.tsx` | `EmptyState`, action conditionnelle | `talents/error.tsx` → `ErrorState` |
| Fiche `/talents/[id]` | hérité du segment parent | — | 404 via `not-found.tsx` |
| Page placeholder | — | — | `Alert` « Page en préparation » |
| Formulaire futur | dans le flux, sous le champ | — | `fieldErrors` + `Alert` |

---

## §42 — Responsive

### 42.1 Breakpoints

Uniquement les breakpoints Tailwind par défaut, sans nommage maison :

| Préfixe | Largeur | Usage majoritaire dans le dépôt |
|---|---|---|
| *(aucun)* | < 640 px | Mobile : une colonne, navigation repliée |
| `sm:` | ≥ 640 px | Deux colonnes de cartes, texte un peu plus grand |
| `md:` | ≥ 768 px | Peu utilisé : la grille passe à `lg` |
| `lg:` | ≥ 1024 px | Navigation complète, grille 3 colonnes, layout annuaire |
| `xl:` | ≥ 1280 px | Ajustements fins |
| `2xl:` | ≥ 1536 px | Quasi inutilisé |

Le dépôt est **mobile-first** : le style de base est l'état mobile, les
breakpoints ajoutent. L'inverse est un défaut : cela impose un `hidden` sur
chaque élément desktop, donc une page illisible avant le rendu.

### 42.2 Règles de composition

- **Une colonne en dessous de `sm`** pour tout ce qui contient plus de ~40 mots
  ou plus de 4 métadonnées. Les cartes talent ne tiennent pas à deux sur
  mobile : `TalentGrid` est `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, et c'est
  intentionnel.
- **Gouttières** : `px-4` puis `sm:px-6` puis `lg:px-8`, fournies par
  `Container`. Une page n'écrit pas son propre padding horizontal.
- **Ordre de lecture** : sur mobile, l'ordre visuel est l'ordre du DOM. Aucune
  inversion par `order-*` qui créerait un écart entre le parcours visuel et le
  parcours de lecture.
- **Tables** : sur mobile, pas de `overflow-x` pour un tableau de données
  métier. Les données tabulaires sont converties en liste de cartes ou
  dépliées ligne par ligne.

### 42.3 Navigation

- `SiteHeaderNav` rend la navigation complète en `lg` (`hidden ... lg:flex`) et un
  bouton menu en dessous.
- Le panneau mobile est ancré sous l'en-tête (`top-16`, `fixed`), et
  `document.body.style.overflow` est verrouillé pendant l'ouverture.
- Le bouton menu porte `aria-expanded` et `aria-controls`, et son libellé change
  (« Ouvrir le menu » / « Fermer le menu ») en `sr-only`.
- L'état du menu est **déduit du rendu** : `openedAt === pathname`. Un changement
  de route referme le panneau sans effet supplémentaire, donc sans rendu en
  cascade.

### 42.4 Ce qui ne dépend pas de la taille

| Élément | Cible tactile |
|---|---|
| `Button` `md` | 44 px de hauteur |
| `Input` / `Select` | 44 px |
| Cible mobile du bouton menu | ≥ 36 px, `gap` confortable |
| Lien de pagination | `size-9` (36 px) desktop, cibles élargies sur mobile |

Une cible interactive sous 44 px est acceptable sur desktop dense (pagination),
et ne l'est pas sur mobile. `Pagination` masque les numéros de page en dessous de
`sm` (`hidden ... sm:flex`) : sur mobile, seuls « Précédent » et « Suivant »
restent, ce qui est le bon compromis entre la place disponible et la lisibilité.

### 42.5 Ce qui est interdit

- Un breakpoint inventé en dehors des six ci-dessus.
- Une largeur fixe en `px` sur un conteneur de contenu.
- `hidden` sur desktop pour révéler un élément absent sur mobile — l'inverse.
- Tester la fluidité uniquement au bureau.

---

## §43 — Accessibilité et mouvement

### 43.1 Engagement

Une page inaccessible est une page non livrée, pas une page « à améliorer plus
tard ». Les règles ci-dessous sont des critères de refus, pas des
recommandations.

### 43.2 Clavier

- **Tout** est atteignable au clavier, dans un ordre logique.
- Le focus est **toujours visible** : `:focus-visible` porte un `outline: 2px
  solid var(--color-ring)` avec `outline-offset: 2px`, en plus des anneaux
  spécifiques aux composants.
- **Lien d'évitement** : `.skip-link` est le premier élément focusable de la
  page, dans `layout.tsx`. Il cible `#contenu` et n'apparaît qu'au focus.
- `Escape` referme le panneau de navigation mobile.
- Le défilement de l'arrière-plan est verrouillé quand le menu est ouvert.
- Les clés `Previous` / `Next` de `Pagination` portent `rel="prev"` / `rel="next"`.

### 43.3 Structure et sémantique

- Un `h1` par page, dans l'ordre, sans saut de niveau.
- Les zones de navigation portent un `aria-label` distinct : « Navigation
  principale », « Navigation mobile », « Pagination des talents ».
- La route active est annoncée par `aria-current="page"` (en-tête comme
  pagination), jamais par la seule couleur.
- Les `Section` sont des `<section>`, les conteneurs de navigation des `<nav>`, les
  cartes des `<article>`.

### 43.4 Lecture d'écran

| Cas | Attribut |
|---|---|
| Alerte critique (`danger`) | `role="alert"` |
| Information non critique | `role="status"` |
| Chargement | `role="status"` + `aria-live="polite"` + `aria-busy="true"` + libellé `sr-only` |
| Icône seule, sans texte | `<span class="sr-only">` décrivant l'action |
| Icône décorative | `aria-hidden="true"` |
| Valeur tronquée (code de langue) | `abbr` + `title` + version `sr-only` complète |

`LanguageBadge` illustre la règle : le code court « EN » ne doit jamais être la
seule information lue. Le libellé complet « Anglais — niveau professionnel »
est dans le `title` **et** en `sr-only`.

### 43.5 Couleur et contraste

- Une couleur ne porte jamais seule une information. Le statut d'un candidat est
  marqué par un libellé **et** un ton, pas par un ton seul.
- `AVAILABILITY_PRESENTATION` fournit un `description` textuel pour chaque
  état, utilisé en infobulle et repris dans le texte de la fiche.
- Les couleurs de fond et de texte sont définies par paires de rôles
  (`--color-foreground` sur `--color-background`, `--color-primary-foreground` sur
  `--color-primary`), pour que le contraste soit vérifiable une fois, pas à
  chaque usage.
- Ne pas introduire de paire de couleurs hors tokens : une paire non prévue est
  un contraste non vérifié.

### 43.6 Mouvement

- `prefers-reduced-motion: reduce` neutralise animations, transitions et
  `scroll-behavior: smooth` (`globals.css`). C'est une règle globale, appliquée
  via `!important` sur `animation-duration`, `animation-iteration-count` et
  `transition-duration`.
- Aucune animation ne porte une information. `fade-up` décore ; `LoadingState`
  réserve la structure. Rien d'essentiel n'est contenu dans un mouvement.
- Durées : 150–180 ms pour un état, 500 ms pour une entrée de section. Une
  animation plus longue devient une attente.
- Courbe : `--ease-kaji` = `cubic-bezier(0.2, 0, 0, 1)`, une courbe d'entrée
  franche et sans rebond.

### 43.7 Contenu

- Langue déclarée en `fr-FR` (`BRAND.locale`), et le document en `lang="fr"`.
- Les dates sont au format long français. Les nombres utilisent la virgule
  décimale.
- Le texte alternatif est un texte, pas un mot-clé : « Annuaire des talents »,
  pas « image annuaire ».
- L'utilisateur ne fait jamais face à un texte vide : `description` est requis
  dans `EmptyState`, `ErrorState`, `Alert` avec `title`, `SectionHeading` avec
  `title`, et `CardDescription` quand utilisé.

### 43.8 Ce que l'agent doit vérifier avant de livrer un écran

- [ ] L'écran a un `h1` et pas de saut de niveau.
- [ ] Tous les éléments interactifs sont atteignables et activables au clavier.
- [ ] Le focus est visible sur chaque élément interactif.
- [ ] Loading, empty et error sont présents là où ils s'appliquent (§41).
- [ ] Les couleurs sortent des tokens, par paires de rôles.
- [ ] L'information n'est pas portée par la couleur seule.
- [ ] Aucun `aria-*` ne contredit le comportement réel.
- [ ] Le rendu est vérifié en `prefers-reduced-motion: reduce`.
- [ ] Aucune information n'existe uniquement dans un `title` de badge sans
      équivalent `sr-only`.
