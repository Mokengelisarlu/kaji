import { BRAND } from "./site";

/**
 * Informations légales de l'opérateur (`02-product-vision.md` §27).
 *
 * Les mentions légales sont opposables : une valeur inventée vaut pire qu'une
 * case vide, parce qu'elle engage une entité réelle. Ce module sépare donc
 * explicitement ce qui est **établi** de ce qui reste **à compléter**, et
 * n'invente rien — `02` §27.4.3 interdit toute entité ou tout partnership
 * qui n'est pas signé.
 *
 * Chaque champ `pending` porte une clé stable : `PENDING_LEGAL_FIELDS` en
 * liste les identifiants, ce qui permet de vérifier qu'aucune mention
 * obligatoire ne reste invisible.
 */

export type EstablishedValue = {
  readonly state: "established";
  readonly value: string;
};

/** Valeur à compléter par l'opérateur avant la mise en production. */
export type PendingValue = {
  readonly state: "pending";
  /** Ce qui est attendu, pour que la donnée manquante soit actionnable. */
  readonly expected: string;
};

export type LegalValue = EstablishedValue | PendingValue;

export const OPERATOR = {
  /** Raison sociale, telle qu'elle figure au registre. */
  legalName: {
    state: "established",
    value: BRAND.operator,
  },
  /** Forme juridique. */
  legalForm: {
    state: "pending",
    expected: "Forme juridique inscrite au registre (SARLU est un indice, pas une mention suffisante)",
  },
  /** Siège social. */
  registeredOffice: {
    state: "pending",
    expected: "Adresse complète du siège social",
  },
  /** Identifiants d'immatriculation. */
  registration: {
    state: "pending",
    expected: "Numéro RCCM et identifiant fiscal",
  },
  capital: {
    state: "pending",
    expected: "Montant du capital social",
  },
  /** Directeur de la publication. */
  publicationDirector: {
    state: "pending",
    expected: "Nom de la personne physique dirigeante",
  },
  /** Adresse de contact publique. */
  contactEmail: {
    state: "pending",
    expected: "Adresse e-mail de contact publiée",
  },
  contactPhone: {
    state: "pending",
    expected: "Numéro de téléphone publié",
  },
  /** Hébergeur du site — mention obligatoire pour un service en ligne. */
  host: {
    state: "pending",
    expected: "Raison sociale, adresse et téléphone de l'hébergeur",
  },
} as const satisfies Record<string, LegalValue>;

export type OperatorField = keyof typeof OPERATOR;

/**
 * Champs non renseignés. Exporté pour que la page puisse les afficher et
 * qu'un contrôle automatisé puisse échouer si la liste grandit en production.
 */
export const PENDING_LEGAL_FIELDS: readonly OperatorField[] = (
  Object.keys(OPERATOR) as OperatorField[]
).filter((key) => OPERATOR[key].state === "pending");

export function isPending(value: LegalValue): boolean {
  return value.state === "pending";
}

/**
 * Rendu d'une valeur légale.
 *
 * Un champ en attente ne doit jamais être remplacé par une valeur inventée ni
 * masqué : il est signalé comme tel, avec ce qu'il attend. Une page légale
 * qui affiche une mention à compléter est inachevée et le dit ; une page
 * légale qui l'omet ne le dit pas.
 */
export function legalValue(field: OperatorField): {
  readonly text: string;
  readonly complete: boolean;
} {
  const value = OPERATOR[field];
  if (value.state === "established") {
    return { text: value.value, complete: true };
  }
  return { text: `À compléter avant la mise en production — ${value.expected}.`, complete: false };
}
