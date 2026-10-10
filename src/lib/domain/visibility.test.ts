import { describe, expect, it } from "vitest";

import { PROFILE_VISIBILITY, ROLE, type Role } from "./enums";
import { canViewProfile, isPubliclyListable, type Viewer } from "./visibility";

const OWNER = "user_owner";
const STRANGER = "user_stranger";

const anonymous: Viewer = { role: null };
const owner: Viewer = { role: ROLE.CANDIDATE, userId: OWNER };
const otherCandidate: Viewer = { role: ROLE.CANDIDATE, userId: STRANGER };
const employer: Viewer = { role: ROLE.EMPLOYER, userId: STRANGER };
const rh: Viewer = { role: ROLE.RH, userId: STRANGER };
const admin: Viewer = { role: ROLE.ADMIN, userId: STRANGER };

describe("canViewProfile — décision par visibilité et par rôle", () => {
  it("rend une fiche PUBLIQUE visible à tout le monde, y compris anonyme", () => {
    for (const viewer of [anonymous, owner, otherCandidate, employer, rh, admin]) {
      expect(canViewProfile(viewer, { profileVisibility: PROFILE_VISIBILITY.PUBLIC, ownerUserId: OWNER })).toBe(true);
    }
  });

  it("cache une fiche PRIVÉE à tous sauf au propriétaire et à l'équipe Kaji", () => {
    const profile = { profileVisibility: PROFILE_VISIBILITY.PRIVATE, ownerUserId: OWNER };
    expect(canViewProfile(anonymous, profile)).toBe(false);
    expect(canViewProfile(otherCandidate, profile)).toBe(false);
    // Une entreprise, même authentifiée, n'est jamais « l'équipe Kaji » (§4.3).
    expect(canViewProfile(employer, profile)).toBe(false);
    expect(canViewProfile(owner, profile)).toBe(true);
    expect(canViewProfile(rh, profile)).toBe(true);
    expect(canViewProfile(admin, profile)).toBe(true);
  });

  it("traite ON_REQUEST comme non directement accessible (§9.3)", () => {
    const profile = { profileVisibility: PROFILE_VISIBILITY.ON_REQUEST, ownerUserId: OWNER };
    expect(canViewProfile(anonymous, profile)).toBe(false);
    expect(canViewProfile(employer, profile)).toBe(false);
    expect(canViewProfile(otherCandidate, profile)).toBe(false);
    expect(canViewProfile(owner, profile)).toBe(true);
    expect(canViewProfile(rh, profile)).toBe(true);
  });

  it("n'assimile jamais deux fiches sans propriétaire", () => {
    // `undefined === undefined` ne doit pas être lu comme « c'est la mienne ».
    const orphan = { profileVisibility: PROFILE_VISIBILITY.PRIVATE, ownerUserId: undefined };
    expect(canViewProfile({ role: ROLE.CANDIDATE }, orphan)).toBe(false);
    // Un visiteur anonyme n'appartient jamais à une fiche orpheline.
    expect(canViewProfile(anonymous, orphan)).toBe(false);
  });

  it("n'accorde rien à un visiteur sans rôle non plus qu'à un candidat tiers", () => {
    const profile = { profileVisibility: PROFILE_VISIBILITY.PRIVATE, ownerUserId: OWNER };
    for (const role of [ROLE.CANDIDATE, ROLE.PRESTATAIRE, ROLE.EMPLOYER] as const) {
      expect(canViewProfile({ role, userId: STRANGER }, profile)).toBe(false);
    }
  });

  it("accorde à tous les rôles de l'équipe Kaji la fiche privée d'autrui", () => {
    const profile = { profileVisibility: PROFILE_VISIBILITY.PRIVATE, ownerUserId: OWNER };
    for (const role of [ROLE.RH, ROLE.ADMIN, ROLE.SUPER_ADMIN] as Role[]) {
      expect(canViewProfile({ role }, profile)).toBe(true);
    }
  });
});

describe("isPubliclyListable", () => {
  it("n'accepte que PUBLIC", () => {
    expect(isPubliclyListable(PROFILE_VISIBILITY.PUBLIC)).toBe(true);
    expect(isPubliclyListable(PROFILE_VISIBILITY.ON_REQUEST)).toBe(false);
    expect(isPubliclyListable(PROFILE_VISIBILITY.PRIVATE)).toBe(false);
  });
});
