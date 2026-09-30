import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageBanner } from "@/components/ui/content-page";
import { Container, Section } from "@/components/ui/layout";
import { getTalentProfile } from "@/lib/use-cases/talent";
import {
  DEFAULT_SUBJECT,
  isContactSubject,
  PROFILE_SUBJECT,
} from "@/lib/validation/contact";

import { ContactForm } from "./contact-form";

/**
 * EC-11 — Contact et demande de profil (`design.md` §64.5).
 *
 * La page lit le contrat de pré-remplissage déjà produit par `EC-03` :
 * `/contact?objet=demande-profil&candidat=<candidateId>`. Elle doit
 * rattacher la demande au bon profil **et afficher son nom** — un champ
 * `candidateId` invisible laisserait l’utilisateur depositer une demande
 * sans savoir pour qui.
 *
 * Indexable : c’est une page réelle, et c’est la cible du pied de page que
 * `design.md` §64 signale comme point de conversion.
 */
export const metadata: Metadata = {
  title: "Contact",
  description:
    "Déposez un besoin de recrutement ou demandez un profil du vivier. Un médiateur répond sous 48 heures ouvrées.",
  alternates: { canonical: "/contact" },
  robots: { index: true, follow: true },
};

type SearchParams = Promise<{
  objet?: string | string[];
  candidat?: string | string[];
}>;

/** Ne retient que la première valeur : un paramètre répété est forgé. */
function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function ContactPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  const rawSubject = first(params.objet);
  // Un objet inconnu retombe sur le dépôt de besoin plutôt que d’afficher une
  // page d’erreur : le lien reste utilisable, et le formulaire dit de quoi il
  // s’agit.
  const subject = isContactSubject(rawSubject) ? rawSubject : DEFAULT_SUBJECT;

  const rawCandidateId = first(params.candidat);
  const wantsProfile = subject === PROFILE_SUBJECT;

  // Le profil n’est résolu que si un identifiant est présent, et un
  // identifiant absent ou introuvable est une page inexistante : afficher un
  // formulaire de demande de profil sans profil serait un dead-end silencieux.
  const candidateId = wantsProfile ? rawCandidateId : undefined;
  if (wantsProfile && candidateId === undefined) {
    notFound();
  }

  const profile = candidateId === undefined ? null : await getTalentProfile(candidateId);
  if (candidateId !== undefined && profile === null) {
    notFound();
  }

  const candidateLabel =
    profile === null
      ? undefined
      : `${profile.fullName} — ${profile.headline}`;

  return (
    <>
      <PageBanner
        eyebrow={wantsProfile ? "Demande de profil" : "Déposer un besoin"}
        title={wantsProfile ? "Demander ce profil" : "Déposer un besoin"}
        description={
          wantsProfile
            ? "Votre demande part vers un médiateur, qui vérifie la disponibilité et vous répond. Elle ne transmet pas le candidat."
            : "Décrivez le poste ou la mission. Un médiateur reprend votre demande, la précise, et vous dit si elle est tenable."
        }
      />

      <Section spacing="md">
        <Container size="narrow">
          <ContactForm
            subject={subject}
            {...(candidateId !== undefined ? { candidateId } : {})}
            {...(candidateLabel !== undefined ? { candidateLabel } : {})}
          />
        </Container>
      </Section>

      <Section spacing="sm" divider>
        <Container size="narrow">
          <div className="text-muted-foreground flex flex-col gap-2 text-xs">
            <p>
              Le délai de réponse habituel est de 48 heures ouvrées. Il s’agit d’un
              engagement de service, pas d’une estimation.
            </p>
            <p>
              Une entreprise n’obtient jamais les coordonnées d’un candidat avant le
              placement, et uniquement avec son accord.
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
