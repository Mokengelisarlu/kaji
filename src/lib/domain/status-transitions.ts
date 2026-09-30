import { CANDIDATE_STATUS, JOB_REQUEST_STATUS, type CandidateStatus, type JobRequestStatus } from "./enums";

/**
 * Machine à états du processus de recrutement (§6).
 *
 * Les transitions sont décrites ici et **uniquement** ici. Le backend les
 * applique ; le frontend ne fait que déclencher une action et afficher le
 * résultat. Toute transition absente de cette table est refusée.
 */

const CANDIDATE_TRANSITIONS: {
  readonly [S in CandidateStatus]: readonly CandidateStatus[];
} = {
  NEW: [CANDIDATE_STATUS.CONTACTED, CANDIDATE_STATUS.ARCHIVED],
  CONTACTED: [
    CANDIDATE_STATUS.PREQUALIFIED,
    CANDIDATE_STATUS.UNAVAILABLE,
    CANDIDATE_STATUS.ARCHIVED,
  ],
  PREQUALIFIED: [
    CANDIDATE_STATUS.VERIFIED,
    CANDIDATE_STATUS.UNAVAILABLE,
    CANDIDATE_STATUS.ARCHIVED,
  ],
  VERIFIED: [
    CANDIDATE_STATUS.AVAILABLE,
    CANDIDATE_STATUS.OPEN_TO_OPPORTUNITIES,
    CANDIDATE_STATUS.IN_PROCESS,
    CANDIDATE_STATUS.UNAVAILABLE,
    CANDIDATE_STATUS.ARCHIVED,
  ],
  AVAILABLE: [
    CANDIDATE_STATUS.IN_PROCESS,
    CANDIDATE_STATUS.UNAVAILABLE,
    CANDIDATE_STATUS.OPEN_TO_OPPORTUNITIES,
    CANDIDATE_STATUS.ARCHIVED,
  ],
  OPEN_TO_OPPORTUNITIES: [
    CANDIDATE_STATUS.IN_PROCESS,
    CANDIDATE_STATUS.AVAILABLE,
    CANDIDATE_STATUS.UNAVAILABLE,
    CANDIDATE_STATUS.ARCHIVED,
  ],
  IN_PROCESS: [
    CANDIDATE_STATUS.PLACED,
    CANDIDATE_STATUS.AVAILABLE,
    CANDIDATE_STATUS.UNAVAILABLE,
    CANDIDATE_STATUS.ARCHIVED,
  ],
  PLACED: [CANDIDATE_STATUS.AVAILABLE, CANDIDATE_STATUS.UNAVAILABLE],
  UNAVAILABLE: [
    CANDIDATE_STATUS.AVAILABLE,
    CANDIDATE_STATUS.OPEN_TO_OPPORTUNITIES,
    CANDIDATE_STATUS.CONTACTED,
    CANDIDATE_STATUS.ARCHIVED,
  ],
  // Un profil archivé n'est réanimé que par un Super Admin, pas par RH.
  ARCHIVED: [CANDIDATE_STATUS.NEW],
};

export function allowedCandidateTransitions(from: CandidateStatus): readonly CandidateStatus[] {
  return CANDIDATE_TRANSITIONS[from];
}

export function canTransitionCandidate(
  from: CandidateStatus,
  to: CandidateStatus,
): boolean {
  return CANDIDATE_TRANSITIONS[from].includes(to);
}

const JOB_REQUEST_TRANSITIONS: {
  readonly [S in JobRequestStatus]: readonly JobRequestStatus[];
} = {
  NEW: [JOB_REQUEST_STATUS.REVIEWING, JOB_REQUEST_STATUS.CANCELLED],
  REVIEWING: [
    JOB_REQUEST_STATUS.SEARCHING,
    JOB_REQUEST_STATUS.CANCELLED,
    JOB_REQUEST_STATUS.REJECTED,
  ],
  SEARCHING: [
    JOB_REQUEST_STATUS.SHORTLISTED,
    JOB_REQUEST_STATUS.REVIEWING,
    JOB_REQUEST_STATUS.CANCELLED,
  ],
  SHORTLISTED: [
    JOB_REQUEST_STATUS.SENT_TO_CLIENT,
    JOB_REQUEST_STATUS.SEARCHING,
    JOB_REQUEST_STATUS.CANCELLED,
  ],
  SENT_TO_CLIENT: [
    JOB_REQUEST_STATUS.INTERVIEW,
    JOB_REQUEST_STATUS.SHORTLISTED,
    JOB_REQUEST_STATUS.CANCELLED,
  ],
  INTERVIEW: [
    JOB_REQUEST_STATUS.SELECTED,
    JOB_REQUEST_STATUS.SEARCHING,
    JOB_REQUEST_STATUS.CANCELLED,
  ],
  SELECTED: [JOB_REQUEST_STATUS.PLACED, JOB_REQUEST_STATUS.REJECTED],
  // PLACED est l'état final réussi : pas de retour possible.
  PLACED: [],
  REJECTED: [JOB_REQUEST_STATUS.SEARCHING],
  CANCELLED: [JOB_REQUEST_STATUS.REVIEWING],
};

export function allowedJobRequestTransitions(
  from: JobRequestStatus,
): readonly JobRequestStatus[] {
  return JOB_REQUEST_TRANSITIONS[from];
}

export function canTransitionJobRequest(
  from: JobRequestStatus,
  to: JobRequestStatus,
): boolean {
  return JOB_REQUEST_TRANSITIONS[from].includes(to);
}

export type TransitionCheck =
  | { readonly allowed: true }
  | { readonly allowed: false; readonly reason: string };

/**
 * Vérification enrichie, destinée aux use cases : explique le refus
 * pour être journalisée et affichée à l'administrateur.
 */
export function assertCandidateTransition(
  from: CandidateStatus,
  to: CandidateStatus,
): TransitionCheck {
  if (from === to) {
    return { allowed: false, reason: `Le statut est déjà ${to}.` };
  }
  if (!canTransitionCandidate(from, to)) {
    const allowed = allowedCandidateTransitions(from);
    const detail =
      allowed.length > 0 ? allowed.join(", ") : "aucun (état final)";
    return {
      allowed: false,
      reason: `Transition interdite : ${from} → ${to}. Transitions possibles : ${detail}.`,
    };
  }
  return { allowed: true };
}

export function assertJobRequestTransition(
  from: JobRequestStatus,
  to: JobRequestStatus,
): TransitionCheck {
  if (from === to) {
    return { allowed: false, reason: `Le statut est déjà ${to}.` };
  }
  if (!canTransitionJobRequest(from, to)) {
    const allowed = allowedJobRequestTransitions(from);
    const detail =
      allowed.length > 0 ? allowed.join(", ") : "aucun (état final)";
    return {
      allowed: false,
      reason: `Transition interdite : ${from} → ${to}. Transitions possibles : ${detail}.`,
    };
  }
  return { allowed: true };
}
