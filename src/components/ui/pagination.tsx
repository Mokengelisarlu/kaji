import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Pagination de l'annuaire (§13).
 *
 * Les liens sont de vrais liens vers des URL : chaque page reste accessible,
 * indexable et partageable. La page courante est annoncée via `aria-current`.
 */
export function Pagination({
  page,
  totalPages,
  buildHref,
  className,
}: {
  page: number;
  totalPages: number;
  /** Construit l'URL de la page demandée en conservant les filtres actifs. */
  buildHref: (page: number) => string;
  className?: string;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = pageWindow(page, totalPages);

  return (
    <nav
      aria-label="Pagination des talents"
      className={cn("flex flex-wrap items-center justify-between gap-4", className)}
    >
      <p className="text-muted-foreground text-sm">
        Page {page} sur {totalPages}
      </p>

      <div className="flex items-center gap-1.5">
        <Button
          asChild
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          className={cn(page <= 1 && "pointer-events-none opacity-40")}
        >
          <Link href={buildHref(Math.max(1, page - 1))} aria-label="Page précédente" rel="prev">
            <ChevronLeft aria-hidden="true" />
            <span className="hidden sm:inline">Précédent</span>
          </Link>
        </Button>

        <ul className="hidden items-center gap-1 sm:flex">
          {pages.map((entry, index) =>
            entry === null ? (
              <li
                key={`gap-${index}`}
                aria-hidden="true"
                className="text-subtle-foreground px-1.5 text-sm"
              >
                …
              </li>
            ) : (
              <li key={entry}>
                <Link
                  href={buildHref(entry)}
                  aria-current={entry === page ? "page" : undefined}
                  aria-label={`Page ${entry}`}
                  className={cn(
                    "grid size-9 place-items-center rounded-md text-sm font-medium transition-colors",
                    entry === page
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
                  )}
                >
                  {entry}
                </Link>
              </li>
            ),
          )}
        </ul>

        <Button
          asChild
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          className={cn(page >= totalPages && "pointer-events-none opacity-40")}
        >
          <Link
            href={buildHref(Math.min(totalPages, page + 1))}
            aria-label="Page suivante"
            rel="next"
          >
            <span className="hidden sm:inline">Suivant</span>
            <ChevronRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </nav>
  );
}

/** Fenêtre glissante de 5 pages avec ellipses. `null` représente une ellipse. */
function pageWindow(page: number, totalPages: number): readonly (number | null)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, page]);
  if (page - 1 > 1) pages.add(page - 1);
  if (page + 1 < totalPages) pages.add(page + 1);

  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | null)[] = [];
  let previous = 0;

  for (const current of sorted) {
    if (previous !== 0 && current - previous > 1) {
      result.push(null);
    }
    result.push(current);
    previous = current;
  }

  return result;
}
