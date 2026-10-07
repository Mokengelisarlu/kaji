import type {
  PaginatedTalents,
  PublicTalent,
  TalentFilters,
} from "@/lib/domain/talent";
import { normalizeLabel, scoreTalent } from "@/lib/domain/matching";

/**
 * Moteur de filtrage, tri et pagination de l'annuaire.
 *
 * Logiciel partagé par toutes les implémentations de `TalentRepository` :
 * `MockTalentRepository` (vivier de démonstration) et
 * `DrizzleTalentRepository` (PostgreSQL) passent par le même code, ce qui
 * garantit que le tri « relevance » de l'annuaire et celui d'une demande de
 * recrutement ne divergent jamais. Les données peuvent changer de source, le
 * comportement de l'annuaire ne change pas.
 */

/** Filtre, trie et pagine un ensemble de profils publics selon des critères validés. */
export function applyDirectoryFilters(
  talents: readonly PublicTalent[],
  filters: TalentFilters,
): PaginatedTalents {
  const filtered = talents.filter((talent) => matches(talent, filters));
  const sorted = sort(filtered, filters);

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

function matches(talent: PublicTalent, filters: TalentFilters): boolean {
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

function sort(
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