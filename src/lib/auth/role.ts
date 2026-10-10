import { ROLE, type Role } from "@/lib/domain/enums";

/**
 * Résolution du rôle applicatif depuis les *claims* de session Clerk (§20.2).
 *
 * Règle la plus importante du système d'autorisation : le rôle provient
 * **exclusivement de la session serveur**. Un rôle fourni par le client
 * (métadonnée, en-tête, corps de requête) n'est jamais lu. Ce module est pur :
 * il ne touche ni Clerk ni le réseau, ce qui le rend testable sans session.
 *
 * Emplacement du claim : Clerk expose `publicMetadata` dans les claims sous
 * `metadata`. Un utilisateur authentifié sans rôle explicite est un
 * **candidat** — le persona par défaut du produit (§5.1). Un rôle inconnu ou
 * mal typé ne donne jamais plus de droits : on retombe sur le rôle le moins
 * privilégié, jamais sur `ADMIN`.
 */

/** Clé du claim, alignée sur l'exposition de `publicMetadata` par Clerk. */
const ROLE_CLAIM = "role";

const VALID_ROLES: readonly string[] = Object.values(ROLE);

/**
 * Lit `claims.metadata.role` et ne renvoie une valeur que si elle appartient à
 * l'ensemble fermé `ROLE`.
 */
export function parseRoleClaim(claims: unknown): Role | null {
  if (typeof claims !== "object" || claims === null) {
    return null;
  }
  const metadata = (claims as { metadata?: unknown }).metadata;
  if (typeof metadata !== "object" || metadata === null) {
    return null;
  }
  const candidate = (metadata as Record<string, unknown>)[ROLE_CLAIM];
  if (typeof candidate === "string" && VALID_ROLES.includes(candidate)) {
    return candidate as Role;
  }
  return null;
}

/**
 * Rôle effectif d'un utilisateur **authentifié**. Sans claim valide, le rôle
 * est `CANDIDATE` : un compte sans rôle déclaré n'obtient jamais de privilège
 * d'administration.
 */
export function resolveRole(claims: unknown): Role {
  return parseRoleClaim(claims) ?? ROLE.CANDIDATE;
}
