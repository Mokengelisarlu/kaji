import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { TALENT_CATEGORIES } from "@/lib/mock/referentials";
import { getTalentPoolStats } from "@/lib/use-cases/talent";
import { BRAND } from "@/lib/site";

/**
 * EC-07 — Opportunités.
 *
 * Aucune opportunité n’est publiée : la publication d’offres est une
 * fonctionnalité de moyen terme (`02-product-vision.md` §22.2), et
 * `/entreprise/demandes` n’existe pas encore. La page est donc un contenu
 * éditorial honnête, pas un catalogue vide qui ferait croire à un service
 * inexistant.
 *
 * `robots.index` reste à `false` tant que la page ne décrit que des
 * catégories : une page qui annonce une absence n’a pas à être indexée, et
 * `02` §21.3 impose de ne pas indexer une route qui ne livre pas.
 */
export const metadata: Metadata = {
  title: "Opportunités",
  description: `Comment fonctionne une opportunité chez ${BRAND.name}, et pourquoi aucune n’est publiée pour l’instant.`,
  alternates: { canonical: "/opportunites" },
  robots: { index: false, follow: true },
};

export default async function OpportunitiesPage() {
  // Les compteurs par catégorie de `TALENT_CATEGORIES` sont des valeurs de
  // démonstration incohérentes avec le vivier (148 pour l’informatique, 14
  // profils publiés au total). Le seul chiffre fiable ici est le total réel,
  // calculé par le repository.
  const { totalPublished } = await getTalentPoolStats();

  return (
    <>
      <Section spacing="lg" className="border-border/60 border-b">
        <Container size="narrow">
          <SectionHeading
            eyebrow="Opportunités"
            title="Aucune opportunité n’est publiée pour l’instant"
            description={`Nous préférons vous le dire clairement plutôt que d’afficher un catalogue vide. Voici ce qu’une opportunité est chez ${BRAND.name}, et ce qui existe à la place.`}
            as="h1"
          />
        </Container>
      </Section>

      <Section spacing="md">
        <Container size="narrow">
          <div className="flex flex-col gap-4">
            <p className="text-base leading-relaxed font-medium">
              Chez {BRAND.name}, une opportunité n’est pas une annonce. C’est un
              besoin vérifié, qualifié par un médiateur, et rattaché à des profils
              réels du vivier.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
              Publier une opportunité suppose trois choses que nous ne faisons pas
              encore : un espace entreprise authentifié, un dépôt de besoin que
              nous puissions arbitrer, et des profils à qui présenter. Ces
              trois briques arrivent dans cet ordre. Tant qu’elles ne sont pas
              là, publier des offres reviendrait à refaire ce que font tous les
              sites d’emploi, moins bien.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
              Ce qui existe aujourd’hui fonctionne dans l’autre sens : vous pouvez
              parcourir le vivier public, et vous pouvez déposer un besoin. Un
              médiateur vous répond sous 48 heures ouvrées.
            </p>
          </div>
        </Container>
      </Section>

      <Section spacing="md" divider>
        <Container size="wide">
          <SectionHeading
            eyebrow="Le vivier, par métier"
            title={`${totalPublished} profils publiés, répartis sur ces métiers`}
            description="Le vivier est la matière première du service : c’est lui que la médiation interroge, et non des CV en circulation libre. Chaque métier renvoie à l’annuaire filtré."
            align="center"
          />
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TALENT_CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/talents?category=${category.slug}`}
                  className="border-border hover:border-or-600/40 hover:bg-muted/40 flex h-full flex-col gap-1 rounded-lg border p-4 transition-colors"
                >
                  <span className="text-sm font-medium">{category.label}</span>
                  <span className="text-muted-foreground text-xs">
                    Voir les profils
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section spacing="md">
        <Container size="narrow">
          <div className="border-border bg-muted/40 flex flex-col gap-4 rounded-xl border p-6 sm:p-8">
            <h2 className="text-lg font-semibold">Deux chemins disponibles aujourd’hui</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Vous recrutez : déposez votre besoin, un médiateur s’en occupe.
              Vous êtes candidat : le vivier est public, gratuit, et sans
              inscription pour être lu.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/contact?objet=besoin">Déposer un besoin</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/talents">Voir le vivier</Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
