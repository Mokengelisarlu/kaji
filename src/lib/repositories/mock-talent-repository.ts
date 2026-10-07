import type {
  PaginatedTalents,
  PublicTalent,
  PublicTalentProfile,
  TalentDirectoryFacets,
  TalentFilters,
} from "@/lib/domain/talent";
import { EFFECTIVE_AVAILABILITY } from "@/lib/domain/enums";
import type { TalentRepository } from "./talent-repository";
import { applyDirectoryFilters } from "./directory-engine";
import { MOCK_TALENTS, toPublicTalent, MOCK_RECORDS, isPublishable } from "@/lib/mock/talents";
import type { MockTalentRecord } from "@/lib/mock/talents";
import { LOCATIONS, TALENT_CATEGORIES, TALENT_DOMAINS } from "@/lib/mock/referentials";

/**
 * Implémentation `TalentRepository` sur le vivier de démonstration.
 *
 * Elle respecte le même contrat que l'implémentation Drizzle : filtrage, tri,
 * pagination et facettes. Le filtrage, le tri et la pagination sont délégués au
 * moteur partagé `directory-engine`, identique pour toutes les sources. Le jour
 * où l'on passe en `WHERE` + index SQL, seul `DrizzleTalentRepository` change.
 */
export class MockTalentRepository implements TalentRepository {
  constructor(private readonly talents: readonly PublicTalent[] = MOCK_TALENTS) {}

  async list(filters: TalentFilters): Promise<PaginatedTalents> {
    return applyDirectoryFilters(this.talents, filters);
  }

  async findPublishedById(candidateId: string): Promise<PublicTalent | null> {
    return this.talents.find((talent) => talent.candidateId === candidateId) ?? null;
  }

  async findPublishedProfileById(candidateId: string): Promise<PublicTalentProfile | null> {
    const record: MockTalentRecord | undefined = MOCK_RECORDS.find(
      (entry) => entry.candidateId === candidateId,
    );
    if (record === undefined || !isPublishable(record)) {
      return null;
    }
    return toPublicProfile(record);
  }

  async getDirectoryFacets(): Promise<TalentDirectoryFacets> {
    const skillLabels = new Set<string>();
    const languageCodes = new Set<string>();

    for (const talent of this.talents) {
      for (const skill of talent.skills) {
        skillLabels.add(skill.label);
      }
      for (const language of talent.languages) {
        languageCodes.add(language.code);
      }
    }

    const usedCategories = new Set(this.talents.map((talent) => talent.categorySlug));
    const usedDomains = new Set(this.talents.flatMap((talent) => talent.domainSlugs));
    const usedCities = new Set(this.talents.map((talent) => talent.location.citySlug));

    return {
      totalPublished: this.talents.length,
      verifiedCount: this.talents.filter((talent) => talent.isVerified).length,
      availableCount: this.talents.filter(
        (talent) =>
          talent.availability === EFFECTIVE_AVAILABILITY.AVAILABLE ||
          talent.availability === EFFECTIVE_AVAILABILITY.AVAILABLE_WITH_DELAY ||
          talent.availability === EFFECTIVE_AVAILABILITY.OPEN,
      ).length,
      categories: TALENT_CATEGORIES.filter((category) => usedCategories.has(category.slug)),
      domains: TALENT_DOMAINS.filter((domain) => usedDomains.has(domain.slug)),
      cities: LOCATIONS.filter((location) => usedCities.has(location.citySlug)),
      skillLabels: [...skillLabels].sort((a, b) => a.localeCompare(b, "fr")),
      languageCodes: [...languageCodes].sort(),
    };
  }

  /* ---------------------------------------------------------------- */
  /* Interne                                                           */
  /* ---------------------------------------------------------------- */
}

/**
 * Construit la projection publique complète à partir d'un enregistrement
 * interne. Point de passage **obligatoire** : c'est ici, et seulement ici, que
 * l'on décide quels champs franchissent la frontière de confidentialité.
 */
function toPublicProfile(record: MockTalentRecord): PublicTalentProfile {
  return {
    ...toPublicTalent(record),
    experiences: record.experiences,
    education: record.education,
    certifications: record.certifications,
  };
}
