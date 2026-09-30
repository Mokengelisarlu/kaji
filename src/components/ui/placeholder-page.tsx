import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Construction } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/layout";

/**
 * Page « en cours de construction ».
 *
 * Utilisée pour les routes listées dans 03-system-architecture.md qui ne sont
 * pas encore implémentées. Elle évite les liens morts depuis l'en-tête et le
 * pied de page, et elle **annonce explicitement** que la page n'existe pas
 * encore plutôt que de laisser croire à un contenu.
 *
 * Règle : dès qu'une page réelle est livrée, ce composant doit disparaître de
 * la route concernée. Vérifié dans 06-progress-tracker.md.
 */
export function PlaceholderPage({
  title,
  description,
  status,
}: {
  title: string;
  description: string;
  status: string;
}) {
  return (
    <Section spacing="md">
      <Container size="narrow">
        <div className="flex flex-col items-start gap-5">
          <div
            aria-hidden="true"
            className="bg-surface-muted text-muted-foreground grid size-14 place-items-center rounded-full"
          >
            <Construction className="size-7" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl sm:text-4xl">{title}</h1>
            <p className="text-muted-foreground text-base">{description}</p>
          </div>

          <Alert tone="info" title="Page en préparation">
            {status}
          </Alert>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/talents">
                Parcourir les talents
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/">Retour à l’accueil</Link>
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export function placeholderMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    // Une page en construction n'a pas sa place dans un index de recherche.
    robots: { index: false, follow: true },
  };
}
