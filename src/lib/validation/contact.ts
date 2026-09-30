import { z } from "zod";

import { CONTRACT_TYPE, CONTRACT_TYPE_LABEL, type ContractType } from "@/lib/domain/enums";

/**
 * Validation du formulaire de contact (`design.md` §64.5, `02` §16.2).
 *
 * Deux objets coexistent sur une même route, choisis par le paramètre
 * `objet` :
 *
 * - `besoin` — l’entreprise mandate une recherche (§16.2 : « déposer un
 *   besoin », jamais « publier une annonce »).
 * - `demande-profil` — l’entreprise demande le profil qu’elle a consulté
 *   depuis `EC-03`, via `?objet=demande-profil&candidat=<candidateId>`.
 *
 * Le pré-remplissage porte un identifiant métier dans l’URL. Il est donc
 * traité comme non fiable : `candidateId` est validé au format, mais c’est
 * la page qui le résout ensuite. Le formulaire ne prétend jamais qu’un
 * profil a été trouvé à partir de la seule URL.
 */

/** Valeurs acceptées pour `?objet=`. Toute autre valeur retombe sur le défaut. */
export const CONTACT_SUBJECTS = ["besoin", "demande-profil"] as const;
export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];

export const DEFAULT_SUBJECT: ContactSubject = "besoin";

/** Objets autres que la demande de profil n’ont pas de profil associé. */
export const PROFILE_SUBJECT: ContactSubject = "demande-profil";

export function isContactSubject(value: string | undefined): value is ContactSubject {
  return CONTACT_SUBJECTS.some((subject) => subject === value);
}

/** Canal de réponse choisi par l’utilisateur. */
export const CONTACT_CHANNELS = ["email", "telephone"] as const;
export type ContactChannel = (typeof CONTACT_CHANNELS)[number];

/** Degré d’urgence, du plus au moins contraignant. */
export const CONTACT_URGENCIES = ["normal", "sous-une-semaine", "urgent"] as const;
export type ContactUrgency = (typeof CONTACT_URGENCIES)[number];

export const URGENCY_LABELS: Readonly<Record<ContactUrgency, string>> = {
  normal: "Sans urgence particulière",
  "sous-une-semaine": "Recherche souhaitée sous une semaine",
  urgent: "Poste pourvu rapidement — démarrage attendu sous 30 jours",
};

/** Devise déclarative du besoin. Aucun montant n’est calculé par le site. */
export const CONTACT_BUDGETS = ["non-precise", "taux-journalier", "salaire-annuel"] as const;
export type ContactBudget = (typeof CONTACT_BUDGETS)[number];

export const BUDGET_LABELS: Readonly<Record<ContactBudget, string>> = {
  "non-precise": "À définir avec le médiateur",
  "taux-journalier": "Taux journalier",
  "salaire-annuel": "Salaire annuel",
};

/**
 * Un téléphone français, séparateurs tolérés.
 *
 * La chaîne vide est **valide** : le champ n’est obligatoire que si le canal
 * choisi est le téléphone, et cette condition est vérifiée par `superRefine`.
 * Le rendre obligatoire ici ferait échouer toute soumission par e-mail, qui est
 * le cas le plus fréquent.
 */
const phone = z.preprocess(
  (value) => (typeof value === "string" ? value.trim().replace(/[.\s-]/g, "") : value),
  z.union([
    z.literal(""),
    z
      .string()
      .regex(/^(\+33|0033|0)[1-9]\d{8}$/, "Numéro de téléphone non reconnu."),
  ]),
);

const requiredText = (field: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${field} est obligatoire.`)
    .max(max, `${field} ne doit pas dépasser ${max} caractères.`);

/**
 * Champs communs aux deux objets.
 *
 * Le téléphone n’est exigé que si le canal le réclame : le demander sinon
 * collecterait une donnée personnelle sans raison.
 */
const commonFields = {
  name: requiredText("Le nom", 120),
  organisation: z.string().trim().max(160, "L’organisation ne doit pas dépasser 160 caractères.").optional(),
  email: z.string().trim().min(1, "L’adresse électronique est obligatoire.").email("Adresse électronique non reconnue."),
  channel: z.enum(CONTACT_CHANNELS),
  urgency: z.enum(CONTACT_URGENCIES),
  context: z.string().trim().max(2000, "Le contexte ne doit pas dépasser 2000 caractères.").optional(),
};

const baseShape = {
  subject: z.enum(CONTACT_SUBJECTS),
  ...commonFields,
  consent: z.literal("on", {
    error: "L’acceptation de la politique de confidentialité est obligatoire.",
  }),
};

const besoinShape = z.object({
  ...baseShape,
  subject: z.literal("besoin"),
  role: requiredText("Le poste ou la mission", 160),
  skills: requiredText("Les compétences attendues", 600),
  location: requiredText("La localisation", 160),
  contract: z.enum(Object.values(CONTRACT_TYPE)),
  budget: z.enum(CONTACT_BUDGETS),
  budgetAmount: z.string().trim().max(40, "Le montant ne doit pas dépasser 40 caractères."),
  telephone: phone,
});

const demandeProfilShape = z.object({
  ...baseShape,
  subject: z.literal(PROFILE_SUBJECT),
  candidateId: z
    .string()
    .trim()
    .min(1, "La demande doit être rattachée à un profil.")
    .regex(/^[a-zA-Z0-9_-]{4,64}$/, "Identifiant de profil non reconnu."),
  motive: requiredText("Le motif de la demande", 1000),
  telephone: phone,
});

/**
 * Règles transverses : cohérence entre deux champs.
 *
 * Elles sont portées par `contactSchema` et **non** par chaque forme, pour une
 * raison précise : un `superRefine` posé sur une forme n’est pas exécuté par
 * `z.discriminatedUnion`, qui ne connaît que la forme brute. Les poser sur les
 * formes seules donnerait un schéma de validation qui passe en tests et n’est
 * jamais appliqué en production.
 */
function crossFieldChecks(
  value: { readonly channel: string; readonly telephone: string } & Partial<
    { readonly budget: string; readonly budgetAmount: string }
  >,
  ctx: z.RefinementCtx,
): void {
  if (value.channel === "telephone" && value.telephone.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["telephone"],
      message:
        "Un numéro de téléphone est nécessaire si vous choisissez le téléphone comme canal.",
    });
  }
  if (
    value.budget !== undefined &&
    value.budget !== "non-precise" &&
    (value.budgetAmount ?? "").length === 0
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["budgetAmount"],
      message: "Précisez le montant, ou choisissez « à définir avec le médiateur ».",
    });
  }
}

export const contactSchema = z
  .discriminatedUnion("subject", [besoinShape, demandeProfilShape])
  .superRefine(crossFieldChecks);

/**
 * Charge utile validée. Le discriminant est garanti présent, et le type se
 * répartit sur `subject` : un appelant peut ainsi lire `budgetAmount` sans
 * vérifier d’abord que l’objet est bien un besoin.
 */
export type ContactData = z.output<typeof contactSchema>;

/**
 * Transforme un `FormData` en charge utile candidate.
 *
 * Le retour n’est volontairement **pas** typé : les champs `select` arrivent
 * en `string` et seul `contactSchema` peut décider s’ils sont valides. Typer
 * ici obligerait à dupliquer les listes de valeurs, et les désynchroniserait
 * du schéma.
 *
 * Les champs optionnels vides deviennent `undefined` plutôt que `""` : le
 * repository ne doit jamais recevoir une chaîne vide là où l’absence est la
 * valeur attendue.
 */
export function normaliseContactInput(raw: FormData): Record<string, unknown> {
  const text = (key: string): string => {
    const value = raw.get(key);
    return typeof value === "string" ? value : "";
  };
  const optional = (key: string): string | undefined => {
    const value = text(key);
    return value.length === 0 ? undefined : value;
  };

  const subject = text("subject");
  const shared = {
    name: text("name"),
    organisation: optional("organisation"),
    email: text("email"),
    channel: text("channel"),
    urgency: text("urgency"),
    context: optional("context"),
    consent: text("consent"),
  };

  if (subject === PROFILE_SUBJECT) {
    return {
      subject,
      candidateId: text("candidateId"),
      motive: text("motive"),
      telephone: text("telephone"),
      ...shared,
    };
  }

  return {
    subject: "besoin",
    role: text("role"),
    skills: text("skills"),
    location: text("location"),
    contract: text("contract"),
    budget: text("budget"),
    budgetAmount: text("budgetAmount"),
    telephone: text("telephone"),
    ...shared,
  };
}

/** Types de contrat, exposés au sélecteur avec les libellés du domaine. */
export const CONTRACT_OPTIONS: readonly { readonly value: ContractType; readonly label: string }[] =
  Object.values(CONTRACT_TYPE).map((value) => ({
    value,
    label: CONTRACT_TYPE_LABEL[value],
  }));

/**
 * Résumé d’une demande validée, destiné au médiateur et non à l’utilisateur.
 *
 * Il permet de vérifier qu’une soumission a été lue et comprise sans avoir
 * besoin d’une base de données : c’est la preuve que la donnée est
 * exploitable, et non la preuve qu’elle a été transmise.
 *
 * La fonction est pure et vit ici plutôt que dans `actions.ts` : un module
 * `"use server"` n’exporte que des actions asynchrones, et cette fonction
 * doit rester testable sans serveur.
 */
export function summariseContactRequest(payload: Record<string, unknown>): readonly string[] {
  const get = (key: string): string => {
    const value = payload[key];
    return typeof value === "string" ? value : "";
  };

  if (get("subject") === PROFILE_SUBJECT) {
    return [`Demande de profil : ${get("candidateId")}`, `Motif : ${get("motive")}`];
  }

  return [
    `Besoin : ${get("role")}`,
    `Compétences : ${get("skills")}`,
    `Localisation : ${get("location")}`,
    `Contrat : ${get("contract")}`,
  ];
}
