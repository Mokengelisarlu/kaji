import { describe, expect, it } from "vitest";

import { ROLE } from "@/lib/domain/enums";
import { parseRoleClaim, resolveRole } from "./role";

describe("parseRoleClaim — liste blanche du claim de session", () => {
  it("lit un rôle valide exposé sous `metadata.role`", () => {
    expect(parseRoleClaim({ metadata: { role: "RH" } })).toBe(ROLE.RH);
    expect(parseRoleClaim({ metadata: { role: "EMPLOYER" } })).toBe(ROLE.EMPLOYER);
    expect(parseRoleClaim({ metadata: { role: "SUPER_ADMIN" } })).toBe(ROLE.SUPER_ADMIN);
  });

  it("refuse tout rôle hors de l'ensemble fermé `ROLE`", () => {
    // Une valeur inventée ne doit jamais ouvrir un privilège.
    expect(parseRoleClaim({ metadata: { role: "ROOT" } })).toBeNull();
    expect(parseRoleClaim({ metadata: { role: "admin" } })).toBeNull();
    expect(parseRoleClaim({ metadata: { role: 42 } })).toBeNull();
    expect(parseRoleClaim({ metadata: { role: null } })).toBeNull();
  });

  it("refuse un claim absent ou de forme inattendue", () => {
    expect(parseRoleClaim(null)).toBeNull();
    expect(parseRoleClaim(undefined)).toBeNull();
    expect(parseRoleClaim("RH")).toBeNull();
    expect(parseRoleClaim({})).toBeNull();
    expect(parseRoleClaim({ metadata: null })).toBeNull();
    expect(parseRoleClaim({ metadata: "RH" })).toBeNull();
    // Un `role` à la racine (hors de `metadata`) n'est pas le claim attendu.
    expect(parseRoleClaim({ role: "RH" })).toBeNull();
  });
});

describe("resolveRole — repli sûr", () => {
  it("donne CANDIDATE à un utilisateur authentifié sans rôle déclaré", () => {
    expect(resolveRole({})).toBe(ROLE.CANDIDATE);
    expect(resolveRole({ metadata: {} })).toBe(ROLE.CANDIDATE);
    expect(resolveRole(null)).toBe(ROLE.CANDIDATE);
  });

  it("ne retombe jamais sur un rôle privilégié", () => {
    // Le repli le moins privilégié est la seule option acceptable.
    expect(resolveRole({ metadata: { role: "inconnu" } })).toBe(ROLE.CANDIDATE);
  });

  it("respecte un rôle valide", () => {
    expect(resolveRole({ metadata: { role: "ADMIN" } })).toBe(ROLE.ADMIN);
  });
});
