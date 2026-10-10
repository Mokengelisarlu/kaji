/**
 * Périodes au niveau du **mois et de l'année**.
 *
 * Représentation de stockage : `YYYY-MM` (ex. `2023-01`).
 * La forme `YYYY` seule est tolérée **en lecture** pour les données historiques
 * dont le mois n'a jamais été connu : on n'invente alors aucun mois.
 *
 * Le jour n'existe jamais : aucune date au format `YYYY-MM-DD` n'est produite.
 */

const YEAR_MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;
const YEAR_ONLY_PATTERN = /^(\d{4})$/;

export const MONTH_LABELS_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
] as const;

export type ParsedPeriod = {
  readonly year: number;
  /** `null` lorsque seul l'année est connue. */
  readonly month: number | null;
};

/** Analyse une période ; `null` si la valeur est absente ou mal formée. */
export function parsePeriod(value: string | null | undefined): ParsedPeriod | null {
  if (!value) return null;
  const trimmed = value.trim();
  const withMonth = YEAR_MONTH_PATTERN.exec(trimmed);
  if (withMonth && withMonth[1] && withMonth[2]) {
    return { year: Number(withMonth[1]), month: Number(withMonth[2]) };
  }
  const yearOnly = YEAR_ONLY_PATTERN.exec(trimmed);
  if (yearOnly && yearOnly[1]) {
    return { year: Number(yearOnly[1]), month: null };
  }
  return null;
}

/** `true` si la valeur est un mois et une année valides (`YYYY-MM`). */
export function isYearMonth(value: string | null | undefined): boolean {
  const parsed = parsePeriod(value);
  return parsed !== null && parsed.month !== null;
}

/** `true` si la valeur est une année seule ou un mois et une année valides. */
export function isYearMonthOrYear(value: string | null | undefined): boolean {
  return parsePeriod(value) !== null;
}

/**
 * Libellé lisible : `2023-01` → « Janvier 2023 ».
 * `2023` seul reste « 2023 » (aucun mois inventé).
 */
export function formatPeriodFr(value: string | null | undefined): string {
  const parsed = parsePeriod(value);
  if (!parsed) return "";
  const label = parsed.month !== null ? MONTH_LABELS_FR[parsed.month - 1] : undefined;
  return label ? `${label} ${parsed.year}` : String(parsed.year);
}

/** Clé d'ordre absolue (année × 12 + mois). Un mois inconnu est traité comme janvier. */
export function periodOrderKey(value: string | null | undefined): number | null {
  const parsed = parsePeriod(value);
  if (!parsed) return null;
  return parsed.year * 12 + ((parsed.month ?? 1) - 1);
}

/** Compare deux périodes ; les valeurs inconnues se placent à la fin. */
export function comparePeriods(a: string | null | undefined, b: string | null | undefined): number {
  const keyA = periodOrderKey(a);
  const keyB = periodOrderKey(b);
  if (keyA === null && keyB === null) return 0;
  if (keyA === null) return 1;
  if (keyB === null) return -1;
  return keyA - keyB;
}

/** Segment de parcours muni d'un début, d'une fin éventuelle et d'un statut « en cours ». */
export type PeriodSpan = {
  readonly start: string | null | undefined;
  readonly end: string | null | undefined;
  readonly isCurrent?: boolean;
};

/** Clé de période pour la date courante (UTC). */
export function currentPeriodKey(now: Date = new Date()): number {
  return now.getUTCFullYear() * 12 + now.getUTCMonth();
}

/**
 * Total de mois couverts par des segments, **sans compter deux fois** les
 * mois couverts par des segments qui se chevauchent. Les segments contigus ou
 * qui se recouvrent sont fusionnés. Un segment sans début connu est ignoré.
 * Un segment « en cours » court jusqu'à `nowKey` (mois courant par défaut).
 */
export function totalMonthsCovered(
  spans: readonly PeriodSpan[],
  nowKey: number = currentPeriodKey(),
): number {
  const ranges: Array<readonly [number, number]> = [];
  for (const span of spans) {
    const startKey = periodOrderKey(span.start);
    if (startKey === null) continue;
    const endKeyRaw = span.isCurrent ? nowKey : periodOrderKey(span.end);
    // Fin inconnue mais non « en cours » : on compte un seul mois.
    const endKey = endKeyRaw === null ? startKey : endKeyRaw;
    if (endKey < startKey) continue; // incohérent : refusé en amont par la validation.
    ranges.push([startKey, endKey]);
  }
  if (ranges.length === 0) return 0;

  const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
  let total = 0;
  let [currentStart, currentEnd] = sorted[0]!;
  for (let i = 1; i < sorted.length; i += 1) {
    const range = sorted[i]!;
    if (range[0] <= currentEnd + 1) {
      if (range[1] > currentEnd) currentEnd = range[1];
    } else {
      total += currentEnd - currentStart + 1;
      currentStart = range[0];
      currentEnd = range[1];
    }
  }
  total += currentEnd - currentStart + 1;
  return total;
}

/** Ancienneté en années (arrondie à une décimale) à partir des segments. */
export function totalYearsCovered(spans: readonly PeriodSpan[], nowKey?: number): number {
  const months = totalMonthsCovered(spans, nowKey);
  return Math.round((months / 12) * 10) / 10;
}
