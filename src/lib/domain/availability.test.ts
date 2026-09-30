import { describe, expect, it } from "vitest";

import {
  AVAILABILITY_TYPE,
  CANDIDATE_STATUS,
  EFFECTIVE_AVAILABILITY,
  type CandidateStatus,
} from "./enums";
import { isPresentableAvailability, resolveEffectiveAvailability } from "./availability";

/** Date d'origine fixe : la disponibilité ne doit dépendre de rien d'autre. */
const NOW = new Date("2026-03-15T12:00:00.000Z");

/** Date ISO située `days` jours avant NOW. */
function daysAgo(days: number): string {
  const date = new Date(NOW);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString();
}

type Overrides = {
  readonly status?: CandidateStatus;
  readonly declaredAvailability?: (typeof AVAILABILITY_TYPE)[keyof typeof AVAILABILITY_TYPE];
  readonly lastProfileUpdateAt?: string;
  readonly lastAvailabilityConfirmationAt?: string;
};

function resolve(overrides: Overrides = {}) {
  return resolveEffectiveAvailability({
    status: overrides.status ?? CANDIDATE_STATUS.AVAILABLE,
    declaredAvailability:
      overrides.declaredAvailability ?? AVAILABILITY_TYPE.IMMEDIATELY,
    lastProfileUpdateAt: overrides.lastProfileUpdateAt ?? daysAgo(2),
    lastAvailabilityConfirmationAt:
      overrides.lastAvailabilityConfirmationAt ?? daysAgo(2),
    now: NOW,
  });
}

describe("resolveEffectiveAvailability — règle non négociable", () => {
  it("n'accorde la disponibilité qu'aux trois conditions réunies", () => {
    // Statut cohérent + déclaration positive + mise à jour récente.
    expect(resolve()).toBe(EFFECTIVE_AVAILABILITY.AVAILABLE);
  });

  it("ne déduit jamais la disponibilité du seul statut", () => {
    // Règle fondatrice de §3.1 : avoir un compte ne signifie jamais être
    // disponible. Un statut AVAILABLE mais une déclaration NOT_AVAILABLE
    // reste indisponible — la déclaration l'emporte.
    expect(
      resolve({
        status: CANDIDATE_STATUS.AVAILABLE,
        declaredAvailability: AVAILABILITY_TYPE.NOT_AVAILABLE,
      }),
    ).toBe(EFFECTIVE_AVAILABILITY.UNAVAILABLE);
  });

  it("ne porte pas la porte de statut, qui relève de la présentabilité", () => {
    // La table de décision de §3.1 ne contient aucune porte
    // `PRESENTABLE_STATUSES` : la valeur effective décrit ce que le candidat
    // déclare, pas ce que Kaji peut présenter. Un profil en `NEW` qui déclare
    // être disponible immédiatement et dont le profil est frais vaut donc
    // `AVAILABLE`.
    //
    // Ce n'est pas une faille : c'est `isPresentableAvailability` qui réserve
    // la présentation aux statuts vérifiés. Séparer les deux est exactement ce
    // que séparent les trois notions de §3.1. Confondre les deux en ajoutant
    // une porte ici ferait disappear un profil du vivier public alors qu'il
    // n'est simplement pas encore présentable.
    for (const status of [
      CANDIDATE_STATUS.NEW,
      CANDIDATE_STATUS.CONTACTED,
      CANDIDATE_STATUS.PREQUALIFIED,
      CANDIDATE_STATUS.VERIFIED,
    ] as const) {
      expect(resolve({ status })).toBe(EFFECTIVE_AVAILABILITY.AVAILABLE);
    }
  });
});

describe("resolveEffectiveAvailability — court-circuit par statut", () => {
  it("rend un profil archivé indisponible quoi qu'il déclare", () => {
    expect(
      resolve({
        status: CANDIDATE_STATUS.ARCHIVED,
        declaredAvailability: AVAILABILITY_TYPE.IMMEDIATELY,
      }),
    ).toBe(EFFECTIVE_AVAILABILITY.UNAVAILABLE);
  });

  it("rend indisponible un candidat déjà engagé", () => {
    // Sa disponibilité est consommée par le processus en cours, pas par le
    // vivier : les deux ne doivent pas se concurrencer.
    expect(resolve({ status: CANDIDATE_STATUS.PLACED })).toBe(
      EFFECTIVE_AVAILABILITY.UNAVAILABLE,
    );
    expect(resolve({ status: CANDIDATE_STATUS.IN_PROCESS })).toBe(
      EFFECTIVE_AVAILABILITY.UNAVAILABLE,
    );
  });

  it("respecte un statut UNAVAILABLE explicite", () => {
    expect(resolve({ status: CANDIDATE_STATUS.UNAVAILABLE })).toBe(
      EFFECTIVE_AVAILABILITY.UNAVAILABLE,
    );
  });
});

describe("resolveEffectiveAvailability — déclaration différée", () => {
  it("distingue disponible, disponible sous délai et ouvert", () => {
    expect(resolve({ declaredAvailability: AVAILABILITY_TYPE.IMMEDIATELY })).toBe(
      EFFECTIVE_AVAILABILITY.AVAILABLE,
    );
    expect(resolve({ declaredAvailability: AVAILABILITY_TYPE.ONE_MONTH })).toBe(
      EFFECTIVE_AVAILABILITY.AVAILABLE_WITH_DELAY,
    );
    expect(resolve({ declaredAvailability: AVAILABILITY_TYPE.THREE_MONTHS })).toBe(
      EFFECTIVE_AVAILABILITY.AVAILABLE_WITH_DELAY,
    );
    expect(resolve({ declaredAvailability: AVAILABILITY_TYPE.OPEN_TO_OPPORTUNITIES })).toBe(
      EFFECTIVE_AVAILABILITY.OPEN,
    );
  });
});

describe("resolveEffectiveAvailability — fraîcheur comme garde-fou", () => {
  it("bascule en reconfirmation requise au-delà de 30 jours", () => {
    // Le commentaire du module promet qu'on ne retombe jamais
    // automatiquement sur AVAILABLE. Ce test verrouille cette promesse.
    expect(resolve({ lastProfileUpdateAt: daysAgo(31) })).toBe(
      EFFECTIVE_AVAILABILITY.REQUIRES_CONFIRMATION,
    );
  });

  it("bascule aussi en reconfirmation requise sur un profil périmé", () => {
    expect(resolve({ lastProfileUpdateAt: daysAgo(400) })).toBe(
      EFFECTIVE_AVAILABILITY.REQUIRES_CONFIRMATION,
    );
  });

  it("privilégie l'indisponibilité déclarée sur la reconfirmation", () => {
    // Un candidat qui se dit indisponible n'a pas à être reconfirmé : la
    // reconfirmation est un statut intermédiaire, pas un résultat pire que
    // « indisponible ».
    expect(
      resolve({
        declaredAvailability: AVAILABILITY_TYPE.NOT_AVAILABLE,
        lastProfileUpdateAt: daysAgo(200),
      }),
    ).toBe(EFFECTIVE_AVAILABILITY.UNAVAILABLE);
  });

  it("ne retombe pas sur AVAILABLE après reconfirmation incomplète", () => {
    const result = resolve({ lastProfileUpdateAt: daysAgo(120) });
    expect(result).not.toBe(EFFECTIVE_AVAILABILITY.AVAILABLE);
    expect(result).toBe(EFFECTIVE_AVAILABILITY.REQUIRES_CONFIRMATION);
  });
});

describe("isPresentableAvailability", () => {
  it("accepte les trois disponibilités confirmables sur un statut présentable", () => {
    for (const availability of [
      EFFECTIVE_AVAILABILITY.AVAILABLE,
      EFFECTIVE_AVAILABILITY.AVAILABLE_WITH_DELAY,
      EFFECTIVE_AVAILABILITY.OPEN,
    ] as const) {
      expect(isPresentableAvailability(availability, CANDIDATE_STATUS.VERIFIED)).toBe(true);
      expect(isPresentableAvailability(availability, CANDIDATE_STATUS.AVAILABLE)).toBe(true);
      expect(
        isPresentableAvailability(availability, CANDIDATE_STATUS.OPEN_TO_OPPORTUNITIES),
      ).toBe(true);
    }
  });

  it("refuse une disponibilité qui exige une reconfirmation", () => {
    // C'est la barrière avant présentation à un client : proposer un profil
    // périmé engage Kaji sur une information non vérifiée.
    expect(
      isPresentableAvailability(
        EFFECTIVE_AVAILABILITY.REQUIRES_CONFIRMATION,
        CANDIDATE_STATUS.VERIFIED,
      ),
    ).toBe(false);
  });

  it("refuse un statut non présentable même avec une bonne disponibilité", () => {
    expect(isPresentableAvailability(EFFECTIVE_AVAILABILITY.AVAILABLE, CANDIDATE_STATUS.NEW)).toBe(
      false,
    );
    expect(
      isPresentableAvailability(EFFECTIVE_AVAILABILITY.AVAILABLE, CANDIDATE_STATUS.CONTACTED),
    ).toBe(false);
    expect(
      isPresentableAvailability(EFFECTIVE_AVAILABILITY.AVAILABLE, CANDIDATE_STATUS.ARCHIVED),
    ).toBe(false);
    expect(
      isPresentableAvailability(
        EFFECTIVE_AVAILABILITY.AVAILABLE,
        CANDIDATE_STATUS.PREQUALIFIED,
      ),
    ).toBe(false);
  });

  it("ne présente jamais un candidat archivé ou en cours de placement", () => {
    for (const availability of Object.values(EFFECTIVE_AVAILABILITY)) {
      expect(isPresentableAvailability(availability, CANDIDATE_STATUS.ARCHIVED)).toBe(false);
      expect(isPresentableAvailability(availability, CANDIDATE_STATUS.PLACED)).toBe(false);
      expect(isPresentableAvailability(availability, CANDIDATE_STATUS.IN_PROCESS)).toBe(false);
    }
  });
});
