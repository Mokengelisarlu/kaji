import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, UserSearch } from "lucide-react";

import { TalentSlider } from "@/components/talent/talent-slider";
import {
  ProseBody,
  type ProseSection,
} from "@/components/ui/content-page";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";
import {
  EMPLOYER_DASHBOARD_PATH,
  EMPLOYER_SIGNUP_PATH,
  isEmployer,
} from "@/lib/auth/employer";
import { getSession } from "@/lib/auth/session";
import { getFeaturedTalents, getTalentPoolStats } from "@/lib/use-cases/talent";
import { BRAND } from "@/lib/site";

export const metadata: Metadata = {
  title: "Entreprises",
  description: `Confier un recrutement à ${BRAND.name} : comment se déroule une demande, ce que l’entreprise reçoit, et ce qu’elle ne recevra jamais.`,
  alternates: { canonical: "/entreprise" },
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

export default async function BusinessesPage() {
  const [featuredTalents, poolStats, session] = await Promise.all([
    getFeaturedTalents(3),
    getTalentPoolStats(),
    getSession(),
  ]);

  const employerConnected = session !== null && isEmployer(session.role);

  return (
    <>
      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-border overflow-hidden border-b bg-surface">
        <Container
          size="wide"
          className="grid items-center gap-10 pt-12 sm:pt-16 lg:grid-cols-2 lg:gap-12 lg:pt-20"
        >
          <div className="flex flex-col items-start gap-5 py-4 sm:gap-6 lg:py-10">
            <p className="bg-kaji-50 text-kaji-700 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-2xs font-semibold tracking-[0.12em] uppercase">
              <UserSearch aria-hidden="true" className="size-3.5" />
              Recrutement · Médiation humaine
            </p>

            <h1 className="max-w-xl text-4xl sm:text-5xl lg:text-6xl">
              À la recherche d’un talent ?
            </h1>

            <p className="text-muted-foreground max-w-xl text-base sm:text-lg">
              Notre annuaire croise des profils vérifiés et des disponibilités
              effectives, prêts à pourvoir le poste que vous recherchez. Créez
              un compte pour les consulter et déposer votre besoin.
            </p>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
              <Button asChild size="lg">
                <Link href={employerConnected ? EMPLOYER_DASHBOARD_PATH : EMPLOYER_SIGNUP_PATH}>
                  {employerConnected ? "Mon espace entreprise" : "Créer un compte"}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/contact?objet=besoin">Déposer un besoin</Link>
              </Button>
            </div>

            <dl className="border-border text-muted-foreground mt-3 grid w-full max-w-lg grid-cols-3 gap-3 border-t pt-5 text-sm">
              <div className="flex flex-col gap-0.5">
                <dt className="sr-only">Profils publiés</dt>
                <dd className="text-foreground text-xl font-semibold">{poolStats.totalPublished}</dd>
                <dd className="text-xs">profils publiés</dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="sr-only">Profils vérifiés</dt>
                <dd className="text-foreground text-xl font-semibold">
                  {poolStats.verifiedRatio}&nbsp;%
                </dd>
                <dd className="text-xs">vérifiés par l’équipe</dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="sr-only">Profils disponibles</dt>
                <dd className="text-foreground text-xl font-semibold">
                  {poolStats.availableCount}
                </dd>
                <dd className="text-xs">disponibles maintenant</dd>
              </div>
            </dl>
          </div>

          <TalentSlider talents={featuredTalents} />
        </Container>
      </section>

      <ProseBody sections={SECTIONS} />
    </>
  );
}
