import type { Metadata } from "next";
import Link from "next/link";

import {
  PageBanner,
  ProseBody,
  type ProseSection,
} from "@/components/ui/content-page";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/layout";
import { BRAND } from "@/lib/site";

export const metadata: Metadata = {
  title: "Entreprises",
  description: `Confier un recrutement à ${BRAND.name} : comment se déroule une demande, ce que l’entreprise reçoit, et ce qu’elle ne recevra jamais.`,
  alternates: { canonical: "/entreprises" },
};

const SECTIONS: readonly ProseSection[] = [
  {
    id: "ce-que-vous-deposez",
    title: "Ce que vous déposez",
    blocks: [
      {
        kind: "lead",
        text: "Une entreprise ne publie pas une annonce. Elle dépose un besoin.",
      },
      {
        kind: "paragraph",
        text: "Un besoin, c’est un métier, des compétences, un lieu, un contrat, une échéance. C’est aussi un contexte : pourquoi le poste est ouvert, ce qui a déjà été tenté, ce qui ferait partir la bonne personne.",
      },
      {
        kind: "paragraph",
        text: "Ce contexte est la partie la plus utile du dépôt, et la plus souvent omise. Un médiateur qui sait qu’une recherche précédente a échoué sur le niveau de rémunération posera une question différente, et fera mieux. Un médiateur à qui l’on ne dit rien fera comme tout le monde.",
      },
    ],
  },
  {
    id: "deroulement",
    title: "Comment la demande se déroule",
    blocks: [
      {
        kind: "paragraph",
        text: "Le cycle compte dix étapes. En voici les cinq qui vous concernent, dans l’ordre où vous les traverserez.",
      },
      {
        kind: "list",
        items: [
          "Analyse et reformulation. Un médiateur reprend votre besoin, le précise, et vous dit s’il est faisable. Si la demande n’est pas tenable, vous l’apprenez ici, pas trois semaines plus tard.",
          "Recherche. La demande entre dans le vivier, où elle croise les compétences et les disponibilités effectives, pas les disponibilités déclarées.",
          "Sélection. Trois à cinq profils vous sont proposés, chacun avec une justification écrite : ce qui correspond, ce qui reste à vérifier.",
          "Présentation et entretiens. Les entretiens sont organisés par Kaji. Vous n’êtes pas seul à relancer, et les candidats ne reçoivent pas cinq messages concurrents.",
          "Décision et placement. Vous confirmez un profil, ou vous demandez une nouvelle recherche. Le canal de contact est établi à ce moment-là, avec l’accord du candidat.",
        ],
      },
      {
        kind: "note",
        text: "Le délai de réponse habituel est de 48 heures ouvrées. Il s’agit d’un engagement de service affiché, pas d’une estimation de devis.",
      },
    ],
  },
  {
    id: "ce-que-vous-recevez",
    title: "Ce que vous recevez",
    blocks: [
      {
        kind: "list",
        items: [
          "Une sélection courte, argumentée — pas une liste de cinquante CV.",
          "Des profils dont la vérification et la disponibilité sont datées, pas affirmées.",
          "Les entretiens organisés, avec les comptes rendus consignés.",
          "Un dossier de placement, et non un profil que vous devez encore vérifier.",
        ],
      },
    ],
  },
  {
    id: "ce-que-vous-ne-recevrez-jamais",
    title: "Ce que vous ne recevrez jamais",
    blocks: [
      {
        kind: "lead",
        text: "L’absence de données est une fonctionnalité, pas un oubli.",
      },
      {
        kind: "list",
        items: [
          "Les coordonnées d’un candidat. Ni téléphone, ni e-mail, ni adresse exacte. Vous ne les demandez pas ; nous ne les avons pas à vous donner. Elles s’établissent au placement, avec l’accord du candidat.",
          "Le score de correspondance d’un candidat, présenté comme une note de qualité. C’est un score de correspondance avec un besoin, et il n’a pas de valeur en dehors de celui-ci.",
          "Les notes internes de Kaji sur un profil, ni les commentaires de nos médiateurs. Ce sont des outils de décision, pas des arguments de vente.",
          "Un vivier de masse. La quantité de profils n’est pas le service ; la qualité de la sélection l’est.",
        ],
      },
    ],
  },
  {
    id: "ce-que-nous-ne-faisons-pas",
    title: "Ce que nous ne faisons pas",
    blocks: [
      {
        kind: "list",
        items: [
          "Nous ne diffusons pas votre demande à un vivier de CV. Envoyer cent profils à une boîte mail n’est pas une recherche, c’est un envoi.",
          "Nous ne vendons pas de candidats. Nous rendons un résultat de recherche documenté.",
          "Nous ne promettons pas un recrutement. Nous nous engageons sur le délai de réponse et sur la traçabilité de la démarche.",
        ],
      },
    ],
  },
];

export default function BusinessesPage() {
  return (
    <>
      <PageBanner
        eyebrow="Entreprises"
        title="Confier une recherche, pas publier une annonce"
        description={`Le parcours entreprise chez ${BRAND.name} : ce que vous déposez, ce que vous recevez, et ce que vous n’obtiendrez pas.`}
      />

      <Section spacing="md">
        <Container size="narrow">
          <div className="border-border bg-muted/40 flex flex-col gap-4 rounded-xl border p-6 sm:p-8">
            <h2 className="text-lg font-semibold">Commencer par décrire votre besoin</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Le formulaire indique le métier, les compétences, la localisation, le
              type de contrat et l’échéance. Un médiateur vous répond sous 48 heures
              ouvrées.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/contact?objet=besoin">Déposer un besoin</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/talents">Parcourir le vivier d’abord</Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <ProseBody sections={SECTIONS} />
    </>
  );
}
