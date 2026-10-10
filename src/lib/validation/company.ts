import { z } from "zod";

import { COMPANY_SIZE } from "@/lib/domain/enums";

/**
 * Validation du dépôt d'informations entreprise (§6, `EC-09`).
 *
 * Ces données sont administratives : elles servent à la vérification par
 * l'équipe, jamais à la publication. Le formulaire reçoit toujours des chaînes
 * (`FormData`), y compris pour les champs facultatifs laissés vides : une
 * chaîne vide devient « absente », jamais une valeur fictive.
 */

const requiredText = (field: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${field} est obligatoire.`)
    .max(max, `${field} ne doit pas dépasser ${max} caractères.`);

const optionalText = (field: string, max: number) =>
  z
    .string()
    .trim()
    .max(max, `${field} ne doit pas dépasser ${max} caractères.`)
    .transform((value) => (value.length === 0 ? undefined : value));

const website = z
  .string()
  .trim()
  .max(255, "L'adresse du site ne doit pas dépasser 255 caractères.")
  .transform((value) => (value.length === 0 ? undefined : value))
  .refine((value) => value === undefined || /^https?:\/\/[^\s]+$/i.test(value), {
    message: "L'adresse doit commencer par http:// ou https://.",
  });

export const companySchema = z.object({
  name: requiredText("Le nom de l'entreprise", 255),
  legalName: optionalText("La raison sociale", 255),
  sector: requiredText("Le secteur d'activité", 150),
  size: z.enum(Object.values(COMPANY_SIZE), {
    message: "Sélectionnez une taille d'entreprise.",
  }),
  city: requiredText("La ville", 150),
  country: z
    .string()
    .trim()
    .max(150, "Le pays ne doit pas dépasser 150 caractères.")
    .transform((value) => (value.length === 0 ? "République Démocratique du Congo" : value)),
  website,
  contactName: requiredText("Le nom du contact", 255),
  contactEmail: z
    .string()
    .trim()
    .min(1, "L'adresse électronique est obligatoire.")
    .max(255, "L'adresse électronique ne doit pas dépasser 255 caractères.")
    .email("Adresse électronique non reconnue."),
  contactPhone: optionalText("Le téléphone", 50),
  description: requiredText("La présentation", 2000),
});

export type CompanySubmissionInput = z.infer<typeof companySchema>;
