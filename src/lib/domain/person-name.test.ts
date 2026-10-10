import { describe, expect, it } from "vitest";
import {
  composeFullName,
  hasPostName,
  hasStructuredName,
  normalizeNamePart,
  resolveDisplayName,
} from "./person-name";

describe("normalizeNamePart", () => {
  it("retire les espaces superflus sans toucher au contenu", () => {
    expect(normalizeNamePart("  Mwela  ")).toBe("Mwela");
    expect(normalizeNamePart("Jean   Pierre")).toBe("Jean Pierre");
  });

  it("préserve accents, apostrophes, traits d'union et casse", () => {
    expect(normalizeNamePart("N'Goma")).toBe("N'Goma");
    expect(normalizeNamePart("Mbuyi-Kabongo")).toBe("Mbuyi-Kabongo");
    expect(normalizeNamePart("Nadège")).toBe("Nadège");
    expect(normalizeNamePart("d'Allaire")).toBe("d'Allaire");
  });

  it("renvoie une chaîne vide pour une valeur absente", () => {
    expect(normalizeNamePart(null)).toBe("");
    expect(normalizeNamePart(undefined)).toBe("");
  });
});

describe("composeFullName", () => {
  it("assemble dans l'ordre Nom Postnom Prénom", () => {
    expect(composeFullName({ lastName: "Muela", postName: "Kabongo", firstName: "Anaclet" })).toBe(
      "Muela Kabongo Anaclet",
    );
  });

  it("omet le postnom lorsqu'il est absent (jamais de double espace)", () => {
    expect(composeFullName({ lastName: "Muela", postName: "", firstName: "Anaclet" })).toBe("Muela Anaclet");
    expect(composeFullName({ lastName: "Muela", postName: null, firstName: "Anaclet" })).toBe("Muela Anaclet");
    expect(composeFullName({ lastName: "Muela", firstName: "Anaclet" })).toBe("Muela Anaclet");
  });
});

describe("hasPostName", () => {
  it("distingue un postnom réellement renseigné d'un champ vide", () => {
    expect(hasPostName({ postName: "Kabongo" })).toBe(true);
    expect(hasPostName({ postName: "  " })).toBe(false);
    expect(hasPostName({ postName: null })).toBe(false);
  });
});

describe("hasStructuredName / resolveDisplayName", () => {
  it("exploite les parties explicites lorsqu'elles sont complètes", () => {
    const profile = { fullName: "ancien nom", lastName: "Muela", postName: "Kabongo", firstName: "Anaclet" };
    expect(hasStructuredName(profile)).toBe(true);
    expect(resolveDisplayName(profile)).toBe("Muela Kabongo Anaclet");
  });

  it("retombe sur fullName quand les parties sont absentes (profil migré)", () => {
    const profile = { fullName: "Nadège Kabongo", lastName: null, firstName: null };
    expect(hasStructuredName(profile)).toBe(false);
    expect(resolveDisplayName(profile)).toBe("Nadège Kabongo");
  });

  it("retombe sur fullName si une seule partie est présente", () => {
    const profile = { fullName: "Kabongo Muela", lastName: "Muela", firstName: "" };
    expect(hasStructuredName(profile)).toBe(false);
    expect(resolveDisplayName(profile)).toBe("Kabongo Muela");
  });
});
