import type {
  ActivityType,
  AvailabilityType,
  ContractType,
  EducationStatus,
  EffectiveAvailability,
  LanguageCode,
  LanguageLevel,
  PoolKind,
  TalentSource,
} from "./enums";

/**
 * Formes de données du domaine.
 *
 * Deux principes structurants :
 *
 * 1. `PublicTalent` est la SEULE forme que les routes publiques sont
 *    autorisées à consommer. Elle ne contient aucun champ de contact direct
 *    ni aucune donnée sensible (§9). Les données privées vivent dans
 *    `CandidateProfile`, inaccessible aux repositories publics.
 *
 * 2. Toute forme destinée à l'UI est un DTO explicitement déclaré. Aucun type
 *    de ligne de base de données ne fuit jusqu'aux composants.
 */

/* ------------------------------------------------------------------ */
/* Référentiels                                                       */
/* ------------------------------------------------------------------ */

/** Catégorie de métier. Sert de grouping principal dans l'annuaire. */
export type TalentCategory = {
  readonly slug: string;
  readonly label: string;
  readonly description: string;
  /** Nombre de profils dans le vivier, utilisé pour l'ordre du directory. */
  readonly count: number;
};

/** Domaine / secteur d'activité. Plus transverse que la catégorie. */
export type TalentDomain = {
  readonly slug: string;
  readonly label: string;
};

/** Localité exposée publiquement. Volontairement grossière (§9). */
export type Location = {
  /** Identifiant interne, jamais l'adresse exacte. */
  readonly citySlug: string;
  readonly city: string;
  readonly country: string;
  /** true si la localisation est hors du pays principal d'opération. */
  readonly isRemoteEligible: boolean;
};

/* ------------------------------------------------------------------ */
/* Sous-ensembles du talent                                           */
/* ------------------------------------------------------------------ */

export type Experience = {
  readonly id: string;
  readonly title: string;
  readonly organization: string;
  /** Nature de l'activité (emploi, stage, freelance, bénévolat…). */
  readonly activityType?: ActivityType;
  readonly location?: string;
  /** Début au format `YYYY-MM` (jamais de jour). */
  readonly startDate: string;
  readonly isCurrent: boolean;
  /** Fin au format `YYYY-MM` ; absent si `isCurrent`. */
  readonly endDate?: string;
  readonly summary?: string;
  readonly achievements: readonly string[];
};

export type Education = {
  readonly id: string;
  readonly diploma: string;
  readonly school: string;
  readonly field?: string;
  /** Début au format `YYYY-MM` (ou `YYYY` si le mois est inconnu). */
  readonly startDate?: string;
  /** Fin au format `YYYY-MM` (ou `YYYY` si le mois est inconnu). */
  readonly endDate?: string;
  readonly status?: EducationStatus;
};

export type Skill = {
  readonly id: string;
  readonly label: string;
  /** Niveau auto-déclaré, 1–5. *Jamais* une note de qualité du candidat. */
  readonly level: 1 | 2 | 3 | 4 | 5;
  readonly yearsOfPractice?: number;
};

export type LanguageSkill = {
  readonly code: LanguageCode;
  readonly level: LanguageLevel;
};

export type Certification = {
  readonly id: string;
  readonly name: string;
  readonly issuer: string;
  /** Date d'obtention au format `YYYY-MM` (ou `YYYY` si le mois est inconnu). */
  readonly issuedAt?: string;
  /** Date d'expiration au format `YYYY-MM`, si applicable. */
  readonly expiresAt?: string;
};

/* ------------------------------------------------------------------ */
/* Fiche publique (§9)                                                */
/* ------------------------------------------------------------------ */

/**
 * Champs strictement autorisés sur une page publique.
 *
 * INTERDIT par construction : téléphone, adresse exacte, email personnel,
 * pièces d'identité, documents, notes internes, commentaires RH, scores
 * internes, historique de recrutement.
 *
 * Toute modification de cette liste doit être justifiée dans 03-system-architecture.md.
 */
export type PublicTalent = {
  /** Identifiant candidat, format `KJ-AAAA-NNNN`. Seul identifiant public. */
  readonly candidateId: string;
  readonly fullName: string;
  /** Titre professionnel, ex. « Ingénieur DevOps senior ». */
  readonly headline: string;
  /** Catégorie de métier. */
  readonly categorySlug: string;
  readonly categoryLabel: string;
  /** Domaines d'expertise. */
  readonly domainSlugs: readonly string[];
  readonly location: Location;
  /** Années d'expérience totales, dérivées et non déclarées. */
  readonly yearsOfExperience: number;
  readonly skills: readonly Skill[];
  readonly languages: readonly LanguageSkill[];
  /** Disponibilité effective, jamais la simple déclaration. */
  readonly availability: EffectiveAvailability;
  /** Délai déclaré, conservé pour information contextuelle. */
  readonly declaredAvailability: AvailabilityType;
  readonly desiredContractTypes: readonly ContractType[];
  /** Résumé professionnel, rédigé pour être public. */
  readonly summary: string;
  readonly poolKind: PoolKind;
  /** true si Kaji a vérifié le profil. */
  readonly isVerified: boolean;
  /** Provenance déclarative, non sensible. */
  readonly source: TalentSource;
};

/**
 * Fiche publique complète d'un talent.
 *
 * Ajoute à `PublicTalent` les éléments de parcours qui sont **par construction**
 * publics (§9, §14) : expérience, formation, certifications. Chaque champ de
 * ce type est validé comme publiable lors de la saisie ; c'est l'absence du
 * champ dans ce type qui constitue la garantie, pas sa présence.
 *
 * Toute donnée de contact, coordonnée, pièce d'identité, salaire, note interne
 * ou journal d'audit est volontairement absente : elle n'a pas de projection
 * publique et ne doit jamais être ajoutée à ce type.
 */
export type PublicTalentProfile = PublicTalent & {
  readonly experiences: readonly Experience[];
  readonly education: readonly Education[];
  readonly certifications: readonly Certification[];
};

/* ------------------------------------------------------------------ */
/* Critères de filtrage de l'annuaire (§13)                           */
/* ------------------------------------------------------------------ */

export type TalentSort = "relevance" | "experience_desc" | "experience_asc" | "recent";

export type TalentFilters = {
  readonly query: string;
  readonly categorySlugs: readonly string[];
  readonly domainSlugs: readonly string[];
  readonly citySlugs: readonly string[];
  /** Bornes d'expérience. `[min, max]` en années, bornes incluses. */
  readonly experience: readonly [number, number];
  readonly skillLabels: readonly string[];
  readonly languageCodes: readonly LanguageCode[];
  readonly availabilities: readonly EffectiveAvailability[];
  readonly contractTypes: readonly ContractType[];
  readonly verifiedOnly: boolean;
  readonly poolKinds: readonly PoolKind[];
  readonly sort: TalentSort;
  readonly page: number;
  readonly pageSize: number;
};

export type PaginatedTalents = {
  readonly items: readonly PublicTalent[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
};

/* ------------------------------------------------------------------ */
/* Briques d'analyse pour les listes                                  */
/* ------------------------------------------------------------------ */

/** Agrégats affichés dans l'annuaire, sans exposer de données individuelles. */
export type TalentDirectoryFacets = {
  readonly totalPublished: number;
  readonly verifiedCount: number;
  readonly availableCount: number;
  readonly categories: readonly TalentCategory[];
  readonly domains: readonly TalentDomain[];
  readonly cities: readonly Location[];
  readonly skillLabels: readonly string[];
  readonly languageCodes: readonly string[];
};
