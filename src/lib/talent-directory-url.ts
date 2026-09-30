import type { TalentFilters } from "@/lib/domain/talent";

/**
 * Sérialisation des filtres de l'annuaire en URL (§13).
 *
 * Isolé dans `lib/` et non dans `page.tsx` : les fichiers de page Next.js
 * n'exportent que des éléments de l'API App Router.
 *
 * Invariant : tout changement de filtre autre que `page` ramène à la page 1.
 * Sans cela, retirer un filtre depuis la page 4 affiche une page vide.
 */
export function buildDirectoryHref(
  filters: TalentFilters,
  overrides: Partial<TalentFilters> = {},
): string {
  const next = { ...filters, ...overrides };
  const params = new URLSearchParams();

  if (next.query.length > 0) params.set("q", next.query);
  if (next.categorySlugs.length > 0) params.set("category", next.categorySlugs.join(","));
  if (next.domainSlugs.length > 0) params.set("domain", next.domainSlugs.join(","));
  if (next.citySlugs.length > 0) params.set("city", next.citySlugs.join(","));
  if (next.skillLabels.length > 0) params.set("skill", next.skillLabels.join(","));
  if (next.languageCodes.length > 0) params.set("language", next.languageCodes.join(","));
  if (next.contractTypes.length > 0) params.set("contract", next.contractTypes.join(","));
  if (next.availabilities.length > 0) params.set("availability", next.availabilities.join(","));
  if (next.poolKinds.length > 0) params.set("pool", next.poolKinds.join(","));
  if (next.verifiedOnly) params.set("verified", "1");
  if (next.sort !== "relevance") params.set("sort", next.sort);

  const [min, max] = next.experience;
  if (min !== 0) params.set("experienceMin", String(min));
  if (max !== 50) params.set("experienceMax", String(max));

  const page = overrides.page ?? 1;
  if (page > 1) params.set("page", String(page));

  const queryString = params.toString();
  return queryString.length > 0 ? `/talents?${queryString}` : "/talents";
}

/** Nombre de filtres actifs, hors pagination. */
export function countActiveFilters(filters: TalentFilters): number {
  const [min, max] = filters.experience;

  return (
    (filters.query.length > 0 ? 1 : 0) +
    filters.categorySlugs.length +
    filters.domainSlugs.length +
    filters.citySlugs.length +
    filters.skillLabels.length +
    filters.languageCodes.length +
    filters.contractTypes.length +
    filters.availabilities.length +
    filters.poolKinds.length +
    (filters.verifiedOnly ? 1 : 0) +
    (min !== 0 || max !== 50 ? 1 : 0)
  );
}
