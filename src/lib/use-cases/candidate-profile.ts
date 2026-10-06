import { candidateProfileSchema, type CandidateProfileSubmissionInput } from "@/lib/validation/candidate-profile";
import { createCandidateProfileInDb } from "@/lib/repositories/candidate-repository";

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

export async function evaluateCandidateProfileSubmission(
  formData: FormData,
  clerkUserId?: string,
): Promise<CandidateProfileState> {
  const raw = Object.fromEntries(formData.entries());

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

  const languages: Array<{ code: any; level: any }> = [];
  idx = 0;
  while (formData.get(`languages[${idx}].code`)) {
    const code = formData.get(`languages[${idx}].code`) as string;
    const level = formData.get(`languages[${idx}].level`) as string;
    if (code) {
      languages.push({ code, level } as any);
    }
    idx++;
  }

  const experiences: any[] = [];
  idx = 0;
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

  const education: any[] = [];
  idx = 0;
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

  const certifications: any[] = [];
  idx = 0;
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

  const desiredContractTypes = formData.getAll("desiredContractTypes") as string[];

  const nom = (raw.nom as string) || "";
  const prenom = (raw.prenom as string) || "";
  const computedFullName = (raw.fullName as string) || `${prenom} ${nom}`.trim() || nom || prenom;

  const input: CandidateProfileSubmissionInput = {
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
    profileVisibility: raw.profileVisibility as any,
    declaredAvailability: raw.declaredAvailability as any,
    desiredContractTypes: desiredContractTypes.length > 0 ? (desiredContractTypes as any) : undefined,
  };

  const parsed = candidateProfileSchema.safeParse(input);
  if (!parsed.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "form";
      errors[key] = errors[key] ? [...errors[key], issue.message] : [issue.message];
    }
    return { status: "invalid", errors };
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
