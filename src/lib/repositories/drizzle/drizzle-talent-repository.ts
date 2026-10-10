import { eq, and } from "drizzle-orm";
import type { TalentRepository } from "../talent-repository";
import type {
  AvailabilityType,
  ContractType,
  EffectiveAvailability,
  PoolKind,
  TalentSource,
} from "@/lib/domain/enums";
import type {
  Location,
  PaginatedTalents,
  PublicTalent,
  PublicTalentProfile,
  TalentCategory,
  TalentDirectoryFacets,
  TalentDomain,
  TalentFilters,
} from "@/lib/domain/talent";
import { EFFECTIVE_AVAILABILITY, PROFILE_VISIBILITY } from "@/lib/domain/enums";
import { db } from "@/lib/db";
import { candidateProfiles } from "@/lib/db/schema";
import { applyDirectoryFilters } from "../directory-engine";
import {
  CATEGORY_BY_SLUG,
  DOMAIN_BY_SLUG,
} from "@/lib/mock/referentials";

type CandidateProfileRow = typeof candidateProfiles.$inferSelect;

/**
 * Implémentation `TalentRepository` sur PostgreSQL (via Drizzle).
 *
 * Elle expose uniquement des `PublicTalent` : la projection publique est
 * construite ici, et une seule ligne (`repositories/index.ts`) pilote la
 * bascule de source. Le filtrage, le tri et la pagination sont délégués au
 * moteur partagé `directory-engine`, identique au vivier de démonstration.
 *
 * Confidentialité : `findPublished*` et l'annuaire ne renvoient que les fiches
 * `PUBLIC` (§4.2), conformément à la règle domaine `isPubliclyListable`. Les
 * fiches `ON_REQUEST`/`PRIVATE` restent invisibles des canaux publics.
 */
export class DrizzleTalentRepository implements TalentRepository {
  async list(filters: TalentFilters): Promise<PaginatedTalents> {
    const rows = await this.findPublishedRows();
    return applyDirectoryFilters(rows.map((row) => this.toPublicTalent(row)), filters);
  }

  async findPublishedById(candidateId: string): Promise<PublicTalent | null> {
    const result = await db.query.candidateProfiles.findFirst({
      where: this.publishedWhere(candidateId),
    });
    if (!result) return null;
    return this.toPublicTalent(result);
  }

  async findPublishedProfileById(candidateId: string): Promise<PublicTalentProfile | null> {
    const result = await db.query.candidateProfiles.findFirst({
      where: this.publishedWhere(candidateId),
    });
    if (!result) return null;
    return this.toPublicProfile(result);
  }

  async getDirectoryFacets(): Promise<TalentDirectoryFacets> {
    const rows = await this.findPublishedRows();
    const talents = rows.map((row) => this.toPublicTalent(row));

    const skillLabels = new Set<string>();
    const languageCodes = new Set<string>();
    for (const talent of talents) {
      for (const skill of talent.skills) {
        skillLabels.add(skill.label);
      }
      for (const language of talent.languages) {
        languageCodes.add(language.code);
      }
    }

    return {
      totalPublished: talents.length,
      verifiedCount: talents.filter((talent) => talent.isVerified).length,
      availableCount: talents.filter(
        (talent) =>
          talent.availability === EFFECTIVE_AVAILABILITY.AVAILABLE ||
          talent.availability === EFFECTIVE_AVAILABILITY.AVAILABLE_WITH_DELAY ||
          talent.availability === EFFECTIVE_AVAILABILITY.OPEN,
      ).length,
      categories: this.computeCategories(rows),
      domains: this.computeDomains(rows),
      cities: this.computeCities(rows),
      skillLabels: [...skillLabels].sort((a, b) => a.localeCompare(b, "fr")),
      languageCodes: [...languageCodes].sort(),
    };
  }

  /* ---------------------------------------------------------------- */
  /* Interne                                                           */
  /* ---------------------------------------------------------------- */

  private publishedWhere(candidateId: string) {
    return and(
      eq(candidateProfiles.candidateId, candidateId),
      eq(candidateProfiles.profileVisibility, PROFILE_VISIBILITY.PUBLIC),
    );
  }

  private async findPublishedRows() {
    return db.query.candidateProfiles.findMany({
      where: eq(candidateProfiles.profileVisibility, PROFILE_VISIBILITY.PUBLIC),
    });
  }

  private computeCategories(rows: readonly CandidateProfileRow[]): readonly TalentCategory[] {
    const bySlug = new Map<string, TalentCategory>();
    for (const row of rows) {
      const existing = bySlug.get(row.categorySlug);
      if (existing) {
        bySlug.set(row.categorySlug, { ...existing, count: existing.count + 1 });
        continue;
      }
      const reference = CATEGORY_BY_SLUG.get(row.categorySlug);
      bySlug.set(row.categorySlug, {
        slug: row.categorySlug,
        label: row.categoryLabel,
        description: reference?.description ?? row.categoryLabel,
        count: 1,
      });
    }
    return [...bySlug.values()].sort((a, b) => b.count - a.count);
  }

  private computeDomains(rows: readonly CandidateProfileRow[]): readonly TalentDomain[] {
    const bySlug = new Map<string, TalentDomain>();
    for (const row of rows) {
      for (const slug of row.domainSlugs ?? []) {
        if (!bySlug.has(slug)) {
          bySlug.set(slug, {
            slug,
            label: DOMAIN_BY_SLUG.get(slug)?.label ?? slug,
          });
        }
      }
    }
    return [...bySlug.values()].sort((a, b) => a.label.localeCompare(b.label, "fr"));
  }

  private computeCities(rows: readonly CandidateProfileRow[]): readonly Location[] {
    const byCitySlug = new Map<string, Location>();
    for (const row of rows) {
      if (!byCitySlug.has(row.citySlug)) {
        byCitySlug.set(row.citySlug, {
          citySlug: row.citySlug,
          city: row.city,
          country: row.country,
          isRemoteEligible: row.isRemoteEligible,
        });
      }
    }
    return [...byCitySlug.values()].sort((a, b) => a.city.localeCompare(b.city, "fr"));
  }

  private toPublicTalent(row: CandidateProfileRow): PublicTalent {
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
      skills: (row.skills ?? []) as PublicTalent["skills"],
      languages: (row.languages ?? []) as PublicTalent["languages"],
      availability: row.availability as EffectiveAvailability,
      declaredAvailability: row.declaredAvailability as AvailabilityType,
      desiredContractTypes: (row.desiredContractTypes ?? []) as ContractType[],
      summary: row.summary,
      poolKind: row.poolKind as PoolKind,
      isVerified: row.isVerified,
      source: row.source as TalentSource,
    };
  }

  private toPublicProfile(row: CandidateProfileRow): PublicTalentProfile {
    return {
      ...this.toPublicTalent(row),
      experiences: row.experiences ?? [],
      education: row.education ?? [],
      certifications: row.certifications ?? [],
    };
  }
}