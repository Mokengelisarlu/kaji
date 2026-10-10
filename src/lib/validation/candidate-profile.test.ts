import { describe, expect, it } from "vitest";
import { certificationSchema, educationSchema, experienceSchema } from "./candidate-profile";

describe("experienceSchema", () => {
  it("accepte les réalisations sous forme de tableau", () => {
    const result = experienceSchema.safeParse({
      title: "Ingénieur logiciel",
      organization: "Kaji",
      location: "Lubumbashi",
      startDate: "2024-01",
      isCurrent: false,
      endDate: "2025-12",
      summary: "Développement de services.",
      achievements: ["Créé une API", "Amélioré la performance"],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.achievements).toEqual([
        "Créé une API",
        "Amélioré la performance",
      ]);
    }
  });

  it("accepte une période au niveau de l'année seule (données historiques)", () => {
    const result = experienceSchema.safeParse({
      title: "Ingénieur",
      organization: "Kaji",
      startDate: "2019",
      isCurrent: true,
    });

    expect(result.success).toBe(true);
  });

  it("refuse un format de date au jour près", () => {
    const result = experienceSchema.safeParse({
      title: "Ingénieur",
      organization: "Kaji",
      startDate: "2024-01-01",
      isCurrent: true,
    });

    expect(result.success).toBe(false);
  });

  it("refuse une fin antérieure au début", () => {
    const result = experienceSchema.safeParse({
      title: "Ingénieur",
      organization: "Kaji",
      startDate: "2024-06",
      isCurrent: false,
      endDate: "2023-01",
    });

    expect(result.success).toBe(false);
  });

  it("ignore la fin incohérente lorsqu'un poste est en cours", () => {
    const result = experienceSchema.safeParse({
      title: "Ingénieur",
      organization: "Kaji",
      startDate: "2024-06",
      isCurrent: true,
      endDate: "2023-01",
    });

    expect(result.success).toBe(true);
  });
});

describe("educationSchema", () => {
  it("accepte un mois et une année facultatifs", () => {
    const result = educationSchema.safeParse({
      diploma: "Licence",
      school: "UNILU",
      startDate: "2015-09",
      endDate: "2019-06",
    });

    expect(result.success).toBe(true);
  });

  it("transforme une période vide en absence de valeur", () => {
    const result = educationSchema.safeParse({
      diploma: "Licence",
      school: "UNILU",
      startDate: "",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.startDate).toBeUndefined();
    }
  });

  it("refuse une fin antérieure au début", () => {
    const result = educationSchema.safeParse({
      diploma: "Licence",
      school: "UNILU",
      startDate: "2019-09",
      endDate: "2015-06",
    });

    expect(result.success).toBe(false);
  });
});

describe("certificationSchema", () => {
  it("accepte une date d'obtention au mois et une expiration", () => {
    const result = certificationSchema.safeParse({
      name: "AWS",
      issuer: "Amazon",
      issuedAt: "2021-03",
      expiresAt: "2026-03",
    });

    expect(result.success).toBe(true);
  });

  it("refuse une date au jour près", () => {
    const result = certificationSchema.safeParse({
      name: "AWS",
      issuer: "Amazon",
      issuedAt: "2021-03-01",
    });

    expect(result.success).toBe(false);
  });
});
