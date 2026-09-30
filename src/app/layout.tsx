import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { BRAND } from "@/lib/site";

import "./globals.css";

/**
 * Typographie de marque (voir 04-design-system.md).
 * - Fraunces : voix éditoriale, ton de médiation humaine.
 * - Plus Jakarta Sans : interface, lisibilité, registre professionnel.
 */
const display = Fraunces({
  variable: "--font-kaji-display",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "opsz"],
});

const sans = Plus_Jakarta_Sans({
  variable: "--font-kaji-sans",
  subsets: ["latin"],
  display: "swap",
});

/** `metadataBase` rend les URLs absolues (Open Graph, canoniques). */
export const metadata: Metadata = {
  metadataBase: new URL(`https://${BRAND.domain}`),
  title: {
    default: `${BRAND.name} — ${BRAND.tagline}`,
    template: `%s · ${BRAND.name}`,
  },
  description:
    "Kaji.com met en relation entreprises et talents qualifiés par une équipe de médiation professionnelle. Vivier de talents vérifié, matching, entretiens et placement.",
  applicationName: BRAND.name,
  keywords: [
    "recrutement",
    "vivier de talents",
    "médiation professionnelle",
    "emploi RDC",
    "consulting",
    "freelance Afrique",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: BRAND.name,
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description:
      "Talents qualifiés, vivier vérifié et accompagnement humain du besoin au placement.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description:
      "Talents qualifiés, vivier vérifié et accompagnement humain du besoin au placement.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${display.variable} ${sans.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <a href="#contenu" className="skip-link">
          Aller au contenu principal
        </a>
        <SiteHeader />
        <main id="contenu" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
