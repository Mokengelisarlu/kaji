import { Award, Briefcase, CheckCircle2, GraduationCap, Languages, MapPin, Quote, Users } from "lucide-react";

import { AvailabilityBadge } from "@/components/talent/availability-badge";
import { availabilityDescription } from "@/components/talent/availability-presentation";
import { LanguageBadge } from "@/components/talent/language-badge";
import { SkillBadge } from "@/components/talent/skill-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/layout";
import type {
  Certification,
  Education,
  Experience,
  PublicTalent,
} from "@/lib/domain/talent";
import { CONTRACT_TYPE_LABEL, POOL_KIND, POOL_KIND_LABEL } from "@/lib/domain/enums";

/**
 * Blocs de la fiche publique talent (§14).
 *
 * Tous les composants ne consomment que `PublicTalent` ou des sous-listes de
 * structures déjà publiques. Aucune coordonnée, aucune adresse précise, aucun
 * document, aucune note interne.
 */

/* ------------------------------------------------------------------ */
/* En-tête                                                             */
/* ------------------------------------------------------------------ */

export function TalentProfileHeader({ talent }: { talent: PublicTalent }) {
  return (
    <div className="border-border from-kaji-50 to-background border-b bg-gradient-to-b">
      <Container size="wide" className="py-10 sm:py-14">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-subtle-foreground font-mono text-xs tracking-wide">
                  {talent.candidateId}
                </p>
                {talent.isVerified && (
                  <Badge tone="accent">
                    <CheckCircle2 aria-hidden="true" />
                    Profil vérifié par Kaji
                  </Badge>
                )}
                {talent.poolKind === POOL_KIND.PRESTATAIRE_POOL && (
                  <Badge tone="info">{POOL_KIND_LABEL[talent.poolKind]}</Badge>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl">{talent.fullName}</h1>
              <p className="text-muted-foreground text-lg">{talent.headline}</p>
            </div>

            <div className="shrink-0">
              <AvailabilityBadge availability={talent.availability} />
            </div>
          </div>

          <dl className="border-border text-muted-foreground grid grid-cols-1 gap-4 border-t pt-6 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <Fact icon={<Briefcase />} term="Catégorie">
              {talent.categoryLabel}
            </Fact>
            <Fact icon={<MapPin />} term="Localisation">
              {talent.location.city}, {talent.location.country}
            </Fact>
            <Fact icon={<Users />} term="Expérience">
              {talent.yearsOfExperience} ans
            </Fact>
            <Fact icon={<Languages />} term="Langues">
              {talent.languages.length} langue{talent.languages.length > 1 ? "s" : ""}
            </Fact>
          </dl>
        </div>
      </Container>
    </div>
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

/* ------------------------------------------------------------------ */
/* Contenu                                                             */
/* ------------------------------------------------------------------ */

function SectionCard({
  icon,
  title,
  footnote,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  footnote?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3 pb-4">
        <span
          aria-hidden="true"
          className="bg-kaji-50 text-primary grid size-9 shrink-0 place-items-center rounded-lg [&_svg]:size-4"
        >
          {icon}
        </span>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {children}
        {footnote !== undefined && <p className="text-subtle-foreground text-xs">{footnote}</p>}
      </CardContent>
    </Card>
  );
}

export function SummarySection({ talent }: { talent: PublicTalent }) {
  return (
    <SectionCard icon={<Quote />} title="Résumé professionnel">
      <p className="text-foreground text-base leading-relaxed">{talent.summary}</p>
    </SectionCard>
  );
}

export function AvailabilitySection({ talent }: { talent: PublicTalent }) {
  return (
    <SectionCard
      icon={<Briefcase />}
      title="Disponibilité"
      footnote="La disponibilité affichée est vérifiée par l'équipe Kaji. Elle ne vaut pas engagement de recrutement."
    >
      <AvailabilityBadge availability={talent.availability} />
      <p className="text-muted-foreground text-sm">{availabilityDescription(talent.availability)}</p>

      <div className="flex flex-col gap-2">
        <p className="text-subtle-foreground text-xs">Type de contrat recherché</p>
        <div className="flex flex-wrap gap-1.5">
          {talent.desiredContractTypes.map((type) => (
            <Badge key={type} tone="neutral" size="sm" className="font-normal">
              {CONTRACT_TYPE_LABEL[type]}
            </Badge>
          ))}
        </div>
      </div>

      {talent.location.isRemoteEligible && (
        <p className="text-muted-foreground text-sm">
          Le candidat se déclare ouvert au télétravail.
        </p>
      )}
    </SectionCard>
  );
}

export function SkillsSection({ talent }: { talent: PublicTalent }) {
  return (
    <SectionCard
      icon={<Award />}
      title="Compétences"
      footnote="Les niveaux indiqués sont auto-déclarés par le candidat. Kaji ne publie aucune note de valeur."
    >
      <div className="flex flex-wrap gap-1.5">
        {talent.skills.map((skill) => (
          <SkillBadge key={skill.id} label={skill.label} level={skill.level} />
        ))}
      </div>
    </SectionCard>
  );
}

export function LanguagesSection({ talent }: { talent: PublicTalent }) {
  return (
    <SectionCard icon={<Languages />} title="Langues">
      <ul className="flex flex-col gap-2.5">
        {talent.languages.map((language) => (
          <li key={language.code} className="flex items-center gap-2">
            <LanguageBadge language={language} />
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

export function ExperienceSection({ experiences }: { experiences: readonly Experience[] }) {
  return (
    <SectionCard icon={<Briefcase />} title="Expérience">
      {experiences.length === 0 ? (
        <EmptyLine>Aucune expérience détaillée n’est publiée.</EmptyLine>
      ) : (
        <ol className="flex flex-col gap-5">
          {experiences.map((experience) => (
            <li key={experience.id} className="flex flex-col gap-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h3 className="text-sm font-semibold">{experience.title}</h3>
                <p className="text-subtle-foreground text-xs">
                  {formatYear(experience.startDate)} –{" "}
                  {experience.isCurrent ? "aujourd'hui" : formatYear(experience.endDate)}
                </p>
              </div>
              <p className="text-muted-foreground text-sm">
                {experience.organization}
                {experience.location !== undefined && ` · ${experience.location}`}
              </p>
              {experience.summary !== undefined && (
                <p className="text-muted-foreground text-sm">{experience.summary}</p>
              )}
              {experience.achievements.length > 0 && (
                <ul className="text-muted-foreground mt-1 flex flex-col gap-1 text-sm">
                  {experience.achievements.map((achievement) => (
                    <li key={achievement} className="flex items-start gap-2">
                      <span aria-hidden="true" className="bg-or-500 mt-2 size-1 shrink-0 rounded-full" />
                      {achievement}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      )}
    </SectionCard>
  );
}

export function EducationSection({ education }: { education: readonly Education[] }) {
  return (
    <SectionCard icon={<GraduationCap />} title="Formation">
      {education.length === 0 ? (
        <EmptyLine>Aucune formation n’est publiée.</EmptyLine>
      ) : (
        <ul className="flex flex-col gap-3">
          {education.map((item) => (
            <li key={item.id} className="flex flex-col gap-0.5">
              <h3 className="text-sm font-semibold">{item.diploma}</h3>
              <p className="text-muted-foreground text-sm">
                {item.school}
                {item.field !== undefined && ` · ${item.field}`}
              </p>
              {item.startYear !== undefined && (
                <p className="text-subtle-foreground text-xs">
                  {item.startYear}
                  {item.endYear !== undefined && ` – ${item.endYear}`}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

export function CertificationsSection({
  certifications,
}: {
  certifications: readonly Certification[];
}) {
  return (
    <SectionCard icon={<Award />} title="Certifications">
      {certifications.length === 0 ? (
        <EmptyLine>Aucune certification publiée.</EmptyLine>
      ) : (
        <ul className="flex flex-col gap-3">
          {certifications.map((certification) => (
            <li key={certification.id} className="flex flex-col gap-0.5">
              <h3 className="text-sm font-semibold">{certification.name}</h3>
              <p className="text-muted-foreground text-sm">
                {certification.issuer}
                {certification.issuedYear !== undefined && ` · ${certification.issuedYear}`}
              </p>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground text-sm">{children}</p>;
}

function formatYear(date: string | undefined): string {
  return date === undefined ? "" : date.slice(0, 4);
}
