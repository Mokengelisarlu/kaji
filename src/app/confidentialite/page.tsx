import type { Metadata } from "next";

import {
  PageBanner,
  ProseBody,
  type ProseSection,
} from "@/components/ui/content-page";
import { OPERATOR, PENDING_LEGAL_FIELDS, legalValue } from "@/lib/legal";
import { BRAND } from "@/lib/site";

/**
 * EC-13 — Politique de confidentialité.
 *
 * Indexable, comme toute page légale (`design.md` §64.6).
 *
 * Les traitements décrits ici sont ceux du code, pas ceux d’un modèle
 * théorique : aucun cookie, aucun traceur, aucun script tiers, aucun envoi à
 * une régie publicitaire. Les profils publiés sont fictifs et servent à
 * démontrer le service. Décrire une_finalité que le code n’implémente pas
 * serait une promesse non tenue.
 */
export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: `Quelles données ${BRAND.name} collecte, pourquoi, combien de temps, et ce qu’il ne collecte pas.`,
  alternates: { canonical: "/confidentialite" },
  robots: { index: true, follow: true },
};

const SECTIONS: readonly ProseSection[] = [
  {
    id: "responsable",
    title: "Responsable du traitement",
    blocks: [
      {
        kind: "lead",
        text: `Le responsable du traitement est ${OPERATOR.legalName.value}, éditeur de ${BRAND.name}.`,
      },
      {
        kind: "paragraph",
        text: `Le contact destiné aux questions relatives aux données personnelles est l’adresse de contact publiée dans les mentions légales.${legalValue("contactEmail").complete ? "" : " Elle reste à publier."}`,
      },
    ],
  },
  {
    id: "principe",
    title: "Notre position de principe",
    blocks: [
      {
        kind: "paragraph",
        text: `${BRAND.name} met en relation des talents et des entreprises. La donnée la plus sensible au sens courant est la donnée professionnelle : parcours, compétences, disponibilité. Elle est ici le cœur du service, ce qui suppose une discipline de conservation et une transparence sur sa portée.`,
      },
      {
        kind: "list",
        items: [
          "Nous ne vendons pas de données personnelles.",
          "Nous ne louons pas de bases de contacts.",
          "Nous ne transmettons pas les coordonnées d’un candidat à une entreprise avant le placement, et uniquement avec l’accord du candidat.",
          "Nous n’utilisons ni cookie publicitaire, ni traceur, ni outil de mesure d’audience tiers.",
        ],
      },
    ],
  },
  {
    id: "donnees-publiques",
    title: "Données visibles dans le vivier public",
    blocks: [
      {
        kind: "paragraph",
        text: "L’annuaire public affiche des profils de démonstration : prénom, prénom composé, initiales du nom, métier, années d’expérience, localisations déclarées, compétences, disponibilités, date de dernière mise à jour et statut de vérification.",
      },
      {
        kind: "list",
        items: [
          "Nom de famille jamais affiché en entier : seules les initiales le sont.",
          "Photographie d’identité absente.",
          "Coordonnées complètes absentes : ni téléphone, ni adresse électronique, ni adresse postale.",
          "Employeur actuel masqué, remplacé par la seule entreprise déclarée par le candidat.",
        ],
      },
      {
        kind: "note",
        text: "Ces profils sont fictifs et servent à démontrer le fonctionnement du service. Aucune donnée réelle de personne physique identifiable n’est publiée sur ce site.",
      },
    ],
  },
  {
    id: "donnees-collectees",
    title: "Données collectées",
    blocks: [
      {
        kind: "paragraph",
        text: "La consultation du site public ne demande aucune création de compte et ne déclenche aucune collecte de données personnelles. Aucune adresse électronique n’est demandée pour parcourir le vivier.",
      },
      {
        kind: "paragraph",
        text: "Lorsqu’une personne choisit de déposer un besoin ou de demander la création d’un profil via le formulaire de contact, les informations saisies dans ce formulaire sont transmises à l’éditeur. Elles sont alors utilisées pour répondre à la demande et poursuivre la mise en relation.",
      },
    ],
  },
  {
    id: "finalites",
    title: "Finalités et bases légales",
    blocks: [
      {
        kind: "list",
        items: [
          "Répondre à une demande de contact : intérêt légitime de l’éditeur à traiter une demande qui lui est adressée.",
          "Instruire un besoin d’entreprise et proposer des profils : exécution de mesures précontractuelles à la demande de la personne concernée.",
          "Créer et tenir un profil candidat à sa demande : exécution de mesures précontractuelles à la demande de la personne concernée.",
          "Conserver les échanges nécessaires à l’instruction de la demande : intérêt légitime et obligation légale de conservation des pièces d’un dossier de recrutement.",
          "Établir un canal de contact lors d’un placement : exécution du contrat de prestation entre l’entreprise et le candidat.",
        ],
      },
      {
        kind: "paragraph",
        text: "Aucune décision automatisée produisant des effets juridiques n’est prise sur la base des données du vivier. Les scores de correspondance existent pour ordonner une recherche et ne fondent à eux seuls aucune exclusion.",
      },
    ],
  },
  {
    id: "destinataires",
    title: "Destinataires",
    blocks: [
      {
        kind: "paragraph",
        text: "Les données sont accessibles aux seules personnes qui interviennent chez l’éditeur dans le cadre de la médiation. Elles ne sont ni revendues, ni louées, ni échangées avec des tiers à des fins commerciales.",
      },
      {
        kind: "paragraph",
        text: "Un employeur ne reçoit, avant le placement, que les éléments strictement nécessaires à l’évaluation : métier, compétences, expérience, localisation, disponibilité. Les coordonnées complètes ne sont communiquées qu’après accord du candidat.",
      },
      {
        kind: "paragraph",
        text: "Les sous-traitants techniques susceptibles d’héberger le site ou d’acheminer les messages figureront dans la liste dès leur désignation, avec la base de leur intervention.",
      },
    ],
  },
  {
    id: "conservation",
    title: "Durées de conservation",
    blocks: [
      {
        kind: "paragraph",
        text: "Les demandes de contact sans suite sont conservées le temps d’instruire la demande, puis supprimées. Les profils publiés dans le vivier le sont tant que le candidat le souhaite : le retrait est la règle, la conservation n’est justifiée que par une démarche en cours.",
      },
      {
        kind: "note",
        text:
          PENDING_LEGAL_FIELDS.length > 0
            ? "Les durées exactes seront fixées et publiées avec l’identité complète de l’éditeur. Elles sont volontairement indiquées ici en principe et non en nombre de jours : une durée annoncée sans base légale applicable documentée serait arbitraire."
            : "Les durées exactes figurent ci-dessus.",
      },
    ],
  },
  {
    id: "droits",
    title: "Vos droits",
    blocks: [
      {
        kind: "paragraph",
        text: "Vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation et d’opposition, ainsi que du droit à la portabilité de vos données. Ces droits s’exercent auprès du responsable du traitement.",
      },
      {
        kind: "paragraph",
        text: "En cas de réponse insatisfaisante, vous pouvez introduire une réclamation auprès de l’autorité de contrôle compétente. Une médiation entre les parties est recherché avant toute démarche contentieuse.",
      },
    ],
  },
  {
    id: "cookies",
    title: "Cookies et traceurs",
    blocks: [
      {
        kind: "paragraph",
        text: "Ce site ne dépose aucun cookie à des fins de mesure d’audience, de publicité ou de personnalisation. Aucun script tiers n’y est chargé. Il n’y a donc ni bannière de consentement à afficher, ni outil à garder d’exclusion à proposer.",
      },
      {
        kind: "paragraph",
        text: "Cette situation n’est pas définitive : elle décrit le site aujourd’hui. L’introduction d’un outil d’analyse ou d’un parcours d’authentification entraînera une mise à jour de cette politique et, le cas échéant, un dispositif de consentement.",
      },
    ],
  },
  {
    id: "securite",
    title: "Sécurité",
    blocks: [
      {
        kind: "paragraph",
        text: "Les échanges avec le site sont chiffrés. L’accès aux données est restreint aux personnes qui les traitent dans le cadre de leur fonction. Aucun dispositif ne garantit toutefois l’absence de risque : en cas de violation de données constatée, l’éditeur informera les personnes concernées lorsque la réglementation l’impose.",
      },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageBanner
        eyebrow="Données personnelles"
        title="Politique de confidentialité"
        description={`Ce que ${BRAND.name} collecte, pourquoi, combien de temps — et ce qu’il ne collecte pas.`}
      />
      <ProseBody sections={SECTIONS} />
    </>
  );
}
