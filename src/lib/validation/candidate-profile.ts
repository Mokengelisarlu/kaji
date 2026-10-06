import { z } from "zod";
import {
  AVAILABILITY_TYPE,
  CONTRACT_TYPE,
  LANGUAGE_CODE,
  LANGUAGE_LEVEL,
  PROFILE_VISIBILITY,
} from "@/lib/domain/enums";

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

export const skillSchema = z.object({
  label: requiredText("La compétence", 80),
  level: z.coerce.number().int().min(1).max(5),
  yearsOfPractice: z.coerce.number().int().min(0).max(50).optional().or(z.literal("")).transform((v) => (v === "" ? undefined : v)),
});

export const languageSchema = z.object({
  code: z.enum(Object.values(LANGUAGE_CODE)),
  level: z.enum(Object.values(LANGUAGE_LEVEL)),
});

export const experienceSchema = z.object({
  title: requiredText("Le titre du poste", 160),
  organization: requiredText("L'organisation", 160),
  location: z.string().trim().max(160).optional(),
  startDate: z.string().trim().min(1, "La date de début est obligatoire."),
  isCurrent: z.boolean().optional().default(false),
  endDate: z.string().trim().optional(),
  summary: z.string().trim().max(2000).optional(),
  achievements: z
    .array(z.string().trim().max(4000))
    .optional()
    .default([]),
});

export const educationSchema = z.object({
  diploma: requiredText("Le diplôme", 160),
  school: requiredText("L'établissement", 160),
  field: z.string().trim().max(160).optional(),
  startYear: z.coerce.number().int().min(1900).max(2100).optional().or(z.literal("")).transform((v) => (v === "" ? undefined : v)),
  endYear: z.coerce.number().int().min(1900).max(2100).optional().or(z.literal("")).transform((v) => (v === "" ? undefined : v)),
});

export const certificationSchema = z.object({
  name: requiredText("La certification", 160),
  issuer: requiredText("L'organisme", 160),
  issuedYear: z.coerce.number().int().min(1900).max(2100).optional().or(z.literal("")).transform((v) => (v === "" ? undefined : v)),
  expiresAt: z.string().trim().optional(),
});

export const candidateProfileSchema = z.object({
  fullName: requiredText("Le nom complet", 120),
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
