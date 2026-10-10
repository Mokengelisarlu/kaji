import { z } from "zod";
import {
  AVAILABILITY_TYPE,
  CONTRACT_TYPE,
  LANGUAGE_CODE,
  LANGUAGE_LEVEL,
  PROFILE_VISIBILITY,
} from "@/lib/domain/enums";
import { comparePeriods, isYearMonthOrYear } from "@/lib/domain/period";

/**
 * Validation for candidate profile creation (onboarding).
 * Follows the same patterns as contact validation.
 */

const requiredText = (field: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${field} est obligatoire.`)
    .max(max, `${field} ne doit pas dépasser ${max} caractères.`);

const PERIOD_MESSAGE = "Format attendu : AAAA-MM (mois et année).";

/** Période facultative (`AAAA-MM` ou `AAAA` seule) ; une chaîne vide devient absente. */
const optionalPeriod = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === undefined || v === "" ? undefined : v))
  .refine((v) => v === undefined || isYearMonthOrYear(v), { message: PERIOD_MESSAGE });

/** Période obligatoire (`AAAA-MM` ou `AAAA` seule). */
const requiredPeriod = z
  .string()
  .trim()
  .min(1, "La date de début est obligatoire.")
  .refine((v) => isYearMonthOrYear(v), { message: PERIOD_MESSAGE });

export const skillSchema = z.object({
  label: requiredText("La compétence", 80),
  level: z.coerce.number().int().min(1).max(5),
  yearsOfPractice: z.coerce.number().int().min(0).max(50).optional().or(z.literal("")).transform((v) => (v === "" ? undefined : v)),
});

export const languageSchema = z.object({
  code: z.enum(Object.values(LANGUAGE_CODE)),
  level: z.enum(Object.values(LANGUAGE_LEVEL)),
});

export const experienceSchema = z
  .object({
    title: requiredText("Le titre du poste", 160),
    organization: requiredText("L'organisation", 160),
    location: z.string().trim().max(160).optional(),
    startDate: requiredPeriod,
    isCurrent: z.boolean().optional().default(false),
    endDate: optionalPeriod,
    summary: z.string().trim().max(2000).optional(),
    achievements: z
      .array(z.string().trim().max(4000))
      .optional()
      .default([]),
  })
  .refine(
    (e) => e.isCurrent || e.endDate === undefined || comparePeriods(e.startDate, e.endDate) <= 0,
    { message: "La date de fin doit être postérieure ou égale à la date de début.", path: ["endDate"] },
  );

export const educationSchema = z
  .object({
    diploma: requiredText("Le diplôme", 160),
    school: requiredText("L'établissement", 160),
    field: z.string().trim().max(160).optional(),
    startDate: optionalPeriod,
    endDate: optionalPeriod,
  })
  .refine((e) => e.startDate === undefined || e.endDate === undefined || comparePeriods(e.startDate, e.endDate) <= 0, {
    message: "La date de fin doit être postérieure ou égale à la date de début.",
    path: ["endDate"],
  });

export const certificationSchema = z.object({
  name: requiredText("La certification", 160),
  issuer: requiredText("L'organisme", 160),
  issuedAt: optionalPeriod,
  expiresAt: optionalPeriod,
});

export const candidateProfileSchema = z.object({
  fullName: requiredText("Le nom complet", 120),
  lastName: requiredText("Le nom", 120),
  postName: z
    .string()
    .trim()
    .max(120, "Le postnom ne doit pas dépasser 120 caractères.")
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  firstName: requiredText("Le prénom", 120),
  phone: z.string().trim().max(50).optional(),
  headline: requiredText("Le titre professionnel", 160),
  categoryLabel: requiredText("La catégorie", 160),
  domainLabels: z.string().trim().optional(), // comma-separated
  city: requiredText("La ville", 160),
  country: z.string().trim().max(80).default("France"),
  isRemoteEligible: z.boolean().optional().default(true),
  yearsOfExperience: z.coerce.number().int().min(0).max(50),
  summary: requiredText("Le résumé", 4000),
  skills: z.array(skillSchema).min(1, "Au moins une compétence est requise."),
  languages: z.array(languageSchema).min(1, "Au moins une langue est requise."),
  experiences: z.array(experienceSchema).optional().default([]),
  education: z.array(educationSchema).optional().default([]),
  certifications: z.array(certificationSchema).optional().default([]),
  profileVisibility: z.enum(Object.values(PROFILE_VISIBILITY)),
  declaredAvailability: z.enum(Object.values(AVAILABILITY_TYPE)).optional(),
  desiredContractTypes: z.array(z.enum(Object.values(CONTRACT_TYPE))).min(1).optional(),
});

export type CandidateProfileFormValues = z.infer<typeof candidateProfileSchema>;
export type CandidateProfileSubmissionInput = CandidateProfileFormValues;

/* ------------------------------------------------------------------ */
/* Blocs d'édition ciblée (dashboard)                                  */
/* ------------------------------------------------------------------ */

/** Résumé professionnel, bloc seul. */
export const summaryBlockSchema = z.object({
  summary: requiredText("Le résumé", 4000),
});

/** Disponibilité déclarée + contrats + télétravail. */
export const availabilityBlockSchema = z.object({
  declaredAvailability: z.enum(Object.values(AVAILABILITY_TYPE)).optional(),
  desiredContractTypes: z.array(z.enum(Object.values(CONTRACT_TYPE))).optional(),
  isRemoteEligible: z.boolean().optional().default(true),
});

export const skillsBlockSchema = z.object({
  skills: z.array(skillSchema).min(1, "Au moins une compétence est requise."),
});

export const languagesBlockSchema = z.object({
  languages: z.array(languageSchema).min(1, "Au moins une langue est requise."),
});

export const experiencesBlockSchema = z.object({
  experiences: z.array(experienceSchema).optional().default([]),
});

export const educationBlockSchema = z.object({
  education: z.array(educationSchema).optional().default([]),
});

export const certificationsBlockSchema = z.object({
  certifications: z.array(certificationSchema).optional().default([]),
});
