import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Award, Briefcase, CheckCircle2, Mail, MapPin, Pencil, Phone, Users } from "lucide-react";
import { BlockCardEditor } from "@/components/candidat/block-card-editor";
import { ProfileCreatedToast } from "@/components/talent/profile-created-toast";
import {
  AvailabilitySection,
  CertificationsSection,
  EducationSection,
  ExperienceSection,
  LanguagesSection,
  SkillsSection,
  SummarySection,
} from "@/components/talent/talent-profile-sections";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/layout";
import { PROFILE_VISIBILITY_LABEL } from "@/lib/domain/enums";
import { DOMAIN_BY_SLUG } from "@/lib/mock/referentials";
import { getCandidateProfileForUser } from "@/lib/use-cases/candidate-profile";

const BLOC_LABELS: Record<string, string> = {
  summary: "Résumé professionnel",
  availability: "Disponibilité",
  skills: "Compétences",
  languages: "Langues",
  experiences: "Expérience",
  education: "Formation",
  certifications: "Certifications",
};

export default async function CandidatDashboardPage({ searchParams }: PageProps<"/candidat/dashboard">) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/connexion");
  }

  const profile = await getCandidateProfileForUser(userId);
  if (!profile) {
    redirect("/candidat/onboarding");
  }

  const user = await currentUser();
  const email =
    profile.email ??
    user?.emailAddresses.find((address) => address.id === user.primaryEmailAddressId)?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress;

  const { profil, bloc } = await searchParams;

  const domains = profile.domainSlugs
    .map((slug) => DOMAIN_BY_SLUG.get(slug)?.label ?? slug)
    .join(", ");

  const blocLabel = bloc !== undefined ? BLOC_LABELS[String(bloc)] : undefined;

  return (
    <Container size="wide" className="py-8 sm:py-10">
      <ProfileCreatedToast created={profil === "cree"} />

      {profil === "mis-a-jour" && (
        <Alert tone="success" title="Profil mis à jour" className="mb-6">
          Vos modifications sont enregistrées et reflétées dans votre fiche publique.
        </Alert>
      )}

      {blocLabel !== undefined && (
        <Alert tone="success" title={`Bloc « ${blocLabel} » mis à jour`} className="mb-6">
          Vos modifications sont enregistrées et reflétées dans votre fiche publique.
        </Alert>
      )}

      {/* En-tête CV : identité + actions. */}
      <Card className="mb-8">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 flex-col gap-2">
                <div className="flex items-center gap-2">
                  <p className="text-subtle-foreground font-mono text-xs tracking-wide">
                    {profile.candidateId}
                  </p>
                  <Link
                    href="/candidat/profil"
                    aria-label="Modifier mon identité"
                    className="text-subtle-foreground hover:text-primary focus-visible:ring-ring/35 grid size-6 place-items-center rounded-md focus-visible:ring-[3px] focus-visible:outline-none"
                  >
                    <Pencil aria-hidden="true" className="size-3.5" />
                  </Link>
                </div>
                <h1 className="text-3xl sm:text-4xl">{profile.fullName}</h1>
                <p className="text-muted-foreground text-lg">{profile.headline}</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <Badge tone={profile.isVerified ? "success" : "neutral"}>
                    {profile.isVerified && <CheckCircle2 aria-hidden="true" className="size-3.5" />}
                    {profile.isVerified ? "Profil vérifié" : "Non vérifié"}
                  </Badge>
                  <Badge tone="info">
                    {PROFILE_VISIBILITY_LABEL[profile.profileVisibility] ?? profile.profileVisibility}
                  </Badge>
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                <Button asChild>
                  <Link href="/candidat/profil">Modifier mon profil</Link>
                </Button>
                <Button asChild variant="secondary" size="sm">
                  <Link href={`/talents/${profile.candidateId}`}>Voir ma fiche publique</Link>
                </Button>
              </div>
            </div>

            <dl className="border-border text-muted-foreground grid grid-cols-1 gap-4 border-t pt-6 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <Fact icon={<Briefcase aria-hidden="true" />} term="Catégorie">
                {profile.categoryLabel}
              </Fact>
              <Fact icon={<MapPin aria-hidden="true" />} term="Localisation">
                {profile.location.city}, {profile.location.country}
              </Fact>
              <Fact icon={<Users aria-hidden="true" />} term="Expérience">
                {profile.yearsOfExperience} ans
              </Fact>
              <Fact icon={<Award aria-hidden="true" />} term="Domaines">
                {domains || "—"}
              </Fact>
              <Fact icon={<Mail aria-hidden="true" />} term="E-mail">
                {email ?? "—"}
              </Fact>
              <Fact icon={<Phone aria-hidden="true" />} term="Téléphone">
                {profile.phone ?? "—"}
              </Fact>
            </dl>
          </div>
        </CardContent>
      </Card>

      {/* CV : parcours à gauche, compétences & disponibilité à droite. */}
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:gap-8">
        <div className="flex min-w-0 flex-col gap-5">
          <BlockCardEditor
            title="Résumé professionnel"
            editor={{ variant: "summary", summary: profile.summary }}
          >
            <SummarySection talent={profile} />
          </BlockCardEditor>

          <BlockCardEditor
            title="Expérience"
            editor={{
              variant: "experiences",
              experiences: profile.experiences.map((e) => ({
                title: e.title,
                organization: e.organization,
                location: e.location,
                startDate: e.startDate,
                isCurrent: e.isCurrent,
                endDate: e.endDate,
                summary: e.summary,
                achievements: e.achievements,
              })),
            }}
          >
            <ExperienceSection experiences={profile.experiences} />
          </BlockCardEditor>

          <BlockCardEditor
            title="Formation"
            editor={{
              variant: "education",
              education: profile.education.map((e) => ({
                diploma: e.diploma,
                school: e.school,
                field: e.field,
                startDate: e.startDate,
                endDate: e.endDate,
              })),
            }}
          >
            <EducationSection education={profile.education} />
          </BlockCardEditor>

          <BlockCardEditor
            title="Certifications"
            editor={{
              variant: "certifications",
              certifications: profile.certifications.map((c) => ({
                name: c.name,
                issuer: c.issuer,
                issuedAt: c.issuedAt,
                expiresAt: c.expiresAt,
              })),
            }}
          >
            <CertificationsSection certifications={profile.certifications} />
          </BlockCardEditor>
        </div>

        <aside className="flex flex-col gap-5 lg:sticky lg:top-20 lg:h-fit">
          <BlockCardEditor
            title="Disponibilité"
            editor={{
              variant: "availability",
              declaredAvailability: profile.declaredAvailability,
              desiredContractTypes: profile.desiredContractTypes,
              isRemoteEligible: profile.location.isRemoteEligible,
            }}
          >
            <AvailabilitySection talent={profile} />
          </BlockCardEditor>

          <BlockCardEditor
            title="Compétences"
            editor={{
              variant: "skills",
              skills: profile.skills.map((s) => ({
                label: s.label,
                level: s.level,
                yearsOfPractice: s.yearsOfPractice,
              })),
            }}
          >
            <SkillsSection talent={profile} />
          </BlockCardEditor>

          <BlockCardEditor
            title="Langues"
            editor={{
              variant: "languages",
              languages: profile.languages.map((l) => ({ code: l.code, level: l.level })),
            }}
          >
            <LanguagesSection talent={profile} />
          </BlockCardEditor>

          <Card>
            <CardHeader>
              <CardTitle>Votre fiche publique</CardTitle>
              <CardDescription>
                C&apos;est exactement ce contenu que les entreprises consultent à un niveau national.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" size="sm" block>
                <Link href={`/talents/${profile.candidateId}`}>Ouvrir ma fiche</Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </Container>
  );
}

function Fact({
  icon,
  term,
  children,
}: {
  icon: React.ReactNode;
  term: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span aria-hidden="true" className="text-subtle-foreground shrink-0">
        {icon}
      </span>
      <div className="flex min-w-0 flex-col">
        <dt className="text-subtle-foreground text-xs">{term}</dt>
        <dd className="truncate">{children}</dd>
      </div>
    </div>
  );
}