import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { EMPLOYER_DASHBOARD_PATH } from "@/lib/auth/employer";
import { getSession } from "@/lib/auth/session";
import { ROLE, ROLE_LABEL } from "@/lib/domain/enums";
import { getCandidateProfileByClerkUserId } from "@/lib/repositories/candidate-repository";
import { SwitchAccountButton } from "./switch-account-button";

export const metadata: Metadata = {
  title: "Créer un compte entreprise",
  description:
    "Déclarez votre entreprise, faites-la vérifier, puis déposez votre premier besoin de recrutement.",
  robots: { index: false },
};

/**
 * Entrée de l'espace entreprise, sensible à l'état d'authentification.
 *
 * - visiteur : formulaire d'inscription Clerk, retour vers le tableau de bord ;
 * - employeur connecté : redirection vers son tableau de bord ;
 * - compte connecté sans fiche candidat : considéré comme un nouveau compte
 *   entreprise → tableau de bord ;
 * - candidat/prestataire existant : on demande de se connecter avec un compte
 *   entreprise (jamais de bascule silencieuse de rôle — §20).
 */
export default async function EntrepriseInscriptionPage() {
  const session = await getSession();

  if (session === null) {
    return (
      <Section spacing="md">
        <Container size="narrow">
          <SectionHeading
            eyebrow="Compte entreprise"
            title="Créer votre compte entreprise"
            description="Un compte entreprise vous permet de déposer vos besoins et d’accéder aux talents vérifiés."
          />
          <div className="mt-8 flex justify-center">
            <SignUp fallbackRedirectUrl={EMPLOYER_DASHBOARD_PATH} signInUrl="/connexion" />
          </div>
        </Container>
      </Section>
    );
  }

  if (session.role === ROLE.EMPLOYER) {
    redirect(EMPLOYER_DASHBOARD_PATH);
  }

  const candidateProfile = await getCandidateProfileByClerkUserId(session.userId);
  if (candidateProfile === null) {
    redirect(EMPLOYER_DASHBOARD_PATH);
  }

  return (
    <Section spacing="md">
      <Container size="narrow">
        <SectionHeading
          eyebrow="Compte entreprise"
          title="Utilisez un compte entreprise"
          description="Vous êtes actuellement connecté avec un autre type de compte."
        />
        <div className="mt-8 space-y-6">
          <Alert tone="warning" title={`Compte ${ROLE_LABEL[session.role]}`}>
            Vous êtes connecté avec un compte {ROLE_LABEL[session.role]}. Pour déposer
            un besoin de recrutement, connectez-vous avec un compte entreprise — un
            compte candidat ne peut pas être converti.
          </Alert>
          <div className="flex flex-wrap items-center gap-3">
            <SwitchAccountButton />
            <Button asChild variant="ghost">
              <Link href="/">Retour à l’accueil</Link>
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
