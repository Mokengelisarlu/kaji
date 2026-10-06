import { eq } from "drizzle-orm";
import type { TalentRepository } from "../talent-repository";
import type {
  PaginatedTalents,
  PublicTalent,
  PublicTalentProfile,
  TalentDirectoryFacets,
  TalentFilters,
} from "@/lib/domain/talent";
import { db } from "@/lib/db";
import { candidateProfiles } from "@/lib/db/schema";

export class DrizzleTalentRepository implements TalentRepository {
  async list(filters: TalentFilters): Promise<PaginatedTalents> {
    // Minimal implementation - returns empty for now; existing mock behavior is fine
    // but we can extend later. For onboarding, we mainly need create/find.
    return {
      items: [],
      total: 0,
      page: filters.page,
      pageSize: filters.pageSize,
      totalPages: 1,
    };
  }

  async findPublishedById(candidateId: string): Promise<PublicTalent | null> {
    const result = await db.query.candidateProfiles.findFirst({
      where: eq(candidateProfiles.candidateId, candidateId),
    });
    if (!result) return null;
    return this.toPublicTalent(result);
  }

  async findPublishedProfileById(candidateId: string): Promise<PublicTalentProfile | null> {
    const result = await db.query.candidateProfiles.findFirst({
      where: eq(candidateProfiles.candidateId, candidateId),
    });
    if (!result) return null;
    return this.toPublicProfile(result);
  }

  async getDirectoryFacets(): Promise<TalentDirectoryFacets> {
    return {
      totalPublished: 0,
      verifiedCount: 0,
      availableCount: 0,
      categories: [],
      domains: [],
      cities: [],
      skillLabels: [],
      languageCodes: [],
    };
  }

  private toPublicTalent(row: any): PublicTalent {
    return {
      candidateId: row.candidateId,
      fullName: row.fullName,
      headline: row.headline,
      categorySlug: row.categorySlug,
      categoryLabel: row.categoryLabel,
      domainSlugs: row.domainSlugs ?? [],
      location: {
        citySlug: row.citySlug,
        city: row.city,
        country: row.country,
        isRemoteEligible: row.isRemoteEligible,
      },
      yearsOfExperience: row.yearsOfExperience,
      skills: row.skills ?? [],
      languages: row.languages ?? [],
      availability: row.availability,
      declaredAvailability: row.declaredAvailability,
      desiredContractTypes: row.desiredContractTypes ?? [],
      summary: row.summary,
      poolKind: row.poolKind,
      isVerified: row.isVerified,
      source: row.source,
    };
  }

  private toPublicProfile(row: any): PublicTalentProfile {
    return {
      ...this.toPublicTalent(row),
      experiences: row.experiences ?? [],
      education: row.education ?? [],
      certifications: row.certifications ?? [],
    };
  }
}
