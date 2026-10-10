import { describe, expect, it } from "vitest";
import {
  comparePeriods,
  currentPeriodKey,
  formatPeriodFr,
  isYearMonth,
  isYearMonthOrYear,
  parsePeriod,
  totalMonthsCovered,
  totalYearsCovered,
} from "./period";

describe("parsePeriod", () => {
  it("analyse un mois et une année", () => {
    expect(parsePeriod("2023-01")).toEqual({ year: 2023, month: 1 });
    expect(parsePeriod("2023-12")).toEqual({ year: 2023, month: 12 });
  });

  it("analyse une année seule sans inventer de mois", () => {
    expect(parsePeriod("2016")).toEqual({ year: 2016, month: null });
  });

  it("refuse un jour, un mois invalide ou une chaîne vide", () => {
    expect(parsePeriod("2023-01-15")).toBeNull();
    expect(parsePeriod("2023-13")).toBeNull();
    expect(parsePeriod("2023-00")).toBeNull();
    expect(parsePeriod("")).toBeNull();
    expect(parsePeriod(null)).toBeNull();
  });
});

describe("isYearMonth / isYearMonthOrYear", () => {
  it("distingue mois-année et année seule", () => {
    expect(isYearMonth("2023-05")).toBe(true);
    expect(isYearMonth("2016")).toBe(false);
    expect(isYearMonthOrYear("2016")).toBe(true);
    expect(isYearMonthOrYear("2023-05")).toBe(true);
    expect(isYearMonthOrYear("2023-13")).toBe(false);
  });
});

describe("formatPeriodFr", () => {
  it("affiche le mois en toutes lettres", () => {
    expect(formatPeriodFr("2023-01")).toBe("Janvier 2023");
    expect(formatPeriodFr("2024-09")).toBe("Septembre 2024");
  });

  it("affiche uniquement l'année lorsqu'elle seule est connue", () => {
    expect(formatPeriodFr("2016")).toBe("2016");
  });

  it("renvoie une chaîne vide pour une valeur invalide", () => {
    expect(formatPeriodFr("")).toBe("");
    expect(formatPeriodFr("2023-13")).toBe("");
  });
});

describe("comparePeriods", () => {
  it("ordonne chronologiquement", () => {
    expect(comparePeriods("2020-01", "2021-01")).toBeLessThan(0);
    expect(comparePeriods("2021-06", "2021-01")).toBeGreaterThan(0);
    expect(comparePeriods("2021-01", "2021-01")).toBe(0);
  });

  it("place les valeurs inconnues à la fin", () => {
    expect(comparePeriods(null, "2021-01")).toBeGreaterThan(0);
    expect(comparePeriods("2021-01", null)).toBeLessThan(0);
  });
});

describe("totalMonthsCovered", () => {
  it("additionne des périodes disjointes", () => {
    const months = totalMonthsCovered([
      { start: "2020-01", end: "2020-12" },
      { start: "2022-01", end: "2022-06" },
    ]);
    expect(months).toBe(12 + 6);
  });

  it("ne compte pas deux fois les mois qui se chevauchent", () => {
    const months = totalMonthsCovered([
      { start: "2020-01", end: "2020-06" },
      { start: "2020-04", end: "2020-12" },
    ]);
    expect(months).toBe(12);
  });

  it("fusionne des périodes contiguës", () => {
    const months = totalMonthsCovered([
      { start: "2020-01", end: "2020-06" },
      { start: "2020-07", end: "2020-09" },
    ]);
    expect(months).toBe(9);
  });

  it("gère une période en cours jusqu'au mois courant", () => {
    const now = currentPeriodKey(new Date(Date.UTC(2026, 9, 10))); // Octobre 2026
    const months = totalMonthsCovered([{ start: "2026-01", end: null, isCurrent: true }], now);
    expect(months).toBe(10); // janvier..octobre inclus
  });

  it("ignore un segment sans début connu", () => {
    const months = totalMonthsCovered([{ start: null, end: "2020-12" }]);
    expect(months).toBe(0);
  });
});

describe("totalYearsCovered", () => {
  it("convertit les mois en années arrondies", () => {
    const months = totalMonthsCovered([
      { start: "2020-01", end: "2023-12" },
    ]);
    expect(months).toBe(48);
    expect(totalYearsCovered([{ start: "2020-01", end: "2023-12" }])).toBe(4);
  });
});
