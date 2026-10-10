# 02 — Vision produit : Kaji.com

> **Numérotation** : ce document est propriétaire des sections **§1 à §22**.
> Le registre complet des `§` du projet est dans `01-ai-workflow.md` §2.
> `§23` et suivants appartiennent à `03-system-architecture.md`.

---

## §1 — Produit, marque et société opératrice

### §1.1 Nom et marque

| Attribut | Valeur | Source de vérité dans le code |
|---|---|---|
| Nom de marque public | **Kaji.com** | `BRAND.name` — `src/lib/site.ts` |
| Nom court | Kaji | `BRAND.shortName` |
| Signature | *Talent & Professional Mediation Platform* | `BRAND.tagline` |
| Domaine | `kaji.com` | `BRAND.domain` |
| Ancien domaine (traçabilité administrative uniquement) | `jobs.mokengelisarlu.com` | `BRAND.legacyDomain` — **jamais affiché** |
| Langue | Français (`fr-FR`, `<html lang="fr">`) | `BRAND.locale` |

**Kaji.com** est le nom du produit. Il est écrit avec la pointuation complète
(« Kaji.com ») dans les contexts commerciaux, légaux et editoriaux, et sans
pointuation (« Kaji ») dans les contexts de produit où l'interface elle-même
porte déjà le nom de domaine.

### §1.2 Société opératrice

| Attribut | Valeur |
|---|---|
| Dénomination sociale | **Mokengeli SARLU** |
| Forme juridique | SARLU (société à responsabilité limitée unipersonnelle) |
| Rôle | **Exploitante** du produit Kaji.com |
| Mention obligatoire | *Operated by Mokengeli SARLU* / *Exploitée par Mokengeli SARLU* |

**Règle de séparation marque / opérateur, non négociable :**

- `Kaji.com` est ce que l'utilisateur utilise et paie.
- `Mokengeli SARLU` est l'entité qui signe les contrats, porte les obligations
  légales (RGPD-like, droit du travail, fiscalité) et endosse la réputation.
- Partout où le produit est présenté contractuellement ou juridiquement, les deux
  noms apparaissent. La mention « Exploitée par Mokengeli SARLU » figure dans le
  pied de page de tout l'espace public et dans les pages légales (§27).
- Le nom de l'opérateur n'est **jamais** utilisé comme nom de produit dans les
  titres de page, les e-mails transactionnels ni les messages de l'interface.

### §1.3 Positionnement géographique

Marché initial : **RDC (République démocratique du Congo)** en priorité, avec
extension naturelle à l'Afrique centrale et de l'Ouest — Cameroun, Côte d'Ivoire,
Sénégal, Congo. Les villes de référence sont déjà modélisées dans le référentiel
(`src/lib/mock/referentials.ts`) : Kinshasa, Lubumbashi, Goma, Mbuji-Mayi,
Douala, Yaoundé, Abidjan, Dakar, Brazzaville, Province de Kinshasa.

---

## §2 — Positionnement et promesse

### §2.1 Ce que Kaji n'est pas

Cette section est la plus importante du document. Kaji se définit autant par ses
refus que par ses capacités.

| Kaji **n'est pas** | Raison |
|---|---|
| Une place de marché d'offres d'emploi | Publier des annonces produit du volume, pas de la qualité. Kaji ne publie pas. |
| Une place de marché de main-d'œuvre à la Uber | Le modèle à la mission courte ne garantit ni la qualité, ni la protection de la donnée. |
| Un algorithme de classement de personnes | Un score de pertinence mesure la **correspondance avec un poste**, jamais la valeur d'une personne. |
| Un réseau social professionnel | Aucune publication libre, aucun follower, aucun signal d'activité. |
| Une agence de placement classique | Kaji ne « vend » pas un candidat : l'entreprise mandate une recherche, Kaji rend un résultat argumenté. |

### §2.2 Ce que Kaji est

**Kaji.com est une plateforme de médiation professionnelle** : une entreprise
confie un besoin de recrutement, une équipe de	Kaji} constitue, qualifie et
actualise un vivier de profils, vérifie les informations et présente une
shortlist argumentée, puis organise les entretiens et le placement.

Le mot central est **médiation**. Il signifie :

- un **interlocuteur unique** côté Kaji suit la demande de bout en bout ;
- l'entreprise ne fait pas de casting, elle mandate ;
- le candidat ne postule pas à l'aveugle, il est contacté par des entreprises
  sélectionnées ;
- la décision de présenter un profil est **humaine, datée et motivée**.

### §2.3 Promesse

> **« Le bon talent, trouvé par des humains — pas par un algorithme. »**

Traduction opérationnelle en quatre engagements vérifiables :

1. **Vérifié** — chaque profil affiché avec le badge « Vérifié » a été contrôlé
   par l'équipe, sur pièces, et la date de vérification est connue.
2. **Confirmé** — la disponibilité affichée est une **disponibilité effective**,
   résultat d'un calcul qui combine statut, déclaration du candidat et fraîcheur du
   profil (§3.1, §3.2). Un profil dont la donnée date de plus de 30 jours affiche
   « Disponibilité à reconfirmer » : jamais « Disponible ».
3. **Encadré** — un chargé de médiation suit la demande depuis l'analyse du besoin
   jusqu'au placement, et jusqu'après.
4. **Protégé** — les coordonnées, les documents et les notes internes ne sont
   jamais publics. Une entreprise doit **demander** l'accès ; Kaji l'accorde, filtre
   et trace.

### §2.4 Problème résolu

**Côté entreprise.** Le recrutement en Afrique centrale reste largement informel :
marketplaces généralistes, bouche-à-oreille, réseaux sociaux. Les conséquences
sont connues et coûteuses : profils fantaisistes, indisponibilités déclarées non
vérifiées, des délais de traitement très longs, une rotation du personnel élevée faute
d'ingénierie d'accueil, perte de temps des directions sur des tâches de
sourcing, et un risque juridique réel sur les données personnelles collectées
dans des tableurs et des messageries privées.

**Côté talent.** Le talent qualifié est invisible en dehors de son réseau
personnel. Il n'a pas de présence professionnelle durable : il perd le contact
avec le marché entre deux missions, il accepte des conditions par défaut parce
qu'il n'a aucun levier, et il ne sait pas qui le contacte ni pourquoi. Le
recrutement informel lui fait perdre du temps, de la dignité et de la sécurité.

**Le problème que Kaji attaque n'est pas le manque de personnes : c'est le défaut de coordination.**

**Côté Kaji / Mokengeli SARLU.** Le modèle existe déjà sur le terrain : une équipe
de médiation qui travaille par téléphone, WhatsApp et tableur. Ce qui manque,
c'est la **mémoire** : l'historique des profils, la fraîcheur des informations, la
traçabilité des accès. Kaji est l'informatisation d'un savoir-faire de médiation
réel, pas un projet théorique.

---

## §3 — Le vivier de talents

C'est la matière première du produit. Sa qualité détermine tout le reste.

### §3.1 Disponibilité

**Règle fondatrice : avoir un compte ne signifie jamais être disponible.**

Trois notions distinctes, souvent confondues, sont implémentées dans
`src/lib/domain/availability.ts` et `src/lib/domain/enums.ts` :

| Notion | Type | Définition |
|---|---|---|
| **Disponibilité déclarée** | `AvailabilityType` | Ce que le candidat a dit : `IMMEDIATELY`, `ONE_MONTH`, `THREE_MONTHS`, `OPEN_TO_OPPORTUNITIES`, `NOT_AVAILABLE` |
| **Disponibilité effective** | `EffectiveAvailability` | Ce qui est **affiché publiquement**, calculé |
| **Présentabilité** | `isPresentableAvailability()` | Droit de présenter le profil à une entreprise |

`resolveEffectiveAvailability()` calcule la valeur effective. Ordre de décision
(strict, court-circuit à la première règle satisfaite) :

| # | Condition | Résultat |
|---|---|---|
| 1 | statut `ARCHIVED` | `UNAVAILABLE` |
| 2 | statut `PLACED` ou `IN_PROCESS` | `UNAVAILABLE` — la disponibilité est consommée par le processus, pas par le vivier |
| 3 | déclaration `NOT_AVAILABLE` | `UNAVAILABLE` |
| 4 | statut `UNAVAILABLE` | `UNAVAILABLE` |
| 5 | fraîcheur `NEEDS_UPDATE` (> 30 j) | `REQUIRES_CONFIRMATION` |
| 6 | fraîcheur `STALE` (> 90 j) | `REQUIRES_CONFIRMATION` |
| 7 | déclaration `IMMEDIATELY` | `AVAILABLE` |
| 8 | déclaration `ONE_MONTH` / `THREE_MONTHS` | `AVAILABLE_WITH_DELAY` |
| 9 | déclaration `OPEN_TO_OPPORTUNITIES` | `OPEN` |

**Interdiction absolue :** ne jamais retomber automatiquement sur `AVAILABLE` au-delà
de 30 jours. Un profil périmé bascule en `REQUIRES_CONFIRMATION` et doit être
reconfirmé par l'équipe Kaji. C'est la règle qui protège la réputation de Kaji et
qui empêche une entreprise de faire un déplacement pour un candidat parti.

### §3.2 Fraîcheur du profil

`resolveFreshnessBand()` mesure l'ancienneté de `lastProfileUpdateAt` en **jours
calendaires UTC**, normalisés en début de journée pour éviter les écarts d'heure.
Seuils dans `FRESHNESS_THRESHOLDS_DAYS` — jamais de littéral magique dispersé :

| Bande | Seuil | Libellé public | Conséquence |
|---|---|---|---|
| `RECENT` | ≤ 30 jours | « Profil récent » | Disponibilité opposable |
| `NEEDS_UPDATE` | 31 – 90 jours | « Profil à actualiser » | `REQUIRES_CONFIRMATION` |
| `STALE` | > 90 jours | « Profil ancien » | `REQUIRES_CONFIRMATION` + campagne de reconfirmation |

`lastAvailabilityConfirmationAt` est traité **séparément** de
`lastProfileUpdateAt` : une disponibilité peut être périmée alors que le profil
reste riche et à jour. Un profil peut donc être `RECENT` tout en nécessitant une
reconfirmation de disponibilité — c'est le cas normal d'un candidat en mission longue
dont il actualise bien son CV.

`formatProfileAge()` produit la formulation humaine : « mis à jour hier », « mis à
jour il y a 12 jours », « mis à jour il y a 3 mois ».

### §3.3 Statut du candidat

`CandidateStatus` est le statut **interne du vivier**, distinct de la disponibilité.
Il suit la progression réelle d'un profil dans le système Kaji.

| Statut | Libellé | Signification |
|---|---|---|
| `NEW` | Nouveau | Entré dans le vivier, jamais contacté |
| `CONTACTED` | Contacté | Premier échange effectué |
| `PREQUALIFIED` | Préqualifié | Compétences et disponibilité validées à l'oral |
| `VERIFIED` | Vérifié | Vérification documentaire et datée |
| `AVAILABLE` | Disponible | Mobilisable immédiatement |
| `OPEN_TO_OPPORTUNITIES` | Ouvert aux opportunités | À l'écoute, sans urgence déclarée |
| `IN_PROCESS` | En cours de processus | Présent dans une demande active |
| `PLACED` | Placé | Placement effectif |
| `UNAVAILABLE` | Indisponible | Non orienté vers de nouvelles opportunités |
| `ARCHIVED` | Archivé | Sorti du vivier |

`PRESENTABLE_STATUSES` = `VERIFIED`, `AVAILABLE`, `OPEN_TO_OPPORTUNITIES`. Un
profil qui n'est pas dans cette liste **ne peut pas** être présenté à une
entreprise, quelle que soit sa disponibilité affichée. Le statut seul ne suffit
jamais : la fraîcheur (§3.2) est également évaluée.

Les transitions autorisées sont définies **exclusivement** dans
`src/lib/domain/status-transitions.ts`. Toute transition absente de cette table est
refusée. Détail dans §6.

### §3.4 Deux viviers distincts

`PoolKind` sépare deux populations qui ne relèvent pas du même modèle :

| Vivier | Valeur | Contenu | Modèle |
|---|---|---|---|
| **Talent Pool** | `TALENT_POOL` | Salariés : CDI, CDD, stage, alternance | Recherche, présélection, entretien, placement |
| **Prestataire Pool** | `PRESTATAIRE_POOL` | Indépendants sur des missions : freelance, prestation, conseil | Mission, vérification de capacité, contractualisation |

Règle : **les structures techniques sont partagées, la logique métier ne l'est
pas.** Un prestataire n'est pas un salarié sous un autre nom.

- Le libellé du vivier est affiché publiquement sur la carte et la fiche quand il
  s'agit du vivier prestataires (`Badge tone="info"`), pour éviter qu'un lecteur
  croie à un CDI.
- Les relations contractuelles, la fiscalité et la protection sociale diffèrent et
  sont traitées hors de ce document (§11, §22).
- Un recrutement peut alimenter les deux viviers depuis un seul compte ; c'est un
  choix du candidat, contrôlé par lui.

---

## §4 — Données du candidat

### §4.1 Projection publique

`PublicTalent` est **la seule forme** que les routes publiques sont autorisées à
consommer. Elle ne contient aucun champ de contact direct ni aucune donnée
sensible. C'est une garantie **par construction** : l'absence du champ dans le type
constitue la barrière, pas la présence d'un contrôle dans la page.

Champs autorisés sur une page publique :

```text
candidateId        identifiant KJ-AAAA-NNNN, seul identifiant exposé
fullName           nom affichable
headline           titre professionnel
categorySlug/Label catégorie de métier
domainSlugs        domaines d'expertise
location           ville + pays + éligibilité télétravail (jamais l'adresse)
yearsOfExperience  années, dérivées et non déclarées
skills             libellé + niveau auto-déclaré 1–5
languages          code + niveau auto-déclaré
availability       DISPONIBILITÉ EFFECTIVE, jamais la déclaration
declaredAvailability  déclaration, conservée pour contexte
desiredContractTypes   contrats recherchés
summary            résumé rédigé pour être public
poolKind           vivier
isVerified         booléen dérivé du statut de vérification
source             source d'acquisition, non sensible
```

`PublicTalentProfile` ajoute `experiences`, `education`, `certifications` — les
éléments de parcours **par construction publics** (§14).

**Interdits par construction** dans `PublicTalent` et `PublicTalentProfile` :
téléphone, email personnel, adresse exacte, pièce d'identité, documents, notes
internes, commentaires RH, scores internes, historique de recrutement, salaire.

Toute modification de ces deux types doit être justifiée par écrit dans
`03-system-architecture.md` §24. C'est une règle de revue, pas une suggestion.

### §4.2 Visibilité contrôlée par le candidat

`ProfileVisibility` — le candidat **maîtrise** l'exposition de sa fiche. Ce n'est
pas une option secondaire, c'est un droit.

| Valeur | Libellé | Effet |
|---|---|---|
| `PUBLIC` | Profil public | Visible dans l'annuaire, indexable, partageable |
| `ON_REQUEST` | Visible sur demande | Absent de l'annuaire ; accessible uniquement via une demande de profil arbitrée par Kaji |
| `PRIVATE` | Profil privé | Masqué de tout canal externe ; visible uniquement par l'équipe Kaji |

`isPublishable()` (dans `src/lib/mock/talents.ts`, à porter dans la couche data)
définit la publiabilité : `visibility === PUBLIC` **et** `status !== ARCHIVED`. Un
profil non publiable renvoie `null` depuis le repository et la page appelle
`notFound()` — HTTP 404 réel, pour que la fiche disparaisse de l'index des moteurs
de recherche.

### §4.3 Données privées

Les données privées vivent dans des structures **distinctes**, jamais dans
`PublicTalent`, et sont servies par des repositories **distincts** :

```text
Données publiques   → PublicTalent / PublicTalentProfile  → talentRepository
Données privées     → CandidateProfile                   → candidateRepository (interdit aux routes publiques)
Données sensibles   → CandidateDocuments, CandidatePrivateData → accès nominatif, journalisé
```

Le RBAC (§20) rend `CANDIDATE_PRIVATE_DATA` et `CANDIDATE_DOCUMENTS` **inaccessibles**
au rôle `EMPLOYER` — l'entrée est un tableau vide `[]`, refus par défaut. Ce n'est
pas masqué dans l'interface, c'est absent de la matrice d'autorisation.

### §4.4 Identité nominative et datation

L'identité d'une personne est **structurée**, jamais présumée à partir d'une
chaîne unique. Trois composantes explicites :

| Champ | Règle |
|---|---|
| `lastName` (Nom) | Obligatoire |
| `postName` (Postnom) | **Facultatif** — jamais inventé lorsqu'absent |
| `firstName` (Prénom) | Obligatoire |

Ordre d'affichage officiel : **« Nom Postnom Prénom »**. Le nom affichable est
composé par `composeFullName` (`src/lib/domain/person-name.ts`) ; les parties
vides sont omises, jamais remplacées par des espaces. La colonne historique
`full_name` est conservée pour les fiches migrées et n'est **jamais réécrite
d'office** : `resolveDisplayName` retombe sur `fullName` tant que les parties ne
sont pas renseignées. Accents, apostrophes, traits d'union et casse saisis sont
préservés.

Les dates de parcours (expériences, formations, certifications) sont exprimées
au **mois et à l'année** — `YYYY-MM` (`src/lib/domain/period.ts`). Le **jour
n'existe jamais** : aucune date `YYYY-MM-DD` n'est produite ni affichée. La forme
`YYYY` seule reste tolérée **en lecture** pour les données historiques dont le
mois n'a jamais été connu ; on n'invente alors aucun mois. Règles associées :

- Une période de fin doit être **postérieure ou égale** au début.
- Un segment « en cours » (`isCurrent`) n'a pas de fin ; une fin fournie pour un
  segment en cours est ignorée.
- L'ancienneté dérivée (`totalYearsCovered`) fusionne les segments qui se
  chevauchent ou se touchent : un mois n'est **jamais compté deux fois**.

---

## §5 — Utilisateurs et personas

### §5.1 Candidat / prestataire

| | |
|---|---|
| **Qui** | Professionnel qualifié, salarié ou indépendant, 22 – 45 ans, basés en RDC ou en Afrique centrale ou de l'ouest. |
| **Situation** | Sait qu'il a de la valeur mais n'a pas de présence professionnelle durable. Recrute par bouche-à-oreille, LinkedIn, groupes WhatsApp. |
| **Objectif** | Être trouvé pour une opportunité **adaptée**, sans perdre sa dignité ni sa sécurité. |
| **Frustrations** | Candidatures en masse sans réponse ; profils qui mentent sur leur disponibilité ; perte de contact avec le marché entre deux missions ; feeling d'être un CV. |
| **Ce que Kaji doit apporter** | Un profil qui vit dans la durée ; une disponibilité honnête qu'il contrôle ; savoir qui le contacte et pourquoi. |
| **Objections** | « On va me juger par une note. » « Je ne veux pas que tout le monde voie mon téléphone. » « Et si on ne me rappelle jamais ? » |
| **Réponses** | Aucune note de valeur n'est publiée (§3.3, §14) ; visibilité contrôlée par lui (§4.2) ; l'équipe récontacte et actualise le vivier (§18). |

### §5.2 Entreprise

| | |
|---|---|
| **Qui** | PME, ETI, start-up, ONG, groupe, Cabinet de conseil. Décideur : DRH, DAF, Dirigeant, Recruteur. |
| **Situation** | Un besoin précis, une urgence, aucun outil. Recrute par recommandations informelles. |
| **Objectif** | Un profil confirmé, présentable en interne, qui tienne dans la durée. |
| **Frustrations** | 200 CV, 3 sérieux ; des profils fantaisistes ; des déplacements coûteux pour des désistements ; une incertitude sur la conformité des données collectées. |
| **Ce que Kaji doit apporter** | Un vivier constitué, un interlocuteur unique, une shortlist argumentée, des informations vérifiées. |
| **Objections** | « Pourquoi payer si je peux poster une annonce ? » « J'ai besoin de quelqu'un tout de suite. » « Qu'est-ce que vous voyez sur le candidat que je ne verrai pas ? » |
| **Réponses** | Le coût est dans le résultat, pas dans le volume (§2.2) ; délai moyen affiché et tenu ; le détail du matching est explicable règle par règle (§8). |

### §5.3 Médiateur RH (interne)

| | |
|---|---|
| **Qui** | Chargé de médiation Kaji. Suit plusieurs demandes et plusieurs viviers en parallèle. |
| **Besoin** | Un outil qui se souvient : qui est disponible, depuis quand, pour qui, et ce qui a été dit. |
| **Frustrations** | Tableurs divergents, informations périmées, appels répétés, aucune trace de ce qui a été transmis à qui. |
| **Ce que Kaji doit apporter** | Un tableau de bord, des tâches, un historique, des alertes de fraîcheur, des modèles de messages. |

### §5.4 Administrateur Kaji

| | |
|---|---|
| **Qui** | Administrateur plateforme. Gère référentiels, comptes, rôles, paramètres. |
| **Besoin** | Tracer qui a accédé à quoi, révoquer un accès, corriger une règle. |
| **Règle** | Un administrateur ne « déverrouille » pas un candidat : il ne fait que refléter l'état du système. La réanimation d'un profil archivé est réservée au Super Admin. |

### §5.5 Super administrateur

Rôle distinct de l'administrateur, avec des pouvoirs supplémentaires sur les
paramètres et l'audit, et le seul autorisé à réactiver un profil archivé
(`status-transitions.ts` : `ARCHIVED → NEW` n'existe que pour ce cas, et l'action
lui-même est protégée côté use case).

---

## §6 — Processus de recrutement

Le processus est une **machine à états** décrite en un seul endroit :
`src/lib/domain/status-transitions.ts`. Le backend applique, le frontend déclenche
et affiche. Toute transition absente de la table est refusée, avec une raison
exploitable.

### §6.1 Statuts de demande

| Statut | Libellé public | Signification |
|---|---|---|
| `NEW` | Nouvelle | Demande reçue, non qualifiée |
| `REVIEWING` | En analyse | L'équipe évalue la faisabilité |
| `SEARCHING` | Recherche en cours | Le vivier est consulté, les profils sont contactés |
| `SHORTLISTED` | Shortlist constituée | 3 à 5 profils retenus en interne |
| `SENT_TO_CLIENT` | Profils envoyés | Shortlist transmise à l'entreprise |
| `INTERVIEW` | Entretiens | Entretiens en cours |
| `SELECTED` | Sélectionné | L'entreprise a fait son choix |
| `PLACED` | Placé | Placement effectif |
| `REJECTED` | Refusée | Le besoin ne peut pas être servi |
| `CANCELLED` | Annulée | L'entreprise a renoncé |

### §6.2 Transitions de demande autorisées

```text
NEW           → REVIEWING | CANCELLED
REVIEWING     → SEARCHING | CANCELLED | REJECTED
SEARCHING     → SHORTLISTED | REVIEWING | CANCELLED
SHORTLISTED   → SENT_TO_CLIENT | SEARCHING | CANCELLED
SENT_TO_CLIENT→ INTERVIEW | SHORTLISTED | CANCELLED
INTERVIEW     → SELECTED | SEARCHING | CANCELLED
SELECTED      → PLACED | REJECTED
PLACED        → (aucune) — état final réussi
REJECTED      → SEARCHING — reprise possible
CANCELLED     → REVIEWING — reprise possible
```

Deux invariants :

- **`PLACED` est final.** Aucun retour possible. Un placement ne se « défait » pas.
- **Le retour en `SEARCHING` est toujours possible** depuis `SHORTLISTED`,
  `SENT_TO_CLIENT` et `INTERVIEW`. Un client qui ne valide pas la shortlist ne
  perd pas le besoin : la recherche reprend.

### §6.3 Transitions de candidat autorisées

```text
NEW                   → CONTACTED | ARCHIVED
CONTACTED             → PREQUALIFIED | UNAVAILABLE | ARCHIVED
PREQUALIFIED          → VERIFIED | UNAVAILABLE | ARCHIVED
VERIFIED              → AVAILABLE | OPEN_TO_OPPORTUNITIES | IN_PROCESS | UNAVAILABLE | ARCHIVED
AVAILABLE             → IN_PROCESS | UNAVAILABLE | OPEN_TO_OPPORTUNITIES | ARCHIVED
OPEN_TO_OPPORTUNITIES → IN_PROCESS | AVAILABLE | UNAVAILABLE | ARCHIVED
IN_PROCESS            → PLACED | AVAILABLE | UNAVAILABLE | ARCHIVED
PLACED                → AVAILABLE | UNAVAILABLE
UNAVAILABLE           → AVAILABLE | OPEN_TO_OPPORTUNITIES | CONTACTED | ARCHIVED
ARCHIVED              → NEW   (Super Admin uniquement)
```

`assertCandidateTransition()` et `assertJobRequestTransition()` enrichissent la
vérification d'un motif lisible, destiné à être journalisé et affiché à
l'administrateur : *« Transition interdite : IN_PROCESS → PLACED. Transitions
possibles : PLACED, AVAILABLE, UNAVAILABLE, ARCHIVED. »*

---

## §7 — Entretiens

`InterviewStatus` couvre le cycle d'un entretien :

| Statut | Libellé | Règle |
|---|---|---|
| `SCHEDULED` | Planifié | Date, heure, canal, participants confirmés |
| `COMPLETED` | Réalisé | Compte rendu obligatoire |
| `RESCHEDULED` | Reprogrammé | Nouvelle date, motif obligatoire |
| `CANCELLED` | Annulé | Motif obligatoire |
| `NO_SHOW` | Absent | Un candidat absent deux fois ne reste pas en shortlist sans arbitrage explicite |

Règles :

- La planification est faite **par Kaji**, pas en direct entre l'entreprise et le
  candidat. C'est le cœur du service de médiation.
- Un compte rendu d'entretien est **obligatoire** à la clôture ; il est
  qualitativement utilisé par l'équipe, **jamais** publié sur la fiche publique (§9).
- Les entretiens sont enregistrés avec les participants, la date et le canal, de
  manière à produire une chronologie auditable.

---

## §8 — Moteur de matching

Implémenté dans `src/lib/domain/matching.ts`. C'est le cœur technique de la
différenciation produit, et sa conception est contrainte par la promesse §2.3.

### §8.1 Principes

1. Le score mesure la **correspondance avec les critères du poste**, jamais la
   qualité d'une personne.
2. Il **n'est jamais affiché comme une note, une étoile ou un pourcentage de
   valeur**. Le libellé imposé est « Correspondance avec les critères du poste ».
3. Chaque critère est une **règle indépendante**, activable et pondérable.
4. Le moteur est **modulaire** : ajouter un critère = ajouter une règle, sans
   toucher à l'orchestrateur.
5. **Aucune dépendance externe, aucun scoring opaque, aucun apprentissage
   automatique.** Un recruteur doit pouvoir expliquer le score règle par règle.

### §8.2 Règles et poids

| Règle | `id` | Poids | Applicable si | Score |
|---|---|---|---|---|
| Compétences | `skills` | 3 | compétences requises |nb trouvées / nb requises |
| Métier | `category` | 3 | catégories demandées | 1 ou 0 |
| Expérience | `experience` | 2 | borne min ou max | 1 si dans la fourchette, sinon proximité dégressive |
| Langues | `languages` | 2 | langues requises | nb trouvées / nb requises |
| Type de contrat | `contract` | 1.5 | contrats demandés | 1 si compatible |
| Localisation | `location` | 1 | villes demandées | 1 si correspondance, 0.5 sinon |
| Télétravail | `remote` | 1 | télétravail exigé | 1 si éligible |
| Mots-clés | `keywords` | 1 | requête ≥ 2 caractères | nb termes / nb termes |

Règle d'expérience, justification : un écart d'un an du minimum ne doit pas
écarter quelqu'un. Le score est donc `0.6` à 1 an sous le minimum, `0.35` à
2 ans, `0.15` au-delà ; et du côté supérieur `0.75` à 1 an au-dessus du maximum,
`0.5` à 3 ans, `0.25` au-delà.

### §8.3 Sortie

`scoreTalent()` retourne `{ score: 0–100, breakdown, meetsAllCriteria }`.
`rankTalents()` classe les talents. Le `breakdown` est **obligatoire** : il est
l'argument d'explication au recruteur, et il ne doit pas être optionnel dans
l'interface.

**Invariant important :** le tri « pertinence » de l'annuaire (§13) utilise le
**même** moteur que le matching d'une demande. L'annuaire et la recherche de
recrutement ne peuvent donc pas diverger. Cette cohérence est implémentée dans
`MockTalentRepository.sort()` et doit être conservée lors du passage à SQL.

---

## §9 — Confidentialité et publication

C'est la contrainte la plus structurante du produit. Elle est implémentée, pas
seulement annoncée.

### §9.1 Principe de non-divulgation par défaut

Ce qui est publié est **la seule chose qui a été validée pour être publiée**. Le
candidat ne « choisit pas de masquer » ses coordonnées : elles ne sont pas
structurellement disponibles dans la forme publique.

### §9.2 Ce qui n'est jamais public

| Donnée | Pourquoi | Accès alternatif |
|---|---|---|
| Téléphone, email personnel | Contact direct = recrutement de Niveau 1, pas de médiation | Demande de profil arbitrée par Kaji |
| Adresse exacte | Localisation précise = risque de sécurité | Ville + pays seulement |
| Pièces d'identité, documents | Données sensibles au sens legal | Vérification interne, en face à face ou à la demande |
| Notes internes, commentaires RH | Jugement non fondé, non auditable | Usage interne exclusivement |
| Historique de recrutement | Divulgation aux entreprises concurrentes | Usage interne |
| Salaire, prétentions | Rapport de force défavorable au candidat | Usage interne |
| Score de matching d'un candidat hors contexte | Faux signal de valeur | Uniquement face à une demande de recrutement précise |

### §9.3 Demande de profil

Le seul chemin par lequel une entreprise obtient plus qu'une fiche publique :

```text
1. L'entreprise soumet une demande liée à un besoin de recrutement.
2. Kaji vérifie que la demande est légitime (entreprise identifiée, besoin réel).
3. Kaji vérifie la disponibilité EN COURS auprès du candidat.
4. Kaji filtre ce qui peut être transmis.
5. L'accès accordé est tracé (qui, quand, quoi, pour quelle demande).
6. Le candidat est informé de l'accès.
```

Le délai de réponse habituel affiché publiquement est **48 h ouvrées**. C'est un
engagement de service, pas une estimation.

### §9.4 Suppression d'une fiche

Un candidat qui retire sa fiche fait ce qu'il veut de sa visibilité. La page
renvoie alors un **vrai 404** (`notFound()` levé dans `generateMetadata` **et** dans
le corps — sinon un « soft 404 » en HTTP 200, et la fiche reste indexée). La
mention est explicite : *« Un profil retiré de l'annuaire reste consultable
uniquement par l'équipe qui l'a retiré. »*

---

## §10 — Acquisition et sources

`TalentSource` documente d'où vient chaque profil. C'est une donnée
**d'acquisition**, non sensible, affichable, et elle pilote le pilotage commercial.

| Source | Libellé | Remarque |
|---|---|---|
| `WEBSITE` | Site web | Inscription directe sur Kaji.com |
| `WHATSAPP` | WhatsApp | Canal d'acquisition dominant en RDC |
| `FACEBOOK` | Facebook | groupes et pages professionnelles |
| `INSTAGRAM` | Instagram | artisans, commerce, services |
| `LINKEDIN` | LinkedIn | profils déjà qualifiés |
| `SCHOOL` | École | partenariat établissements |
| `UNIVERSITY` | Université |Stages, jeunes diplômés |
| `TRAINING_CENTER` | Centre de formation | filières professionnelles |
| `REFERRAL` | Recommandation | bouche-à-oreille **qualifié** |
| `FIELD_OUTREACH` | Prospection terrain | équipe Kaji sur le terrain |
| `RECRUITMENT_CAMPAIGN` | Campagne de recrutement | campagnes événementielles |
| `DIRECT_SIGNUP` | Inscription directe | formulaire /candidats |

La source est affichable publiquement sur la fiche et sert à mesurer l'efficacité
relative de chaque canal. Elle n'est jamais utilisée pour évaluer le candidat.

---

## §11 — Modèle économique et prestations

### §11.1 Principe : payer pour le résultat

Kaji ne facture **pas** la publication d'une annonce, l'accès à l'annuaire, ni le
nombre de candidats présentés. Le modèle est une **rémunération de succès** ou un
forfait de mission.

### §11.2 Prestations prévues

| Prestation | Cible | Description |
|---|---|---|
| **Recrutement (Talent Pool)** | Entreprise | Recherche, qualification, shortlist, entretiens, placement |
| **Mission de conseil (Prestataire Pool)** | Entreprise | Sélection d'un indépendant, vérification de capacité, contractualisation |
| **Contrat de prestation** | Prestataire | Mise en relation et accompagnement administratif (§22) |
| **Accompagnement RH** | Entreprise, organisation | Structuration des besoins, modèles d'entretien, intégration (§22) |

Le détail des montants n'est pas dans ce document : il relève de la politique
commerciale de Mokengeli SARLU, pas de la spécification produit.

### §11.3 Éthique commerciale

- Aucun placement n'est « vendu » au candidat.
- Aucune entreprise ne peut acheter l'accès au vivier.
- Aucune discrimination positive ou négative sur un critère non pertinent pour le
  poste (origine, genre, âge, religion, situation familiale) n'est autorisée dans
  les critères de matching. Les critères du moteur (§8) sont des critères de
  **poste**.

---

## §12 — Conversion

Objectif de conversion unique, prioritaire : **obtenir une demande de recrutement
qualifiée.** La croissance du vivier est un moyen, pas un but.

### §12.1 Appels à l'action principaux

Deux entrées, **toujours dans cet ordre** :

| Ordre | Libellé | Cible | Route |
|---|---|---|---|
| 1 | « Je cherche un talent » | Entreprise | `/entreprise/inscription` |
| 2 | « Créer mon profil » | Candidat | `/candidats` |

L'ordre n'est pas esthétique : le message de médiation sert d'abord les entreprises,
et le vivier s'alimente par les candidats. Cet ordre est implémenté dans
`PRIMARY_CTA` (`src/lib/site.ts`) et dans `CtaSection`, et ne doit jamais être
inversé. Sur l'accueil, le hero propose d'abord « Découvrir les opportunités »
(`/opportunites`), puis « Créer un compte » (`/candidats`) ; il n'y a pas de bloc
`CtaSection` final.

### §12.2 CTA secondaires

| Libellé | Contexte | Route |
|---|---|---|
| « Demander ce profil » | Fiche talent, colonne latérale | `/contact?objet=demande-profil&candidat=<id>` |
| « Déposer un besoin » | Fiche talent, carte secondaire | `/entreprise/inscription` |
| « Réinitialiser les filtres » | Annuaire sans résultat | `/talents` |
| « Voir l'annuaire des talents » | 404 | `/talents` |
| « Parcourir les talents » | Page en préparation | `/talents` |

### §12.3 Preuve et réassurance

Les blocs de confiance de la page d'accueil ne sont pas décoratifs, ils répondent à
une objection précise :

| Argument | Objection à laquelle il répond |
|---|---|
| « Données personnelles maîtrisées » | « Où vont mes coordonnées ? » |
| « Profils vérifiés par l'équipe » | « La vérification est-elle réelle ? » |
| « Deux viviers distincts » | « CDI ou freelance, je ne sais pas ce que je paie. » |
| « Opérateur identifié » | « Qui porte les engagements ? » |
| « Réponse habituelle sous 48 h ouvrées » | « Est-ce que quelqu'un va vraiment répondre ? » |

---

## §13 — Annuaire et filtres

L'annuaire des talents est la vitrine du produit. C'est aussi la seule page qui
combine SEO, performance et interactivité.

### §13.1 Principes

- **URL comme état.** Chaque combinaison de filtres est une URL propre :
  partageable, indexable, fonctionnelle sans JavaScript. Soumission par `GET`.
- **Filtre actif = pastille retirable.** L'utilisateur voit ce qu'il a coché et
  peut le retirer sans rouvrir le formulaire.
- **Toute modification de filtre autre que `page` ramène à la page 1.** Sans cela,
  retirer un filtre depuis la page 4 affiche une page vide. Invariant codé dans
  `buildDirectoryHref()`.
- **Filtre invalide signalé, pas silencieux.** Un paramètre hors liste blanche est
  rejeté et l'utilisateur en est informé par un `Alert tone="warning"`.
- **Pagination réelle.** Un lien d'archive mène à du contenu lisible : une page
  au-delà de la dernière renvoie la dernière page, pas une page blanche.

### §13.2 Filtres disponibles

| Paramètre URL | Type | Comportement |
|---|---|---|
| `q` | texte, ≤ 120 car. | Tous les termes (≥ 2 car.) doivent être trouvés, normalisation accents et casse |
| `category` | slugs CSV | Catégorie de métier |
| `domain` | slugs CSV | Secteur d'activité |
| `city` | slugs CSV | Ville |
| `skill` | libellés CSV | Compétence (correspondance normalisée) |
| `language` | codes CSV | Langue, liste blanche stricte |
| `availability` | valeurs CSV | Disponibilité **effective** |
| `contract` | valeurs CSV | Type de contrat recherché |
| `pool` | valeurs CSV | Vivier (talent / prestataire) |
| `experienceMin` / `experienceMax` | entiers 0–50 | Bornes incluses, réordonnées si inversées |
| `verified` | flag | Profils vérifiés uniquement |
| `sort` | enum | `relevance` (défaut), `experience_desc`, `experience_asc`, `recent` |
| `page` | entier ≥ 1 | Pagination |
| `pageSize` | 6–48 | 12 par défaut |

Tri `relevance` : utilise le moteur §8, donc identique au matching de demande.

Tri `recent` : tri par fraîcheur de mise à jour. Note : l'implémentation mock
actuelle trie alphabétiquement faute d'exposer la date brute — c'est une
**limitation connue** à corriger au branchement SQL (voir `06-progress-tracker.md`).

### §13.3 Affichage

Trois compteurs en tête de page, mis à jour en fonction des filtres :

```text
X profils publiés · Y mobilisables · Z vérifiés
```

« Mobilisable » compte uniquement `AVAILABLE`, `AVAILABLE_WITH_DELAY` et `OPEN` —
c'est-à-dire exactement ce qui est présenter à une entreprise sans reconfirmation.
C'est un indicateur d'honnêteté, pas un argument commercial.

---

## §14 — Fiche publique talent

Page `/talents/[id]`. Structure en deux colonnes à partir de `lg` : contenu à
gauche, conversion et garde-fous à droite.

### §14.1 Sections, dans cet ordre

1. **En-tête** — identifiant `KJ-AAAA-NNNN` (en mono, discret), badge « Vérifié »,
   badge de vivier, nom, titre, disponibilité effective en grand, puis quatre
   faits : catégorie, localisation, expérience, nombre de langues.
2. **Résumé professionnel** — texte rédigé pour être public.
3. **Disponibilité** — badge + explication + contrats recherchés + mention
   télétravail. Mention de pied obligatoire : *« La disponibilité affichée est
   vérifiée par l'équipe Kaji. Elle ne vaut pas engagement de recrutement. »*
4. **Expérience** — poste, organisation, période, résumé, réalisations.
5. **Compétences** — libellés + niveaux auto-déclarés. Mention de pied
   obligatoire : *« Les niveaux indiqués sont auto-déclarés par le candidat. Kaji
   ne publie aucune note de valeur. »*
6. **Formation**
7. **Langues**
8. **Certifications**

### §14.2 Colonne latérale

1. **Carte de conversion** — « Ce profil vous intéresse ? » + CTA « Demander ce
   profil » + « Réponse habituelle sous 48 h ouvrées ».
2. **Alerte de confidentialité** — liste explicite de ce qui n'est **pas** publié :
   ni téléphone ni email, ni adresse ni documents, ni notes internes ni
   historique. Cette carte est un actif de confiance, pas un avertissement
   juridique.
3. **Carte secondaire** — « Vous recrutez pour ce type de profil ? » → Déposer un
   besoin.
4. **Mention d'opérateur** — nom du produit + opérateur.

### §14.3 Règles

- Chaque section vide affiche une ligne explicite (« Aucune expérience détaillée
  n'est publiée »), jamais un bloc blanc.
- Le niveau de compétence est présenté comme **auto-déclaré**, jamais comme une
  évaluation.
- Le code langue est toujours accompagné du libellé complet en `title` et en
  `sr-only` : le code court n'est jamais la seule information lue par un lecteur
  d'écran.
- La page ne lit **jamais** un enregistrement interne, seulement un
  `PublicTalentProfile`.

---

## §15 — Parcours candidat

### §15.1 Objectif du parcours

Passer d'un contact isolé (WhatsApp, recommandation) à une présence professionnelle
durable, vérifiée, et maîtrisée par le candidat.

### Étapes

| # | Étape | Ce que fait le candidat | Ce que fait Kaji |
|---|---|---|---|
| 1 | Découverte | Voit l'annuaire, comprend que les coordonnées ne sont pas publiques | Publie un vivier attractif et honnête |
| 2 | Intérêt | Clique « Créer mon profil » | — |
| 3 | Création de compte | S'authentifie (Clerk) | Crée le compte candidat |
| 4 | Profil | Renseigne identité, métier, compétences, langues, expérience, formation | Valide les champs publiables |
| 5 | Visibilité | Choisit `PUBLIC`, `ON_REQUEST` ou `PRIVATE` | Respecte strictement ce choix |
| 6 | Disponibilité | Déclare sa disponibilité et son délai | Calcule la disponibilité effective |
| 7 | Vérification | Envoie ses justificatifs (hors ligne ou via espace sécurisé) | Vérifie, date, statue `VERIFIED` |
| 8 | Vie du profil | Actualise au moins tous les 30 jours | Alerte l'équipe en cas de péremption |
| 9 | Opportunité | Voit les entreprises qui demandent son profil | Filtre, arbitre, informe le candidat avant contact |

### §15.2 Règles du parcours

- Le candidat **voit toujours** sa disponibilité effective et sa bande de
  fraîcheur, et comprend pourquoi elle est ce qu'elle est.
- Le candidat est **informé** avant qu'une entreprise le contacte. Il n'est jamais
  contacté « à son insu » par une démarche Kaji.
- Le candidat peut **retirer sa fiche** à tout moment, sans justification.
- Aucune démarche de sortie agressive : pas d'e-mail de réactivation non
  sollicité, pas de relance agressive. La réactualisation du vivier est un travail
  **humain** de l'équipe (§18).

---

## §16 — Parcours entreprise

### Étapes

| # | Étape | Ce que fait l'entreprise | Ce que fait Kaji |
|---|---|---|---|
| 1 | Découverte | Arrive sur `/entreprises` ou `/` | Explique le modèle, refuse le vocabulaire « marketplace » |
| 2 | Compte | Crée un compte entreprise, déclare sa société | Vérifie l'entreprise (KYC simplifié) |
| 3 | Besoin | Dépose un besoin : poste, mission, compétences, localisation, urgence, contrat, budget | Analyse, qualifie, reformule si nécessaire |
| 4 | Recherche | Suit la demande | Constitue la shortlist via le moteur §8 + arbitrage humain |
| 5 | Shortlist | Reçoit 3 à 5 profils argumentés, avec le détail du matching | Justifie chaque profil présenté |
| 6 | Accès profil | Demande l'accès complet à un profil | Vérifie la disponibilité en cours, filtre, trace, informe |
| 7 | Entretiens | Participe aux entretiens planifiés | Planifie, relance, compte rendu |
| 8 | Sélection | Choisit ou refuse | Trace la décision |
| 9 | Placement | Formalise | Conclut, rend le placement |

### §16.2 Règles

- L'entreprise ne « postule » pas, elle **mandate**. Le vocabulaire de l'interface
  reflète cela : « Déposer un besoin », « Confier un recrutement », jamais
  « Publier une annonce ».
- Le délai de réponse est affiché publiquement (48 h ouvrées pour une demande de
  profil) et suivi comme un engagement de service.
- L'entreprise n'a **jamais** accès direct aux coordonnées : elle passe par Kaji
  jusqu'à l'étape du placement, où le canal de contact est établi avec
  l'accord du candidat et du médiateur.
- Une entreprise refusée ou non solvente est exclue du vivier : la réputation du
  vivier est un actif.

---

## §17 — Parcours administrateur et RH

### §17.1 Médiateur RH — journée type

1. **Tableau de bord** — demandes en cours par statut, profils à reconfirmer
   (fraîcheur > 30 j), entretiens de la journée, alertes.
2. **Traiter une demande** — analyser, qualifier, passer `REVIEWING → SEARCHING`.
3. **Construire la shortlist** — filtrer le vivier, lancer le moteur §8, ajouter
   des notes internes, composer une justification par profil.
4. **Contacter les candidats** — vérifier la disponibilité en cours, obtenir
   l'accord, consigner.
5. **Envoyer** — passer `SHORTLISTED → SENT_TO_CLIENT`, notifier l'entreprise.
6. **Piloter les entretiens** — planifier, relancer, consigner les comptes rendus.
7. **Clôturer** — `SELECTED` puis `PLACED`, ou retour `SEARCHING` si le client
   n'a pas validé.
8. **Maintenir le vivier** — campagnes de reconfirmation, mise à jour des profils
   périmés, vérification de nouveaux arrivants.

### §17.2 Administrateur

- Gestion des référentiels : catégories, domaines, villes, compétences, langues.
- Gestion des comptes et des rôles.
- Lecture du journal d'audit, révoquer un accès.
- Paramètres de plateforme.

### §17.3 Règles

- Un Super Admin est requis pour réactiver un profil archivé — action journalisée.
- Toute transmission de données à une entreprise est journalisée avec l'identité
  de l'agent, l'horodatage, le périmètre transmis et la demande de référence.
- Les notes internes ne sont **jamais** lisibles par une entreprise, quel que soit
  son statut. L'audit montre **qui a accédé**, pas « ce que l'entreprise a lu ».

---

## §18 — Processus de médiation

C'est le cœur du modèle économique et le différenciateur face aux plateformes
automatisées.

### §18.1 Principes

1. **Un interlocuteur unique** suit la demande de l'analyse au placement.
2. **La décision de présenter est humaine.** Le moteur propose, l'humain décide.
3. **La vérification est datée et documentée**, jamais déclarative.
4. **Le candidat garde la main** sur ses données, sa visibilité et sa
   disponibilité.
5. **Aucune sortie du processus sans trace.** Qui a dit quoi, à qui, quand.

### §18.2 Cycle de médiation d'une demande

| Étape | Responsable | Entrée | Sortie |
|---|---|---|---|
| 1. Réception | Système | Besoin déposé | Demande `NEW` |
| 2. Analyse | Médiateur | Demande `NEW` | Besoin reformulé, faisabilité |
| 3. Recherche | Médiateur + moteur | Besoin qualifié | Candidats pressentis |
| 4. Confirmation | Médiateur → candidat | Candidats pressentis | Disponibilités réelles, accords |
| 5. Arbitrage | Médiateur | Scores + informations humaines | Shortlist 3–5, justifiée |
| 6. Présentation | Médiateur | Shortlist | `SENT_TO_CLIENT`, entreprise informée |
| 7. Accès | Médiateur | Demande de l'entreprise | Profil complet filtré, tracé |
| 8. Entretiens | Médiateur | Shortlist acceptée | Entretiens planifiés, comptes rendus |
| 9. Décision | Entreprise | Entretiens | `SELECTED` ou retour `SEARCHING` |
| 10. Placement | Médiateur | `SELECTED` | `PLACED`, accompagnement |

### §18.3 Ce que la médiation n'est pas

- Ce n'est pas de la **sous-traitance de masse** : un volume de « envoyer 100 CV à
  une boîte n'est pas un service.
- Ce n'est pas de l'**automatisation déguisée** : si aucun humain ne décide, ce
  n'est pas de la médiation.
- Ce n'est pas de l'**agence de placement** : Kaji ne vend pas un candidat, elle
  rend un résultat de recherche documenté.

---

## §19 — Règles métier transverses

Règles qui traversent tout le produit, à ne jamais enfreindre.

| # | Règle | Codée dans |
|---|---|---|
| R1 | Avoir un compte ≠ être disponible | `availability.ts` |
| R2 | La disponibilité affichée est la disponibilité **effective** | `availability.ts`, `availability-presentation.ts` |
| R3 | Un profil de plus de 30 jours ne peut jamais afficher « Disponible » | `FRESHNESS_THRESHOLDS_DAYS` |
| R4 | Seuls `VERIFIED`, `AVAILABLE`, `OPEN_TO_OPPORTUNITIES` sont présentables | `PRESENTABLE_STATUSES` |
| R5 | Toute transition d'état non listée est refusée | `status-transitions.ts` |
| R6 | `PLACED` est un état final | `status-transitions.ts` |
| R7 | Une fiche non publiable renvoie un vrai 404 | `notFound()` dans `generateMetadata` |
| R8 | Aucune coordonnée dans une route publique | `PublicTalent` par construction |
| R9 | Aucune note de valeur d'un candidat n'est publiée | `matching.ts`, textes de `§14` |
| R10 | Le score de matching n'est jamais un pourcentage de qualité | `matching.ts` |
| R11 | Le refus par défaut est la règle en autorisation | `permissions.ts` (`[]` = refus) |
| R12 | Le rôle provient **exclusivement** de la session serveur | `permissions.ts` (jamais du client) |
| R13 | Toute URL de filtre est validée par liste blanche | `talent-filters.ts` |
| R14 | Changer un filtre ramène à la page 1 | `buildDirectoryHref()` |
| R15 | Kaji.com est la marque, Mokengeli SARLU est l'opérateur | `BRAND`, footer (§27) |
| R16 | Les données de démonstration sont fictives et marquées | `src/lib/mock/` (§44) |
| R17 | Un profil retiré reste consultable par l'équipe qui l'a retiré | §9.4 |
| R18 | Le refus de RH est définitif sans arbitrage humain | `verify.ts` à créer — `updateTag` + journal |
| R19 | L'identité est structurée Nom/Postnom/Prénom ; le postnom est facultatif et jamais inventé ; affichage « Nom Postnom Prénom » | `person-name.ts` (§4.4) |
| R20 | Les dates de parcours sont au mois et à l'année (`YYYY-MM`) ; le jour n'existe jamais ; la fin est ≥ au début | `period.ts`, `candidate-profile.ts` (§4.4) |

---

## §20 — Rôles et autorisations

`Role` définit six rôles. La matrice complète est dans
`src/lib/domain/permissions.ts` et constitue la **source de vérité unique**.

| Rôle | Libellé | Périmètre |
|---|---|---|
| `CANDIDATE` | Candidat | Son profil, ses documents, ses demandes d'entretien |
| `PRESTATAIRE` | Prestataire | Idem, dans le vivier prestataires |
| `EMPLOYER` | Entreprise | Ses demandes, ses shortlists, ses entretiens, lecture de l'affichage public des candidats |
| `RH` | RH (médiateur) | Le vivier, les demandes, les entretiens, les placements, lecture de l'audit |
| `ADMIN` | Administrateur | Tout sauf les paramètres et la réanimation |
| `SUPER_ADMIN` | Super administrateur | Tout, y compris paramètres, audit complet, réanimation de profil archivé |

### §20.1 Matrice — points critiques

| Ressource | CANDIDATE | PRESTATAIRE | EMPLOYER | RH | ADMIN | SUPER_ADMIN |
|---|---|---|---|---|---|---|
| `PUBLIC_TALENT` | READ | READ | READ | READ | FULL | FULL |
| `CANDIDATE_PROFILE` | R/U | R/U | **READ** | FULL | FULL | FULL |
| `CANDIDATE_PRIVATE_DATA` | R/U | R/U | **—** | READ | FULL | FULL |
| `CANDIDATE_DOCUMENTS` | FULL | FULL | **—** | R/C/U | FULL | FULL |
| `COMPANY` | READ | READ | R/U | READ | FULL | FULL |
| `JOB_REQUEST` | READ | READ | FULL | FULL | FULL | FULL |
| `APPLICATION` | READ | READ | FULL | FULL | FULL | FULL |
| `SHORTLIST` | — | — | READ | FULL | FULL | FULL |
| `INTERVIEW` | READ | READ | FULL | FULL | FULL | FULL |
| `PLACEMENT` | — | — | READ | FULL | FULL | FULL |
| `NOTIFICATION` | READ | READ | READ | READ | FULL | FULL |
| `AUDIT_LOG` | — | — | **—** | READ | READ | FULL |
| `SETTINGS` | — | — | **—** | — | READ | FULL |
| `USER` | — | — | **—** | — | FULL | FULL |

`READ`/`R`, `FULL` = R+C+U+D+MANAGE. `—` = tableau vide `[]`, refus par défaut.

### §20.2 Lecture de la matrice

- `MANAGE` inclut lecture, création, modification, suppression et actions
  d'arbitrage.
- `NONE` est **l'absence d'entrée** : refus par défaut. Toute nouvelle ressource
  ajoutée à `RESOURCE` est refusée à tout le monde tant qu'elle n'est pas
  explicitement accordée.
- `EMPLOYER` a `CANDIDATE_PROFILE: READ` — c'est-à-dire **l'affichage public du
  candidat**, jamais son dossier. Le commentaire est explicite dans le code.
- `CANDIDATE_PRIVATE_DATA: []` pour `EMPLOYER` est un choix produit, pas une
  oubli : les coordonnées d'un candidat ne sont accessibles à une entreprise que
  par une **demande de profil arbitrée par Kaji** (§9.3).
- Le rôle est lu **exclusivement** de la session serveur. Un rôle déclaré par le
  client (`metadata`, header, body) n'est **jamais** lu. C'est la règle de sécurité
  la plus importante du système d'autorisation.

---

## §21 — MVP : périmètre

Le MVP de Kaji.com est un **vivier public de qualité**. Il n'est pas un produit
complet, et il ne prétend pas l'être. Chaque page livrée doit être honnête sur ce
qui n'existe pas encore.

### §21.1 Dans le périmètre du MVP

| # | Fonctionnalité | État initial | Notes |
|---|---|---|---|
| M1 | Page d'accueil | Livré | Hero illustré, présentation de la plateforme, catégories illustrées, talents en vedette, section « Pourquoi Kaji » ; sans panneaux par public ni CTA final |
| M2 | Annuaire des talents `/talents` | Livré | Filtres URL, facettes, tri, pagination, états vides et d'erreur |
| M3 | Fiche publique talent `/talents/[id]` | Livré | En-tête, 7 sections, colonne conversion + confidentialité, 404 réel |
| M4 | Domain layer complet (statuts, disponibilité, fraîcheur, matching, RBAC, visibilité, transitions) | Livré | 198 tests Vitest, dans le même répertoire que les modules. Couverture : `status-transitions`, `availability`, `freshness`, `permissions`, `matching`, `person-name`, `period`, `visibility`, `auth/role`, `validation/*`. Non couvert : `enums.ts` (constantes pures), `talent.ts` (types), et les enveloppes `auth/session.ts` / `auth/guard.ts` (Clerk/Next sans logique propre) |
| M5 | Design system (tokens, boutons, champs, cartes, badges, états, mise en page) | Livré | Base pour toutes les phases suivantes |
| M6 | En-tête, pied de page, mentions de marque | Livré | Opérateur nommé |
| M7 | Pages légales et institutionnelles | Placeholder | Doivent être livrées avant la production |
| M8 | Contact / demande de profil | Placeholder | CTA actif, formulaire à livrer |

### §21.2 Hors périmètre du MVP

Espaces authentifiés (candidat, entreprise, RH, admin), workflow de recrutement,
opportunités publiées, documents, notifications. Ces éléments sont décrits en
§15 à §18 et planifiés dans `06-progress-tracker.md`.

### §21.3 Règle de honnêteté du MVP

Une route non livrée s'affiche avec `PlaceholderPage`, qui **annonce
explicitement** que la page est en préparation et propose un chemin de
contournement. Elle n'invente pas de contenu et n'est jamais indexée
(`robots: { index: false, follow: true }`).

Dès qu'une page réelle est livrée, `PlaceholderPage` disparaît de cette route.
Vérifié dans `06-progress-tracker.md`.

---

## §22 — Fonctionnalités futures

Planifiées, non implémentées. Chaque élément est un objectif, pas un engagement.

### §22.1 Court terme

| Fonctionnalité | Description |
|---|---|
| Espaces authentifiés | Portails candidat, entreprise, RH, admin (Clerk, §26) |
| Formulaire de contact | Réception de demandes, avec accus de réception |
| Politiques légales complètes | Mentions légales, confidentialité, cookies |
| Page « À propos » | Institutionnel, méthode, équipe |
| Recherche par pertinence améliorée | Tri `recent` basé sur la vraie date de mise à jour |
| Pagination de l'annuaire par curseur | Au-delà de ~5 000 profils, passer en pagination par curseur |

### §22.2 Moyen terme

| Fonctionnalité | Description |
|---|---|
| Espace candidat | Profil éditable, documents, disponibilité, historique (§15) |
| Espace entreprise | Dépôt de besoin, suivi de demande, shortlists (§16) |
| Espace RH | Tableau de bord, file de travail, campagne de reconfirmation (§17) |
| Workflow de recrutement complet | Machine à états §6 en production |
| Publication d'opportunités | Offres et missions après vérification du besoin |
| Notifications | E-mail et in-app, centre de notifications |
| Journal d'audit complet | Qui a accédé à quoi, traçable et consultable |
| Recherche avancée | Recherche à facettes, sauvegarde de recherches, alertes |

### §22.3 Long terme

| Fonctionnalité | Description |
|---|---|
| Documents et pièces justificatives | Stockage objet, vérification, cycle de vie |
| Contrats et contractualisation prestataire | Templates, signature, conformité |
| Évaluations et historiques | Bilans post-placement, satisfaction, réactivité du vivier |
| Facturation | Prestations, facturation, abonnements entreprise |
| API partenaires | Accès contrôlé aux viviers et aux besoins |
| Extension géographique | Nouvelles villes, nouvelles langues, nouveaux marchés |
| Mobile natif | Application iOS / Android pour les candidats sur le terrain |

---

## §27 — Mentions de marque et opérateur

> Section intercalée dans la numérotation globale : elle appartient au produit
> parce qu'elle est une exigence éditoriale opposable, pas une décision technique.
> L'architecture la traite en `03` §38 (variables) et `03` §39 (sécurité).

### §27.1 Les deux noms

| Nom | Nature | Où il apparaît | Où il n'apparaît jamais |
|---|---|---|---|
| **Kaji.com** | Marque produit | Navigation, titres de page, e-mails transactionnels, supports commerciaux | — |
| **Mokengeli SARLU** | Société opératrice | Pied de page de l'espace public, pages légales, contrats, factures, courriers juridiques | Titres de page, messages d'interface, noms de boutons |

Le pied de page de tout l'espace public porte la mention
`Operated by Mokengeli SARLU`, servie par `BRAND.operatorLabel` dans
`src/lib/site.ts`. Elle n'est pas optionnelle : la retirer rend le site
non-conforme à la séparation marque / opérateur décidée au §1.2.

### §27.2 Signature

`Talent & Professional Mediation Platform` — `BRAND.tagline`. Le mot
« Mediation » est le discriminant du positionnement (§2) : il porte la promesse
dans la signature et se Suffit à lui-même. Il n'a pas besoin d'être réexpliqué à
chaque occurrence.

Le mot « marketplace » est **interdit** pour désigner Kaji.com : ni dans
l'interface, ni dans les titres, ni dans les e-mails. Deux usages légitimes
subsistent dans `src/`, tous deux désignant autre chose qu'à Kaji :

1. `src/lib/mock/talents.ts` — une réalisation professionnelle d'un candidat du
   vivier de démonstration : « Développement d'une marketplace à 4 000 commandes
   par mois ». Un candidat peut avoir construit une place de marché.
2. `src/app/a-propos/page.tsx` — la page qui **explique** l'interdiction au
   visiteur, en le renvoyant à ce premier cas.

Aucune occurrence ne désigne Kaji.com. C'est la règle à vérifier, pas
l'absence du mot : une page d'interdiction doit pouvoir nommer ce qu'elle
interdit.

Dans les documents internes, le terme reste autorisé pour expliquer la raison de
l'interdiction, comme ici.

Les équivalents à éviter sont listés en §66.2 de `design.md` : *marketplace*,
*plateforme d'offres*, *annuaire d'emplois*, *répartir une offre*,
*publier une annonce*.

### §27.3 Emplacements obligatoires

| Emplacement | Contenu exigé |
|---|---|
| Pied de page, espace public | Marque, tagline, `Operated by Mokengeli SARLU` |
| `EC-12` Mentions légales | Raison sociale, forme juridique, siège, contacts, hébergeur |
| `EC-13` Confidentialité | Responsable de traitement = Mokengeli SARLU, pas Kaji.com |
| E-mails transactionnels | Signataire `Mokengeli SARLU`, objet anhydre (jamais le nom du candidat) |
| Titres de page (`metadata.title`) | `Kaji.com` uniquement |

### §27.4 Règles de rédaction

1. Pointuation complète dans les contextes commerciaux, juridiques et
   éditoriaux ; forme courte dans l'interface produit.
2. Jamais de traduction de la dénomination sociale.
3. Jamais d'entité inventée : pas de « Kaji SAS », pas de « Kaji Africa », pas
   de partnership qui n'est pas signé.
4. Le nom du candidat n'apparaît jamais dans l'objet d'un e-mail (§35) : il
   apparaît dans le corps, où il est contextualisé.
5. Le domaine hérité `jobs.mokengelisarlu.com` est une trace administrative et
   **n'est jamais affiché** (R15).

### §27.5 État réel

`BRAND` (`name`, `shortName`, `tagline`, `domain`, `legacyDomain`, `locale`),
`PRIMARY_CTA`, `FOOTER_NAV` et `LEGAL_NAV` sont centralisés dans
`src/lib/site.ts`. Le pied de page consomme `BRAND`, `FOOTER_NAV` et `LEGAL_NAV`.
Les pages légales sont encore en `PlaceholderPage` et ne portent donc pas encore
les mentions légales complètes de §27.3 — c'est le jalon M7 de
`06-progress-tracker.md`.
