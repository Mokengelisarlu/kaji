import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { candidateProfiles } from "@/lib/db/schema";
import type { CreateCandidateProfileInput } from "@/lib/store/candidate-profiles";
import { generateCandidateId, type StoredCandidateProfile } from "@/lib/store/candidate-profiles";
import { slugify } from "@/lib/utils/slugify";

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
      fullName: input.fullName,
      headline: input.headline,
      categorySlug,
      categoryLabel: input.categoryLabel,
      domainSlugs,
      citySlug: slugify(input.city),
      city: input.city,
      country: input.country || "République Démocratique du Congo",
      isRemoteEligible: input.isRemoteEligible ?? true,
      yearsOfExperience: input.yearsOfExperience,
      skills: input.skills.map((s, i) => ({ id: `${candidateId}-skill-${i}`, ...s })),
      languages: input.languages.map((l) => ({ code: l.code, level: l.level })),
      availability: "AVAILABLE_WITH_DELAY",
      declaredAvailability: input.declaredAvailability ?? "OPEN_TO_OPPORTUNITIES",
      desiredContractTypes: (input.desiredContractTypes ?? ["CDI"]) as string[],
      summary: input.summary,
      poolKind: "TALENT_POOL",
      isVerified: false,
      source: "DIRECT_SIGNUP",
      experiences: (input.experiences ?? []).map((e, i) => ({ id: `${candidateId}-exp-${i}`, ...e })),
      education: (input.education ?? []).map((e, i) => ({ id: `${candidateId}-edu-${i}`, ...e })),
      certifications: (input.certifications ?? []).map((c, i) => ({ id: `${candidateId}-cert-${i}`, ...c })),
      profileVisibility: input.profileVisibility,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  const row = inserted[0];
  if (!row) {
    throw new Error("Failed to create candidate profile");
  }

  return {
    candidateId: row.candidateId,
    fullName: row.fullName,
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
    skills: row.skills as any,
    languages: row.languages as any,
    availability: row.availability as any,
    declaredAvailability: row.declaredAvailability as any,
    desiredContractTypes: row.desiredContractTypes as any,
    summary: row.summary,
    poolKind: row.poolKind as any,
    isVerified: row.isVerified,
    source: row.source as any,
    experiences: row.experiences as any,
    education: row.education as any,
    certifications: row.certifications as any,
    clerkUserId: row.clerkUserId ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    profileVisibility: row.profileVisibility as any,
  };
}

export async function getCandidateProfileById(candidateId: string): Promise<StoredCandidateProfile | null> {
  const row = await db.query.candidateProfiles.findFirst({
    where: eq(candidateProfiles.candidateId, candidateId),
  });
  if (!row) return null;
  return {
    candidateId: row.candidateId,
    fullName: row.fullName,
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
    skills: row.skills as any,
    languages: row.languages as any,
    availability: row.availability as any,
    declaredAvailability: row.declaredAvailability as any,
    desiredContractTypes: row.desiredContractTypes as any,
    summary: row.summary,
    poolKind: row.poolKind as any,
    isVerified: row.isVerified,
    source: row.source as any,
    experiences: row.experiences as any,
    education: row.education as any,
    certifications: row.certifications as any,
    clerkUserId: row.clerkUserId ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    profileVisibility: row.profileVisibility as any,
  };
}
