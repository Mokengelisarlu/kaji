import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock, Mail, PhoneCall, ShieldCheck } from "lucide-react";

import { ProfileCreatedToast } from "@/components/talent/profile-created-toast";
import {
  AvailabilitySection,
  CertificationsSection,
  EducationSection,
  ExperienceSection,
  LanguagesSection,
  SkillsSection,
  SummarySection,
  TalentProfileHeader,
} from "@/components/talent/talent-profile-sections";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container, Section } from "@/components/ui/layout";
import { getTalentProfile } from "@/lib/use-cases/talent";
import { CANDIDATE_ID_PATTERN } from "@/lib/validation/candidate-id";
import { BRAND } from "@/lib/site";

/**
 * Fiche publique talent (§14, §9).
 *
 * Trois garde-fous distincts :
 * 1. `CANDIDATE_ID_PATTERN` rejette les identifiants malformés avant tout accès
 *    aux données ;
 * 2. `getTalentProfile` ne renvoie qu'un `PublicTalentProfile`, projection
 *    vérifiée dont les coordonnées sont exclues par construction ;
 * 3. la page ne lit jamais un enregistrement interne.
 *
 * `notFound()` est levé dans `generateMetadata` **et** dans le corps : la route
 * est rendue en streaming, donc un appel effectué uniquement dans le corps
 * arrive après l'envoi des en-têtes et produirait un « soft 404 » (HTTP 200
 * avec la page introuvable). Lever l'erreur le plus tôt possible garantit le
 * vrai statut 404 — nécessaire quand un candidat retire sa fiche, pour qu'elle
 * sorte de l'index des moteurs de recherche.
 *
 * Les coordonnées ne sont jamais présentes dans le rendu : le CTA passe par une
 * demande de profil, instruite par l'équipe Kaji.
 */

export async function generateMetadata({
  params,
}: PageProps<"/talents/[id]">): Promise<Metadata> {
  const { id } = await params;

  if (!CANDIDATE_ID_PATTERN.test(id)) {
    notFound();
  }

  const talent = await getTalentProfile(id);
  if (talent === null) {
    notFound();
  }

  return {
    title: `${talent.headline} — ${talent.fullName}`,
    description: talent.summary.slice(0, 160),
    alternates: { canonical: `/talents/${talent.candidateId}` },
    openGraph: {
      title: `${talent.fullName} — ${talent.headline}`,
      description: talent.summary.slice(0, 160),
      type: "profile",
    },
  };
}

export default async function TalentProfilePage({
  params,
  searchParams,
}: PageProps<"/talents/[id]">) {
  const { id } = await params;
  const { profil } = await searchParams;

  if (!CANDIDATE_ID_PATTERN.test(id)) {
    notFound();
  }

  const talent = await getTalentProfile(id);
  if (talent === null) {
    notFound();
  }

  return (
    <>
      <ProfileCreatedToast created={profil === "cree"} />
      <TalentProfileHeader talent={talent} />

      <Section spacing="md">
        <Container size="wide">
          <Link
            href="/talents"
            className="text-muted-foreground hover:text-primary mb-6 inline-flex items-center gap-1.5 text-sm font-medium"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Retour à l’annuaire
          </Link>

          <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:gap-8">
            {/* Colonne principale : contenu de la fiche. */}
            <div className="flex min-w-0 flex-col gap-5">
              <SummarySection talent={talent} />
              <AvailabilitySection talent={talent} />
              <ExperienceSection experiences={talent.experiences} />
              <SkillsSection talent={talent} />
              <EducationSection education={talent.education} />
              <LanguagesSection talent={talent} />
              <CertificationsSection certifications={talent.certifications} />
            </div>

            {/* Colonne latérale : conversion + garde-fous de confidentialité. */}
            <aside className="flex flex-col gap-5 lg:sticky lg:top-20 lg:h-fit">
              <Card className="border-kaji-200 bg-kaji-50/60">
                <CardContent className="flex flex-col gap-4 p-5 sm:p-6">
                  <h2 className="text-lg">Ce profil vous intéresse ?</h2>
                  <p className="text-muted-foreground text-sm">
                    Déposez une demande : notre équipe vérifie la disponibilité en cours, vous
                    confirme ce qui peut être transmis, puis vous présente le profil complet.
                  </p>
                  <Button asChild block>
                    <Link
                      href={`/contact?objet=demande-profil&candidat=${encodeURIComponent(talent.candidateId)}`}
                    >
                      <Mail aria-hidden="true" />
                      Demander ce profil
                    </Link>
                  </Button>
                  <p className="text-subtle-foreground text-xs">
                    Réponse habituelle sous 48 h ouvrées.
                  </p>
                </CardContent>
              </Card>

              <Alert tone="info" title="Données volontairement non publiées">
                <ul className="mt-1 flex flex-col gap-1">
                  <li className="flex items-start gap-1.5">
                    <PhoneCall aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                    Ni téléphone ni email personnel
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Lock aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                    Ni adresse exacte ni documents
                  </li>
                  <li className="flex items-start gap-1.5">
                    <ShieldCheck aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                    Ni notes internes ni historique de recrutement
                  </li>
                </ul>
              </Alert>

              <Card>
                <CardContent className="p-5">
                  <p className="text-foreground text-sm font-semibold">
                    Vous recrutez pour ce type de profil ?
                  </p>
                  <p className="text-muted-foreground mt-1.5 text-sm">
                    Déposez un besoin : nous cherchons dans le vivier et vous présentons une
                    shortlist argumentée.
                  </p>
                  <Button asChild variant="secondary" size="sm" block className="mt-4">
                    <Link href="/entreprise/inscription">Déposer un besoin</Link>
                  </Button>
                </CardContent>
              </Card>

              <p className="text-subtle-foreground text-xs">
                {BRAND.name} — {BRAND.operatorLabel}. Fiche présentée à titre informatif ;
                seule l’équipe {BRAND.name} arbitre la transmission des informations.
              </p>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
