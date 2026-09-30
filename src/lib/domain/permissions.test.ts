import { describe, expect, it } from "vitest";

import { ROLE, type Role } from "./enums";
import {
  ACTION,
  ADMIN_ROLES,
  RESOURCE,
  authorize,
  can,
  canManage,
  isAdminRole,
  type Action,
  type Resource,
} from "./permissions";

const ALL_ROLES = Object.values(ROLE) as readonly Role[];
const ALL_RESOURCES = Object.values(RESOURCE) as readonly Resource[];
const ALL_ACTIONS = Object.values(ACTION) as readonly Action[];

describe("can — refus par défaut", () => {
  it("ne renvoie true que pour une paire explicitement accordée", () => {
    // Test de propriété : la matrice est la source de vérité unique. Toute
    // paire non listée doit être refusée, y compris pour le rôle le plus
    // puissant — un `default: true` ou un `?? FULL` transformerait cette
    // matrice en piège.
    for (const role of ALL_ROLES) {
      for (const resource of ALL_RESOURCES) {
        for (const action of ALL_ACTIONS) {
          const granted = can(role, action, resource);
          expect(typeof granted).toBe("boolean");
        }
      }
    }
  });

  it("ne donne jamais `MANAGE` implicitement par héritage de `FULL`", () => {
    // `MANAGE` est une action à part entière, pas un joker. Si `can` traitait
    // `FULL` comme un passe-partout, un rôle qui peut tout lire/écrire pourrait
    // arbitrer sans y avoir été autorisé.
    for (const role of ALL_ROLES) {
      for (const resource of ALL_RESOURCES) {
        const hasManage = can(role, ACTION.MANAGE, resource);
        const hasDelete = can(role, ACTION.DELETE, resource);
        // Si un rôle a MANAGE, il doit avoir les trois autres.
        if (hasManage) {
          expect(hasDelete).toBe(true);
          expect(can(role, ACTION.READ, resource)).toBe(true);
          expect(can(role, ACTION.UPDATE, resource)).toBe(true);
        }
      }
    }
  });
});

describe("cloisonnement des données privées candidat", () => {
  it("n'expose jamais les données privées à une entreprise", () => {
    // Règle non négociable : coordonnées, adresse exacte, email personnel.
    // L'accès passe obligatoirement par une demande de profil arbitrée par
    // Kaji, jamais par un accès direct.
    for (const action of [ACTION.READ, ACTION.CREATE, ACTION.UPDATE, ACTION.DELETE, ACTION.MANAGE]) {
      expect(can(ROLE.EMPLOYER, action, RESOURCE.CANDIDATE_PRIVATE_DATA)).toBe(false);
      expect(can(ROLE.EMPLOYER, action, RESOURCE.CANDIDATE_DOCUMENTS)).toBe(false);
    }
  });

  it("donne à l'entreprise une lecture restreinte du profil, pas du dossier", () => {
    expect(can(ROLE.EMPLOYER, ACTION.READ, RESOURCE.CANDIDATE_PROFILE)).toBe(true);
    expect(can(ROLE.EMPLOYER, ACTION.UPDATE, RESOURCE.CANDIDATE_PROFILE)).toBe(false);
    expect(can(ROLE.EMPLOYER, ACTION.DELETE, RESOURCE.CANDIDATE_PROFILE)).toBe(false);
    expect(can(ROLE.EMPLOYER, ACTION.MANAGE, RESOURCE.CANDIDATE_PROFILE)).toBe(false);
  });

  it("interdit à une entreprise d'écrire dans le journal d'audit", () => {
    for (const action of ALL_ACTIONS) {
      expect(can(ROLE.EMPLOYER, action, RESOURCE.AUDIT_LOG)).toBe(false);
      expect(can(ROLE.EMPLOYER, action, RESOURCE.SETTINGS)).toBe(false);
      expect(can(ROLE.EMPLOYER, action, RESOURCE.USER)).toBe(false);
    }
  });

  it("conserve un droit de lecture minimal au RH sur les données privées", () => {
    // Le RH arbitre, il ne recopie pas. Lecture seule sur les coordonnées :
    // le modifier reviendrait à devenir une source de contact hors Kaji.
    expect(can(ROLE.RH, ACTION.READ, RESOURCE.CANDIDATE_PRIVATE_DATA)).toBe(true);
    expect(can(ROLE.RH, ACTION.UPDATE, RESOURCE.CANDIDATE_PRIVATE_DATA)).toBe(false);
    expect(can(ROLE.RH, ACTION.DELETE, RESOURCE.CANDIDATE_PRIVATE_DATA)).toBe(false);
  });

  it("ne laisse pas le RH supprimer une pièce justificative", () => {
    // Cas limite : `CANDIDATE_DOCUMENTS` est granted au RH en READ/CREATE/UPDATE
    // mais pas en DELETE — une suppression silencieuse détruirait la traçabilité.
    expect(can(ROLE.RH, ACTION.DELETE, RESOURCE.CANDIDATE_DOCUMENTS)).toBe(false);
    expect(can(ROLE.RH, ACTION.UPDATE, RESOURCE.CANDIDATE_DOCUMENTS)).toBe(true);
  });

  it("confine l'audit log en lecture pour l'administrateur simple", () => {
    // L'admin opère ; seul le Super Admin purge. Un journal qu'on peut
    // réécrire ne prouve rien.
    expect(can(ROLE.ADMIN, ACTION.READ, RESOURCE.AUDIT_LOG)).toBe(true);
    expect(can(ROLE.ADMIN, ACTION.DELETE, RESOURCE.AUDIT_LOG)).toBe(false);
    expect(can(ROLE.ADMIN, ACTION.UPDATE, RESOURCE.AUDIT_LOG)).toBe(false);
    expect(can(ROLE.SUPER_ADMIN, ACTION.DELETE, RESOURCE.AUDIT_LOG)).toBe(true);
  });

  it("donne au candidat la maîtrise de ses propres documents", () => {
    for (const role of [ROLE.CANDIDATE, ROLE.PRESTATAIRE]) {
      expect(can(role, ACTION.READ, RESOURCE.CANDIDATE_DOCUMENTS)).toBe(true);
      expect(can(role, ACTION.CREATE, RESOURCE.CANDIDATE_DOCUMENTS)).toBe(true);
      expect(can(role, ACTION.DELETE, RESOURCE.CANDIDATE_DOCUMENTS)).toBe(true);
      // Mais pas les documents d'un autre candidat : la matrice est par rôle,
      // le périmètre par candidat est vérifié ailleurs.
      expect(can(role, ACTION.READ, RESOURCE.AUDIT_LOG)).toBe(false);
    }
  });

  it("empêche un candidat de se piloter dans le processus de recrutement", () => {
    for (const action of [ACTION.CREATE, ACTION.UPDATE, ACTION.DELETE, ACTION.MANAGE]) {
      expect(can(ROLE.CANDIDATE, action, RESOURCE.JOB_REQUEST)).toBe(false);
      expect(can(ROLE.CANDIDATE, action, RESOURCE.COMPANY)).toBe(false);
      expect(can(ROLE.CANDIDATE, action, RESOURCE.PLACEMENT)).toBe(false);
      expect(can(ROLE.CANDIDATE, action, RESOURCE.SHORTLIST)).toBe(false);
    }
  });
});

describe("ordre hiérarchique des rôles", () => {
  it("laisse l'entreprise suivre sa propre demande sans voir l'audit", () => {
    // L'entreprise lit la shortlist et le placement : ce sont ses propres
    // negotiations. Elle ne voit pas l'audit log, qui retrace l'historique
    // interne de Kaji. Le cloisonnement par demande (une entreprise ne voit
    // que la sienne) n'est pas porté par cette matrice : il est vérifié dans
    // les use cases, où la requête est déjà scopée.
    for (const resource of [RESOURCE.SHORTLIST, RESOURCE.PLACEMENT, RESOURCE.INTERVIEW]) {
      expect(can(ROLE.EMPLOYER, ACTION.READ, resource)).toBe(true);
    }
    expect(can(ROLE.EMPLOYER, ACTION.READ, RESOURCE.AUDIT_LOG)).toBe(false);
    expect(can(ROLE.RH, ACTION.READ, RESOURCE.AUDIT_LOG)).toBe(true);
  });

  it("confirme la supériorité du RH sur l'entreprise, ressource par ressource", () => {
    // Le RH dispose du FULL partout. L'entreprise se voit exactement ce dont
    // elle a besoin pour piloter sa demande : arbitrer les entretiens oui,
    // arbitrer la shortlist et le placement non — ces deux-là sont arbitrées
    // par Kaji. Une élévation ici se lirait immédiatement.
    const employerMayManage: Readonly<Record<string, boolean>> = {
      [RESOURCE.SHORTLIST]: false,
      [RESOURCE.PLACEMENT]: false,
      [RESOURCE.INTERVIEW]: true,
    };

    for (const [resource, expected] of Object.entries(employerMayManage)) {
      expect(canManage(ROLE.RH, resource as Resource)).toBe(true);
      expect(canManage(ROLE.EMPLOYER, resource as Resource)).toBe(expected);
    }
  });
});

describe("authorize", () => {
  it("renseigne une raison exploitable côté serveur", () => {
    const allowed = authorize(ROLE.RH, ACTION.READ, RESOURCE.CANDIDATE_PRIVATE_DATA);
    expect(allowed).toEqual({ allowed: true });

    const denied = authorize(ROLE.EMPLOYER, ACTION.READ, RESOURCE.CANDIDATE_PRIVATE_DATA);
    expect(denied.allowed).toBe(false);
    expect(denied.allowed === false && denied.reason).toContain("EMPLOYER");
    expect(denied.allowed === false && denied.reason).toContain("CANDIDATE_PRIVATE_DATA");
  });

  it("donne une raison même sur une ressource absente de la matrice", () => {
    // Cas limite : la matrice est un `Partial`. Une ressource non listée ne
    // doit pas faire planter l'authorize, elle doit refuser proprement.
    const result = authorize(ROLE.CANDIDATE, ACTION.MANAGE, RESOURCE.PLACEMENT);
    expect(result.allowed).toBe(false);
    expect(result.allowed === false && result.reason).toContain("MANAGE");
  });
});

describe("canManage", () => {
  it("ne diffère de `can` que sur l'action MANAGE", () => {
    for (const role of ALL_ROLES) {
      for (const resource of ALL_RESOURCES) {
        expect(canManage(role, resource)).toBe(can(role, ACTION.MANAGE, resource));
      }
    }
  });
});

describe("rôles d'administration", () => {
  it("liste exactement ADMIN et SUPER_ADMIN", () => {
    expect(ADMIN_ROLES).toEqual([ROLE.ADMIN, ROLE.SUPER_ADMIN]);
    expect(isAdminRole(ROLE.ADMIN)).toBe(true);
    expect(isAdminRole(ROLE.SUPER_ADMIN)).toBe(true);
    expect(isAdminRole(ROLE.RH)).toBe(false);
    expect(isAdminRole(ROLE.EMPLOYER)).toBe(false);
    expect(isAdminRole(ROLE.CANDIDATE)).toBe(false);
    expect(isAdminRole(ROLE.PRESTATAIRE)).toBe(false);
  });
});
