import {
  AVAILABILITY_TYPE,
  CANDIDATE_STATUS,
  POOL_KIND,
  PROFILE_VISIBILITY,
  TALENT_SOURCE,
  VERIFICATION_STATUS,
  type AvailabilityType,
  type CandidateStatus,
  type PoolKind,
  type ProfileVisibility,
  type TalentSource,
  type VerificationStatus,
} from "@/lib/domain/enums";
import { resolveEffectiveAvailability } from "@/lib/domain/availability";
import type {
  Certification,
  Education,
  Experience,
  LanguageSkill,
  Location,
  PublicTalent,
  Skill,
} from "@/lib/domain/talent";
import { LOCATION_BY_SLUG } from "./referentials";

/**
 * Vivier de démonstration.
 *
 * ⚠️ DONNÉES FICTIVES (§44). Ces profils sont inventés pour valider l'UX,
 * la typographie et l'architecture. Ils ne représentent aucune personne réelle
 * et ne doivent jamais être publiés.
 *
 * Ce fichier contient volontairement des champs « internes » (statut,
 * fraîcheur, visibilité) absents de `PublicTalent` : c'est la projection
 * `toPublicTalent` qui décide ce qui devient public. Cette frontière est la
 * garantie principale contre l'exposition de données sensibles.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Ancre temporelle du jeu de données. */
const NOW = new Date();

/** Date située `days` jours avant l'ancre. */
function daysAgo(days: number): Date {
  return new Date(NOW.getTime() - days * MS_PER_DAY);
}

export type MockTalentRecord = {
  readonly candidateId: string;
  readonly fullName: string;
  readonly headline: string;
  readonly categorySlug: string;
  readonly categoryLabel: string;
  readonly domainSlugs: readonly string[];
  readonly citySlug: string;
  readonly yearsOfExperience: number;
  readonly skills: readonly Skill[];
  readonly languages: readonly LanguageSkill[];
  readonly declaredAvailability: AvailabilityType;
  readonly desiredContractTypes: PublicTalent["desiredContractTypes"];
  readonly summary: string;
  readonly poolKind: PoolKind;
  readonly status: CandidateStatus;
  readonly verificationStatus: VerificationStatus;
  readonly source: TalentSource;
  readonly visibility: ProfileVisibility;
  readonly experiences: readonly Experience[];
  readonly education: readonly Education[];
  readonly certifications: readonly Certification[];
  /**
   * Dernière mise à jour volontaire du profil.
   *
   * Une `Date`, pas un nombre de jours : le record est une donnée
   * auto-descriptive, lisible et testable sans charger le module. Convertir
   * ici plutôt qu'à la projection évite que `toPublicTalent` dépende de
   * l'ancre temporelle du fichier.
   */
  readonly lastProfileUpdateAt: Date;
  /** Dernière reconfirmation explicite de la disponibilité. */
  readonly lastAvailabilityConfirmationAt: Date;
};

const RECORDS: readonly MockTalentRecord[] = [
  {
    candidateId: "KJ-2024-0114",
    fullName: "Nadège Kabongo",
    headline: "Ingénieure DevOps senior",
    categorySlug: "informatique",
    categoryLabel: "Informatique & Tech",
    domainSlugs: ["technologie", "finance"],
    citySlug: "kinshasa",
    yearsOfExperience: 8,
    skills: [
      { id: "s-1", label: "Kubernetes", level: 5, yearsOfPractice: 5 },
      { id: "s-2", label: "Terraform", level: 4, yearsOfPractice: 4 },
      { id: "s-3", label: "AWS", level: 4, yearsOfPractice: 4 },
      { id: "s-4", label: "CI/CD", level: 5, yearsOfPractice: 6 },
      { id: "s-5", label: "Python", level: 4, yearsOfPractice: 7 },
      { id: "s-6", label: "Observabilité", level: 3, yearsOfPractice: 2 },
    ],
    languages: [
      { code: "FR", level: "NATIVE" },
      { code: "EN", level: "PROFESSIONAL" },
      { code: "LN", level: "NATIVE" },
    ],
    declaredAvailability: AVAILABILITY_TYPE.ONE_MONTH,
    desiredContractTypes: ["CDI", "CONSULTING"],
    summary:
      "Ingénieure infrastructure ayant industrialisé les déploiements de trois applications bancaires sur Kubernetes. J'aime réduire les incidents et rendre les systèmes prévisibles.",
    poolKind: POOL_KIND.TALENT_POOL,
    status: CANDIDATE_STATUS.AVAILABLE,
    verificationStatus: VERIFICATION_STATUS.VERIFIED,
    source: TALENT_SOURCE.REFERRAL,
    visibility: PROFILE_VISIBILITY.PUBLIC,
    lastProfileUpdateAt: daysAgo(6),
    lastAvailabilityConfirmationAt: daysAgo(6),
    experiences: [
      {
        id: "e-1",
        title: "Ingénieure Plateforme",
        organization: "Groupe bancaire",
        location: "Kinshasa",
        startDate: "2021-03",
        isCurrent: true,
        summary: "Refonte de la plateforme de conteneurs du groupe.",
        achievements: [
          "Temps de déploiement réduit de 40 minutes à 6 minutes",
          "Disponibilité de la plateforme portée à 99,95 %",
          "Mise en place de l'astreinte SRE sur 6 équipes",
        ],
      },
      {
        id: "e-2",
        title: "Développeuse Back-end",
        organization: "Éditeur de logiciels",
        location: "Kinshasa",
        startDate: "2018-01",
        isCurrent: false,
        endDate: "2021-02",
        achievements: ["Migration de 12 services vers une architecture événementielle"],
      },
    ],
    education: [
      {
        id: "ed-1",
        diploma: "Master en informatique",
        school: "Université de Kinshasa",
        field: "Systèmes distribués",
        startDate: "2016",
        endDate: "2018",
      },
    ],
    certifications: [
      {
        id: "c-1",
        name: "Certified Kubernetes Application Developer",
        issuer: "CNCF",
        issuedAt: "2023",
      },
    ],
  },
  {
    candidateId: "KJ-2024-0231",
    fullName: "Boris Tshimanga",
    headline: "Électricien bâtiment qualifié",
    categorySlug: "artisanat",
    categoryLabel: "Artisanat & Services",
    domainSlugs: ["batiment", "energie"],
    citySlug: "lubumbashi",
    yearsOfExperience: 12,
    skills: [
      { id: "s-1", label: "Électricité bâtiment", level: 5, yearsOfPractice: 12 },
      { id: "s-2", label: "Lecture de schémas", level: 4, yearsOfPractice: 9 },
      { id: "s-3", label: "Mise à la terre", level: 4, yearsOfPractice: 8 },
      { id: "s-4", label: "Habilitation électrique", level: 5, yearsOfPractice: 6 },
    ],
    languages: [{ code: "FR", level: "NATIVE" }, { code: "TS", level: "NATIVE" }],
    declaredAvailability: AVAILABILITY_TYPE.IMMEDIATELY,
    desiredContractTypes: ["CDI", "CDD", "PRESTATION"],
    summary:
      "Électricien bâtiment avec plus de dix ans de chantiers dans le Haut-Katanga. Habitué aux calendriers contraints et aux contrôles de conformité.",
    poolKind: POOL_KIND.TALENT_POOL,
    status: CANDIDATE_STATUS.AVAILABLE,
    verificationStatus: VERIFICATION_STATUS.VERIFIED,
    source: TALENT_SOURCE.TRAINING_CENTER,
    visibility: PROFILE_VISIBILITY.PUBLIC,
    lastProfileUpdateAt: daysAgo(12),
    lastAvailabilityConfirmationAt: daysAgo(12),
    experiences: [
      {
        id: "e-1",
        title: "Chef d'équipe électricité",
        organization: "Entreprise de construction",
        location: "Lubumbashi",
        startDate: "2019-06",
        isCurrent: true,
        summary: "Encadrement d'une équipe de 9 électriciens sur des programmes résidentiels.",
        achievements: ["Livraison de 14 bâtiments sans incident électrique majeur"],
      },
    ],
    education: [
      {
        id: "ed-1",
        diploma: "Brevet professionnel en électricité",
        school: "Institut technique de Lubumbashi",
        startDate: "2012",
        endDate: "2015",
      },
    ],
    certifications: [],
  },
  {
    candidateId: "KJ-2024-0087",
    fullName: "Sylvie Mwamba",
    headline: "Comptable générale et analyste",
    categorySlug: "gestion",
    categoryLabel: "Gestion & Administration",
    domainSlugs: ["finance", "retail"],
    citySlug: "kinshasa",
    yearsOfExperience: 6,
    skills: [
      { id: "s-1", label: "Comptabilité générale", level: 5, yearsOfPractice: 6 },
      { id: "s-2", label: "Consolidation", level: 4, yearsOfPractice: 3 },
      { id: "s-3", label: "Contrôle de gestion", level: 4, yearsOfPractice: 4 },
      { id: "s-4", label: "SYSCOHADA / OHADA", level: 5, yearsOfPractice: 6 },
      { id: "s-5", label: "Excel avancé", level: 4, yearsOfPractice: 6 },
    ],
    languages: [{ code: "FR", level: "NATIVE" }, { code: "EN", level: "PROFESSIONAL" }],
    declaredAvailability: AVAILABILITY_TYPE.OPEN_TO_OPPORTUNITIES,
    desiredContractTypes: ["CDI", "CDD"],
    summary:
      "Comptable généraliste, certifiée sur le référentiel OHADA, passée par la consolidation d'un groupe de distribution de six filiales.",
    poolKind: POOL_KIND.TALENT_POOL,
    status: CANDIDATE_STATUS.OPEN_TO_OPPORTUNITIES,
    verificationStatus: VERIFICATION_STATUS.VERIFIED,
    source: TALENT_SOURCE.WEBSITE,
    visibility: PROFILE_VISIBILITY.PUBLIC,
    lastProfileUpdateAt: daysAgo(22),
    lastAvailabilityConfirmationAt: daysAgo(22),
    experiences: [
      {
        id: "e-1",
        title: "Comptable générale",
        organization: "Groupe de distribution",
        location: "Kinshasa",
        startDate: "2022-01",
        isCurrent: true,
        achievements: [
          "Mise en place d'un reporting financier mensuel en 15 jours au lieu de 25",
          "Sécurisation du processus de clôture sur 6 filiales",
        ],
      },
    ],
    education: [
      {
        id: "ed-1",
        diploma: "Licence en sciences de gestion",
        school: "Université catholique de Bukavu",
        field: "Finance",
        startDate: "2016",
        endDate: "2019",
      },
    ],
    certifications: [
      { id: "c-1", name: "Diplôme d'expert-comptable en cours", issuer: "Ordre des experts-comptables", issuedAt: "2024", },
    ],
  },
  {
    candidateId: "KJ-2023-0456",
    fullName: "Landry Ilunga",
    headline: "Développeur full-stack",
    categorySlug: "informatique",
    categoryLabel: "Informatique & Tech",
    domainSlugs: ["technologie", "retail"],
    citySlug: "goma",
    yearsOfExperience: 4,
    skills: [
      { id: "s-1", label: "TypeScript", level: 4, yearsOfPractice: 4 },
      { id: "s-2", label: "React", level: 4, yearsOfPractice: 4 },
      { id: "s-3", label: "Node.js", level: 4, yearsOfPractice: 3 },
      { id: "s-4", label: "PostgreSQL", level: 3, yearsOfPractice: 3 },
    ],
    languages: [{ code: "FR", level: "NATIVE" }, { code: "EN", level: "PROFESSIONAL" }],
    declaredAvailability: AVAILABILITY_TYPE.THREE_MONTHS,
    desiredContractTypes: ["CDI", "FREELANCE"],
    summary:
      "Développeur full-stack livrant des produits complets, du modèle de données à l'interface. À l'aise sur des produits utilisés en production par de vraies équipes.",
    poolKind: POOL_KIND.TALENT_POOL,
    status: CANDIDATE_STATUS.PREQUALIFIED,
    verificationStatus: VERIFICATION_STATUS.PARTIAL,
    source: TALENT_SOURCE.DIRECT_SIGNUP,
    visibility: PROFILE_VISIBILITY.PUBLIC,
    lastProfileUpdateAt: daysAgo(47),
    lastAvailabilityConfirmationAt: daysAgo(60),
    experiences: [
      {
        id: "e-1",
        title: "Développeur full-stack",
        organization: "Startup e-commerce",
        location: "Goma",
        startDate: "2023-02",
        isCurrent: true,
        achievements: ["Développement d'une marketplace à 4 000 commandes par mois"],
      },
    ],
    education: [
      {
        id: "ed-1",
        diploma: "Licence en informatique",
        school: "Université de Goma",
        startDate: "2019",
        endDate: "2022",
      },
    ],
    certifications: [],
  },
  {
    candidateId: "KJ-2024-0392",
    fullName: "Esther Bolingo",
    headline: "Infirmière d'État, bloc opératoire",
    categorySlug: "sante",
    categoryLabel: "Santé & Bien-être",
    domainSlugs: ["sante-privee"],
    citySlug: "kinshasa",
    yearsOfExperience: 9,
    skills: [
      { id: "s-1", label: "Soins intensifs", level: 5, yearsOfPractice: 5 },
      { id: "s-2", label: "Bloc opératoire", level: 4, yearsOfPractice: 4 },
      { id: "s-3", label: "Urgences", level: 5, yearsOfPractice: 9 },
      { id: "s-4", label: "Transmission ciblee", level: 4, yearsOfPractice: 8 },
    ],
    languages: [{ code: "FR", level: "NATIVE" }, { code: "LN", level: "NATIVE" }, { code: "EN", level: "INTERMEDIATE" }],
    declaredAvailability: AVAILABILITY_TYPE.NOT_AVAILABLE,
    desiredContractTypes: ["CDI", "PRESTATION"],
    summary:
      "Infirmière d'État avec neuf ans d'expérience hospitalière, dont cinq en réanimation et quatre en bloc. Recherche un poste en clinique privée ou une activité à temps partiel.",
    poolKind: POOL_KIND.TALENT_POOL,
    status: CANDIDATE_STATUS.UNAVAILABLE,
    verificationStatus: VERIFICATION_STATUS.VERIFIED,
    source: TALENT_SOURCE.UNIVERSITY,
    visibility: PROFILE_VISIBILITY.PUBLIC,
    lastProfileUpdateAt: daysAgo(18),
    lastAvailabilityConfirmationAt: daysAgo(18),
    experiences: [
      {
        id: "e-1",
        title: "Infirmière référente",
        organization: "Hôpital",
        location: "Kinshasa",
        startDate: "2019-09",
        isCurrent: true,
        achievements: ["Protocole de prévention des infections : infections documentées réduites de 60 %"],
      },
    ],
    education: [
      {
        id: "ed-1",
        diploma: "Licence en sciences infirmières",
        school: "Institut de sciences de la santé",
        startDate: "2012",
        endDate: "2016",
      },
    ],
    certifications: [
      { id: "c-1", name: "Réanimation et soins intensifs", issuer: "Ordre national des infirmiers", issuedAt: "2021", },
    ],
  },
  {
    candidateId: "KJ-2025-0008",
    fullName: "Patrick Mukendi",
    headline: "Responsable logistique et entrepôt",
    categorySlug: "gestion",
    categoryLabel: "Gestion & Administration",
    domainSlugs: ["logistique", "industrie"],
    citySlug: "mbuji-mayi",
    yearsOfExperience: 7,
    skills: [
      { id: "s-1", label: "Gestion de stock", level: 5, yearsOfPractice: 7 },
      { id: "s-2", label: "WMS / ERP", level: 4, yearsOfPractice: 4 },
      { id: "s-3", label: "Planification de transport", level: 4, yearsOfPractice: 5 },
      { id: "s-4", label: "Encadrement d'équipe", level: 3, yearsOfPractice: 3 },
    ],
    languages: [{ code: "FR", level: "PROFESSIONAL" }, { code: "LN", level: "NATIVE" }],
    declaredAvailability: AVAILABILITY_TYPE.ONE_MONTH,
    desiredContractTypes: ["CDI", "PRESTATION"],
    summary:
      "Responsable logistique avec expérience des entrepoids de 4 000 m². Réduction notable des ruptures par une réorganisation du processus réception.",
    poolKind: POOL_KIND.TALENT_POOL,
    status: CANDIDATE_STATUS.VERIFIED,
    verificationStatus: VERIFICATION_STATUS.VERIFIED,
    source: TALENT_SOURCE.FIELD_OUTREACH,
    visibility: PROFILE_VISIBILITY.PUBLIC,
    lastProfileUpdateAt: daysAgo(9),
    lastAvailabilityConfirmationAt: daysAgo(9),
    experiences: [
      {
        id: "e-1",
        title: "Responsable logistique",
        organization: "Distributeur industriel",
        location: "Mbuji-Mayi",
        startDate: "2021-04",
        isCurrent: true,
        achievements: ["Ruptures de stock passées de 14 % à 4 % en 18 mois"],
      },
    ],
    education: [
      {
        id: "ed-1",
        diploma: "BTS logistique",
        school: "Institut supérieur de commerce",
        startDate: "2014",
        endDate: "2017",
      },
    ],
    certifications: [],
  },
  {
    candidateId: "KJ-2024-0501",
    fullName: "Aline Nsimba",
    headline: "Chargée de communication",
    categorySlug: "commerce",
    categoryLabel: "Commerce & Relation client",
    domainSlugs: ["retail", "ONG"],
    citySlug: "kinshasa",
    yearsOfExperience: 5,
    skills: [
      { id: "s-1", label: "Stratégie de marque", level: 4, yearsOfPractice: 4 },
      { id: "s-2", label: "Rédaction web", level: 4, yearsOfPractice: 5 },
      { id: "s-3", label: "Réseaux sociaux", level: 5, yearsOfPractice: 5 },
      { id: "s-4", label: "Relations presse", level: 3, yearsOfPractice: 2 },
    ],
    languages: [{ code: "FR", level: "NATIVE" }, { code: "EN", level: "PROFESSIONAL" }, { code: "ES", level: "BASIC" }],
    declaredAvailability: AVAILABILITY_TYPE.IMMEDIATELY,
    desiredContractTypes: ["CDI", "FREELANCE"],
    summary:
      "Chargée de communication avec un réseau solide de médias locaux. A construit l'image de marque d'une startup de services financiers sur 18 mois.",
    poolKind: POOL_KIND.TALENT_POOL,
    status: CANDIDATE_STATUS.AVAILABLE,
    verificationStatus: VERIFICATION_STATUS.VERIFIED,
    source: TALENT_SOURCE.INSTAGRAM,
    visibility: PROFILE_VISIBILITY.PUBLIC,
    lastProfileUpdateAt: daysAgo(4),
    lastAvailabilityConfirmationAt: daysAgo(4),
    experiences: [
      {
        id: "e-1",
        title: "Chargée de communication",
        organization: "Fintech",
        location: "Kinshasa",
        startDate: "2023-08",
        isCurrent: true,
        achievements: ["Audience organique multipliée par 4 en 12 mois"],
      },
    ],
    education: [
      {
        id: "ed-1",
        diploma: "Master en communication",
        school: "Université de Kinshasa",
        field: "Communication organisationnelle",
        startDate: "2017",
        endDate: "2019",
      },
    ],
    certifications: [],
  },
  {
    candidateId: "KJ-2024-0143",
    fullName: "Fabrice Kalonji",
    headline: "Prestataire — froid et climatisation",
    categorySlug: "ingenierie",
    categoryLabel: "Ingénierie & Technique",
    domainSlugs: ["batiment", "energie"],
    citySlug: "kinshasa",
    yearsOfExperience: 11,
    skills: [
      { id: "s-1", label: "Froid industriel", level: 5, yearsOfPractice: 8 },
      { id: "s-2", label: "Climatisation", level: 5, yearsOfPractice: 11 },
      { id: "s-3", label: "Recherche de fuite", level: 4, yearsOfPractice: 7 },
      { id: "s-4", label: "Intervention d'urgence", level: 5, yearsOfPractice: 10 },
    ],
    languages: [{ code: "FR", level: "PROFESSIONAL" }, { code: "LN", level: "PROFESSIONAL" }],
    declaredAvailability: AVAILABILITY_TYPE.IMMEDIATELY,
    desiredContractTypes: ["PRESTATION", "FREELANCE", "CONSULTING"],
    summary:
      "Technicien froid et climatisation en prestation, équipé pour les interventions d'urgence sur le parc cooling des commerces et des bureaux.",
    poolKind: POOL_KIND.PRESTATAIRE_POOL,
    status: CANDIDATE_STATUS.AVAILABLE,
    verificationStatus: VERIFICATION_STATUS.VERIFIED,
    source: TALENT_SOURCE.WHATSAPP,
    visibility: PROFILE_VISIBILITY.PUBLIC,
    lastProfileUpdateAt: daysAgo(14),
    lastAvailabilityConfirmationAt: daysAgo(3),
    experiences: [
      {
        id: "e-1",
        title: "Technicien froid et climatisation — indépendant",
        organization: "Activité propre",
        location: "Kinshasa",
        startDate: "2018-02",
        isCurrent: true,
        summary: "Contrat de maintenance chez 11 clients professionnels.",
        achievements: ["Contrat de maintenance avec une clinique privée"],
      },
    ],
    education: [
      {
        id: "ed-1",
        diploma: "CAP frigoriste",
        school: "Centre de formation technique",
        startDate: "2012",
        endDate: "2014",
      },
    ],
    certifications: [
      { id: "c-1", name: "Habilitation fluides frigorigènes", issuer: "Organisme de contrôle", issuedAt: "2022", expiresAt: "2027-04" },
    ],
  },
  {
    candidateId: "KJ-2023-0288",
    fullName: "Grâce Muteba",
    headline: "Enseignante de français",
    categorySlug: "education",
    categoryLabel: "Éducation & Formation",
    domainSlugs: ["ONG"],
    citySlug: "brazzaville",
    yearsOfExperience: 14,
    skills: [
      { id: "s-1", label: "Pédagogie", level: 5, yearsOfPractice: 14 },
      { id: "s-2", label: "Préparation d'examens", level: 4, yearsOfPractice: 8 },
      { id: "s-3", label: "Suivi pédagogique", level: 4, yearsOfPractice: 6 },
    ],
    languages: [{ code: "FR", level: "NATIVE" }, { code: "LN", level: "PROFESSIONAL" }, { code: "EN", level: "INTERMEDIATE" }],
    declaredAvailability: AVAILABILITY_TYPE.OPEN_TO_OPPORTUNITIES,
    desiredContractTypes: ["CDI", "CDD", "PRESTATION"],
    summary:
      "Enseignante de français expérimentée, formatrice d'adultes dans le cadre de programmes de renforcement linguistique.",
    poolKind: POOL_KIND.TALENT_POOL,
    status: CANDIDATE_STATUS.OPEN_TO_OPPORTUNITIES,
    verificationStatus: VERIFICATION_STATUS.VERIFIED,
    source: TALENT_SOURCE.SCHOOL,
    visibility: PROFILE_VISIBILITY.PUBLIC,
    lastProfileUpdateAt: daysAgo(28),
    lastAvailabilityConfirmationAt: daysAgo(28),
    experiences: [
      {
        id: "e-1",
        title: "Enseignante de français",
        organization: "Établissement secondaire",
        location: "Brazzaville",
        startDate: "2015-09",
        isCurrent: true,
        achievements: ["Préparation de 200 candidats à un examen national"],
      },
    ],
    education: [
      {
        id: "ed-1",
        diploma: "Master en Lettres françaises",
        school: "Université Marien Ngouabi",
        startDate: "2008",
        endDate: "2011",
      },
    ],
    certifications: [],
  },
  {
    candidateId: "KJ-2024-0610",
    fullName: "Junior Kalala",
    headline: "Technicien réseau junior",
    categorySlug: "informatique",
    categoryLabel: "Informatique & Tech",
    domainSlugs: ["technologie"],
    citySlug: "kinshasa",
    yearsOfExperience: 1,
    skills: [
      { id: "s-1", label: "Réseau LAN/WAN", level: 3, yearsOfPractice: 1 },
      { id: "s-2", label: "Configuration d'équipements", level: 3, yearsOfPractice: 1 },
      { id: "s-3", label: "Support utilisateur", level: 3, yearsOfPractice: 1 },
    ],
    languages: [{ code: "FR", level: "NATIVE" }, { code: "LN", level: "NATIVE" }, { code: "EN", level: "INTERMEDIATE" }],
    declaredAvailability: AVAILABILITY_TYPE.IMMEDIATELY,
    desiredContractTypes: ["CDI", "STAGE", "ALTERNANCE"],
    summary:
      "Technicien réseau débutant, sortie de formation. Recherche un premier poste en milieu corporate pour consolider son expérience.",
    poolKind: POOL_KIND.TALENT_POOL,
    status: CANDIDATE_STATUS.NEW,
    verificationStatus: VERIFICATION_STATUS.IN_REVIEW,
    source: TALENT_SOURCE.RECRUITMENT_CAMPAIGN,
    visibility: PROFILE_VISIBILITY.PUBLIC,
    lastProfileUpdateAt: daysAgo(3),
    lastAvailabilityConfirmationAt: daysAgo(3),
    experiences: [
      {
        id: "e-1",
        title: "Technicien réseau (stage)",
        organization: "PME de services",
        location: "Kinshasa",
        startDate: "2025-01",
        isCurrent: false,
        endDate: "2025-06",
        achievements: ["Migration de 3 sites vers un nouveau schéma d'adressage"],
      },
    ],
    education: [
      {
        id: "ed-1",
        diploma: "Licence en réseaux informatiques",
        school: "Institut supérieur de gestion",
        startDate: "2021",
        endDate: "2025",
      },
    ],
    certifications: [{ id: "c-1", name: "CCNA", issuer: "Cisco", issuedAt: "2024", },
    ],
  },
  {
    candidateId: "KJ-2023-0121",
    fullName: "Nadine Lokwa",
    headline: "Chargée de recrutement (prestataire)",
    categorySlug: "gestion",
    categoryLabel: "Gestion & Administration",
    domainSlugs: ["technologie", "retail"],
    citySlug: "douala",
    yearsOfExperience: 10,
    skills: [
      { id: "s-1", label: "Sourcing", level: 5, yearsOfPractice: 8 },
      { id: "s-2", label: "Entretiens structurés", level: 5, yearsOfPractice: 9 },
      { id: "s-3", label: "Création de fiches de poste", level: 4, yearsOfPractice: 6 },
      { id: "s-4", label: "Suivi d'expérience candidat", level: 4, yearsOfPractice: 7 },
    ],
    languages: [{ code: "FR", level: "PROFESSIONAL" }, { code: "EN", level: "PROFESSIONAL" }, { code: "ES", level: "INTERMEDIATE" }],
    declaredAvailability: AVAILABILITY_TYPE.OPEN_TO_OPPORTUNITIES,
    desiredContractTypes: ["CONSULTING", "PRESTATION", "FREELANCE"],
    summary:
      "Chargée de recrutement en prestation, spécialiste des profils techniques et commerciaux. Constitue des viviers pour le compte de plusieurs PME.",
    poolKind: POOL_KIND.PRESTATAIRE_POOL,
    status: CANDIDATE_STATUS.VERIFIED,
    verificationStatus: VERIFICATION_STATUS.VERIFIED,
    source: TALENT_SOURCE.REFERRAL,
    visibility: PROFILE_VISIBILITY.PUBLIC,
    lastProfileUpdateAt: daysAgo(134),
    lastAvailabilityConfirmationAt: daysAgo(134),
    experiences: [
      {
        id: "e-1",
        title: "Consultante en recrutement",
        organization: "Cabinet de conseil RH",
        location: "Douala",
        startDate: "2019-11",
        isCurrent: true,
        achievements: ["35 recrutements réalisés sur 24 mois"],
      },
    ],
    education: [
      {
        id: "ed-1",
        diploma: "Master en management des ressources humaines",
        school: "Université de Douala",
        startDate: "2014",
        endDate: "2016",
      },
    ],
    certifications: [],
  },
  {
    candidateId: "KJ-2025-0022",
    fullName: "Blaise Kabemba",
    headline: "Mécanicien automobile",
    categorySlug: "artisanat",
    categoryLabel: "Artisanat & Services",
    domainSlugs: ["industrie", "retail"],
    citySlug: "lubumbashi",
    yearsOfExperience: 6,
    skills: [
      { id: "s-1", label: "Diagnostic moteur", level: 4, yearsOfPractice: 6 },
      { id: "s-2", label: "Électricité automobile", level: 4, yearsOfPractice: 4 },
      { id: "s-3", label: "Entretien courant", level: 5, yearsOfPractice: 6 },
    ],
    languages: [{ code: "FR", level: "PROFESSIONAL" }, { code: "RN", level: "NATIVE" }, { code: "SW", level: "BASIC" }],
    declaredAvailability: AVAILABILITY_TYPE.IMMEDIATELY,
    desiredContractTypes: ["CDI", "CDD", "PRESTATION"],
    summary:
      "Mécanicien polyvalent, habitué à l'accueil client et au diagnostic. Recherche un poste stable en atelier ou en station-service.",
    poolKind: POOL_KIND.PRESTATAIRE_POOL,
    status: CANDIDATE_STATUS.AVAILABLE,
    verificationStatus: VERIFICATION_STATUS.PARTIAL,
    source: TALENT_SOURCE.FACEBOOK,
    visibility: PROFILE_VISIBILITY.PUBLIC,
    lastProfileUpdateAt: daysAgo(16),
    lastAvailabilityConfirmationAt: daysAgo(16),
    experiences: [
      {
        id: "e-1",
        title: "Mécanicien",
        organization: "Garage",
        location: "Lubumbashi",
        startDate: "2021-05",
        isCurrent: true,
        achievements: ["Prise en charge de l'entretien de 60 véhicules par mois"],
      },
    ],
    education: [
      {
        id: "ed-1",
        diploma: "Brevet professionnel en mécanique automobile",
        school: "Institut technique",
        startDate: "2018",
        endDate: "2020",
      },
    ],
    certifications: [],
  },
  {
    candidateId: "KJ-2024-0663",
    fullName: "Céline Tshibangu",
    headline: "Responsable marketing digital",
    categorySlug: "commerce",
    categoryLabel: "Commerce & Relation client",
    domainSlugs: ["technologie", "retail"],
    citySlug: "kinshasa",
    yearsOfExperience: 8,
    skills: [
      { id: "s-1", label: "SEO", level: 4, yearsOfPractice: 5 },
      { id: "s-2", label: "Google Ads", level: 4, yearsOfPractice: 4 },
      { id: "s-3", label: "Analyse de données", level: 4, yearsOfPractice: 4 },
      { id: "s-4", label: "CRM", level: 3, yearsOfPractice: 3 },
    ],
    languages: [{ code: "FR", level: "NATIVE" }, { code: "EN", level: "PROFESSIONAL" }, { code: "PT", level: "INTERMEDIATE" }],
    declaredAvailability: AVAILABILITY_TYPE.THREE_MONTHS,
    desiredContractTypes: ["CDI", "CONSULTING"],
    summary:
      "Responsable marketing digital, à l'aise sur les cycles courts et la mesure d'impact. Encadre une équipe de deux personnes.",
    poolKind: POOL_KIND.TALENT_POOL,
    status: CANDIDATE_STATUS.IN_PROCESS,
    verificationStatus: VERIFICATION_STATUS.VERIFIED,
    source: TALENT_SOURCE.WEBSITE,
    visibility: PROFILE_VISIBILITY.PUBLIC,
    lastProfileUpdateAt: daysAgo(20),
    lastAvailabilityConfirmationAt: daysAgo(20),
    experiences: [
      {
        id: "e-1",
        title: "Responsable marketing digital",
        organization: "E-commerce",
        location: "Kinshasa",
        startDate: "2022-03",
        isCurrent: true,
        achievements: ["Coût d'acquisition réduit de 38 % en 12 mois"],
      },
    ],
    education: [
      {
        id: "ed-1",
        diploma: "Licence en marketing",
        school: "Institut de gestion",
        startDate: "2015",
        endDate: "2018",
      },
    ],
    certifications: [],
  },
  {
    candidateId: "KJ-2024-0170",
    fullName: "Hervé Mbuyamba",
    headline: "Agronome",
    categorySlug: "agriculture",
    categoryLabel: "Agriculture & Agro",
    domainSlugs: ["agroalimentaire", "ONG"],
    citySlug: "goma",
    yearsOfExperience: 5,
    skills: [
      { id: "s-1", label: "Agronomie", level: 4, yearsOfPractice: 5 },
      { id: "s-2", label: "Diagnostic des cultures", level: 4, yearsOfPractice: 4 },
      { id: "s-3", label: "Sécurité alimentaire", level: 3, yearsOfPractice: 2 },
    ],
    languages: [{ code: "FR", level: "PROFESSIONAL" }, { code: "EN", level: "PROFESSIONAL" }, { code: "SW", level: "INTERMEDIATE" }],
    declaredAvailability: AVAILABILITY_TYPE.OPEN_TO_OPPORTUNITIES,
    desiredContractTypes: ["CDD", "PRESTATION", "CONSULTING"],
    summary:
      "Agronome terrain, experience des programmes d'accompagnement de petits producteurs dans la région des lacs.",
    poolKind: POOL_KIND.PRESTATAIRE_POOL,
    status: CANDIDATE_STATUS.CONTACTED,
    verificationStatus: VERIFICATION_STATUS.UNVERIFIED,
    source: TALENT_SOURCE.RECRUITMENT_CAMPAIGN,
    visibility: PROFILE_VISIBILITY.ON_REQUEST,
    lastProfileUpdateAt: daysAgo(76),
    lastAvailabilityConfirmationAt: daysAgo(76),
    experiences: [
      {
        id: "e-1",
        title: "Agronome superviseur",
        organization: "Programme d'appui agricole",
        location: "Goma",
        startDate: "2022-09",
        isCurrent: true,
        achievements: ["Suivi de 420 producteurs sur 12 communes"],
      },
    ],
    education: [
      {
        id: "ed-1",
        diploma: "Ingénieur agronome",
        school: "Faculté d'agronomie",
        startDate: "2016",
        endDate: "2021",
      },
    ],
    certifications: [],
  },
  {
    candidateId: "KJ-2025-0041",
    fullName: "Deborah Mwenze",
    headline: "Coiffeuse et styliste",
    categorySlug: "artisanat",
    categoryLabel: "Artisanat & Services",
    domainSlugs: ["retail"],
    citySlug: "kinshasa",
    yearsOfExperience: 4,
    skills: [
      { id: "s-1", label: "Coiffure", level: 5, yearsOfPractice: 4 },
      { id: "s-2", label: "Coloration", level: 4, yearsOfPractice: 3 },
      { id: "s-3", label: "Management de salon", level: 3, yearsOfPractice: 2 },
    ],
    languages: [{ code: "FR", level: "NATIVE" }, { code: "LN", level: "NATIVE" }, { code: "EN", level: "BASIC" }],
    declaredAvailability: AVAILABILITY_TYPE.ONE_MONTH,
    desiredContractTypes: ["PRESTATION", "CDD"],
    summary:
      "Coiffeuse-styliste, tient son propre salon depuis deux ans. En recherche d'un emplacement dans un salon établi.",
    poolKind: POOL_KIND.PRESTATAIRE_POOL,
    status: CANDIDATE_STATUS.PREQUALIFIED,
    verificationStatus: VERIFICATION_STATUS.PARTIAL,
    source: TALENT_SOURCE.FACEBOOK,
    visibility: PROFILE_VISIBILITY.PUBLIC,
    lastProfileUpdateAt: daysAgo(38),
    lastAvailabilityConfirmationAt: daysAgo(38),
    experiences: [
      {
        id: "e-1",
        title: "Coiffeuse-styliste indépendante",
        organization: "Activité propre",
        location: "Kinshasa",
        startDate: "2023-04",
        isCurrent: true,
        achievements: ["Environ 40 clientes fidèles"],
      },
    ],
    education: [
      {
        id: "ed-1",
        diploma: "Formation professionnelle coiffure",
        school: "Centre de formation",
        startDate: "2021",
        endDate: "2022",
      },
    ],
    certifications: [],
  },
] as const;

/**
 * Projette un enregistrement interne vers la forme publique.
 *
 * Cette fonction est la frontière de sécurité du MVP. Elle omet
 * délibérément : coordonnées, adresse exacte, email, documents, notes internes,
 * expérience détaillée (réservée à la demande de profil via Kaji).
 */
export function toPublicTalent(record: MockTalentRecord, now: Date = NOW): PublicTalent {
  const availability = resolveEffectiveAvailability({
    status: record.status,
    declaredAvailability: record.declaredAvailability,
    lastProfileUpdateAt: record.lastProfileUpdateAt,
    lastAvailabilityConfirmationAt: record.lastAvailabilityConfirmationAt,
    now,
  });

  return {
    candidateId: record.candidateId,
    fullName: record.fullName,
    headline: record.headline,
    categorySlug: record.categorySlug,
    categoryLabel: record.categoryLabel,
    domainSlugs: record.domainSlugs,
    location: locationFor(record.citySlug),
    yearsOfExperience: record.yearsOfExperience,
    skills: record.skills,
    languages: record.languages,
    availability,
    declaredAvailability: record.declaredAvailability,
    desiredContractTypes: record.desiredContractTypes,
    summary: record.summary,
    poolKind: record.poolKind,
    isVerified: record.verificationStatus === VERIFICATION_STATUS.VERIFIED,
    source: record.source,
  };
}

/** Localité du vivier. La liste n'est jamais vide ; l'erreur est donc impossible. */
function locationFor(citySlug: string): Location {
  const found = LOCATION_BY_SLUG.get(citySlug);
  if (found !== undefined) {
    return found;
  }
  throw new Error(
    `Localité inconnue dans le vivier de démonstration : « ${citySlug} ». Ajouter l'entrée dans lib/mock/referentials.ts.`,
  );
}

/** Un profil n'est publiable que s'il est visible et non archivé. */
export function isPublishable(record: MockTalentRecord): boolean {
  return (
    record.visibility === PROFILE_VISIBILITY.PUBLIC && record.status !== CANDIDATE_STATUS.ARCHIVED
  );
}

export const MOCK_RECORDS: readonly MockTalentRecord[] = RECORDS;

export const MOCK_TALENTS: readonly PublicTalent[] = RECORDS.filter(isPublishable).map((record) =>
  toPublicTalent(record),
);
