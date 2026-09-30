import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/layout";

/**
 * 404 de l'espace public.
 * `not-found.tsx` est rendu par Next.js pour toute `notFound()` et pour
 * les routes inconnues. Elle ne doit jamais dépendre de données.
 */
export default function NotFound() {
  return (
    <Section spacing="lg">
      <Container size="narrow">
        <div className="flex flex-col items-center gap-5 text-center">
          <div
            aria-hidden="true"
            className="bg-surface-muted text-muted-foreground grid size-14 place-items-center rounded-full"
          >
            <FileQuestion className="size-7" />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-or-700 text-2xs font-semibold tracking-[0.14em] uppercase">
              Erreur 404
            </p>
            <h1 className="text-3xl sm:text-4xl">Cette page n’existe pas</h1>
            <p className="text-muted-foreground text-base">
              Le lien est peut-être obsolète, ou le profil n’est plus public. Un profil retiré de
              l’annuaire reste consultable uniquement par l’équipe qui l’a retiré.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/talents">Voir l’annuaire des talents</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/">
                <ArrowLeft aria-hidden="true" />
                Retour à l’accueil
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
