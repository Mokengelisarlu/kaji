import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";

import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { requireEmployerAccess } from "@/lib/auth/employer";
import { getCompanyForUser } from "@/lib/use-cases/company";
import { CompanyForm } from "./company-form";

export const metadata: Metadata = {
  title: "Espace entreprise",
  description: "Déclarez votre entreprise pour déposer vos besoins de recrutement.",
  robots: { index: false },
};

export default async function EntrepriseOnboardingPage({
  searchParams,
}: PageProps<"/entreprise/onboarding">) {
  const { userId } = await requireEmployerAccess();

  const [company, params, user] = await Promise.all([
    getCompanyForUser(userId),
    searchParams,
    currentUser(),
  ]);

  const saved = params.enregistre === "1";
  const defaultEmail =
    user?.emailAddresses.find((address) => address.id === user.primaryEmailAddressId)?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress ??
    "";

  return (
    <Section spacing="md">
      <Container size="narrow">
        <SectionHeading
          eyebrow="Espace entreprise"
          title={company ? "Vos informations entreprise" : "Créer votre compte entreprise"}
          description="Déclarez votre entreprise, faites-la vérifier, puis déposez votre premier besoin de recrutement."
        />
        <div className="mt-8">
          <CompanyForm company={company} defaultEmail={defaultEmail} saved={saved} />
        </div>
      </Container>
    </Section>
  );
}
