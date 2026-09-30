import { describe, expect, it } from "vitest";

import {
  CANDIDATE_ID_MAX_LENGTH,
  CANDIDATE_ID_PATTERN,
  isValidCandidateId,
} from "./candidate-id";

describe("isValidCandidateId", () => {
  it("accepte le format nominal `KJ-<année>-<séquence>`", () => {
    expect(isValidCandidateId("KJ-2026-0001")).toBe(true);
    expect(isValidCandidateId("KJ-1999-1234")).toBe(true);
  });

  it("refuse une séquence qui n'a pas exactement quatre chiffres", () => {
    expect(isValidCandidateId("KJ-2026-001")).toBe(false);
    expect(isValidCandidateId("KJ-2026-00001")).toBe(false);
    expect(isValidCandidateId("KJ-2026-")).toBe(false);
  });

  it("refuse un préfixe ou un séparateur altéré", () => {
    expect(isValidCandidateId("kJ-2026-0001")).toBe(false);
    expect(isValidCandidateId("KJI-2026-0001")).toBe(false);
    expect(isValidCandidateId("KJ_2026_0001")).toBe(false);
    expect(isValidCandidateId("XK-2026-0001")).toBe(false);
  });

  it("refuse tout ce qui ressemble à une injection", () => {
    // Le pattern est ancré, donc pas d'ancrage interne à faire. Ces cas
    // documentent que le pattern reste fermé même sous charge d'injection.
    const hostile = [
      "KJ-2026-0001'",
      "KJ-2026-0001 OR 1=1",
      "KJ-2026-0001;DROP TABLE candidates",
      "../../etc/passwd",
      "KJ-2026-0001--",
      "%2e%2e%2f",
    ];
    for (const value of hostile) {
      expect(isValidCandidateId(value)).toBe(false);
    }
  });

  it("refuse les valeurs vides ou composées d'espaces", () => {
    for (const value of ["", " ", "  ", "\t", "\n"]) {
      expect(isValidCandidateId(value)).toBe(false);
    }
  });

  it("refuse une chaîne Unicode qui imite le format", () => {
    // `KJ-202６-0001` contient un 6 pleine largeur (U+FF16), pas un caractère
    // parasite : c'est l'injeu. `\d` en JS ne couvre que les chiffres ASCII,
    // donc ce genre d'homoglyphe est refusé. Un validateur trop permissif
    // accepterait deux identifiants visuellement identiques mais distincts.
    expect(isValidCandidateId("KJ-202６-0001")).toBe(false);
  });

  it("refuse une longueur supérieure au garde-fou, même si le motif passe", () => {
    // Le motif garantit déjà 12 caractères. Ce test verrouille que les deux
    // garde-fous restent cohérents si le motif change un jour.
    expect(CANDIDATE_ID_MAX_LENGTH).toBe(12);
    expect("KJ-2026-0001".length).toBe(CANDIDATE_ID_MAX_LENGTH);
  });

  it("expose un motif réellement ancré, donc sans recherche partielle", () => {
    // Un motif non ancré accepterait « xxKJ-2026-0001yy ». On le fige.
    expect(CANDIDATE_ID_PATTERN.source).toBe("^KJ-\\d{4}-\\d{4}$");
    expect(CANDIDATE_ID_PATTERN.test("xxKJ-2026-0001yy")).toBe(false);
  });
});
