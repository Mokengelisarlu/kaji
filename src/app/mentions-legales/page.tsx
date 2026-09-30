import type { Metadata } from "next";

import {
  PageBanner,
  ProseBody,
  type ProseSection,
} from "@/components/ui/content-page";
import { OPERATOR, PENDING_LEGAL_FIELDS, legalValue, type OperatorField } from "@/lib/legal";
import { BRAND } from "@/lib/site";

/**
 * EC-12 — Mentions légales.
 *
 * Indexable, et obligatoirement : `design.md` §64.6 rappelle qu’une page
 * légale non indexée n’est pas opposable. C’est la raison pour laquelle
 * `placeholderMetadata()` (qui force `noindex`) ne convient pas ici.
 *
 * Les mentions non encore renseignées sont affichées comme telles. Aucune
 * valeur n’est inventée : `02` §27.4.3 l’interdit, et une mention légale
 * fausse engage une entité réelle.
 */
export const metadata: Metadata = {
  title: "Mentions légales",
  description: `Éditeur, hébergeur et conditions d’utilisation de ${BRAND.name}, service exploité par ${BRAND.operator}.`,
  alternates: { canonical: "/mentions-legales" },
  robots: { index: true, follow: true },
};

/** Mention obligatoire, rendue depuis `OPERATOR`. */
function mention(label: string, field: OperatorField) {
  const { text, complete } = legalValue(field);
  return { label, text, complete };
}

const IDENTITY = [
  mention("Éditeur du site", "legalName"),
  mention("Forme juridique", "legalForm"),
  mention("Siège social", "registeredOffice"),
  mention("Immatriculation", "registration"),
  mention("Capital social", "capital"),
  mention("Directeur de la publication", "publicationDirector"),
  mention("Contact", "contactEmail"),
  mention("Téléphone", "contactPhone"),
  mention("Hébergeur", "host"),
];

const SECTIONS: readonly ProseSection[] = [
  {
    id: "editeur",
    title: "Éditeur du site",
    blocks: [
      {
        kind: "lead",
        text: `Le site ${BRAND.domain} est édité par ${OPERATOR.legalName.value}.`,
      },
      {
        kind: "paragraph",
        text: `La marque ${BRAND.name} et la société ${BRAND.operator} sont deux identités distinctes : la première désigne le service, la seconde est l’entité juridique responsable. Les pages légales, les contrats et la facturation relèvent de la seconde.`,
      },
    ],
  },
  {
    id: "coordonnees",
    title: "Coordonnées de l’éditeur",
    blocks: [
      {
        kind: "paragraph",
        text: "Les mentions ci-dessous sont exigées par la réglementation applicable aux services en ligne. Elles doivent être complètes avant la mise en production : une mention absente ou erronée engage la responsabilité de l’éditeur.",
      },
      {
        kind: "list",
        items: IDENTITY.map((entry) => `${entry.label} : ${entry.text}`),
      },
      {
        kind: "note",
        text:
          PENDING_LEGAL_FIELDS.length > 0
            ? `${PENDING_LEGAL_FIELDS.length} mention(s) restent à renseigner. Elles sont signalées ci-dessus plutôt que laissées vides ou estimées : une mention légale inventée engage une entité réelle.`
            : "Toutes les mentions obligatoires sont renseignées.",
      },
    ],
  },
  {
    id: "hebergement",
    title: "Hébergement",
    blocks: [
      {
        kind: "paragraph",
        text: "Le nom, l’adresse et le numéro de téléphone de l’hébergeur sont une mention obligatoire pour un service accessible en ligne. Ils figurent dans la liste ci-dessus, au même titre que les coordonnées de l’éditeur.",
      },
    ],
  },
  {
    id: "propriete-intellectuelle",
    title: "Propriété intellectuelle",
    blocks: [
      {
        kind: "paragraph",
        text: "La structure générale du site, les textes rédigés pour décrire le service, les éléments graphiques et les marques déposées sont la propriété de l’éditeur ou font l’objet d’une autorisation. Toute reproduction représentation ou adaptation, totale ou partielle, est interdite sans autorisation écrite préalable.",
      },
      {
        kind: "paragraph",
        text: "Les contenus déposés par les candidats — parcours, formations, certifications — demeurent leur propriété. Leur publication sur le site vaut autorisation de diffusion publique dans le cadre du service, et peut être retirée à la demande du candidat.",
      },
    ],
  },
  {
    id: "responsabilite",
    title: "Responsabilité",
    blocks: [
      {
        kind: "paragraph",
        text: "L’éditeur s’efforce d’assurer l’exactitude et la mise à jour des informations publiées. Il ne peut toutefois garantir l’exhaustivité du vivier ni l’adéquation d’un profil à un besoin donné : l’arbitrage reste une décision humaine, et l’éditeur n’est pas partie au contrat liant une entreprise et un candidat.",
      },
      {
        kind: "paragraph",
        text: "L’éditeur ne peut être tenu responsable des dommages directs ou indirects résultant de l’accès au site ou de son utilisation, ni de la disponibilité du service. L’accès au site est fourni en l’état, sans garantie de continuité.",
      },
    ],
  },
  {
    id: "liens",
    title: "Liens vers des sites tiers",
    blocks: [
      {
        kind: "paragraph",
        text: "Le site peut contenir des liens vers des ressources externes. L’éditeur n’exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu. Un lien vers un site tiers ne vaut pas caution de l’éditeur.",
      },
    ],
  },
  {
    id: "droit-applicable",
    title: "Droit applicable et juridiction",
    blocks: [
      {
        kind: "paragraph",
        text: "Les présentes mentions sont soumises au droit applicable au siège de l’éditeur. En cas de litige, une solution amiable sera recherchée avant toute action judiciaire. Le forum compétent sera précisé dès que le siège social sera renseigné.",
      },
    ],
  },
];

export default function LegalNoticePage() {
  return (
    <>
      <PageBanner
        eyebrow="Informations légales"
        title="Mentions légales"
        description={`Qui édite ${BRAND.name}, qui l’héberge, et ce que l’usage du site engage.`}
      />
      <ProseBody sections={SECTIONS} />
    </>
  );
}
