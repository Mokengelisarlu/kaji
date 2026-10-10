import type {
  Certification,
  Education,
  Experience,
  LanguageSkill,
  PublicTalentProfile,
  Skill,
} from "@/lib/domain/talent";
import type { AvailabilityType, ContractType, ProfileVisibility } from "@/lib/domain/enums";
import {
  AVAILABILITY_TYPE,
  CONTRACT_TYPE,
  EFFECTIVE_AVAILABILITY,
  POOL_KIND,
  TALENT_SOURCE,
} from "@/lib/domain/enums";

export type StoredCandidateProfile = PublicTalentProfile & {
  readonly clerkUserId?: string;
  /** Contact privé, jamais exposé sur la fiche publique (§9). */
  readonly email?: string;
  /** Contact privé, jamais exposé sur la fiche publique (§9). */
  readonly phone?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly profileVisibility: ProfileVisibility;
};

const profiles = new Map<string, StoredCandidateProfile>();

export function generateCandidateId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `KJ-${year}-${random}`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Champs modifiables par le candidat lui-même. `clerkUserId` est exclu :
 * l'appartenance est vérifiée séparément par la requête d'écriture.
 */
export type UpdateCandidateProfileInput = Omit<CreateCandidateProfileInput, "clerkUserId">;

/**
 * Patch ciblé sur un ou plusieurs blocs du profil (dashboard).
 * Seules les propriétés fournies sont mises à jour ; `undefined` = inchangé.
 */
export type CandidateProfileSectionPatch = {
  readonly summary?: string;
  readonly skills?: readonly Omit<Skill, "id">[];
  readonly languages?: readonly LanguageSkill[];
  readonly experiences?: readonly Omit<Experience, "id">[];
  readonly education?: readonly Omit<Education, "id">[];
  readonly certifications?: readonly Omit<Certification, "id">[];
  readonly declaredAvailability?: AvailabilityType;
  readonly desiredContractTypes?: readonly ContractType[];
  readonly isRemoteEligible?: boolean;
};

export type CreateCandidateProfileInput = {
  readonly clerkUserId?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly fullName: string;
  readonly headline: string;
  readonly categoryLabel: string;
  readonly domainLabels?: readonly string[];
  readonly city: string;
  readonly country: string;
  readonly isRemoteEligible?: boolean;
  readonly yearsOfExperience: number;
  readonly summary: string;
  readonly skills: readonly Omit<Skill, "id">[];
  readonly languages: readonly LanguageSkill[];
  readonly experiences?: readonly Omit<Experience, "id">[];
  readonly education?: readonly Omit<Education, "id">[];
  readonly certifications?: readonly Omit<Certification, "id">[];
  readonly profileVisibility: ProfileVisibility;
  readonly declaredAvailability?: (typeof AVAILABILITY_TYPE)[keyof typeof AVAILABILITY_TYPE];
  readonly desiredContractTypes?: readonly (typeof CONTRACT_TYPE)[keyof typeof CONTRACT_TYPE][];
};

export function createCandidateProfile(input: CreateCandidateProfileInput): StoredCandidateProfile {
  const candidateId = generateCandidateId();
  const now = new Date().toISOString();
  const categorySlug = slugify(input.categoryLabel);
  const domainSlugs = (input.domainLabels ?? []).map(slugify);

  const profile: StoredCandidateProfile = {
    candidateId,
    fullName: input.fullName,
    headline: input.headline,
    categorySlug,
    categoryLabel: input.categoryLabel,
    domainSlugs,
    location: {
      citySlug: slugify(input.city),
      city: input.city,
      country: input.country || "France",
      isRemoteEligible: input.isRemoteEligible ?? true,
    },
    yearsOfExperience: input.yearsOfExperience,
    skills: input.skills.map((skill, index) => ({
      id: `${candidateId}-skill-${index}`,
      ...skill,
    })),
    languages: input.languages,
    availability: EFFECTIVE_AVAILABILITY.AVAILABLE_WITH_DELAY,
    declaredAvailability: input.declaredAvailability ?? AVAILABILITY_TYPE.OPEN_TO_OPPORTUNITIES,
    desiredContractTypes: input.desiredContractTypes ?? [CONTRACT_TYPE.CDI],
    summary: input.summary,
    poolKind: POOL_KIND.TALENT_POOL,
    isVerified: false,
    source: TALENT_SOURCE.DIRECT_SIGNUP,
    experiences: (input.experiences ?? []).map((exp, index) => ({
      id: `${candidateId}-exp-${index}`,
      ...exp,
    })),
    education: (input.education ?? []).map((edu, index) => ({
      id: `${candidateId}-edu-${index}`,
      ...edu,
    })),
    certifications: (input.certifications ?? []).map((cert, index) => ({
      id: `${candidateId}-cert-${index}`,
      ...cert,
    })),
    clerkUserId: input.clerkUserId,
    email: input.email,
    phone: input.phone,
    createdAt: now,
    updatedAt: now,
    profileVisibility: input.profileVisibility,
  };

  profiles.set(candidateId, profile);
  return profile;
}

export function getCandidateProfile(candidateId: string): StoredCandidateProfile | null {
  return profiles.get(candidateId) ?? null;
}
