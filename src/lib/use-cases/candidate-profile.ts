import {
  availabilityBlockSchema,
  candidateProfileSchema,
  certificationsBlockSchema,
  educationBlockSchema,
  experiencesBlockSchema,
  languagesBlockSchema,
  skillsBlockSchema,
  summaryBlockSchema,
  type CandidateProfileSubmissionInput,
} from "@/lib/validation/candidate-profile";
import {
  createCandidateProfileInDb,
  deleteCandidateProfileByClerkUserId,
  getCandidateProfileByClerkUserId,
  updateCandidateProfile,
  updateCandidateProfileSections,
} from "@/lib/repositories/candidate-repository";
import type { CandidateProfileSectionPatch, StoredCandidateProfile } from "@/lib/store/candidate-profiles";
import { CONTRACT_TYPE } from "@/lib/domain/enums";
import type { LanguageCode, LanguageLevel } from "@/lib/domain/enums";

export type CandidateProfileState = {
  readonly status: "idle" | "success" | "error" | "invalid";
  readonly errors: Record<string, string[]>;
  readonly candidateId?: string;
  readonly talentUrl?: string;
  readonly message?: string;
};

function parseCommaSeparated(value: string | undefined): string[] {
  if (!value || value.trim().length === 0) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

function parseAchievements(value: string | undefined): string[] {
  if (!value || value.trim().length === 0) return [];
  return value
    .split(/\n|;/)
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

/**
 * Lecture des champs de formulaire candidat (création **et** mise à jour).
 *
 * Le formulaire d'édition réutilise exactement les mêmes noms de champs que
 * l'onboarding : `skills[index].label`, `languages[index].code`, etc. Une
 * seule source de vérité évite la dérive entre les deux flux.
 */
function parseSkills(formData: FormData): Array<{ label: string; level: number; yearsOfPractice: number | undefined }> {
  const skills: Array<{ label: string; level: number; yearsOfPractice: number | undefined }> = [];
  let idx = 0;
  while (formData.get(`skills[${idx}].label`)) {
    const label = formData.get(`skills[${idx}].label`) as string;
    const level = formData.get(`skills[${idx}].level`) as string;
    const years = formData.get(`skills[${idx}].yearsOfPractice`) as string;
    if (label) {
      skills.push({
        label,
        level: parseInt(level) || 1,
        yearsOfPractice: years && years.trim() !== "" ? parseInt(years) : undefined,
      });
    }
    idx++;
  }
  return skills;
}

function parseLanguages(formData: FormData): Array<{ code: LanguageCode; level: LanguageLevel }> {
  const languages: Array<{ code: LanguageCode; level: LanguageLevel }> = [];
  let idx = 0;
  while (formData.get(`languages[${idx}].code`)) {
    const code = formData.get(`languages[${idx}].code`) as string;
    const level = formData.get(`languages[${idx}].level`) as string;
    if (code) {
      languages.push({ code: code as LanguageCode, level: level as LanguageLevel });
    }
    idx++;
  }
  return languages;
}

type ExperienceRaw = {
  title: string;
  organization: string;
  location?: string;
  startDate: string;
  isCurrent: boolean;
  endDate?: string;
  summary?: string;
  achievements: string[];
};

type EducationRaw = {
  diploma: string;
  school: string;
  field?: string;
  startYear?: string;
  endYear?: string;
};

type CertificationRaw = {
  name: string;
  issuer: string;
  issuedYear?: string;
  expiresAt?: string;
};

function parseExperiences(formData: FormData): ExperienceRaw[] {
  const experiences: ExperienceRaw[] = [];
  let idx = 0;
  while (formData.get(`experiences[${idx}].title`)) {
    const title = formData.get(`experiences[${idx}].title`) as string;
    if (!title) {
      idx++;
      continue;
    }
    const isCurrent = formData.get(`experiences[${idx}].isCurrent`) === "on";
    experiences.push({
      title,
      organization: formData.get(`experiences[${idx}].organization`) as string,
      location: (formData.get(`experiences[${idx}].location`) as string) || undefined,
      startDate: formData.get(`experiences[${idx}].startDate`) as string,
      isCurrent,
      endDate: isCurrent ? undefined : (formData.get(`experiences[${idx}].endDate`) as string) || undefined,
      summary: (formData.get(`experiences[${idx}].summary`) as string) || undefined,
      achievements: parseAchievements(formData.get(`experiences[${idx}].achievements`) as string),
    });
    idx++;
  }
  return experiences;
}

function parseEducation(formData: FormData): EducationRaw[] {
  const education: EducationRaw[] = [];
  let idx = 0;
  while (formData.get(`education[${idx}].diploma`)) {
    const diploma = formData.get(`education[${idx}].diploma`) as string;
    if (!diploma) {
      idx++;
      continue;
    }
    education.push({
      diploma,
      school: formData.get(`education[${idx}].school`) as string,
      field: (formData.get(`education[${idx}].field`) as string) || undefined,
      startYear: formData.get(`education[${idx}].startYear`) as string,
      endYear: formData.get(`education[${idx}].endYear`) as string,
    });
    idx++;
  }
  return education;
}

function parseCertifications(formData: FormData): CertificationRaw[] {
  const certifications: CertificationRaw[] = [];
  let idx = 0;
  while (formData.get(`certifications[${idx}].name`)) {
    const name = formData.get(`certifications[${idx}].name`) as string;
    if (!name) {
      idx++;
      continue;
    }
    certifications.push({
      name,
      issuer: formData.get(`certifications[${idx}].issuer`) as string,
      issuedYear: formData.get(`certifications[${idx}].issuedYear`) as string,
      expiresAt: (formData.get(`certifications[${idx}].expiresAt`) as string) || undefined,
    });
    idx++;
  }
  return certifications;
}

function extractCandidateProfileInput(formData: FormData): CandidateProfileSubmissionInput {
  const raw = Object.fromEntries(formData.entries());

  const skills = parseSkills(formData);
  const languages = parseLanguages(formData);
  const experiences = parseExperiences(formData);
  const education = parseEducation(formData);
  const certifications = parseCertifications(formData);

  const desiredContractTypes = formData.getAll("desiredContractTypes") as string[];

  const nom = (raw.nom as string) || "";
  const prenom = (raw.prenom as string) || "";
  const computedFullName = (raw.fullName as string) || `${prenom} ${nom}`.trim() || nom || prenom;

  return {
    fullName: computedFullName || (raw.fullName as string),
    headline: raw.headline as string,
    categoryLabel: raw.categoryLabel as string,
    domainLabels: raw.domainLabels as string,
    city: raw.city as string,
    country: (raw.country as string) || "République Démocratique du Congo",
    isRemoteEligible: raw.isRemoteEligible === "on" || raw.isRemoteEligible === "true",
    yearsOfExperience: parseInt(raw.yearsOfExperience as string) || 0,
    summary: raw.summary as string,
    skills,
    languages,
    experiences,
    education,
    certifications,
    profileVisibility: raw.profileVisibility,
    declaredAvailability: raw.declaredAvailability,
    desiredContractTypes: desiredContractTypes.length > 0 ? desiredContractTypes : undefined,
  } as unknown as CandidateProfileSubmissionInput;
}

function errorsFromZod(issues: Array<{ path: (string | number | symbol)[]; message: string }>): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = issue.path.join(".") || "form";
    errors[key] = errors[key] ? [...errors[key], issue.message] : [issue.message];
  }
  return errors;
}

export async function evaluateCandidateProfileSubmission(
  formData: FormData,
  clerkUserId?: string,
): Promise<CandidateProfileState> {
  const parsed = candidateProfileSchema.safeParse(extractCandidateProfileInput(formData));
  if (!parsed.success) {
    return { status: "invalid", errors: errorsFromZod(parsed.error.issues) };
  }

  try {
    const profile = await createCandidateProfileInDb({
      ...parsed.data,
      clerkUserId,
      domainLabels: parseCommaSeparated(parsed.data.domainLabels as string | undefined),
      skills: parsed.data.skills.map((s: any) => ({ label: s.label, level: s.level, yearsOfPractice: s.yearsOfPractice === "" ? undefined : (typeof s.yearsOfPractice === 'number' ? s.yearsOfPractice : (s.yearsOfPractice ? Number(s.yearsOfPractice) : undefined)) })) as any,
      languages: parsed.data.languages as any,
      experiences: parsed.data.experiences?.map((e: any) => ({ ...e, achievements: Array.isArray(e.achievements) ? e.achievements : parseAchievements(e.achievements as any) })) as any,
    });
    return {
      status: "success",
      errors: {},
      candidateId: profile.candidateId,
      talentUrl: `/talents/${profile.candidateId}`,
      message: "Profil créé avec succès.",
    };
  } catch (error) {
    console.error("Error creating candidate profile:", error);
    return {
      status: "error",
      errors: { form: ["Une erreur est survenue lors de la création du profil."] },
      message: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

/** Le profil du candidat connecté, ou `null` s'il n'en a pas encore créé. */
export async function getCandidateProfileForUser(clerkUserId: string): Promise<StoredCandidateProfile | null> {
  return getCandidateProfileByClerkUserId(clerkUserId);
}

export async function evaluateCandidateProfileUpdate(
  formData: FormData,
  candidateId: string,
  clerkUserId: string,
): Promise<CandidateProfileState> {
  const parsed = candidateProfileSchema.safeParse(extractCandidateProfileInput(formData));
  if (!parsed.success) {
    return { status: "invalid", errors: errorsFromZod(parsed.error.issues) };
  }

  try {
    const profile = await updateCandidateProfile(candidateId, clerkUserId, {
      fullName: parsed.data.fullName,
      headline: parsed.data.headline,
      categoryLabel: parsed.data.categoryLabel,
      domainLabels: parseCommaSeparated(parsed.data.domainLabels as string | undefined),
      city: parsed.data.city,
      country: parsed.data.country,
      isRemoteEligible: parsed.data.isRemoteEligible,
      yearsOfExperience: parsed.data.yearsOfExperience,
      summary: parsed.data.summary,
      skills: parsed.data.skills.map((s) => ({ label: s.label, level: s.level as 1 | 2 | 3 | 4 | 5, yearsOfPractice: s.yearsOfPractice })),
      languages: parsed.data.languages,
      profileVisibility: parsed.data.profileVisibility,
      declaredAvailability: parsed.data.declaredAvailability,
      desiredContractTypes: parsed.data.desiredContractTypes,
    });
    if (!profile) {
      return {
        status: "error",
        errors: { form: ["Profil introuvable pour cet utilisateur."] },
        message: "Profil introuvable.",
      };
    }
    return {
      status: "success",
      errors: {},
      candidateId: profile.candidateId,
      talentUrl: `/talents/${profile.candidateId}`,
      message: "Profil mis à jour avec succès.",
    };
  } catch (error) {
    console.error("Error updating candidate profile:", error);
    return {
      status: "error",
      errors: { form: ["Une erreur est survenue lors de la mise à jour du profil."] },
      message: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

export async function deleteCandidateProfileForUser(clerkUserId: string): Promise<boolean> {
  return deleteCandidateProfileByClerkUserId(clerkUserId);
}

/* ------------------------------------------------------------------ */
/* Édition ciblée d'un bloc du profil (dashboard).                     */
/* ------------------------------------------------------------------ */

async function applySectionPatch(
  candidateId: string,
  clerkUserId: string,
  patch: CandidateProfileSectionPatch,
): Promise<CandidateProfileState> {
  try {
    const profile = await updateCandidateProfileSections(candidateId, clerkUserId, patch);
    if (!profile) {
      return {
        status: "error",
        errors: { form: ["Profil introuvable pour cet utilisateur."] },
        message: "Profil introuvable.",
      };
    }
    return {
      status: "success",
      errors: {},
      candidateId: profile.candidateId,
      talentUrl: `/talents/${profile.candidateId}`,
      message: "Bloc mis à jour avec succès.",
    };
  } catch (error) {
    console.error("Error updating candidate profile section:", error);
    return {
      status: "error",
      errors: { form: ["Une erreur est survenue lors de la mise à jour du bloc."] },
      message: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

export async function evaluateSummaryUpdate(
  formData: FormData,
  candidateId: string,
  clerkUserId: string,
): Promise<CandidateProfileState> {
  const parsed = summaryBlockSchema.safeParse({ summary: (formData.get("summary") as string) ?? "" });
  if (!parsed.success) return { status: "invalid", errors: errorsFromZod(parsed.error.issues) };
  return applySectionPatch(candidateId, clerkUserId, { summary: parsed.data.summary });
}

export async function evaluateAvailabilityUpdate(
  formData: FormData,
  candidateId: string,
  clerkUserId: string,
): Promise<CandidateProfileState> {
  const declaredAvailability = (formData.get("declaredAvailability") as string) || undefined;
  const selectedContracts = formData.getAll("desiredContractTypes") as string[];
  const parsed = availabilityBlockSchema.safeParse({
    declaredAvailability,
    desiredContractTypes: selectedContracts.length > 0 ? selectedContracts : undefined,
    isRemoteEligible: formData.get("isRemoteEligible") === "on" || formData.get("isRemoteEligible") === "true",
  });
  if (!parsed.success) return { status: "invalid", errors: errorsFromZod(parsed.error.issues) };

  const data = parsed.data;
  return applySectionPatch(candidateId, clerkUserId, {
    declaredAvailability: data.declaredAvailability,
    desiredContractTypes:
      data.desiredContractTypes && data.desiredContractTypes.length > 0
        ? data.desiredContractTypes
        : [CONTRACT_TYPE.CDI],
    isRemoteEligible: data.isRemoteEligible,
  });
}

export async function evaluateSkillsUpdate(
  formData: FormData,
  candidateId: string,
  clerkUserId: string,
): Promise<CandidateProfileState> {
  const parsed = skillsBlockSchema.safeParse({ skills: parseSkills(formData) });
  if (!parsed.success) return { status: "invalid", errors: errorsFromZod(parsed.error.issues) };
  return applySectionPatch(candidateId, clerkUserId, {
    skills: parsed.data.skills.map((s) => ({
      label: s.label,
      level: s.level as 1 | 2 | 3 | 4 | 5,
      yearsOfPractice: s.yearsOfPractice,
    })),
  });
}

export async function evaluateLanguagesUpdate(
  formData: FormData,
  candidateId: string,
  clerkUserId: string,
): Promise<CandidateProfileState> {
  const parsed = languagesBlockSchema.safeParse({ languages: parseLanguages(formData) });
  if (!parsed.success) return { status: "invalid", errors: errorsFromZod(parsed.error.issues) };
  return applySectionPatch(candidateId, clerkUserId, { languages: parsed.data.languages });
}

export async function evaluateExperiencesUpdate(
  formData: FormData,
  candidateId: string,
  clerkUserId: string,
): Promise<CandidateProfileState> {
  const parsed = experiencesBlockSchema.safeParse({ experiences: parseExperiences(formData) });
  if (!parsed.success) return { status: "invalid", errors: errorsFromZod(parsed.error.issues) };
  return applySectionPatch(candidateId, clerkUserId, {
    experiences: parsed.data.experiences.map((e) => ({
      title: e.title,
      organization: e.organization,
      location: e.location,
      startDate: e.startDate,
      isCurrent: e.isCurrent,
      endDate: e.endDate,
      summary: e.summary,
      achievements: e.achievements ?? [],
    })),
  });
}

export async function evaluateEducationUpdate(
  formData: FormData,
  candidateId: string,
  clerkUserId: string,
): Promise<CandidateProfileState> {
  const parsed = educationBlockSchema.safeParse({ education: parseEducation(formData) });
  if (!parsed.success) return { status: "invalid", errors: errorsFromZod(parsed.error.issues) };
  return applySectionPatch(candidateId, clerkUserId, {
    education: parsed.data.education.map((e) => ({
      diploma: e.diploma,
      school: e.school,
      field: e.field,
      startYear: e.startYear,
      endYear: e.endYear,
    })),
  });
}

export async function evaluateCertificationsUpdate(
  formData: FormData,
  candidateId: string,
  clerkUserId: string,
): Promise<CandidateProfileState> {
  const parsed = certificationsBlockSchema.safeParse({ certifications: parseCertifications(formData) });
  if (!parsed.success) return { status: "invalid", errors: errorsFromZod(parsed.error.issues) };
  return applySectionPatch(candidateId, clerkUserId, {
    certifications: parsed.data.certifications.map((c) => ({
      name: c.name,
      issuer: c.issuer,
      issuedYear: c.issuedYear,
      expiresAt: c.expiresAt,
    })),
  });
}