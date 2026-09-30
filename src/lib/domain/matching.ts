import type { PublicTalent } from "./talent";
import type { ContractType } from "./enums";

/**
 * Moteur de matching à règles (§8).
 *
 * Principes :
 * - le score mesure la **correspondance avec les critères du poste**, jamais la
 *   qualité d'une personne. Il ne doit pas être affiché comme une note/étoile ;
 * - chaque critère est une règle indépendante, activable et pondérable ;
 * - le moteur est modulaire : ajouter un critère = ajouter une règle, sans
 *   toucher à l'orchestrateur ;
 * - aucune dépendance externe, aucun scoring opaque, aucun ML.
 */

export type MatchCriteria = {
  readonly query?: string;
  readonly categorySlugs?: readonly string[];
  readonly domainSlugs?: readonly string[];
  readonly citySlugs?: readonly string[];
  readonly remoteOnly?: boolean;
  readonly minExperienceYears?: number;
  readonly maxExperienceYears?: number;
  readonly requiredSkills?: readonly string[];
  readonly requiredLanguages?: readonly string[];
  readonly contractTypes?: readonly ContractType[];
};

export type MatchRuleResult = {
  readonly ruleId: string;
  /** 0 → aucun rapport, 1 → correspondance totale. */
  readonly score: number;
  readonly matched: boolean;
  readonly detail: string;
};

export type MatchRule = {
  readonly id: string;
  readonly label: string;
  /** Poids relatif. Les poids sont normalisés, leur somme n'a pas besoin d valoir 1. */
  readonly weight: number;
  /** `true` si l'absence de critère côté poste rend la règle non applicable. */
  readonly applies: (criteria: MatchCriteria) => boolean;
  readonly evaluate: (talent: PublicTalent, criteria: MatchCriteria) => MatchRuleResult;
};

const COMBINING_DIACRITICS = /[\u0300-\u036f]/g;

const normalize = (value: string): string =>
  value
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .toLowerCase()
    .trim();

/** Normalisation tolérante aux accents et à la casse. */
export const normalizeLabel = normalize;

function ruleResult(
  rule: MatchRule,
  score: number,
  matched: boolean,
  detail: string,
): MatchRuleResult {
  return { ruleId: rule.id, score: Math.max(0, Math.min(1, score)), matched, detail };
}

export const SKILLS_RULE: MatchRule = {
  id: "skills",
  label: "Compétences",
  weight: 3,
  applies: (criteria) => (criteria.requiredSkills?.length ?? 0) > 0,
  evaluate: (talent, criteria) => {
    const required = criteria.requiredSkills ?? [];
    const owned = new Set(talent.skills.map((skill) => normalize(skill.label)));
    const found = required.filter((skill) => owned.has(normalize(skill)));
    const score = found.length / required.length;
    return ruleResult(
      SKILLS_RULE,
      score,
      found.length === required.length,
      found.length === required.length
        ? `Toutes les compétences requises sont présentes (${found.length}/${required.length}).`
        : `${found.length}/${required.length} compétence(s) requise(s) trouvée(s).`,
    );
  },
};

export const CATEGORY_RULE: MatchRule = {
  id: "category",
  label: "Métier",
  weight: 3,
  applies: (criteria) => (criteria.categorySlugs?.length ?? 0) > 0,
  evaluate: (talent, criteria) => {
    const required = criteria.categorySlugs ?? [];
    const matched = required.includes(talent.categorySlug);
    return ruleResult(
      CATEGORY_RULE,
      matched ? 1 : 0,
      matched,
      matched
        ? `Métier conforme : ${talent.categoryLabel}.`
        : `Métier « ${talent.categoryLabel} » hors du périmètre demandé.`,
    );
  },
};

export const EXPERIENCE_RULE: MatchRule = {
  id: "experience",
  label: "Expérience",
  weight: 2,
  applies: (criteria) =>
    criteria.minExperienceYears !== undefined ||
    criteria.maxExperienceYears !== undefined,
  evaluate: (talent, criteria) => {
    const min = criteria.minExperienceYears ?? 0;
    const max = criteria.maxExperienceYears ?? Number.POSITIVE_INFINITY;
    const years = talent.yearsOfExperience;

    // Dans la fourchette = correspondance totale. Hors fourchette = proximité
    // dégressive, ce qui évite d'écarter quelqu'un d'un an du minimum.
    let score: number;
    if (years >= min && years <= max) {
      score = 1;
    } else if (years < min) {
      const gap = min - years;
      score = gap <= 1 ? 0.6 : gap <= 2 ? 0.35 : 0.15;
    } else {
      const gap = years - max;
      score = gap <= 1 ? 0.75 : gap <= 3 ? 0.5 : 0.25;
    }

    const matched = years >= min && years <= max;
    return ruleResult(
      EXPERIENCE_RULE,
      score,
      matched,
      `${years} an(s) d'expérience pour une fourchette de ${min} à ${Number.isFinite(max) ? max : "∞"}.`,
    );
  },
};

export const LANGUAGE_RULE: MatchRule = {
  id: "languages",
  label: "Langues",
  weight: 2,
  applies: (criteria) => (criteria.requiredLanguages?.length ?? 0) > 0,
  evaluate: (talent, criteria) => {
    const required = criteria.requiredLanguages ?? [];
    const owned = new Set<string>(talent.languages.map((language) => language.code));
    const found = required.filter((code) => owned.has(code));
    const score = found.length / required.length;
    return ruleResult(
      LANGUAGE_RULE,
      score,
      found.length === required.length,
      `${found.length}/${required.length} langue(s) requise(s) maîtrisée(s).`,
    );
  },
};

export const CONTRACT_RULE: MatchRule = {
  id: "contract",
  label: "Type de contrat",
  weight: 1.5,
  applies: (criteria) => (criteria.contractTypes?.length ?? 0) > 0,
  evaluate: (talent, criteria) => {
    const required = criteria.contractTypes ?? [];
    const matched = talent.desiredContractTypes.some((type) => required.includes(type));
    return ruleResult(
      CONTRACT_RULE,
      matched ? 1 : 0,
      matched,
      matched
        ? "Type de contrat recherché compatible."
        : "Type de contrat recherché non compatible.",
    );
  },
};

export const LOCATION_RULE: MatchRule = {
  id: "location",
  label: "Localisation",
  weight: 1,
  applies: (criteria) => (criteria.citySlugs?.length ?? 0) > 0,
  evaluate: (talent, criteria) => {
    const required = criteria.citySlugs ?? [];
    const matched = required.includes(talent.location.citySlug);
    return ruleResult(
      LOCATION_RULE,
      matched ? 1 : 0.5,
      matched,
      matched
        ? `Basé(e) à ${talent.location.city}.`
        : `Basé(e) à ${talent.location.city}, hors des localisations demandées.`,
    );
  },
};

export const REMOTE_RULE: MatchRule = {
  id: "remote",
  label: "Télétravail",
  weight: 1,
  applies: (criteria) => criteria.remoteOnly === true,
  evaluate: (talent) =>
    ruleResult(
      REMOTE_RULE,
      talent.location.isRemoteEligible ? 1 : 0,
      talent.location.isRemoteEligible,
      talent.location.isRemoteEligible
        ? "Ouvert au télétravail."
        : "Télétravail non déclaré.",
    ),
};

const KEYWORD_RULE: MatchRule = {
  id: "keywords",
  label: "Mots-clés",
  weight: 1,
  applies: (criteria) => (criteria.query?.trim().length ?? 0) >= 2,
  evaluate: (talent, criteria) => {
    const haystack = normalize(
      [
        talent.fullName,
        talent.headline,
        talent.summary,
        talent.categoryLabel,
        talent.skills.map((skill) => skill.label).join(" "),
      ].join(" "),
    );
    const terms = normalize(criteria.query ?? "")
      .split(/\s+/)
      .filter((term) => term.length >= 2);
    if (terms.length === 0) {
      return ruleResult(KEYWORD_RULE, 0, false, "Recherche vide.");
    }
    const found = terms.filter((term) => haystack.includes(term));
    return ruleResult(
      KEYWORD_RULE,
      found.length / terms.length,
      found.length === terms.length,
      `${found.length}/${terms.length} terme(s) retrouvé(s).`,
    );
  },
};

/** Registre de règles, par ordre de poids décroissant. */
export const MATCHING_RULES: readonly MatchRule[] = [
  SKILLS_RULE,
  CATEGORY_RULE,
  EXPERIENCE_RULE,
  LANGUAGE_RULE,
  CONTRACT_RULE,
  LOCATION_RULE,
  REMOTE_RULE,
  KEYWORD_RULE,
];

export type MatchScore = {
  readonly candidateId: string;
  /** 0–100. À afficher comme « correspondance avec les critères du poste ». */
  readonly score: number;
  /** Détail par règle, pour expliquer le score à un recruteur. */
  readonly breakdown: readonly MatchRuleResult[];
  /** `true` si toutes les règles applicables sont satisfaites. */
  readonly meetsAllCriteria: boolean;
};

export function scoreTalent(
  talent: PublicTalent,
  criteria: MatchCriteria,
  rules: readonly MatchRule[] = MATCHING_RULES,
): MatchScore {
  const applicable = rules.filter((rule) => rule.applies(criteria));

  if (applicable.length === 0) {
    return { candidateId: talent.candidateId, score: 0, breakdown: [], meetsAllCriteria: true };
  }

  const breakdown = applicable.map((rule) => rule.evaluate(talent, criteria));
  const totalWeight = applicable.reduce((sum, rule) => sum + rule.weight, 0);
  const weighted = breakdown.reduce(
    (sum, result, index) => sum + result.score * (applicable[index]?.weight ?? 0),
    0,
  );

  const score = totalWeight > 0 ? Math.round((weighted / totalWeight) * 100) : 0;

  return {
    candidateId: talent.candidateId,
    score,
    breakdown,
    meetsAllCriteria: breakdown.every((result) => result.matched),
  };
}

/** Classe les talents du plus au moins correspondant. */
export function rankTalents(
  talents: readonly PublicTalent[],
  criteria: MatchCriteria,
  rules: readonly MatchRule[] = MATCHING_RULES,
): readonly MatchScore[] {
  return talents
    .map((talent) => scoreTalent(talent, criteria, rules))
    .sort((a, b) => b.score - a.score);
}
