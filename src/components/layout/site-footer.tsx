import Link from "next/link";

import { Container } from "@/components/ui/layout";
import { BRAND, FOOTER_NAV, LEGAL_NAV } from "@/lib/site";

/**
 * Pied de page public.
 *
 * Structure de marque obligatoire (§27) :
 *   KAJI.COM — Talent & Professional Mediation Platform
 *   Operated by MOKENGELI SARLU
 *
 * Kaji est la marque produit. Mokengeli SARLU est la société opératrice et
 * doit rester nommée dans le pied de page.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-border bg-surface mt-auto border-t">
      <Container size="wide" className="py-12 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3">
            <p className="font-display text-kaji-800 text-xl font-semibold tracking-tight">
              {BRAND.name}
            </p>
            <p className="text-muted-foreground max-w-xs text-sm">
              Plateforme de talents et de médiation professionnelle. Nous construisons des viviers,
              qualifions les profils et accompagnons les recrutements.
            </p>
          </div>

          {FOOTER_NAV.map((section) => (
            <nav key={section.title} aria-label={section.title} className="flex flex-col gap-3">
              <p className="text-foreground text-sm font-semibold">{section.title}</p>
              <ul className="flex flex-col gap-2">
                {section.links.map((link) => (
                  <li key={`${section.title}-${link.href}`}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-primary text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="border-border mt-10 flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground text-sm">
              © {year} {BRAND.name}. Tous droits réservés.
            </p>
            <p className="text-subtle-foreground text-xs">
              {BRAND.tagline} — {BRAND.operatorLabel}
            </p>
          </div>

          <nav aria-label="Informations légales" className="flex flex-wrap gap-x-5 gap-y-2">
            {LEGAL_NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-subtle-foreground hover:text-primary text-xs transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  );
}
