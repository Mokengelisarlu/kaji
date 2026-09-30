import { describe, expect, it } from "vitest";

import { FRESHNESS_BAND } from "./enums";
import {
  daysSince,
  describeProfileFreshness,
  formatProfileAge,
  requiresAvailabilityReconfirmation,
  resolveFreshnessBand,
} from "./freshness";

/** Date d'origine fixe : les tests ne doivent pas dépendre de l'heure réelle. */
const NOW = new Date("2026-03-15T12:00:00.000Z");

/** Construit une date ISO située `days` jours avant NOW. */
function daysAgo(days: number): string {
  const date = new Date(NOW);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString();
}

describe("daysSince", () => {
  it("compte des jours calendaires, pas des heures", () => {
    // 23 h 59 le même jour calendaire = 0 jour écoulé, pas 1.
    const lateYesterday = new Date("2026-03-14T23:59:59.000Z");
    expect(daysSince(lateYesterday, NOW)).toBe(1);

    const justAfterMidnight = new Date("2026-03-15T00:00:01.000Z");
    expect(daysSince(justAfterMidnight, NOW)).toBe(0);
  });

  it("ne renvoie jamais un nombre négatif", () => {
    // Cas limite : une date de mise à jour dans le futur (erreur de saisie,
    // décalage d'horloge, import erroné) ne doit pas produire d'âge négatif,
    // qui ferait passer un profil périmé pour frais.
    const future = new Date("2027-01-01T00:00:00.000Z");
    expect(daysSince(future, NOW)).toBe(0);
  });

  it("traite une date illisible comme infiniment ancienne", () => {
    // Une date corrompue ne doit pas être traitée comme « fraîche » parce que
    // le calcul a produit NaN.
    expect(daysSince("pas-une-date", NOW)).toBe(Number.POSITIVE_INFINITY);
    expect(daysSince(new Date(Number.NaN), NOW)).toBe(Number.POSITIVE_INFINITY);
  });

  it("accepte une chaîne ISO ou un objet Date", () => {
    expect(daysSince(daysAgo(10), NOW)).toBe(10);
    expect(daysSince(new Date(daysAgo(10)), NOW)).toBe(10);
  });
});

describe("resolveFreshnessBand", () => {
  it("classe un profil mis à jour aujourd'hui comme récent", () => {
    expect(resolveFreshnessBand(daysAgo(0), NOW)).toBe(FRESHNESS_BAND.RECENT);
  });

  it("inclut le 30e jour dans la bande récente", () => {
    // Frontière : le seuil est `age <= 30`. Si quelqu'un passe à `<`, un
    // profil à 30 jours passe en NeedsUpdate et perd sa disponibilité.
    expect(resolveFreshnessBand(daysAgo(30), NOW)).toBe(FRESHNESS_BAND.RECENT);
  });

  it("classe le 31e jour comme needing update", () => {
    expect(resolveFreshnessBand(daysAgo(31), NOW)).toBe(FRESHNESS_BAND.NEEDS_UPDATE);
  });

  it("inclut le 90e jour dans NeedsUpdate et bascule au 91e", () => {
    expect(resolveFreshnessBand(daysAgo(90), NOW)).toBe(FRESHNESS_BAND.NEEDS_UPDATE);
    expect(resolveFreshnessBand(daysAgo(91), NOW)).toBe(FRESHNESS_BAND.STALE);
  });

  it("dégrade un profil ancien en stale", () => {
    expect(resolveFreshnessBand(daysAgo(365), NOW)).toBe(FRESHNESS_BAND.STALE);
  });

  it("dégrade une date illisible plutôt que de la considérer fraîche", () => {
    expect(resolveFreshnessBand("pas-une-date", NOW)).toBe(FRESHNESS_BAND.STALE);
  });
});

describe("requiresAvailabilityReconfirmation", () => {
  it("exige une reconfirmation dès que le profil sort de la bande récente", () => {
    expect(requiresAvailabilityReconfirmation(daysAgo(30), NOW)).toBe(false);
    expect(requiresAvailabilityReconfirmation(daysAgo(31), NOW)).toBe(true);
    expect(requiresAvailabilityReconfirmation(daysAgo(200), NOW)).toBe(true);
  });
});

describe("describeProfileFreshness", () => {
  it("regroupe bande, âge et obligation de reconfirmation", () => {
    expect(describeProfileFreshness(daysAgo(45), NOW)).toEqual({
      band: FRESHNESS_BAND.NEEDS_UPDATE,
      daysSinceUpdate: 45,
      requiresReconfirmation: true,
    });
  });

  it("reste cohérent pour un profil du jour", () => {
    expect(describeProfileFreshness(daysAgo(0), NOW)).toEqual({
      band: FRESHNESS_BAND.RECENT,
      daysSinceUpdate: 0,
      requiresReconfirmation: false,
    });
  });
});

describe("formatProfileAge", () => {
  it("rédige les trois cas nominaux", () => {
    expect(formatProfileAge(0)).toBe("mis à jour aujourd'hui");
    expect(formatProfileAge(1)).toBe("mis à jour hier");
    expect(formatProfileAge(12)).toBe("mis à jour il y a 12 jours");
  });

  it("bascule en mois au-delà de 30 jours", () => {
    expect(formatProfileAge(31)).toBe("mis à jour il y a 1 mois");
    expect(formatProfileAge(75)).toBe("mis à jour il y a 3 mois");
  });

  it("avoue une ancienneté inconnue plutôt que d'afficher un nombre faux", () => {
    // Cas limite issu de `daysSince` : une date illisible donne Infinity.
    // Afficher « mis à jour il y a Infinity mois » serait pire qu'un silence.
    expect(formatProfileAge(Number.POSITIVE_INFINITY)).toBe("ancienneté inconnue");
  });
});
