import { Container, Section, SectionHeading } from "@/components/ui/layout";

/**
 * Gabarit commun des pages de contenu éditorial et juridique.
 *
 * Cinq routes le partagent : `EC-05` À propos, `EC-07` Opportunités,
 * `EC-08` Entreprises, `EC-12` Mentions légales, `EC-13` Confidentialité. Le
 * gabarit garantit qu'un même bandeau et une même colonne de lecture servent
 * partout, et qu'une page légale ne peut pas être livrée avec une mise en page
 * différente d'une page institutionnelle par inadvertance.
 */

export type ProseBlock =
  | { readonly kind: "lead"; readonly text: string }
  | { readonly kind: "paragraph"; readonly text: string }
  | { readonly kind: "list"; readonly items: readonly string[] }
  | { readonly kind: "note"; readonly text: string };

export type ProseSection = {
  readonly id: string;
  readonly title: string;
  readonly blocks: readonly ProseBlock[];
};

/** Bandeau d'en-tête : surtitre, titre, chapô. Toujours hors du flux de prose. */
export function PageBanner({
  eyebrow,
  title,
  description,
}: {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
}) {
  return (
    <Section spacing="lg" className="border-border/60 border-b">
      <Container size="narrow">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          as="h1"
        />
      </Container>
    </Section>
  );
}

/**
 * Corps de la page, en sections numérotées avec sommaire latéral.
 *
 * Le sommaire n'est pas décoratif : ces pages sont longues et lues jusqu'au
 * bout, notamment par un lecteur qui cherche une obligation précise.
 */
export function ProseBody({
  sections,
  updatedAt,
}: {
  readonly sections: readonly ProseSection[];
  /** Date de dernière révision, affichée si fournie. */
  readonly updatedAt?: string;
}) {
  return (
    <Section spacing="md">
      <Container size="wide">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-16">
          <nav
            aria-label="Sommaire"
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <p className="text-muted-foreground text-2xs font-semibold tracking-[0.14em] uppercase">
              Sommaire
            </p>
            <ol className="mt-4 flex flex-col gap-2.5">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
            {updatedAt !== undefined && (
              <p className="text-muted-foreground/80 mt-6 text-xs">
                Dernière révision : {updatedAt}
              </p>
            )}
          </nav>

          <div className="min-w-0">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                aria-labelledby={`${section.id}-titre`}
                className="border-border/70 scroll-mt-24 border-t pt-8 first:border-t-0 first:pt-0 [&+section]:mt-10"
              >
                <h2
                  id={`${section.id}-titre`}
                  className="text-or-700 text-lg font-semibold sm:text-xl"
                >
                  {section.title}
                </h2>
                <div className="mt-4 flex flex-col gap-4">
                  {section.blocks.map((block, index) => (
                    <ProseBlockView key={`${section.id}-${index}`} block={block} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

function ProseBlockView({ block }: { readonly block: ProseBlock }) {
  switch (block.kind) {
    case "lead":
      return (
        <p className="text-foreground text-base leading-relaxed font-medium">
          {block.text}
        </p>
      );
    case "paragraph":
      return (
        <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
          {block.text}
        </p>
      );
    case "list":
      return (
        <ul className="text-muted-foreground flex flex-col gap-2 text-sm leading-relaxed sm:text-base">
          {block.items.map((item) => (
            <li key={item} className="flex gap-2.5">
              <span aria-hidden="true" className="text-or-600 mt-2 size-1.5 shrink-0 rounded-full bg-current" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "note":
      return (
        <p className="border-border text-muted-foreground border-l-2 py-1 pl-4 text-sm leading-relaxed">
          {block.text}
        </p>
      );
  }
}
