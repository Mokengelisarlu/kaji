import {
  AVAILABILITY_TYPE,
  CANDIDATE_STATUS,
  EFFECTIVE_AVAILABILITY,
  FRESHNESS_BAND,
  PRESENTABLE_STATUSES,
  type CandidateStatus,
  type EffectiveAvailability,
} from "./enums";
import { resolveFreshnessBand } from "./freshness";

export type AvailabilityInput = {
  readonly status: CandidateStatus;
  readonly declaredAvailability: (typeof AVAILABILITY_TYPE)[keyof typeof AVAILABILITY_TYPE];
  readonly lastProfileUpdateAt: string | Date;
  /** Date de la dernière reconfirmation explicite par le candidat. */
  readonly lastAvailabilityConfirmationAt: string | Date;
  readonly now: Date;
};

/**
 * Disponibilité effective = statut + déclaration + fraîcheur (§3.1, §3.2).
 *
 * Règle non négociable : **avoir un compte ne signifie jamais être disponible**.
 * Un profil n'est `AVAILABLE` que si les trois conditions sont réunies :
 *   1. le statut candidat l'autorise ;
 *   2. la déclaration n'est pas `NOT_AVAILABLE` ;
 *   3. la dernière mise à jour est récente (< 30 jours).
 *
 * Au-delà de 30 jours, on ne retombe jamais automatiquement sur `AVAILABLE` :
 * le profil bascule en `REQUIRES_CONFIRMATION` et doit être reconfirmé par
 * l'équipe Kaji.
 */
export function resolveEffectiveAvailability(
  input: AvailabilityInput,
): EffectiveAvailability {
  const { status, declaredAvailability, lastProfileUpdateAt, now } = input;

  if (status === CANDIDATE_STATUS.ARCHIVED) {
    return EFFECTIVE_AVAILABILITY.UNAVAILABLE;
  }

  if (status === CANDIDATE_STATUS.PLACED || status === CANDIDATE_STATUS.IN_PROCESS) {
    // Présent dans un processus en cours : la disponibilité est consommée
    // par le processus, pas par le vivier.
    return EFFECTIVE_AVAILABILITY.UNAVAILABLE;
  }

  if (declaredAvailability === AVAILABILITY_TYPE.NOT_AVAILABLE) {
    return EFFECTIVE_AVAILABILITY.UNAVAILABLE;
  }

  if (status === CANDIDATE_STATUS.UNAVAILABLE) {
    return EFFECTIVE_AVAILABILITY.UNAVAILABLE;
  }

  const freshness = resolveFreshnessBand(lastProfileUpdateAt, now);

  if (freshness === FRESHNESS_BAND.STALE) {
    return EFFECTIVE_AVAILABILITY.REQUIRES_CONFIRMATION;
  }

  if (freshness === FRESHNESS_BAND.NEEDS_UPDATE) {
    // La déclaration reste indicative mais n'est plus opposable telle quelle.
    return EFFECTIVE_AVAILABILITY.REQUIRES_CONFIRMATION;
  }

  switch (declaredAvailability) {
    case AVAILABILITY_TYPE.IMMEDIATELY:
      return EFFECTIVE_AVAILABILITY.AVAILABLE;
    case AVAILABILITY_TYPE.ONE_MONTH:
    case AVAILABILITY_TYPE.THREE_MONTHS:
      return EFFECTIVE_AVAILABILITY.AVAILABLE_WITH_DELAY;
    case AVAILABILITY_TYPE.OPEN_TO_OPPORTUNITIES:
      return EFFECTIVE_AVAILABILITY.OPEN;
  }
}

/**
 * Variante stricte : la disponibilité effective doit aussi reposer sur une
 * reconfirmation explicite, pas seulement sur la mise à jour du profil.
 * Utilisée par le matching avant toute présentation à un client.
 */
export function isPresentableAvailability(
  availability: EffectiveAvailability,
  status: CandidateStatus,
): boolean {
  const confirmable: readonly EffectiveAvailability[] = [
    EFFECTIVE_AVAILABILITY.AVAILABLE,
    EFFECTIVE_AVAILABILITY.AVAILABLE_WITH_DELAY,
    EFFECTIVE_AVAILABILITY.OPEN,
  ];

  return confirmable.includes(availability) && PRESENTABLE_STATUSES.includes(status);
}
