import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";

import { ActiveFilters, TalentFiltersForm } from "@/components/talent/talent-filters";
import { TalentGrid } from "@/components/talent/talent-grid";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/states";
import { Pagination } from "@/components/ui/pagination";
import { Container, Section } from "@/components/ui/layout";
import { parseTalentSearchParams } from "@/lib/validation/talent-filters";
import { browseTalentDirectory } from "@/lib/use-cases/talent";
import { buildDirectoryHref, countActiveFilters } from "@/lib/talent-directory-url";
import { BRAND } from "@/lib/site";

export const metadata: Metadata = {
  title: "Annuaire des talents",
  description:
    "Parcourez le vivier de talents Kaji : profils vérifiés, qualifiés, dont la disponibilité est confirmée. Filtrez par métier, localisation, expérience, compétences et langues.",
  alternates: { canonical: "/talents" },
};

/**
 * Annuaire des talents (§13).
 *
 * Les filtres vivent dans l'URL (`searchParams`), sont validés par Zod, puis
 * traduits en `TalentFilters` avant d'atteindre le repository. Un paramètre
 * invalide est signalé à l'utilisateur au lieu de casser la page.
 */
export default async function TalentsPage({ searchParams }: PageProps<"/talents">) {
  const params = await searchParams;
  const { filters, issues } = parseTalentSearchParams(params);

  const { talents, facets, filterIssues } = await browseTalentDirectory({
    filters,
    filterIssues: issues,
  });

  const hasFilters = countActiveFilters(filters) > 0;

  return (
    <>
      <Section spacing="sm" className="border-border border-b">
        <Container size="wide">
          <div className="flex flex-col gap-3">
            <p className="text-or-700 text-2xs font-semibold tracking-[0.14em] uppercase">
              Vivier {BRAND.name}
            </p>
            <h1 className="text-3xl sm:text-4xl">Annuaire des talents</h1>
            <p className="text-muted-foreground max-w-2xl text-base sm:text-lg">
              Des profils qualifiés par notre équipe. Les informations de contact ne sont jamais
              publiques : une entreprise passe par une demande de profil, que nous instruisons.
            </p>
            <p className="text-muted-foreground text-sm" aria-live="polite">
              <strong className="text-foreground font-semibold">{facets.totalPublished}</strong>{" "}
              profil{facets.totalPublished > 1 ? "s" : ""} publié
              {facets.totalPublished > 1 ? "s" : ""} ·{" "}
              <strong className="text-foreground font-semibold">{facets.availableCount}</strong>{" "}
              mobilisable{facets.availableCount > 1 ? "s" : ""} ·{" "}
              <strong className="text-foreground font-semibold">{facets.verifiedCount}</strong>{" "}
              vérifié{facets.verifiedCount > 1 ? "s" : ""}
            </p>
          </div>
        </Container>
      </Section>

      <Section spacing="sm">
        <Container size="wide">
          <div className="grid gap-8 lg:grid-cols-[17rem_1fr] lg:gap-10">
            <aside
              aria-label="Filtres"
              className="border-border bg-surface h-fit rounded-xl border p-5 lg:sticky lg:top-20"
            >
              <TalentFiltersForm facets={facets} filters={filters} />
            </aside>

            <div className="flex min-w-0 flex-col gap-5">
              {filterIssues.length > 0 && (
                <Alert tone="warning" title="Certains filtres ont été ignorés">
                  <ul className="list-disc pl-4">
                    {filterIssues.map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                </Alert>
              )}

              <ActiveFilters
                filters={filters}
                facets={facets}
                buildHref={(next) => buildDirectoryHref(filters, next)}
              />

              {talents.items.length === 0 ? (
                <EmptyState
                  icon={<SearchX className="size-6" />}
                  title="Aucun profil ne correspond à ces critères"
                  description="Élargissez la recherche en retirant un filtre ou en ouvrant la fourchette d'expérience. Le vivier grandit chaque semaine : revenez bientôt."
                  action={
                    hasFilters ? (
                      <Link
                        href="/talents"
                        scroll={false}
                        className="text-primary mt-1 text-sm font-medium underline underline-offset-4"
                      >
                        Réinitialiser les filtres
                      </Link>
                    ) : undefined
                  }
                />
              ) : (
                <>
                  <TalentGrid talents={talents.items} />
                  <Pagination
                    page={talents.page}
                    totalPages={talents.totalPages}
                    buildHref={(page) => buildDirectoryHref(filters, { page })}
                  />
                </>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
