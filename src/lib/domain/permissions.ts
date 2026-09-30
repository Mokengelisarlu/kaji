import { ROLE, type Role } from "./enums";

/**
 * Matrice d'autorisation RBAC (§20).
 *
 * Cette matrice est la **source de vérité unique**. Elle est consommée par
 * les guards serveur. Un rôle déclaré par le client (`metadata`, header, body)
 * n'est jamais lu : le rôle provient exclusivement de la session serveur.
 *
 * Convention de lecture :
 * - `MANAGE` inclut lecture, création, modification et suppression ;
 * - `NONE` est l'absence d'entrée, refusée par défaut.
 */

export const RESOURCE = {
  PUBLIC_TALENT: "PUBLIC_TALENT",
  CANDIDATE_PROFILE: "CANDIDATE_PROFILE",
  CANDIDATE_PRIVATE_DATA: "CANDIDATE_PRIVATE_DATA",
  CANDIDATE_DOCUMENTS: "CANDIDATE_DOCUMENTS",
  COMPANY: "COMPANY",
  JOB_REQUEST: "JOB_REQUEST",
  APPLICATION: "APPLICATION",
  SHORTLIST: "SHORTLIST",
  INTERVIEW: "INTERVIEW",
  PLACEMENT: "PLACEMENT",
  NOTIFICATION: "NOTIFICATION",
  AUDIT_LOG: "AUDIT_LOG",
  SETTINGS: "SETTINGS",
  USER: "USER",
} as const;

export type Resource = (typeof RESOURCE)[keyof typeof RESOURCE];

export const ACTION = {
  READ: "READ",
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  MANAGE: "MANAGE",
} as const;

export type Action = (typeof ACTION)[keyof typeof ACTION];

const READ: readonly Action[] = [ACTION.READ];
const FULL: readonly Action[] = [
  ACTION.READ,
  ACTION.CREATE,
  ACTION.UPDATE,
  ACTION.DELETE,
  ACTION.MANAGE,
];

/**
 * Les données privées d'un candidat (coordonnées, adresse exacte, email
 * personnel) ne sont jamais accessibles à une entreprise, même vérifiée.
 * L'accès passe obligatoirement par une demande de profil arbitrée par Kaji.
 */
const EMPLOYER_PROFILE_ACCESS: readonly Action[] = [ACTION.READ];

const PERMISSIONS: {
  readonly [R in Role]: Readonly<Partial<Record<Resource, readonly Action[]>>>;
} = {
  CANDIDATE: {
    [RESOURCE.PUBLIC_TALENT]: READ,
    [RESOURCE.CANDIDATE_PROFILE]: [ACTION.READ, ACTION.UPDATE],
    [RESOURCE.CANDIDATE_PRIVATE_DATA]: [ACTION.READ, ACTION.UPDATE],
    [RESOURCE.CANDIDATE_DOCUMENTS]: FULL,
    [RESOURCE.COMPANY]: READ,
    [RESOURCE.JOB_REQUEST]: READ,
    [RESOURCE.APPLICATION]: READ,
    [RESOURCE.INTERVIEW]: READ,
    [RESOURCE.NOTIFICATION]: READ,
  },
  PRESTATAIRE: {
    [RESOURCE.PUBLIC_TALENT]: READ,
    [RESOURCE.CANDIDATE_PROFILE]: [ACTION.READ, ACTION.UPDATE],
    [RESOURCE.CANDIDATE_PRIVATE_DATA]: [ACTION.READ, ACTION.UPDATE],
    [RESOURCE.CANDIDATE_DOCUMENTS]: FULL,
    [RESOURCE.COMPANY]: READ,
    [RESOURCE.JOB_REQUEST]: READ,
    [RESOURCE.APPLICATION]: READ,
    [RESOURCE.INTERVIEW]: READ,
    [RESOURCE.NOTIFICATION]: READ,
  },
  EMPLOYER: {
    [RESOURCE.PUBLIC_TALENT]: READ,
    [RESOURCE.COMPANY]: [ACTION.READ, ACTION.UPDATE],
    [RESOURCE.JOB_REQUEST]: FULL,
    [RESOURCE.APPLICATION]: FULL,
    [RESOURCE.SHORTLIST]: READ,
    [RESOURCE.INTERVIEW]: FULL,
    [RESOURCE.PLACEMENT]: READ,
    [RESOURCE.NOTIFICATION]: READ,
    // Lecture limitée de l'affichage public du candidat, jamais du dossier.
    [RESOURCE.CANDIDATE_PROFILE]: EMPLOYER_PROFILE_ACCESS,
    [RESOURCE.CANDIDATE_PRIVATE_DATA]: [],
    [RESOURCE.CANDIDATE_DOCUMENTS]: [],
    [RESOURCE.AUDIT_LOG]: [],
    [RESOURCE.SETTINGS]: [],
    [RESOURCE.USER]: [],
  },
  RH: {
    [RESOURCE.PUBLIC_TALENT]: READ,
    [RESOURCE.CANDIDATE_PROFILE]: FULL,
    [RESOURCE.CANDIDATE_PRIVATE_DATA]: [ACTION.READ],
    [RESOURCE.CANDIDATE_DOCUMENTS]: [ACTION.READ, ACTION.CREATE, ACTION.UPDATE],
    [RESOURCE.COMPANY]: READ,
    [RESOURCE.JOB_REQUEST]: FULL,
    [RESOURCE.APPLICATION]: FULL,
    [RESOURCE.SHORTLIST]: FULL,
    [RESOURCE.INTERVIEW]: FULL,
    [RESOURCE.PLACEMENT]: FULL,
    [RESOURCE.NOTIFICATION]: READ,
    [RESOURCE.AUDIT_LOG]: READ,
  },
  ADMIN: {
    [RESOURCE.PUBLIC_TALENT]: FULL,
    [RESOURCE.CANDIDATE_PROFILE]: FULL,
    [RESOURCE.CANDIDATE_PRIVATE_DATA]: FULL,
    [RESOURCE.CANDIDATE_DOCUMENTS]: FULL,
    [RESOURCE.COMPANY]: FULL,
    [RESOURCE.JOB_REQUEST]: FULL,
    [RESOURCE.APPLICATION]: FULL,
    [RESOURCE.SHORTLIST]: FULL,
    [RESOURCE.INTERVIEW]: FULL,
    [RESOURCE.PLACEMENT]: FULL,
    [RESOURCE.NOTIFICATION]: FULL,
    [RESOURCE.AUDIT_LOG]: READ,
    [RESOURCE.USER]: FULL,
    [RESOURCE.SETTINGS]: READ,
  },
  SUPER_ADMIN: {
    [RESOURCE.PUBLIC_TALENT]: FULL,
    [RESOURCE.CANDIDATE_PROFILE]: FULL,
    [RESOURCE.CANDIDATE_PRIVATE_DATA]: FULL,
    [RESOURCE.CANDIDATE_DOCUMENTS]: FULL,
    [RESOURCE.COMPANY]: FULL,
    [RESOURCE.JOB_REQUEST]: FULL,
    [RESOURCE.APPLICATION]: FULL,
    [RESOURCE.SHORTLIST]: FULL,
    [RESOURCE.INTERVIEW]: FULL,
    [RESOURCE.PLACEMENT]: FULL,
    [RESOURCE.NOTIFICATION]: FULL,
    [RESOURCE.AUDIT_LOG]: FULL,
    [RESOURCE.USER]: FULL,
    [RESOURCE.SETTINGS]: FULL,
  },
};

export function can(role: Role, action: Action, resource: Resource): boolean {
  const allowed = PERMISSIONS[role][resource];
  return allowed !== undefined && allowed.includes(action);
}

/** Variante `MANAGE` : lecture + écriture + actions d'arbitrage. */
export function canManage(role: Role, resource: Resource): boolean {
  return can(role, ACTION.MANAGE, resource);
}

export type AuthorizationFailure = {
  readonly allowed: false;
  readonly reason: string;
};

export type AuthorizationResult = { readonly allowed: true } | AuthorizationFailure;

/** Vérification destinée aux use cases, avec raison exploitable côté serveur. */
export function authorize(
  role: Role,
  action: Action,
  resource: Resource,
): AuthorizationResult {
  if (can(role, action, resource)) {
    return { allowed: true };
  }
  return {
    allowed: false,
    reason: `Le rôle ${role} n'a pas l'autorisation « ${action} » sur « ${resource} ».`,
  };
}

/** Rôles disposant d'un accès à l'administration. */
export const ADMIN_ROLES: readonly Role[] = [ROLE.ADMIN, ROLE.SUPER_ADMIN];

export function isAdminRole(role: Role): boolean {
  return ADMIN_ROLES.includes(role);
}
