import { PROFILE_VISIBILITY, type ProfileVisibility, type Role } from "./enums";
import { isStaffRole } from "./permissions";

/**
 * Règles de visibilité d'une fiche candidat (§4.2, §4.3, §9).
 *
 * Ces fonctions traduisent le choix du candidat (`ProfileVisibility`) en une
 * décision binaire, à partir du seul rôle **serveur** du visiteur. Le rôle
 * n'est jamais lu depuis le client : la matrice (`permissions.ts`) et
 * `isStaffRole` opèrent sur un rôle déjà résolu côté serveur.
 */

/** Identité du visiteur, telle qu'établie par la session serveur. */
export type Viewer = {
  /** Rôle résolu depuis la session ; `null` pour un visiteur anonyme. */
  readonly role: Role | null;
  /** Identifiant Clerk du visiteur connecté, s'il y en a un. */
  readonly userId?: string;
};

/** Fiche candidate réduite à ce que la décision exige. */
export type VisibleProfile = {
  readonly profileVisibility: ProfileVisibility;
  /** Propriétaire de la fiche (`clerk_user_id`), pour reconnaître l'auteur. */
  readonly ownerUserId?: string;
};

/**
 * Un visiteur est-il le propriétaire de la fiche ? Un `undefined` ne doit
 * jamais être considéré comme une correspondance : deux fiches sans
 * propriétaire ne s'appartiennent pas mutuellement.
 */
function isOwner(viewer: Viewer, ownerUserId: string | undefined): boolean {
  return viewer.userId !== undefined && ownerUserId !== undefined && viewer.userId === ownerUserId;
}

/**
 * La fiche est-elle directement consultable par ce visiteur ?
 *
 * - `PUBLIC` : oui, pour tout le monde, y compris un visiteur anonyme ;
 * - `ON_REQUEST` : non, sauf le propriétaire et l'équipe Kaji — l'accès public
 *   passe par une demande de profil arbitrée (§9.3) ;
 * - `PRIVATE` : non, sauf le propriétaire et l'équipe Kaji.
 *
 * Une fiche non publiable sur une route publique doit produire un **vrai 404**
 * (§4.2), pas une page vide : c'est à l'appelant de traduire `false` en
 * `notFound()`.
 */
export function canViewProfile(viewer: Viewer, profile: VisibleProfile): boolean {
  if (profile.profileVisibility === PROFILE_VISIBILITY.PUBLIC) {
    return true;
  }
  return isOwner(viewer, profile.ownerUserId) || isStaffRole(viewer.role);
}

/**
 * La fiche est-elle listable dans l'annuaire public ?
 *
 * Seul `PUBLIC` l'est. La fonction est la règle unique côté domaine ; la couche
 * data l'exprime en `WHERE profile_visibility = 'PUBLIC'`.
 */
export function isPubliclyListable(visibility: ProfileVisibility): boolean {
  return visibility === PROFILE_VISIBILITY.PUBLIC;
}
