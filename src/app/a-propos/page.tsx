import type { Metadata } from "next";

import {
  PageBanner,
  ProseBody,
  type ProseSection,
} from "@/components/ui/content-page";
import { BRAND } from "@/lib/site";

export const metadata: Metadata = {
  title: "À propos",
  description: `Qui opère ${BRAND.name}, ce que ${BRAND.tagline} signifie concrètement, et ce que ${BRAND.name} refuse de faire.`,
  alternates: { canonical: "/a-propos" },
};

const SECTIONS: readonly ProseSection[] = [
  {
    id: "identite",
    title: "Deux noms, un seul site",
    blocks: [
      {
        kind: "lead",
        text: `${BRAND.name} est la marque. ${BRAND.operator} est la société qui l’exploite.`,
      },
      {
        kind: "paragraph",
        text: `Cette distinction n’est pas cosmétique. Elle détermine qui répond, qui contracte, qui facture, et qui est responsable des données que le site traite. Un site de talents qui ne dit pas qui l’exploite n’est pas un site de confiance : c’est une page sans interlocuteur.`,
      },
      {
        kind: "paragraph",
        text: `${BRAND.operator} est l’entité juridique à qui vous avez affaire. ${BRAND.name} est le nom sous lequel le service vous est présenté. La signature du site — « ${BRAND.tagline} » — décrit ce que fait le service : de la médiation, pas de la diffusion d’annonces.`,
      },
    ],
  },
  {
    id: "modele",
    title: "Ce que le modèle change",
    blocks: [
      {
        kind: "paragraph",
        text: "Un site de recherche d’emploi vous met en relation et vous laisse seul avec le résultat. Vous filtrez, vous postulez, vous relancez. Le tri est automatique, la sélection ne l’est pas — et elle se fait ailleurs, dans l’ombre.",
      },
      {
        kind: "paragraph",
        text: `${BRAND.name} inverse le rapport. Un profil entre dans un vivier encadré, et une entreprise ne « postule » pas : elle mandate. Un médiateur analyse le besoin, cherche dans le vivier, vérifie les disponibilités, et présente une sélection courte argumentée.`,
      },
      {
        kind: "list",
        items: [
          "Les profils sont vérifiés avant d’être publics, avec une date — pas déclarés par leur propriétaire.",
          "La disponibilité affichée est une disponibilité effective, reconfirmée, jamais une case cochée.",
          "Une sélection est courte et justifiée, et un humain décide de ce qui est présenté.",
          "Les coordonnées ne sont transmises qu’au moment du placement, avec l’accord du candidat.",
        ],
      },
    ],
  },
  {
    id: "processus",
    title: "Le cycle, en dix temps",
    blocks: [
      {
        kind: "paragraph",
        text: "La médiation se déroule en dix étapes, de la réception du besoin au placement. Chaque étape a un responsable et produit une trace : qui a décidé quoi, à partir de quels éléments.",
      },
      {
        kind: "list",
        items: [
          "Le besoin est déposé, puis analysé et reformulé par un médiateur : si la demande n’est pas faisable, on le dit.",
          "La recherche croise le vivier et les disponibilités réelles, avec l’accord des candidats pressentis.",
          "La sélection comporte trois à cinq profils, chacun justifié par écrit.",
          "Les entretiens sont organisés par Kaji ; l’entreprise n’a jamais à relancer seule.",
        ],
      },
      {
        kind: "paragraph",
        text: "Le détail du cycle est expliqué sur la page « Entreprises », qui est le point d’entrée de ce parcours.",
      },
    ],
  },
  {
    id: "ce-que-nous-refusons",
    title: "Ce que nous refusons",
    blocks: [
      {
        kind: "lead",
        text: "Un modèle se juge à ce qu’il refuse. Voici quatre refus, tenus.",
      },
      {
        kind: "list",
        items: [
          "La sous-traitance de masse. Envoyer cent profils à une boîte mail n’est pas un service, c’est un envoi.",
          "L’automatisation déguisée. Si aucun humain ne décide, ce n’est pas de la médiation.",
          "La vente de candidats. Kaji rend un résultat de recherche documenté, elle ne vend pas une personne.",
          "Le vocabulaire de la place de marché. Une entreprise ne publie pas une annonce chez nous : elle confie une recherche.",
        ],
      },
      {
        kind: "note",
        text: `Le mot « marketplace » est absent de ce site pour désigner ${BRAND.name}. S’il apparaît dans le parcours d’un candidat, c’est dans la description d’une réalisation professionnelle — certains candidats ont construit des places de marché à part entière.`,
      },
    ],
  },
  {
    id: "etat-du-service",
    title: "L’état réel du service",
    blocks: [
      {
        kind: "paragraph",
        text: "Ce site est en cours de construction. Il est plus utile de dire ce qui existe que ce qui existera :",
      },
      {
        kind: "list",
        items: [
          "L’annuaire des talents est public, consultable et filtrable. Il ne contient aujourd’hui que des profils de démonstration.",
          "Le formulaire de contact permet de déposer un besoin ou de demander un profil précis.",
          "Les espaces authentifiés — candidat, entreprise, RH — ne sont pas encore ouverts.",
          "Aucune opportunité n’est publiée : le site vous met en relation avec le vivier, pas avec des offres.",
        ],
      },
      {
        kind: "paragraph",
        text: "Les pages légales et la politique de confidentialité décrivent précisément ce qui est traité, et le fonctionnement détaillé est décrit dans la politique de confidentialité.",
      },
    ],
  },
];

export default function AboutPage() {
  return (
    <>
      <PageBanner
        eyebrow="À propos"
        title={`Ce que ${BRAND.name} fait, et ce qu’il refuse de faire`}
        description={`${BRAND.tagline}. Une page sur la méthode, l’opérateur et les limites assumées du service.`}
      />
      <ProseBody sections={SECTIONS} />
    </>
  );
}
