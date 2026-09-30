import Link from "next/link";

import { SiteHeaderNav } from "@/components/layout/site-header-nav";
import { Container } from "@/components/ui/layout";
import { BRAND } from "@/lib/site";

/**
 * En-tête public.
 *
 * Kaji.com est la marque visible. Mokengeli SARLU apparaît en petit, en bas de
 * l'en-tête, comme information sur l'opérateur de la plateforme (§27).
 */
export function SiteHeader() {
  return (
    <header className="border-border bg-surface/85 sticky top-0 z-40 border-b backdrop-blur-md">
      <Container size="wide" className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="group flex shrink-0 flex-col leading-none">
          <span className="font-display text-kaji-800 group-hover:text-primary text-lg font-semibold tracking-tight">
            {BRAND.name}
          </span>
          <span className="text-subtle-foreground mt-0.5 hidden text-2xs sm:block">
            Talent &amp; Professional Mediation
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <SiteHeaderNav />
        </div>
      </Container>
    </header>
  );
}
