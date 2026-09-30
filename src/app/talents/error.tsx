"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { ErrorState } from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/layout";

/**
 * État d'erreur de l'annuaire (§41).
 *
 * `error.digest` est fourni par Next.js en production ; il n'est jamais
 * affiché tel quel à l'utilisateur, mais il est utile dans les journaux.
 */
export default function TalentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[kaji] Erreur de rendu de /talents", error);
  }, [error]);

  return (
    <Section spacing="sm">
      <Container size="narrow">
        <ErrorState
          icon={<AlertTriangle className="size-6" />}
          title="L'annuaire n'a pas pu être chargé"
          description="Une erreur est survenue de notre côté. Réessayez dans un instant ; si le problème persiste, contactez-nous et nous regarderons."
          action={
            <Button onClick={reset} variant="secondary" size="sm">
              Réessayer
            </Button>
          }
        />
      </Container>
    </Section>
  );
}
