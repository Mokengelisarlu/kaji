/**
 * Statuts et énumérations du domaine Kaji.
 *
 * Contraintes :
 * - toute valeur est une union de chaînes littérales dérivée d'un objet `as const` ;
 * - chaque union possède son libellé français dans le même fichier, typé par
 *   `satisfies Record<Union, string>` : ajouter une valeur casse la compilation
 *   tant que le libellé n'est pas fourni ;
 * - aucune chaîne de statut libre n'est autorisée ailleurs dans le code.
 */

/* ------------------------------------------------------------------ */
/* Viviers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Deux viviers distincts (§3.4). Les structures techniques sont partagées,
 * la logique métier ne l'est pas.
 */
export const POOL_KIND = {
  /** Recrutement salarié : CDI, CDD, stage, alternance. */
  TALENT_POOL: "TALENT_POOL",
  /** Professionnels indépendants / prestataires sur des missions. */
  PRESTATAIRE_POOL: "PRESTATAIRE_POOL",
} as const;

export type PoolKind = (typeof POOL_KIND)[keyof typeof POOL_KIND];

export const POOL_KIND_LABEL = {
  TALENT_POOL: "Vivier de talents",
  PRESTATAIRE_POOL: "Vivier de prestataires",
} as const satisfies Record<PoolKind, string>;

/* ------------------------------------------------------------------ */
/* Statut candidat (§3.3)                                             */
/* ------------------------------------------------------------------ */

export const CANDIDATE_STATUS = {
  NEW: "NEW",
  CONTACTED: "CONTACTED",
  PREQUALIFIED: "PREQUALIFIED",
  VERIFIED: "VERIFIED",
  AVAILABLE: "AVAILABLE",
  OPEN_TO_OPPORTUNITIES: "OPEN_TO_OPPORTUNITIES",
  IN_PROCESS: "IN_PROCESS",
  PLACED: "PLACED",
  UNAVAILABLE: "UNAVAILABLE",
  ARCHIVED: "ARCHIVED",
} as const;

export type CandidateStatus = (typeof CANDIDATE_STATUS)[keyof typeof CANDIDATE_STATUS];

export const CANDIDATE_STATUS_LABEL = {
  NEW: "Nouveau",
  CONTACTED: "Contacté",
  PREQUALIFIED: "Préqualifié",
  VERIFIED: "Vérifié",
  AVAILABLE: "Disponible",
  OPEN_TO_OPPORTUNITIES: "Ouvert aux opportunités",
  IN_PROCESS: "En cours de processus",
  PLACED: "Placé",
  UNAVAILABLE: "Indisponible",
  ARCHIVED: "Archivé",
} as const satisfies Record<CandidateStatus, string>;

/**
 * Statuts qui autorisent Kaji à présenter le profil à une entreprise.
 * Un statut seul ne suffit pas : la fraîcheur (§3.2) est également évaluée.
 */
export const PRESENTABLE_STATUSES: readonly CandidateStatus[] = [
  CANDIDATE_STATUS.VERIFIED,
  CANDIDATE_STATUS.AVAILABLE,
  CANDIDATE_STATUS.OPEN_TO_OPPORTUNITIES,
] as const;

/* ------------------------------------------------------------------ */
/* Fraîcheur du profil (§3.2)                                          */
/* ------------------------------------------------------------------ */

export const FRESHNESS_BAND = {
  /** 0–30 jours. */
  RECENT: "RECENT",
  /** 31–90 jours. */
  NEEDS_UPDATE: "NEEDS_UPDATE",
  /** > 90 jours. */
  STALE: "STALE",
} as const;

export type FreshnessBand = (typeof FRESHNESS_BAND)[keyof typeof FRESHNESS_BAND];

export const FRESHNESS_BAND_LABEL = {
  RECENT: "Profil récent",
  NEEDS_UPDATE: "Profil à actualiser",
  STALE: "Profil ancien",
} as const satisfies Record<FreshnessBand, string>;

/** Seuils en jours. Constantes uniques : jamais de littéraux magiques dispersés. */
export const FRESHNESS_THRESHOLDS_DAYS = {
  recentMaxDays: 30,
  needsUpdateMaxDays: 90,
} as const;

/* ------------------------------------------------------------------ */
/* Disponibilité (§3.1, §3.2)                                          */
/* ------------------------------------------------------------------ */

/**
 * Ce que le candidat a déclaré. Volontairement distinct de `CandidateStatus` :
 * un candidat `VERIFIED` peut déclarer `NOT_AVAILABLE`.
 */
export const AVAILABILITY_TYPE = {
  IMMEDIATELY: "IMMEDIATELY",
  ONE_MONTH: "ONE_MONTH",
  THREE_MONTHS: "THREE_MONTHS",
  OPEN_TO_OPPORTUNITIES: "OPEN_TO_OPPORTUNITIES",
  NOT_AVAILABLE: "NOT_AVAILABLE",
} as const;

export type AvailabilityType =
  (typeof AVAILABILITY_TYPE)[keyof typeof AVAILABILITY_TYPE];

export const AVAILABILITY_TYPE_LABEL = {
  IMMEDIATELY: "Disponible immédiatement",
  ONE_MONTH: "Disponible sous 1 mois",
  THREE_MONTHS: "Disponible sous 3 mois",
  OPEN_TO_OPPORTUNITIES: "Ouvert aux opportunités",
  NOT_AVAILABLE: "Indisponible",
} as const satisfies Record<AvailabilityType, string>;

/**
 * Disponibilité *effective*, résultat de la combinaison statut + declaration
 * declaration + fraîcheur. C'est la seule valeur affichée publiquement.
 */
export const EFFECTIVE_AVAILABILITY = {
  AVAILABLE: "AVAILABLE",
  AVAILABLE_WITH_DELAY: "AVAILABLE_WITH_DELAY",
  OPEN: "OPEN",
  REQUIRES_CONFIRMATION: "REQUIRES_CONFIRMATION",
  UNAVAILABLE: "UNAVAILABLE",
} as const;

export type EffectiveAvailability =
  (typeof EFFECTIVE_AVAILABILITY)[keyof typeof EFFECTIVE_AVAILABILITY];

export const EFFECTIVE_AVAILABILITY_LABEL = {
  AVAILABLE: "Disponible",
  AVAILABLE_WITH_DELAY: "Disponible sous délai",
  OPEN: "Ouvert aux opportunités",
  REQUIRES_CONFIRMATION: "Disponibilité à reconfirmer",
  UNAVAILABLE: "Indisponible",
} as const satisfies Record<EffectiveAvailability, string>;

/* ------------------------------------------------------------------ */
/* Type de contrat (§13)                                              */
/* ------------------------------------------------------------------ */

export const CONTRACT_TYPE = {
  CDI: "CDI",
  CDD: "CDD",
  STAGE: "STAGE",
  ALTERNANCE: "ALTERNANCE",
  FREELANCE: "FREELANCE",
  PRESTATION: "PRESTATION",
  CONSULTING: "CONSULTING",
} as const;

export type ContractType = (typeof CONTRACT_TYPE)[keyof typeof CONTRACT_TYPE];

export const CONTRACT_TYPE_LABEL = {
  CDI: "CDI",
  CDD: "CDD",
  STAGE: "Stage",
  ALTERNANCE: "Alternance",
  FREELANCE: "Freelance",
  PRESTATION: "Prestation",
  CONSULTING: "Mission de conseil",
} as const satisfies Record<ContractType, string>;

/* ------------------------------------------------------------------ */
/* Parcours, niveau professionnel et modalités de travail             */
/* ------------------------------------------------------------------ */

/** Nature d'une expérience de parcours. */
export const ACTIVITY_TYPE = {
  EMPLOYMENT: "EMPLOYMENT",
  INTERNSHIP: "INTERNSHIP",
  FREELANCE: "FREELANCE",
  APPRENTICESHIP: "APPRENTICESHIP",
  VOLUNTEERING: "VOLUNTEERING",
  OTHER: "OTHER",
} as const;

export type ActivityType = (typeof ACTIVITY_TYPE)[keyof typeof ACTIVITY_TYPE];

export const ACTIVITY_TYPE_LABEL = {
  EMPLOYMENT: "Emploi",
  INTERNSHIP: "Stage",
  FREELANCE: "Freelance",
  APPRENTICESHIP: "Apprentissage",
  VOLUNTEERING: "Bénévolat",
  OTHER: "Autre",
} as const satisfies Record<ActivityType, string>;

/** Statut d'une formation. */
export const EDUCATION_STATUS = {
  COMPLETED: "COMPLETED",
  IN_PROGRESS: "IN_PROGRESS",
  INTERRUPTED: "INTERRUPTED",
  OTHER: "OTHER",
} as const;

export type EducationStatus = (typeof EDUCATION_STATUS)[keyof typeof EDUCATION_STATUS];

export const EDUCATION_STATUS_LABEL = {
  COMPLETED: "Terminé",
  IN_PROGRESS: "En cours",
  INTERRUPTED: "Interrompu",
  OTHER: "Autre",
} as const satisfies Record<EducationStatus, string>;

/**
 * Niveau professionnel **déclaré** par le candidat.
 * Jamais déduit automatiquement du seul nombre d'années d'expérience.
 */
export const SENIORITY_LEVEL = {
  BEGINNER: "BEGINNER",
  JUNIOR: "JUNIOR",
  INTERMEDIATE: "INTERMEDIATE",
  SENIOR: "SENIOR",
  EXPERT: "EXPERT",
} as const;

export type SeniorityLevel = (typeof SENIORITY_LEVEL)[keyof typeof SENIORITY_LEVEL];

export const SENIORITY_LEVEL_LABEL = {
  BEGINNER: "Débutant",
  JUNIOR: "Junior",
  INTERMEDIATE: "Intermédiaire",
  SENIOR: "Senior",
  EXPERT: "Expert",
} as const satisfies Record<SeniorityLevel, string>;

/** Explication affichée à côté de chaque niveau (§4). */
export const SENIORITY_LEVEL_HINT = {
  BEGINNER: "Je découvre le métier ou possède peu de pratique.",
  JUNIOR: "J'ai acquis des premières compétences pratiques.",
  INTERMEDIATE: "Je peux travailler de manière relativement autonome.",
  SENIOR: "Je possède une expérience approfondie et une forte autonomie.",
  EXPERT: "Je possède une expertise avancée et peux conseiller ou encadrer d'autres professionnels.",
} as const satisfies Record<SeniorityLevel, string>;

/** Modalités de travail recherchées. */
export const WORK_MODE = {
  ONSITE: "ONSITE",
  HYBRID: "HYBRID",
  REMOTE: "REMOTE",
} as const;

export type WorkMode = (typeof WORK_MODE)[keyof typeof WORK_MODE];

export const WORK_MODE_LABEL = {
  ONSITE: "Sur site",
  HYBRID: "Hybride",
  REMOTE: "À distance",
} as const satisfies Record<WorkMode, string>;

/* ------------------------------------------------------------------ */
/* Statuts de demande de recrutement (§6)                             */
/* ------------------------------------------------------------------ */

export const JOB_REQUEST_STATUS = {
  NEW: "NEW",
  REVIEWING: "REVIEWING",
  SEARCHING: "SEARCHING",
  SHORTLISTED: "SHORTLISTED",
  SENT_TO_CLIENT: "SENT_TO_CLIENT",
  INTERVIEW: "INTERVIEW",
  SELECTED: "SELECTED",
  PLACED: "PLACED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
} as const;

export type JobRequestStatus =
  (typeof JOB_REQUEST_STATUS)[keyof typeof JOB_REQUEST_STATUS];

export const JOB_REQUEST_STATUS_LABEL = {
  NEW: "Nouvelle",
  REVIEWING: "En analyse",
  SEARCHING: "Recherche en cours",
  SHORTLISTED: "Shortlist constituée",
  SENT_TO_CLIENT: "Profils envoyés",
  INTERVIEW: "Entretiens",
  SELECTED: "Sélectionné",
  PLACED: "Placé",
  REJECTED: "Refusé",
  CANCELLED: "Annulée",
} as const satisfies Record<JobRequestStatus, string>;

/* ------------------------------------------------------------------ */
/* Statuts d'entretien (§7)                                            */
/* ------------------------------------------------------------------ */

export const INTERVIEW_STATUS = {
  SCHEDULED: "SCHEDULED",
  COMPLETED: "COMPLETED",
  RESCHEDULED: "RESCHEDULED",
  CANCELLED: "CANCELLED",
  NO_SHOW: "NO_SHOW",
} as const;

export type InterviewStatus = (typeof INTERVIEW_STATUS)[keyof typeof INTERVIEW_STATUS];

export const INTERVIEW_STATUS_LABEL = {
  SCHEDULED: "Planifié",
  COMPLETED: "Réalisé",
  RESCHEDULED: "Reprogrammé",
  CANCELLED: "Annulé",
  NO_SHOW: "Absent",
} as const satisfies Record<InterviewStatus, string>;

/* ------------------------------------------------------------------ */
/* Langues (§9)                                                       */
/* ------------------------------------------------------------------ */

export const LANGUAGE_LEVEL = {
  NATIVE: "NATIVE",
  PROFESSIONAL: "PROFESSIONAL",
  INTERMEDIATE: "INTERMEDIATE",
  BASIC: "BASIC",
} as const;

export type LanguageLevel = (typeof LANGUAGE_LEVEL)[keyof typeof LANGUAGE_LEVEL];

export const LANGUAGE_LEVEL_LABEL = {
  NATIVE: "Langue maternelle",
  PROFESSIONAL: "Professionnel",
  INTERMEDIATE: "Intermédiaire",
  BASIC: "Élémentaire",
} as const satisfies Record<LanguageLevel, string>;

/**
 * Sous-ensemble de langues courant sur le marché cible.
 * Étendre cette union plutôt que d'introduire des chaînes libres.
 */
export const LANGUAGE_CODE = {
  FR: "FR",
  EN: "EN",
  PT: "PT",
  ES: "ES",
  AR: "AR",
  SW: "SW",
  LN: "LN",
  KG: "KG",
  TS: "TS",
  RN: "RN",
  WO: "WO",
} as const;

export type LanguageCode = (typeof LANGUAGE_CODE)[keyof typeof LANGUAGE_CODE];

export const LANGUAGE_CODE_LABEL = {
  FR: "Français",
  EN: "Anglais",
  PT: "Portugais",
  ES: "Espagnol",
  AR: "Arabe",
  SW: "Swahili",
  LN: "Lingala",
  KG: "Kikongo",
  TS: "Tshiluba",
  RN: "Rundi",
  WO: "Wolof",
} as const satisfies Record<LanguageCode, string>;

export const LANGUAGE_CODE_SHORT = {
  FR: "FR",
  EN: "EN",
  PT: "PT",
  ES: "ES",
  AR: "AR",
  SW: "SW",
  LN: "LN",
  KG: "KG",
  TS: "TS",
  RN: "RN",
  WO: "WO",
} as const satisfies Record<LanguageCode, string>;

/* ------------------------------------------------------------------ */
/* Source d'acquisition (§10)                                         */
/* ------------------------------------------------------------------ */

export const TALENT_SOURCE = {
  WEBSITE: "WEBSITE",
  WHATSAPP: "WHATSAPP",
  FACEBOOK: "FACEBOOK",
  INSTAGRAM: "INSTAGRAM",
  LINKEDIN: "LINKEDIN",
  SCHOOL: "SCHOOL",
  UNIVERSITY: "UNIVERSITY",
  TRAINING_CENTER: "TRAINING_CENTER",
  REFERRAL: "REFERRAL",
  FIELD_OUTREACH: "FIELD_OUTREACH",
  RECRUITMENT_CAMPAIGN: "RECRUITMENT_CAMPAIGN",
  DIRECT_SIGNUP: "DIRECT_SIGNUP",
} as const;

export type TalentSource = (typeof TALENT_SOURCE)[keyof typeof TALENT_SOURCE];

export const TALENT_SOURCE_LABEL = {
  WEBSITE: "Site web",
  WHATSAPP: "WhatsApp",
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
  LINKEDIN: "LinkedIn",
  SCHOOL: "École",
  UNIVERSITY: "Université",
  TRAINING_CENTER: "Centre de formation",
  REFERRAL: "Recommandation",
  FIELD_OUTREACH: "Prospection terrain",
  RECRUITMENT_CAMPAIGN: "Campagne de recrutement",
  DIRECT_SIGNUP: "Inscription directe",
} as const satisfies Record<TalentSource, string>;

/* ------------------------------------------------------------------ */
/* Vérification et visibilité                                          */
/* ------------------------------------------------------------------ */

export const VERIFICATION_STATUS = {
  UNVERIFIED: "UNVERIFIED",
  IN_REVIEW: "IN_REVIEW",
  PARTIAL: "PARTIAL",
  VERIFIED: "VERIFIED",
  REJECTED: "REJECTED",
} as const;

export type VerificationStatus =
  (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];

export const VERIFICATION_STATUS_LABEL = {
  UNVERIFIED: "Non vérifié",
  IN_REVIEW: "En cours de vérification",
  PARTIAL: "Partiellement vérifié",
  VERIFIED: "Vérifié",
  REJECTED: "Vérification refusée",
} as const satisfies Record<VerificationStatus, string>;

/** Contrôle exercé par le candidat sur la visibilité de sa fiche (§4.2). */
export const PROFILE_VISIBILITY = {
  /** Fiche publique visible dans l'annuaire. */
  PUBLIC: "PUBLIC",
  /** Visible uniquement sur demande explicite d'une entreprise. */
  ON_REQUEST: "ON_REQUEST",
  /** Masqué de tout canal externe. */
  PRIVATE: "PRIVATE",
} as const;

export type ProfileVisibility =
  (typeof PROFILE_VISIBILITY)[keyof typeof PROFILE_VISIBILITY];

export const PROFILE_VISIBILITY_LABEL = {
  PUBLIC: "Profil public",
  ON_REQUEST: "Visible sur demande",
  PRIVATE: "Profil privé",
} as const satisfies Record<ProfileVisibility, string>;

/* ------------------------------------------------------------------ */
/* Rôles (§20)                                                        */
/* ------------------------------------------------------------------ */

export const ROLE = {
  CANDIDATE: "CANDIDATE",
  PRESTATAIRE: "PRESTATAIRE",
  EMPLOYER: "EMPLOYER",
  RH: "RH",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];

export const ROLE_LABEL = {
  CANDIDATE: "Candidat",
  PRESTATAIRE: "Prestataire",
  EMPLOYER: "Entreprise",
  RH: "RH",
  ADMIN: "Administrateur",
  SUPER_ADMIN: "Super administrateur",
} as const satisfies Record<Role, string>;
