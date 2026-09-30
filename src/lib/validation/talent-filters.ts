import { z } from "zod";

import {
  CONTRACT_TYPE,
  EFFECTIVE_AVAILABILITY,
  LANGUAGE_CODE,
  POOL_KIND,
  type ContractType,
  type EffectiveAvailability,
  type LanguageCode,
  type PoolKind,
} from "@/lib/domain/enums";

/**
 * Validation Zod des paramètres de l'annuaire (§13, §23).
 *
 * Toute donnée issue de l'URL est non fiable : elle est validée ici avant
 * d'atteindre le repository. Les valeurs hors enum sont **rejetées** et non
 * silencieusement ignorées, pour éviter qu'un crawl d'URL produise des
 * combinaisons de filtres infinies.
 */

const csv = (value: string): readonly string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

/**
 * Ne conserve que les valeurs d'une liste blanche. Silencieusement ignorer
 * une valeur inconnue évite qu'un lien forgé casse l'annuaire ; l'utilisateur
 * voit le résultat, pas l'erreur de syntaxe.
 */
const csvEnum = (allowed: readonly string[], value: string): readonly string[] => {
  const set = new Set<string>(allowed);
  return csv(value).filter((item) => set.has(item));
};

export const TALENT_SORTS = ["relevance", "experience_desc", "experience_asc", "recent"] as const;

/**
 * `z.coerce.boolean()` est un piège : `Boolean("false") === true`.
 * On accepte donc explicitement « 1 », « true », « oui » et « on ».
 */
const booleanFlag = z
  .union([z.boolean(), z.string()])
  .transform((value) =>
    typeof value === "boolean" ? value : ["1", "true", "oui", "on"].includes(value.toLowerCase()),
  );

const rawSearchParamsSchema = z.object({
  q: z.string().trim().max(120).optional().default(""),
  category: z.string().max(300).optional().default(""),
  domain: z.string().max(300).optional().default(""),
  city: z.string().max(300).optional().default(""),
  skill: z.string().max(300).optional().default(""),
  language: z.string().max(300).optional().default(""),
  availability: z.string().max(200).optional().default(""),
  contract: z.string().max(200).optional().default(""),
  pool: z.string().max(100).optional().default(""),
  experienceMin: z.coerce.number().int().min(0).max(50).optional(),
  experienceMax: z.coerce.number().int().min(0).max(50).optional(),
  verified: booleanFlag.optional().default(false),
  sort: z.enum(TALENT_SORTS).optional().default("relevance"),
  page: z.coerce.number().int().min(1).max(500).optional().default(1),
  pageSize: z.coerce.number().int().min(6).max(48).optional().default(12),
});

export type RawTalentSearchParams = z.input<typeof rawSearchParamsSchema>;

/** Parse sécurisé d'un objet `searchParams` en filtres typés. */
export function parseTalentSearchParams(
  input: Record<string, string | string[] | undefined>,
): {
  readonly filters: import("@/lib/domain/talent").TalentFilters;
  readonly issues: readonly string[];
} {
  const issues: string[] = [];
  const normalised: Record<string, string> = {};

  for (const [key, value] of Object.entries(input)) {
    if (typeof value === "string") {
      normalised[key] = value;
      continue;
    }
    if (Array.isArray(value)) {
      const first = value[0];
      if (first !== undefined) {
        normalised[key] = first;
        issues.push(`Le paramètre « ${key} » a été reçu plusieurs fois ; la première valeur est retenue.`);
      }
      continue;
    }
    if (value !== undefined) {
      normalised[key] = String(value);
    }
  }

  const parsed = rawSearchParamsSchema.safeParse(normalised);

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "racine";
      issues.push(`Paramètre « ${key} » invalide : ${issue.message}.`);
    }
  }

  // En cas de paramètre invalide, on retombe sur des filtres neutres plutôt que
  // de renvoyer une erreur : un lien mal formé ne doit pas casser l'annuaire.
  const data = parsed.success ? parsed.data : rawSearchParamsSchema.parse({});

  const min = data.experienceMin ?? 0;
  const max = data.experienceMax ?? 50;

  return {
    filters: {
      query: data.q,
      categorySlugs: csv(data.category),
      domainSlugs: csv(data.domain),
      citySlugs: csv(data.city),
      experience: min <= max ? [min, max] : [max, min],
      skillLabels: csv(data.skill),
      languageCodes: csvEnum(Object.values(LANGUAGE_CODE), data.language) as readonly LanguageCode[],
      availabilities: csvEnum(
        Object.values(EFFECTIVE_AVAILABILITY),
        data.availability,
      ) as readonly EffectiveAvailability[],
      contractTypes: csvEnum(Object.values(CONTRACT_TYPE), data.contract) as readonly ContractType[],
      verifiedOnly: data.verified,
      poolKinds: csvEnum(Object.values(POOL_KIND), data.pool) as readonly PoolKind[],
      sort: data.sort,
      page: data.page,
      pageSize: data.pageSize,
    },
    issues,
  };
}
