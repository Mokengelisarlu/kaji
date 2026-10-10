import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { candidateProfiles } from "@/lib/db/schema";
import {
  generateCandidateId,
  type CandidateProfileSectionPatch,
  type CreateCandidateProfileInput,
  type StoredCandidateProfile,
  type UpdateCandidateProfileInput,
} from "@/lib/store/candidate-profiles";
import { slugify } from "@/lib/utils/slugify";
import type { PoolKind, TalentSource } from "@/lib/domain/enums";

function toJson<T>(value: T): T {
  return JSON.stringify(value) as unknown as T;
}

type CandidateProfileRow = typeof candidateProfiles.$inferSelect;

function toStoredProfile(row: CandidateProfileRow): StoredCandidateProfile {
  return {
    candidateId: row.candidateId,
    fullName: row.fullName,
    lastName: row.lastName ?? undefined,
    postName: row.postName ?? undefined,
    firstName: row.firstName ?? undefined,
    headline: row.headline,
    categorySlug: row.categorySlug,
    categoryLabel: row.categoryLabel,
    domainSlugs: row.domainSlugs as string[],
    location: {
      citySlug: row.citySlug,
      city: row.city,
      country: row.country,
      isRemoteEligible: row.isRemoteEligible,
    },
    yearsOfExperience: row.yearsOfExperience,
    skills: row.skills as StoredCandidateProfile["skills"],
    languages: row.languages as StoredCandidateProfile["languages"],
    availability: row.availability as StoredCandidateProfile["availability"],
    declaredAvailability: row.declaredAvailability as StoredCandidateProfile["declaredAvailability"],
    desiredContractTypes: row.desiredContractTypes as StoredCandidateProfile["desiredContractTypes"],
    summary: row.summary,
    poolKind: row.poolKind as PoolKind,
    isVerified: row.isVerified,
    source: row.source as TalentSource,
    experiences: row.experiences as StoredCandidateProfile["experiences"],
    education: row.education as StoredCandidateProfile["education"],
    certifications: row.certifications as StoredCandidateProfile["certifications"],
    clerkUserId: row.clerkUserId ?? undefined,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    profileVisibility: row.profileVisibility,
  };
}

export async function createCandidateProfileInDb(input: CreateCandidateProfileInput): Promise<StoredCandidateProfile> {
  const candidateId = generateCandidateId();
  const now = new Date();
  const categorySlug = slugify(input.categoryLabel);
  const domainSlugs = (input.domainLabels ?? []).map(slugify);

  const inserted = await db
    .insert(candidateProfiles)
    .values({
      candidateId,
      clerkUserId: input.clerkUserId,
      email: input.email,
      phone: input.phone,
      fullName: input.fullName,
      lastName: input.lastName,
      postName: input.postName,
      firstName: input.firstName,
      headline: input.headline,
      categorySlug,
      categoryLabel: input.categoryLabel,
      domainSlugs: toJson(domainSlugs),
      citySlug: slugify(input.city),
      city: input.city,
      country: input.country || "République Démocratique du Congo",
      isRemoteEligible: input.isRemoteEligible ?? true,
      yearsOfExperience: input.yearsOfExperience,
      skills: toJson(input.skills.map((s, i) => ({ id: `${candidateId}-skill-${i}`, ...s }))),
      languages: toJson(input.languages.map((l) => ({ code: l.code, level: l.level }))),
      availability: "AVAILABLE_WITH_DELAY",
      declaredAvailability: input.declaredAvailability ?? "OPEN_TO_OPPORTUNITIES",
      desiredContractTypes: toJson((input.desiredContractTypes ?? ["CDI"]) as string[]),
      summary: input.summary,
      poolKind: "TALENT_POOL",
      isVerified: false,
      source: "DIRECT_SIGNUP",
      experiences: toJson((input.experiences ?? []).map((e, i) => ({ id: `${candidateId}-exp-${i}`, ...e }))),
      education: toJson((input.education ?? []).map((e, i) => ({ id: `${candidateId}-edu-${i}`, ...e }))),
      certifications: toJson((input.certifications ?? []).map((c, i) => ({ id: `${candidateId}-cert-${i}`, ...c }))),
      profileVisibility: input.profileVisibility,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  const row = inserted[0];
  if (!row) {
    throw new Error("Failed to create candidate profile");
  }

  return toStoredProfile(row);
}

export async function getCandidateProfileById(candidateId: string): Promise<StoredCandidateProfile | null> {
  const row = await db.query.candidateProfiles.findFirst({
    where: eq(candidateProfiles.candidateId, candidateId),
  });
  return row ? toStoredProfile(row) : null;
}

export async function getCandidateProfileByClerkUserId(clerkUserId: string): Promise<StoredCandidateProfile | null> {
  const row = await db.query.candidateProfiles.findFirst({
    where: eq(candidateProfiles.clerkUserId, clerkUserId),
  });
  return row ? toStoredProfile(row) : null;
}

/**
 * Met à jour les champs que le candidat édite librement.
 *
 * La clause `where` vérifie simultanément l'identité (`candidateId`) et
 * l'appartenance (`clerkUserId`) : aucun utilisateur connecté ne peut écrire
 * sur la fiche d'un autre. Les champs internes (poolKind, source, isVerified,
 * availability) sont volontairement exclus : d'autres écrans les gèrent.
 * Les blocs de parcours (expériences, formations, certifications) sont mis à
 * jour uniquement lorsqu'ils sont fournis : le formulaire d'édition complète
 * les gère, les éditeurs ciblés du tableau de bord passent par
 * `updateCandidateProfileSections`.
 */
export async function updateCandidateProfile(
  candidateId: string,
  clerkUserId: string,
  input: UpdateCandidateProfileInput,
): Promise<StoredCandidateProfile | null> {
  const now = new Date();
  const categorySlug = slugify(input.categoryLabel);
  const domainSlugs = (input.domainLabels ?? []).map(slugify);

  const values: Partial<typeof candidateProfiles.$inferInsert> = {
    fullName: input.fullName,
    headline: input.headline,
    categorySlug,
    categoryLabel: input.categoryLabel,
    domainSlugs: toJson(domainSlugs),
    citySlug: slugify(input.city),
    city: input.city,
    country: input.country || "République Démocratique du Congo",
    isRemoteEligible: input.isRemoteEligible ?? true,
    yearsOfExperience: input.yearsOfExperience,
    skills: toJson(input.skills.map((s, i) => ({ id: `${candidateId}-skill-${i}`, ...s }))),
    languages: toJson(input.languages.map((l) => ({ code: l.code, level: l.level }))),
    declaredAvailability: input.declaredAvailability ?? "OPEN_TO_OPPORTUNITIES",
    desiredContractTypes: toJson((input.desiredContractTypes ?? ["CDI"]) as string[]),
    summary: input.summary,
    profileVisibility: input.profileVisibility,
    updatedAt: now,
  };

  // L'email provient de Clerk et le téléphone d'un champ optionnel : on ne
  // remplace jamais une valeur existante par une absence.
  if (input.email !== undefined) {
    values.email = input.email;
  }
  if (input.phone !== undefined) {
    values.phone = input.phone;
  }
  if (input.lastName !== undefined) {
    values.lastName = input.lastName;
  }
  if (input.postName !== undefined) {
    values.postName = input.postName;
  }
  if (input.firstName !== undefined) {
    values.firstName = input.firstName;
  }
  if (input.experiences !== undefined) {
    values.experiences = toJson(input.experiences.map((e, i) => ({ id: `${candidateId}-exp-${i}`, ...e })));
  }
  if (input.education !== undefined) {
    values.education = toJson(input.education.map((e, i) => ({ id: `${candidateId}-edu-${i}`, ...e })));
  }
  if (input.certifications !== undefined) {
    values.certifications = toJson(input.certifications.map((c, i) => ({ id: `${candidateId}-cert-${i}`, ...c })));
  }

  const updated = await db
    .update(candidateProfiles)
    .set(values)
    .where(and(eq(candidateProfiles.candidateId, candidateId), eq(candidateProfiles.clerkUserId, clerkUserId)))
    .returning();

  const row = updated[0];
  return row ? toStoredProfile(row) : null;
}

/**
 * Met à jour uniquement certains blocs du profil (dashboard), jamais tout.
 * Chaque clé fournie remplace le bloc correspondant ; les autres restent tels quels.
 * L'appartenance est toujours vérifiée par `clerkUserId` + `candidateId`.
 */
export async function updateCandidateProfileSections(
  candidateId: string,
  clerkUserId: string,
  patch: CandidateProfileSectionPatch,
): Promise<StoredCandidateProfile | null> {
  const values: Partial<typeof candidateProfiles.$inferInsert> = {};

  if (patch.summary !== undefined) {
    values.summary = patch.summary;
  }
  if (patch.skills !== undefined) {
    values.skills = toJson(patch.skills.map((s, i) => ({ id: `${candidateId}-skill-${i}`, ...s })));
  }
  if (patch.languages !== undefined) {
    values.languages = toJson(
      patch.languages.map((l) => ({
        id: `${candidateId}-lang-${l.code}`,
        code: l.code,
        level: l.level,
      })),
    );
  }
  if (patch.experiences !== undefined) {
    values.experiences = toJson(patch.experiences.map((e, i) => ({ id: `${candidateId}-exp-${i}`, ...e })));
  }
  if (patch.education !== undefined) {
    values.education = toJson(patch.education.map((e, i) => ({ id: `${candidateId}-edu-${i}`, ...e })));
  }
  if (patch.certifications !== undefined) {
    values.certifications = toJson(patch.certifications.map((c, i) => ({ id: `${candidateId}-cert-${i}`, ...c })));
  }
  if (patch.declaredAvailability !== undefined) {
    values.declaredAvailability = patch.declaredAvailability;
  }
  if (patch.desiredContractTypes !== undefined) {
    values.desiredContractTypes = toJson([...patch.desiredContractTypes] as string[]);
  }
  if (patch.isRemoteEligible !== undefined) {
    values.isRemoteEligible = patch.isRemoteEligible;
  }

  if (Object.keys(values).length === 0) {
    return getCandidateProfileById(candidateId);
  }
  values.updatedAt = new Date();

  const updated = await db
    .update(candidateProfiles)
    .set(values)
    .where(and(eq(candidateProfiles.candidateId, candidateId), eq(candidateProfiles.clerkUserId, clerkUserId)))
    .returning();

  const row = updated[0];
  return row ? toStoredProfile(row) : null;
}

export async function deleteCandidateProfileByClerkUserId(clerkUserId: string): Promise<boolean> {
  const deleted = await db
    .delete(candidateProfiles)
    .where(eq(candidateProfiles.clerkUserId, clerkUserId))
    .returning({ candidateId: candidateProfiles.candidateId });
  return deleted.length > 0;
}