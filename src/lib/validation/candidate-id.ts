/**
 * Format d'identifiant candidat : `KJ-<année>-<séquence>`.
 *
 * Utilisé comme garde-fou **avant** tout accès aux données : un identifiant
 * malformé ne peut pas atteindre la couche repository. Le pattern est
 * volontairement strict et ancré, il ne constitue pas une autorisation.
 */
export const CANDIDATE_ID_PATTERN = /^KJ-\d{4}-\d{4}$/;

/** Longueur maximale d'un identifiant, garde-fou d'allocation. */
export const CANDIDATE_ID_MAX_LENGTH = 12;

export function isValidCandidateId(value: string): boolean {
  return value.length <= CANDIDATE_ID_MAX_LENGTH && CANDIDATE_ID_PATTERN.test(value);
}
