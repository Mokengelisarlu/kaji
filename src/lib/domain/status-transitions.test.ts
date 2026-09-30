import { describe, expect, it } from "vitest";

import {
  CANDIDATE_STATUS,
  JOB_REQUEST_STATUS,
  type CandidateStatus,
  type JobRequestStatus,
} from "./enums";
import {
  allowedCandidateTransitions,
  allowedJobRequestTransitions,
  assertCandidateTransition,
  assertJobRequestTransition,
  canTransitionCandidate,
  canTransitionJobRequest,
} from "./status-transitions";

const ALL_CANDIDATE_STATUSES = Object.values(CANDIDATE_STATUS) as readonly CandidateStatus[];
const ALL_JOB_STATUSES = Object.values(JOB_REQUEST_STATUS) as readonly JobRequestStatus[];

describe("transitions candidat", () => {
  it("autorise le chemin nominal du processus", () => {
    expect(canTransitionCandidate(CANDIDATE_STATUS.NEW, CANDIDATE_STATUS.CONTACTED)).toBe(true);
    expect(canTransitionCandidate(CANDIDATE_STATUS.CONTACTED, CANDIDATE_STATUS.PREQUALIFIED)).toBe(true);
    expect(canTransitionCandidate(CANDIDATE_STATUS.PREQUALIFIED, CANDIDATE_STATUS.VERIFIED)).toBe(true);
    expect(canTransitionCandidate(CANDIDATE_STATUS.VERIFIED, CANDIDATE_STATUS.AVAILABLE)).toBe(true);
    expect(canTransitionCandidate(CANDIDATE_STATUS.IN_PROCESS, CANDIDATE_STATUS.PLACED)).toBe(true);
  });

  it("interdit de vérifier un profil jamais contacté", () => {
    // Règle produit : on ne vérifie pas quelqu'un qu'on n'a pas encore parlé à.
    expect(canTransitionCandidate(CANDIDATE_STATUS.NEW, CANDIDATE_STATUS.VERIFIED)).toBe(false);
    expect(canTransitionCandidate(CANDIDATE_STATUS.NEW, CANDIDATE_STATUS.PREQUALIFIED)).toBe(false);
  });

  it("interdit de placer un candidat qui n'est pas en processus", () => {
    expect(canTransitionCandidate(CANDIDATE_STATUS.AVAILABLE, CANDIDATE_STATUS.PLACED)).toBe(false);
    expect(canTransitionCandidate(CANDIDATE_STATUS.VERIFIED, CANDIDATE_STATUS.PLACED)).toBe(false);
  });

  it("permet de revenir d'un placement à la disponibilité", () => {
    expect(canTransitionCandidate(CANDIDATE_STATUS.PLACED, CANDIDATE_STATUS.AVAILABLE)).toBe(true);
    expect(canTransitionCandidate(CANDIDATE_STATUS.PLACED, CANDIDATE_STATUS.UNAVAILABLE)).toBe(true);
  });

  it("n'autorise que le Super Admin à réveiller un profil archivé", () => {
    // ARCHIVED n'aboutit qu'à NEW. La table ne distingue pas le rôle : c'est
    // le guard serveur qui filtre, pas cette matrice. Ce test verrouille
    // qu'aucune autre sortie n'a été ouverte par inadvertance.
    expect(allowedCandidateTransitions(CANDIDATE_STATUS.ARCHIVED)).toEqual([
      CANDIDATE_STATUS.NEW,
    ]);
  });

  it("ne propose aucune transition sortante d'un état final candidat", () => {
    for (const status of ALL_CANDIDATE_STATUSES) {
      const targets = allowedCandidateTransitions(status);
      for (const target of targets) {
        expect(ALL_CANDIDATE_STATUSES).toContain(target);
      }
      // Une transition vers soi-même n'est jamais une transition.
      expect(targets).not.toContain(status);
      // Pas de doublon : une table qui répète une cible signale une faute de
      // saisie qui n'apparaîtrait dans aucun test d'interface.
      expect(new Set(targets).size).toBe(targets.length);
    }
  });

  it("refuse toute transition par défaut, y compris les fautes de frappe", () => {
    // Cas limites : un statut malformé ne doit jamais être accepté. `can`
    // indexe la table ; une clé inconnue donne `undefined`, dont `.includes`
    // lèverait. On vérifie que l'appel typed reste sûr et que la matrice
    // n'accorde rien par défaut.
    for (const from of ALL_CANDIDATE_STATUSES) {
      for (const to of ALL_CANDIDATE_STATUSES) {
        const expected = allowedCandidateTransitions(from).includes(to);
        expect(canTransitionCandidate(from, to)).toBe(expected);
      }
    }
  });
});

describe("transitions demande d'emploi", () => {
  it("autorise le chemin nominal", () => {
    expect(canTransitionJobRequest(JOB_REQUEST_STATUS.NEW, JOB_REQUEST_STATUS.REVIEWING)).toBe(true);
    expect(canTransitionJobRequest(JOB_REQUEST_STATUS.REVIEWING, JOB_REQUEST_STATUS.SEARCHING)).toBe(true);
    expect(canTransitionJobRequest(JOB_REQUEST_STATUS.SEARCHING, JOB_REQUEST_STATUS.SHORTLISTED)).toBe(true);
    expect(canTransitionJobRequest(JOB_REQUEST_STATUS.SHORTLISTED, JOB_REQUEST_STATUS.SENT_TO_CLIENT)).toBe(true);
    expect(canTransitionJobRequest(JOB_REQUEST_STATUS.SENT_TO_CLIENT, JOB_REQUEST_STATUS.INTERVIEW)).toBe(true);
    expect(canTransitionJobRequest(JOB_REQUEST_STATUS.INTERVIEW, JOB_REQUEST_STATUS.SELECTED)).toBe(true);
    expect(canTransitionJobRequest(JOB_REQUEST_STATUS.SELECTED, JOB_REQUEST_STATUS.PLACED)).toBe(true);
  });

  it("traite PLACED comme un état final sans retour possible", () => {
    expect(allowedJobRequestTransitions(JOB_REQUEST_STATUS.PLACED)).toEqual([]);
    for (const to of ALL_JOB_STATUSES) {
      expect(canTransitionJobRequest(JOB_REQUEST_STATUS.PLACED, to)).toBe(false);
    }
  });

  it("n'autorise pas de ressusciter une demande annulée", () => {
    // Une demande annulée ne repart que par une revue explicite, pas
    // directement vers la recherche.
    expect(canTransitionJobRequest(JOB_REQUEST_STATUS.CANCELLED, JOB_REQUEST_STATUS.SEARCHING)).toBe(false);
    expect(canTransitionJobRequest(JOB_REQUEST_STATUS.CANCELLED, JOB_REQUEST_STATUS.REVIEWING)).toBe(true);
  });

  it("n'autorise pas de rechercher depuis un poste pourvu", () => {
    expect(canTransitionJobRequest(JOB_REQUEST_STATUS.PLACED, JOB_REQUEST_STATUS.SEARCHING)).toBe(false);
    expect(canTransitionJobRequest(JOB_REQUEST_STATUS.SELECTED, JOB_REQUEST_STATUS.SEARCHING)).toBe(false);
  });

  it("ne propose aucune transition invalide ni en double", () => {
    for (const status of ALL_JOB_STATUSES) {
      const targets = allowedJobRequestTransitions(status);
      for (const target of targets) {
        expect(ALL_JOB_STATUSES).toContain(target);
      }
      expect(targets).not.toContain(status);
      expect(new Set(targets).size).toBe(targets.length);
    }
  });
});

describe("assert…Transition — messages exploitables", () => {
  it("accorde sans motif quand la transition est permise", () => {
    expect(assertCandidateTransition(CANDIDATE_STATUS.NEW, CANDIDATE_STATUS.CONTACTED)).toEqual({
      allowed: true,
    });
    expect(assertJobRequestTransition(JOB_REQUEST_STATUS.NEW, JOB_REQUEST_STATUS.REVIEWING)).toEqual({
      allowed: true,
    });
  });

  it("distingue « déjà dans ce statut » d'une transition interdite", () => {
    // Deux refus différents : le premier est un appel sans effet, le
    // second est une règle métier. Les confondre ferait logger un bug produit
    // pour un double-clic.
    const same = assertCandidateTransition(
      CANDIDATE_STATUS.VERIFIED,
      CANDIDATE_STATUS.VERIFIED,
    );
    expect(same.allowed).toBe(false);
    expect(same.allowed === false && same.reason).toBe(`Le statut est déjà ${CANDIDATE_STATUS.VERIFIED}.`);

    const forbidden = assertCandidateTransition(
      CANDIDATE_STATUS.NEW,
      CANDIDATE_STATUS.PLACED,
    );
    expect(forbidden.allowed).toBe(false);
    expect(forbidden.allowed === false && forbidden.reason).toContain("NEW → PLACED");
  });

  it("annonce « état final » quand aucune sortie n'existe", () => {
    const result = assertJobRequestTransition(
      JOB_REQUEST_STATUS.PLACED,
      JOB_REQUEST_STATUS.SEARCHING,
    );
    expect(result.allowed).toBe(false);
    expect(result.allowed === false && result.reason).toContain("aucun (état final)");
  });

  it("liste les transitions possibles pour aider l'administrateur", () => {
    const result = assertCandidateTransition(
      CANDIDATE_STATUS.CONTACTED,
      CANDIDATE_STATUS.VERIFIED,
    );
    expect(result.allowed).toBe(false);
    expect(result.allowed === false && result.reason).toContain(CANDIDATE_STATUS.PREQUALIFIED);
  });
});
