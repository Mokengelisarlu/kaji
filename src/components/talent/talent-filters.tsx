import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";

import { SearchInput, Select, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { TalentDirectoryFacets, TalentFilters } from "@/lib/domain/talent";
import { AVAILABILITY_PRESENTATION } from "@/components/talent/availability-presentation";

/**
 * Formulaire de filtres de l'annuaire (§13).
 *
 * Soumission par GET : chaque combinaison de filtres est une URL propre,
 * partageable, indexable et fonctionnelle sans JavaScript. C'est un choix de
 * fond, pas de commodité.
 */
export function TalentFiltersForm({
  facets,
  filters,
}: {
  facets: TalentDirectoryFacets;
  filters: TalentFilters;
}) {
  const activeCount = countActiveFilters(filters);
  const [min, max] = filters.experience;

  return (
    <form
      method="get"
      action="/talents"
      aria-label="Filtres de l'annuaire des talents"
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="filter-q">Recherche</Label>
        <SearchInput
          id="filter-q"
          name="q"
          defaultValue={filters.query}
          placeholder="Métier, compétence, nom…"
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="filter-category">Catégorie de métier</Label>
        <Select id="filter-category" name="category" defaultValue={filters.categorySlugs[0] ?? ""}>
          <option value="">Toutes les catégories</option>
          {facets.categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="filter-city">Localisation</Label>
        <Select id="filter-city" name="city" defaultValue={filters.citySlugs[0] ?? ""}>
          <option value="">Toutes les localisations</option>
          {facets.cities.map((city) => (
            <option key={city.citySlug} value={city.citySlug}>
              {city.city} ({city.country})
            </option>
          ))}
        </Select>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-foreground mb-1 text-sm font-medium">
          Années d’expérience
        </legend>
        <div className="flex items-center gap-2">
          <Select
            name="experienceMin"
            defaultValue={String(min)}
            aria-label="Expérience minimale"
            className="flex-1"
          >
            {EXPERIENCE_OPTIONS.map((option) => (
              <option key={`min-${option}`} value={option}>
                {option === 0 ? "0 an" : `${option} an${option > 1 ? "s" : ""}`}
              </option>
            ))}
          </Select>
          <span aria-hidden="true" className="text-subtle-foreground text-sm">
            –
          </span>
          <Select
            name="experienceMax"
            defaultValue={String(max)}
            aria-label="Expérience maximale"
            className="flex-1"
          >
            {EXPERIENCE_OPTIONS.map((option) => (
              <option key={`max-${option}`} value={option}>
                {option === 50 ? "50 ans +" : `${option} an${option > 1 ? "s" : ""}`}
              </option>
            ))}
          </Select>
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <Label htmlFor="filter-contract">Type de contrat</Label>
        <Select id="filter-contract" name="contract" defaultValue={filters.contractTypes[0] ?? ""}>
          <option value="">Tous les contrats</option>
          {CONTRACT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="filter-sort">Trier par</Label>
        <Select id="filter-sort" name="sort" defaultValue={filters.sort}>
          <option value="relevance">Pertinence</option>
          <option value="experience_desc">Expérience (décroissante)</option>
          <option value="experience_asc">Expérience (croissante)</option>
          <option value="recent">Récents</option>
        </Select>
      </div>

      <div className="flex items-center gap-2.5">
        <input
          type="checkbox"
          id="filter-verified"
          name="verified"
          value="1"
          defaultChecked={filters.verifiedOnly}
          className="border-border-strong accent-primary size-4 rounded"
        />
        <Label htmlFor="filter-verified" className="cursor-pointer font-normal">
          Profils vérifiés uniquement
        </Label>
      </div>

      <div className="border-border flex flex-col gap-2 border-t pt-5">
        <Button type="submit" block>
          <SlidersHorizontal aria-hidden="true" />
          Appliquer les filtres
        </Button>
        {activeCount > 0 && (
          <Button asChild variant="ghost" size="sm" block>
            <Link href="/talents">
              <X aria-hidden="true" />
              Réinitialiser ({activeCount})
            </Link>
          </Button>
        )}
      </div>
    </form>
  );
}

/** Résumé des filtres actifs, affiché au-dessus de la liste. */
export function ActiveFilters({
  filters,
  facets,
  buildHref,
}: {
  filters: TalentFilters;
  facets: TalentDirectoryFacets;
  buildHref: (next: Partial<TalentFilters>) => string;
}) {
  const chips: { key: string; label: string; clear: Partial<TalentFilters> }[] = [];

  if (filters.query.length > 0) {
    chips.push({ key: "q", label: `« ${filters.query} »`, clear: { query: "" } });
  }

  for (const slug of filters.categorySlugs) {
    const category = facets.categories.find((entry) => entry.slug === slug);
    chips.push({
      key: `category-${slug}`,
      label: category?.label ?? slug,
      clear: { categorySlugs: filters.categorySlugs.filter((entry) => entry !== slug) },
    });
  }

  for (const slug of filters.citySlugs) {
    const city = facets.cities.find((entry) => entry.citySlug === slug);
    chips.push({
      key: `city-${slug}`,
      label: city?.city ?? slug,
      clear: { citySlugs: filters.citySlugs.filter((entry) => entry !== slug) },
    });
  }

  for (const contract of filters.contractTypes) {
    chips.push({
      key: `contract-${contract}`,
      label: CONTRACT_OPTIONS.find((option) => option.value === contract)?.label ?? contract,
      clear: { contractTypes: filters.contractTypes.filter((entry) => entry !== contract) },
    });
  }

  for (const availability of filters.availabilities) {
    chips.push({
      key: `availability-${availability}`,
      label: AVAILABILITY_PRESENTATION[availability].label,
      clear: { availabilities: filters.availabilities.filter((entry) => entry !== availability) },
    });
  }

  if (filters.verifiedOnly) {
    chips.push({ key: "verified", label: "Vérifiés", clear: { verifiedOnly: false } });
  }

  const [min, max] = filters.experience;
  if (min !== 0 || max !== 50) {
    chips.push({
      key: "experience",
      label: `${min}–${max} ans d'expérience`,
      clear: { experience: [0, 50] },
    });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-subtle-foreground text-xs font-medium">Filtres :</span>
      {chips.map((chip) => (
        <Link key={chip.key} href={buildHref(chip.clear)} scroll={false}>
          <Badge tone="brand" size="sm" className="hover:bg-kaji-100 cursor-pointer gap-1">
            {chip.label}
            <X aria-hidden="true" />
            <span className="sr-only">Retirer ce filtre</span>
          </Badge>
        </Link>
      ))}
    </div>
  );
}

const EXPERIENCE_OPTIONS = [0, 1, 2, 3, 5, 8, 10, 15, 20, 50] as const;

const CONTRACT_OPTIONS = [
  { value: "CDI", label: "CDI" },
  { value: "CDD", label: "CDD" },
  { value: "STAGE", label: "Stage" },
  { value: "ALTERNANCE", label: "Alternance" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "PRESTATION", label: "Prestation" },
  { value: "CONSULTING", label: "Mission de conseil" },
] as const;

/** Nombre de filtres actifs — affiché sur le bouton de réinitialisation. */
function countActiveFilters(filters: TalentFilters): number {
  const [min, max] = filters.experience;

  return (
    (filters.query.length > 0 ? 1 : 0) +
    filters.categorySlugs.length +
    filters.citySlugs.length +
    filters.contractTypes.length +
    filters.availabilities.length +
    (filters.verifiedOnly ? 1 : 0) +
    (min !== 0 || max !== 50 ? 1 : 0)
  );
}
