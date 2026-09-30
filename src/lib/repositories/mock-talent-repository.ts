import type {
  PaginatedTalents,
  PublicTalent,
  PublicTalentProfile,
  TalentDirectoryFacets,
  TalentFilters,
} from "@/lib/domain/talent";
import { normalizeLabel, scoreTalent } from "@/lib/domain/matching";
import { EFFECTIVE_AVAILABILITY } from "@/lib/domain/enums";
import type { TalentRepository } from "./talent-repository";
import { MOCK_TALENTS, toPublicTalent, MOCK_RECORDS, isPublishable } from "@/lib/mock/talents";
import type { MockTalentRecord } from "@/lib/mock/talents";
import { LOCATIONS, TALENT_CATEGORIES, TALENT_DOMAINS } from "@/lib/mock/referentials";

/**
 * Implémentation `TalentRepository` sur le vivier de démonstration.
 *
 * Elle respecte le même contrat que la future implémentation Drizzle : filtrage,
 * tri, pagination et facettes. Le filtrage est synchrone et en mémoire ; il
 * s'agira de `WHERE` + index SQL le jour venu. Le tri « relevance » utilise
 * le moteur de matching rule-based (§8), ce qui garantit que le tri de
 * l'annuaire et celui d'une demande de recrutement ne divergent jamais.
 */
export class MockTalentRepository implements TalentRepository {
  constructor(private readonly talents: readonly PublicTalent[] = MOCK_TALENTS) {}

  async list(filters: TalentFilters): Promise<PaginatedTalents> {
    const filtered = this.talents.filter((talent) => this.matches(talent, filters));
    const sorted = this.sort(filtered, filters);

    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
    // Une page au-delà de la dernière renvoie la dernière page : un lien
    // d'archive ancienne mène à du contenu lisible, pas à une page blanche.
    const page = Math.min(filters.page, totalPages);
    const start = (page - 1) * filters.pageSize;

    return {
      items: sorted.slice(start, start + filters.pageSize),
      total,
      page,
      pageSize: filters.pageSize,
      totalPages,
    };
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

  private matches(talent: PublicTalent, filters: TalentFilters): boolean {
    if (filters.verifiedOnly && !talent.isVerified) {
      return false;
    }

    if (filters.categorySlugs.length > 0 && !filters.categorySlugs.includes(talent.categorySlug)) {
      return false;
    }

    if (filters.domainSlugs.length > 0) {
      const matchesDomain = talent.domainSlugs.some((slug) => filters.domainSlugs.includes(slug));
      if (!matchesDomain) {
        return false;
      }
    }

    if (filters.citySlugs.length > 0 && !filters.citySlugs.includes(talent.location.citySlug)) {
      return false;
    }

    const [minExperience, maxExperience] = filters.experience;
    if (talent.yearsOfExperience < minExperience || talent.yearsOfExperience > maxExperience) {
      return false;
    }

    if (filters.poolKinds.length > 0 && !filters.poolKinds.includes(talent.poolKind)) {
      return false;
    }

    if (filters.availabilities.length > 0 && !filters.availabilities.includes(talent.availability)) {
      return false;
    }

    if (filters.contractTypes.length > 0) {
      const matchesContract = talent.desiredContractTypes.some((type) =>
        filters.contractTypes.includes(type),
      );
      if (!matchesContract) {
        return false;
      }
    }

    if (filters.languageCodes.length > 0) {
      const owned = new Set(talent.languages.map((language) => language.code));
      const matchesLanguage = filters.languageCodes.some((code) => owned.has(code));
      if (!matchesLanguage) {
        return false;
      }
    }

    if (filters.skillLabels.length > 0) {
      const owned = new Set(talent.skills.map((skill) => normalizeLabel(skill.label)));
      const matchesSkill = filters.skillLabels.some((label) => owned.has(normalizeLabel(label)));
      if (!matchesSkill) {
        return false;
      }
    }

    if (filters.query.trim().length >= 2) {
      const haystack = normalizeLabel(
        [
          talent.fullName,
          talent.headline,
          talent.summary,
          talent.categoryLabel,
          talent.skills.map((skill) => skill.label).join(" "),
        ].join(" "),
      );
      const terms = normalizeLabel(filters.query)
        .split(/\s+/)
        .filter((term) => term.length >= 2);
      const matchesQuery = terms.every((term) => haystack.includes(term));
      if (!matchesQuery) {
        return false;
      }
    }

    return true;
  }

  private sort(
    talents: readonly PublicTalent[],
    filters: TalentFilters,
  ): readonly PublicTalent[] {
    switch (filters.sort) {
      case "experience_desc":
        return [...talents].sort((a, b) => b.yearsOfExperience - a.yearsOfExperience);
      case "experience_asc":
        return [...talents].sort((a, b) => a.yearsOfExperience - b.yearsOfExperience);
      case "recent": {
        // Un profil « récent » est avant tout un profil à jour : les plus
        // frais d'actualisation d'abord. Le stock mock n'expose pas la date
        // brute, on se limite donc à un tri alphabétique stable et documenté.
        return [...talents].sort((a, b) => a.fullName.localeCompare(b.fullName, "fr"));
      }
      case "relevance":
      default: {
        const criteria = {
          query: filters.query,
          categorySlugs: filters.categorySlugs,
          domainSlugs: filters.domainSlugs,
          citySlugs: filters.citySlugs,
          requiredSkills: filters.skillLabels,
          requiredLanguages: filters.languageCodes,
          contractTypes: filters.contractTypes,
        };
        const scores = new Map(
          talents.map((talent) => [talent.candidateId, scoreTalent(talent, criteria).score]),
        );
        return [...talents].sort(
          (a, b) => (scores.get(b.candidateId) ?? 0) - (scores.get(a.candidateId) ?? 0),
        );
      }
    }
  }
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
