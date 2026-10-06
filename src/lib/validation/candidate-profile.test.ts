import { describe, expect, it } from "vitest";
import { experienceSchema } from "./candidate-profile";

describe("experienceSchema", () => {
  it("accepte les réalisations sous forme de tableau", () => {
    const result = experienceSchema.safeParse({
      title: "Ingénieur logiciel",
      organization: "Kaji",
      location: "Lubumbashi",
      startDate: "2024-01-01",
      isCurrent: false,
      endDate: "2025-12-31",
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
});
