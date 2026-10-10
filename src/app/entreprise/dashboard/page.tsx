import type { Metadata } from "next";
import Link from "next/link";
import { Globe, MapPin, Mail, Phone, User } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { requireEmployerAccess } from "@/lib/auth/employer";
import { COMPANY_SIZE_LABEL } from "@/lib/domain/enums";
import type { Company } from "@/lib/repositories/company-repository";
import { getCompanyForUser } from "@/lib/use-cases/company";

export const metadata: Metadata = {
  title: "Espace entreprise",
  description: "Gérez vos informations, déposez vos besoins et suivez vos demandes de recrutement.",
  robots: { index: false },
};

export default async function EntrepriseDashboardPage({
  searchParams,
}: PageProps<"/entreprise/dashboard">) {
  const { userId } = await requireEmployerAccess();

  const [company, params] = await Promise.all([getCompanyForUser(userId), searchParams]);
  const justSaved = params.enregistre === "1";

  return (
    <Section spacing="md">
      <Container size="narrow">
        <SectionHeading
          eyebrow="Espace entreprise"
          title="Tableau de bord"
          description="Gérez vos informations, déposez vos besoins et suivez vos demandes."
        />

        {justSaved && (
          <Alert tone="success" title="Entreprise enregistrée" className="mt-6">
            Vos informations sont enregistrées. L’équipe Kaji vérifie votre
            entreprise avant la première mise en relation.
          </Alert>
        )}

        <div className="mt-8 space-y-6">
          {company === null ? <MissingCompanyCard /> : <CompanySummaryCard company={company} />}

          <Card>
            <CardHeader>
              <CardTitle>Mes demandes de recrutement</CardTitle>
              <CardDescription>
                Le registre des demandes arrive dans une phase ultérieure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Vous pouvez d’ores et déjà déposer un besoin : il est analysé puis
                traité, et son avancement sera consultable ici.
              </p>
              <div className="mt-4">
                <Button asChild>
                  <Link href="/contact?objet=besoin">Déposer un besoin</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </Section>
  );
}

function MissingCompanyCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Déclarez votre entreprise</CardTitle>
        <CardDescription>
          Dernière étape avant de pouvoir déposer un besoin et être mis en
          relation avec des talents.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          La déclaration prend moins de cinq minutes. Elle n’est pas publique :
          elle sert à la vérification et à la traçabilité de vos demandes.
        </p>
        <div className="mt-4">
          <Button asChild>
            <Link href="/entreprise/onboarding">Déclarer mon entreprise</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CompanySummaryCard({ company }: { readonly company: Company }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <CardTitle>{company.name}</CardTitle>
            <CardDescription>
              {company.sector}
              {company.size.length > 0 ? ` · ${COMPANY_SIZE_LABEL[company.size]}` : ""}
              {company.city.length > 0 ? ` · ${company.city}` : ""}
            </CardDescription>
          </div>
          <Badge tone={company.isVerified ? "success" : "warning"}>
            {company.isVerified ? "Entreprise vérifiée" : "En attente de vérification"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          {company.website !== undefined && company.website.length > 0 && (
            <dt className="text-muted-foreground flex items-center gap-2">
              <Globe aria-hidden="true" className="size-4" />
              <dd className="text-foreground m-0">
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="underline">
                  {company.website}
                </a>
              </dd>
            </dt>
          )}
          <dt className="text-muted-foreground flex items-center gap-2">
            <MapPin aria-hidden="true" className="size-4" />
            <dd className="text-foreground m-0">
              {company.city}
              {company.country.length > 0 ? `, ${company.country}` : ""}
            </dd>
          </dt>
          <dt className="text-muted-foreground flex items-center gap-2">
            <User aria-hidden="true" className="size-4" />
            <dd className="text-foreground m-0">{company.contactName}</dd>
          </dt>
          <dt className="text-muted-foreground flex items-center gap-2">
            <Mail aria-hidden="true" className="size-4" />
            <dd className="text-foreground m-0">{company.contactEmail}</dd>
          </dt>
          {company.contactPhone !== undefined && company.contactPhone.length > 0 && (
            <dt className="text-muted-foreground flex items-center gap-2">
              <Phone aria-hidden="true" className="size-4" />
              <dd className="text-foreground m-0">{company.contactPhone}</dd>
            </dt>
          )}
        </dl>
        <div className="mt-5">
          <Button asChild variant="secondary">
            <Link href="/entreprise/onboarding">Modifier mes informations</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}