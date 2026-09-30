import { FRESHNESS_BAND, FRESHNESS_THRESHOLDS_DAYS, type FreshnessBand } from "./enums";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Normalise une date en début de journée, pour éviter les écarts d'heure. */
function startOfUtcDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/** Nombre de jours calendaires écoulés entre deux dates. Jamais négatif. */
export function daysSince(value: string | Date, now: Date): number {
  const date = typeof value === "string" ? new Date(value) : value;
  const elapsed = startOfUtcDay(now) - startOfUtcDay(date);
  if (Number.isNaN(elapsed)) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.max(0, Math.floor(elapsed / MS_PER_DAY));
}

/**
 * Détermine la bande de fraîcheur d'un profil (§3.2).
 *
 * La référence est `lastProfileUpdateAt` — la dernière mise à jour volontaire
 * du profil. `lastAvailabilityConfirmationAt` est traité séparément par
 * `resolveEffectiveAvailability`, car une disponibilité peut être périmée
 * alors que le profil reste riche et à jour.
 */
export function resolveFreshnessBand(
  lastProfileUpdateAt: string | Date,
  now: Date,
): FreshnessBand {
  const age = daysSince(lastProfileUpdateAt, now);

  if (age <= FRESHNESS_THRESHOLDS_DAYS.recentMaxDays) {
    return FRESHNESS_BAND.RECENT;
  }

  if (age <= FRESHNESS_THRESHOLDS_DAYS.needsUpdateMaxDays) {
    return FRESHNESS_BAND.NEEDS_UPDATE;
  }

  return FRESHNESS_BAND.STALE;
}

/** true si le profil ne peut pas être considéré disponible sans reconfirmation. */
export function requiresAvailabilityReconfirmation(
  lastProfileUpdateAt: string | Date,
  now: Date,
): boolean {
  return resolveFreshnessBand(lastProfileUpdateAt, now) !== FRESHNESS_BAND.RECENT;
}

/** Statut de fraîcheur du candidat au regard de sa dernière mise à jour. */
export type ProfileFreshness = {
  readonly band: FreshnessBand;
  readonly daysSinceUpdate: number;
  readonly requiresReconfirmation: boolean;
};

export function describeProfileFreshness(
  lastProfileUpdateAt: string | Date,
  now: Date,
): ProfileFreshness {
  const age = daysSince(lastProfileUpdateAt, now);

  return {
    band: resolveFreshnessBand(lastProfileUpdateAt, now),
    daysSinceUpdate: age,
    requiresReconfirmation: requiresAvailabilityReconfirmation(lastProfileUpdateAt, now),
  };
}

/** Formulation humaine de l'ancienneté, utilisée dans l'espace candidat. */
export function formatProfileAge(days: number): string {
  if (!Number.isFinite(days)) {
    return "ancienneté inconnue";
  }
  if (days === 0) {
    return "mis à jour aujourd'hui";
  }
  if (days === 1) {
    return "mis à jour hier";
  }
  if (days < 31) {
    return `mis à jour il y a ${days} jours`;
  }

  const months = Math.round(days / 30);
  return months <= 1 ? "mis à jour il y a 1 mois" : `mis à jour il y a ${months} mois`;
}
