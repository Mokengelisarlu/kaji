import { describe, expect, it } from "vitest";

import {
  CONTRACT_TYPE,
  LANGUAGE_CODE,
  LANGUAGE_LEVEL,
  POOL_KIND,
  TALENT_SOURCE,
} from "./enums";
import type { Location, PublicTalent, Skill } from "./talent";
import {
  CATEGORY_RULE,
  CONTRACT_RULE,
  EXPERIENCE_RULE,
  LANGUAGE_RULE,
  LOCATION_RULE,
  MATCHING_RULES,
  REMOTE_RULE,
  SKILLS_RULE,
  normalizeLabel,
  rankTalents,
  scoreTalent,
  type MatchCriteria,
} from "./matching";

const PARIS: Location = {
  citySlug: "paris",
  city: "Paris",
  country: "France",
  isRemoteEligible: true,
};
const LYON: Location = {
  citySlug: "lyon",
  city: "Lyon",
  country: "France",
  isRemoteEligible: false,
};

function skill(label: string, level: Skill["level"] = 3): Skill {
  return { id: `s-${label}`, label, level };
}

function talent(overrides: Partial<PublicTalent> = {}): PublicTalent {
  return {
    candidateId: "KJ-2026-0001",
    fullName: "Awa Diallo",
    headline: "Ingénieure DevOps senior",
    categorySlug: "informatique",
    categoryLabel: "Informatique",
    domainSlugs: ["digital"],
    location: PARIS,
    yearsOfExperience: 6,
    skills: [skill("Docker"), skill("Kubernetes")],
    languages: [
      { code: LANGUAGE_CODE.FR, level: LANGUAGE_LEVEL.NATIVE },
      { code: LANGUAGE_CODE.EN, level: LANGUAGE_LEVEL.PROFESSIONAL },
    ],
    availability: "AVAILABLE",
    declaredAvailability: "IMMEDIATELY",
    desiredContractTypes: [CONTRACT_TYPE.CDI],
    summary: "Automatisation des déploiements.",
    poolKind: POOL_KIND.TALENT_POOL,
    isVerified: true,
    source: TALENT_SOURCE.WEBSITE,
    ...overrides,
  };
}

describe("normalizeLabel", () => {
  it("neutralise casse, accents et espaces latéraux", () => {
    expect(normalizeLabel("  Ingénierie Logicielle ")).toBe("ingenierie logicielle");
    expect(normalizeLabel("RÉACTJS")).toBe("reactjs");
    expect(normalizeLabel("Création")).toBe("creation");
  });
});

describe("poids déclarés", () => {
  it("conserve les poids comme un acte produit explicite", () => {
    // Les poids ne sont pas une implémentation : c'est la priorisation
    // commerciale de Kaji. Ce test les fige pour qu'un réagencement
    // accidentel ne passe pas inaperçu dans une revue de code.
    const weights = new Map(
      MATCHING_RULES.map((rule) => [rule.id, rule.weight] as const),
    );
    expect(Object.fromEntries(weights)).toEqual({
      skills: 3,
      category: 3,
      experience: 2,
      languages: 2,
      contract: 1.5,
      location: 1,
      remote: 1,
      keywords: 1,
    });
  });

  it("conserve des identifiants de règle uniques", () => {
    const ids = MATCHING_RULES.map((rule) => rule.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("règles non applicables", () => {
  it("n'évalue que les règles dont le poste énonce un critère", () => {
    // Une règle sans critère côté poste n'est pas « non satisfaite » : elle
    // n'a pas lieu d'être. Sans cela, un poste sans exigence de langue
    // serait pénalisé par une absence de langue.
    expect(SKILLS_RULE.applies({})).toBe(false);
    expect(CATEGORY_RULE.applies({})).toBe(false);
    expect(LANGUAGE_RULE.applies({})).toBe(false);
    expect(CONTRACT_RULE.applies({})).toBe(false);
    expect(LOCATION_RULE.applies({})).toBe(false);
    expect(REMOTE_RULE.applies({})).toBe(false);
    expect(EXPERIENCE_RULE.applies({})).toBe(false);

    expect(SKILLS_RULE.applies({ requiredSkills: ["Docker"] })).toBe(true);
    expect(REMOTE_RULE.applies({ remoteOnly: true })).toBe(true);
    expect(REMOTE_RULE.applies({ remoteOnly: false })).toBe(false);
  });

  it("retourne un score neutre quand rien ne s'applique", () => {
    const score = scoreTalent(talent(), {});
    expect(score.breakdown).toEqual([]);
    expect(score.score).toBe(0);
    // Sans critère, aucune exigence n'est violée : `meetsAllCriteria` vaut
    // vrai. Le contraire ferait rejeter tout candidat sur un poste vide.
    expect(score.meetsAllCriteria).toBe(true);
  });
});

describe("règle compétences", () => {
  const criteria: MatchCriteria = { requiredSkills: ["Docker", "Kubernetes", "Terraform"] };

  it("accorde une correspondance totale quand tout est présent", () => {
    const subject = talent({
      skills: [skill("Docker"), skill("Kubernetes"), skill("Terraform")],
    });
    const result = SKILLS_RULE.evaluate(subject, criteria);
    expect(result.score).toBe(1);
    expect(result.matched).toBe(true);
  });

  it("compte proportionnellement les compétences trouvées", () => {
    const result = SKILLS_RULE.evaluate(talent(), criteria);
    expect(result.score).toBeCloseTo(2 / 3, 5);
    expect(result.matched).toBe(false);
  });

  it("ignore casse et accents dans la comparaison", () => {
    // Un candidat saisit « KubeRNetes », un poste exige « kubernetes » : la
    // comparaison passe par `normalizeLabel`, sinon la correspondance dépend
    // de la frappe.
    const subject = talent({ skills: [skill("docker"), skill("KUBERNETES")] });
    const result = SKILLS_RULE.evaluate(subject, {
      requiredSkills: ["Docker", "Kubernetes"],
    });
    expect(result.score).toBe(1);
    expect(result.matched).toBe(true);

    // Un accent réellement présent doit aussi se neutraliser.
    const accented = talent({ skills: [skill("création web"), skill("Docker")] });
    expect(
      SKILLS_RULE.evaluate(accented, { requiredSkills: ["Creation Web"] }).matched,
    ).toBe(true);
  });
});

describe("règle expérience", () => {
  it("accorde 1 dans la fourchette, bornes incluses", () => {
    const criteria: MatchCriteria = { minExperienceYears: 3, maxExperienceYears: 8 };
    const result = EXPERIENCE_RULE.evaluate(talent({ yearsOfExperience: 3 }), criteria);
    expect(result.score).toBe(1);
    expect(result.matched).toBe(true);
  });

  it("décote moins un candidat un peu trop expérimenté que sous-qualifié", () => {
    // Choix produit assumé : on écarte moins volontiers un profil senior
    // qu'un profil junior. 10 ans pour un plafond à 8 vaut 0.75, là où 2 ans
    // pour un plancher à 5 ne vaut que 0.35. Ce test empêche l'inversion.
    const tooSenior = EXPERIENCE_RULE.evaluate(talent({ yearsOfExperience: 10 }), {
      minExperienceYears: 3,
      maxExperienceYears: 8,
    });
    const tooJunior = EXPERIENCE_RULE.evaluate(talent({ yearsOfExperience: 2 }), {
      minExperienceYears: 5,
      maxExperienceYears: 8,
    });
    expect(tooSenior.score).toBeGreaterThan(tooJunior.score);
    expect(tooSenior.matched).toBe(false);
    expect(tooJunior.matched).toBe(false);
  });

  it("traite un plafond absent comme un infini", () => {
    const result = EXPERIENCE_RULE.evaluate(talent({ yearsOfExperience: 30 }), {
      minExperienceYears: 5,
    });
    expect(result.score).toBe(1);
    expect(result.matched).toBe(true);
  });
});

describe("règle localisation", () => {
  it("accorde 0.5 à un profil hors périmètre plutôt que 0", () => {
    // Un profil elsewhere reste fréquentable : la géographie est un critère
    // de proximité, pas d'exclusion. 0 donnerait le même poids qu'une
    // absence totale de rapport.
    const result = LOCATION_RULE.evaluate(talent({ location: LYON }), {
      citySlugs: ["paris"],
    });
    expect(result.score).toBe(0.5);
    expect(result.matched).toBe(false);
  });

  it("accorde 1 à une localisation demandée", () => {
    const result = LOCATION_RULE.evaluate(talent(), { citySlugs: ["paris"] });
    expect(result.score).toBe(1);
    expect(result.matched).toBe(true);
  });
});

describe("règle télétravail", () => {
  it("est binaire : pas de mi-score pour un poste en télétravail strict", () => {
    expect(REMOTE_RULE.evaluate(talent({ location: PARIS }), {}).score).toBe(1);
    expect(REMOTE_RULE.evaluate(talent({ location: LYON }), {}).score).toBe(0);
  });
});

describe("scoreTalent", () => {
  it("agrège les poids et produit un score sur 100", () => {
    const criteria: MatchCriteria = {
      requiredSkills: ["Docker", "Kubernetes"],
      categorySlugs: ["informatique"],
    };
    const score = scoreTalent(talent(), criteria);
    // Skills (poids 3, score 1) et category (poids 3, score 1) : 100.
    expect(score.score).toBe(100);
    expect(score.meetsAllCriteria).toBe(true);
    expect(score.breakdown).toHaveLength(2);
  });

  it("penalise proportionnellement une règle non satisfaite", () => {
    // category score 0 sur un total de poids 6 : 50.
    const score = scoreTalent(talent({ categorySlug: "finance" }), {
      requiredSkills: ["Docker", "Kubernetes"],
      categorySlugs: ["informatique"],
    });
    expect(score.score).toBe(50);
    expect(score.meetsAllCriteria).toBe(false);
  });

  it("ignore les règles non applicables dans le dénominateur", () => {
    // Un poste ne demandisant qu'une compétence ne doit pas être noté sur
    // l'ensemble des huit règles : le score d'un candidat hors catégorie ne
    // doit pas être artificiellement gonflé par des règles sans objet.
    const score = scoreTalent(talent({ categorySlug: "finance" }), {
      requiredSkills: ["Docker"],
    });
    expect(score.score).toBe(100);
  });

  it("borne le score entre 0 et 100", () => {
    for (const criteria of [
      { requiredSkills: ["Docker", "Kubernetes"] },
      { requiredSkills: ["Rust", "Go"] },
      {},
      { remoteOnly: true, citySlugs: ["lyon"] },
    ] satisfies MatchCriteria[]) {
      const score = scoreTalent(talent(), criteria).score;
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });
});

describe("rankTalents", () => {
  it("classe du plus au moins correspondant", () => {
    const criteria: MatchCriteria = {
      requiredSkills: ["Docker", "Kubernetes"],
      categorySlugs: ["informatique"],
    };
    const ranked = rankTalents(
      [
        talent({ candidateId: "KJ-2026-0002", skills: [skill("Excel")] }),
        talent({ candidateId: "KJ-2026-0003" }),
      ],
      criteria,
    );
    expect(ranked.map((entry) => entry.candidateId)).toEqual([
      "KJ-2026-0003",
      "KJ-2026-0002",
    ]);
    expect(ranked[0]?.score).toBeGreaterThan(ranked[1]?.score ?? 0);
  });

  it("reste stable à score égal", () => {
    // Deux profils identiques doivent conserver l'ordre d'entrée : un tri
    // instable ferait osciller l'annuaire entre deux rendus.
    const criteria: MatchCriteria = { requiredSkills: ["Docker"] };
    const ranked = rankTalents(
      [
        talent({ candidateId: "KJ-2026-0004" }),
        talent({ candidateId: "KJ-2026-0005" }),
      ],
      criteria,
    );
    expect(ranked.map((entry) => entry.candidateId)).toEqual([
      "KJ-2026-0004",
      "KJ-2026-0005",
    ]);
  });
});
