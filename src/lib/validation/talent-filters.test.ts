import { describe, expect, it } from "vitest";

import {
  CONTRACT_TYPE,
  EFFECTIVE_AVAILABILITY,
  LANGUAGE_CODE,
  POOL_KIND,
} from "@/lib/domain/enums";
import { parseTalentSearchParams } from "./talent-filters";

describe("parseTalentSearchParams — valeurs par défaut", () => {
  it("renvoie des filtres neutres sur une URL vide", () => {
    const { filters, issues } = parseTalentSearchParams({});
    expect(issues).toEqual([]);
    expect(filters.query).toBe("");
    expect(filters.categorySlugs).toEqual([]);
    expect(filters.experience).toEqual([0, 50]);
    expect(filters.verifiedOnly).toBe(false);
    expect(filters.sort).toBe("relevance");
    expect(filters.page).toBe(1);
    expect(filters.pageSize).toBe(12);
  });
});

describe("parseTalentSearchParams — longueur des listes", () => {
  it("découpe une liste séparée par des virgules et écarte les vides", () => {
    const { filters } = parseTalentSearchParams({
      category: "informatique,finance, ,reseau",
    });
    expect(filters.categorySlugs).toEqual(["informatique", "finance", "reseau"]);
  });

  it("retient la première valeur d'un paramètre répété et le signale", () => {
    // Cas limite : `?category=a&category=b` est un comportement de crawler.
    // Prendre la première valeur est déterministe ; l'ignorer en silence
    // produirait deux rendus différents de la même URL.
    const { filters, issues } = parseTalentSearchParams({
      category: ["informatique", "finance"],
    });
    expect(filters.categorySlugs).toEqual(["informatique"]);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toContain("category");
  });
});

describe("parseTalentSearchParams — listes blanches", () => {
  it("conserve une valeur d'énumération valide", () => {
    const { filters } = parseTalentSearchParams({
      language: LANGUAGE_CODE.FR,
      availability: EFFECTIVE_AVAILABILITY.AVAILABLE,
      contract: CONTRACT_TYPE.CDI,
      pool: POOL_KIND.TALENT_POOL,
    });
    expect(filters.languageCodes).toEqual([LANGUAGE_CODE.FR]);
    expect(filters.availabilities).toEqual([EFFECTIVE_AVAILABILITY.AVAILABLE]);
    expect(filters.contractTypes).toEqual([CONTRACT_TYPE.CDI]);
    expect(filters.poolKinds).toEqual([POOL_KIND.TALENT_POOL]);
  });

  it("écarte silencieusement une valeur hors énumération", () => {
    // Choix assumé : un lien forgé ne doit pas casser l'annuaire. La valeur
    // inconnue disparaît, les autres de la liste sont conservées.
    const { filters } = parseTalentSearchParams({
      contract: "CDI,CONTRAT_QUE_N_EXISTE_PAS,CDD",
    });
    expect(filters.contractTypes).toEqual([CONTRACT_TYPE.CDI, CONTRACT_TYPE.CDD]);
  });

  it("ne confond pas les énumérations entre elles", () => {
    // `freelance` est valide côté contrat, invalide côté langue. Une
    // validation croisée par erreur laisserait passer une langue inexistante.
    const { filters } = parseTalentSearchParams({
      language: "freelance",
      contract: "fr",
    });
    expect(filters.languageCodes).toEqual([]);
    expect(filters.contractTypes).toEqual([]);
  });

  it("ne fait pas passer une valeur d'énumération dans une liste libre", () => {
    // Les catégories ne sont pas un enum fermé : `informatique` doit
    // survivre, `CONTRAT_CDI` non plus n'est pas une catégorie valide mais
    // la liste est ouverte par conception.
    const { filters } = parseTalentSearchParams({ category: "informatique" });
    expect(filters.categorySlugs).toEqual(["informatique"]);
  });
});

describe("parseTalentSearchParams — plages numériques", () => {
  it("inverse les bornes quand le minimum dépasse le maximum", () => {
    // Un lien peut contenir `experienceMin=10&experienceMax=3`. Rejeter
    // l'URL ferait perdre le résultat ; réordonner donne la plage voulue.
    const { filters } = parseTalentSearchParams({
      experienceMin: "10",
      experienceMax: "3",
    });
    expect(filters.experience).toEqual([3, 10]);
  });

  it("borne les valeurs hors échelle et signale le dépassement", () => {
    // `page=0` et `pageSize=9999` ne doivent pas produire une page vide ni
    // une requête de 9999 lignes.
    const { filters, issues } = parseTalentSearchParams({ page: "0", pageSize: "9999" });
    expect(filters.page).toBe(1);
    expect(filters.pageSize).toBe(12);
    expect(issues.length).toBeGreaterThan(0);
  });

  it("refuse une expérience négative ou non entière", () => {
    const { issues } = parseTalentSearchParams({ experienceMin: "-3" });
    expect(issues.length).toBeGreaterThan(0);
  });
});

describe("parseTalentSearchParams — drapeaux booléens", () => {
  it("accepte les quatre écritures de vrai", () => {
    // `z.coerce.boolean()` est un piège : `Boolean("false") === true`. Ce test
    // existe pour interdire qu'on remette un coerce un jour.
    for (const value of ["1", "true", "oui", "on", "TRUE", "On"]) {
      expect(parseTalentSearchParams({ verified: value }).filters.verifiedOnly).toBe(true);
    }
  });

  it("traite toute autre écriture comme faux, sans erreur", () => {
    for (const value of ["0", "false", "non", "off", "", "peut-être"]) {
      const { filters, issues } = parseTalentSearchParams({ verified: value });
      expect(filters.verifiedOnly).toBe(false);
      // Un drapeau mal écrit n'est pas une URL invalide : l'annuaire doit
      // rester consultable.
      expect(issues).toEqual([]);
    }
  });
});

describe("parseTalentSearchParams — robustesse", () => {
  it("retombe sur des filtres neutres plutôt que de lever", () => {
    // Un lien mal formé ne doit pas casser l'annuaire : c'est la règle
    // énoncée dans le module. On vérifie qu'aucune entrée ne fait échouer
    // la fonction.
    const hostile: Array<Record<string, string | string[] | undefined>> = [
      { sort: "tri:inventé" },
      { page: "beaucoup" },
      { q: "x".repeat(500) },
      { category: "a".repeat(500) },
      { pageSize: "-1" },
      { unknownParam: "peut importe" },
      { experienceMin: "beaucoup" },
    ];
    for (const input of hostile) {
      const result = parseTalentSearchParams(input);
      expect(result.filters.page).toBeGreaterThanOrEqual(1);
      expect(result.filters.pageSize).toBeGreaterThanOrEqual(6);
      expect(result.filters.experience[0]).toBeLessThanOrEqual(result.filters.experience[1]);
    }
  });

  it("signale chaque paramètre fautif dans `issues`", () => {
    // `issues` sert à afficher un avertissement non bloquant. Un paramètre
    // fautif qui ne serait pas signalé resterait invisible.
    const { issues } = parseTalentSearchParams({ sort: "tri:inventé" });
    expect(issues).toHaveLength(1);
    expect(issues[0]).toContain("sort");
  });

  it("remet tous les filtres à neutre dès qu'un seul paramètre est invalide", () => {
    // Comportement documenté du module : « on retombe sur des filtres neutres
    // plutôt que de renvoyer une erreur ». La validation de `searchParams`
    // étant globale et non par champ, un seul paramètre fautif vide l'ensemble
    // — y compris la catégorie, qui était parfaitement valide.
    //
    // Ce n'est pas évidemment un défaut : c'est le choix fait pour qu'un lien
    // forgé n'ouvre jamais un annuaire dans un état inattendu. Mais l'effet de
    // bord est qu'un `?sort=inconnu&category=informatique` perd le filtre
    // métier sans le dire à l'utilisateur. `issues` remonte bien le sort
    // fautif, ce qui permet à l'interface de l'afficher. Voir l'écart
    // ouvert dans `06-progress-tracker.md`.
    const { filters, issues } = parseTalentSearchParams({
      sort: "tri:inventé",
      category: "informatique",
    });
    expect(filters.sort).toBe("relevance");
    expect(filters.categorySlugs).toEqual([]);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toContain("sort");
  });

  it("ignore un paramètre non reconnu sans le signaler", () => {
    // Zod est strict sur les clés inconnues en entrée ? Non : le schéma
    // n'est pas `.strict()`, donc une clé inconnue est simplement absente
    // du résultat. Ce test fige ce comportement.
    const { filters, issues } = parseTalentSearchParams({ utm_source: "newsletter" });
    expect(issues).toEqual([]);
    expect(JSON.stringify(filters)).not.toContain("utm_source");
  });

  it("tolère une recherche vide ou composée d'espaces", () => {
    expect(parseTalentSearchParams({ q: "   " }).filters.query).toBe("");
  });
});
