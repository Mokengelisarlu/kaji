/**
 * Nom de personne — composition et normalisation.
 *
 * Règle métier : le nom affichable suit l'ordre « Nom Postnom Prénom ».
 *
 * - Le **postnom** est facultatif. Lorsqu'il est absent, il n'est pas
 *   silencieusement remplacé par une chaîne vide : il est simplement omis de
 *   l'assemblage. Une personne sans postnom n'est jamais forcée d'en inventer un.
 * - La normalisation retire les espaces superflus mais **préserve** les accents,
 *   les apostrophes, les traits d'union et la casse saisie.
 * - Aucune donnée inconnue n'est transformée en donnée déclarée : un champ
 *   manquant ne devient jamais une valeur.
 */

/** Les trois composantes explicites d'un nom de personne. */
export type PersonName = {
  readonly lastName: string;
  readonly postName?: string | null;
  readonly firstName: string;
};

/**
 * Normalise une partie de nom : retire les espaces de début et de fin et
 * réduit les espaces internes multiples à un seul. Accents, apostrophes,
 * traits d'union et casse sont conservés.
 */
export function normalizeNamePart(value: string | null | undefined): string {
  if (!value) return "";
  return value.trim().replace(/\s+/g, " ");
}

/** `true` si un postnom est réellement renseigné (non vide après normalisation). */
export function hasPostName(parts: Pick<PersonName, "postName">): boolean {
  return normalizeNamePart(parts.postName).length > 0;
}

/**
 * Assemble le nom affichable dans l'ordre « Nom Postnom Prénom ».
 * Les parties vides sont omises, jamais remplacées par des espaces.
 */
export function composeFullName(parts: PersonName): string {
  return [parts.lastName, parts.postName, parts.firstName]
    .map(normalizeNamePart)
    .filter((part) => part.length > 0)
    .join(" ");
}

/** Profil portant éventuellement un nom structuré et/ou une valeur historique. */
export type NamedProfile = {
  readonly fullName: string;
  readonly lastName?: string | null;
  readonly postName?: string | null;
  readonly firstName?: string | null;
};

/** `true` si le profil possède les deux parties minimales (nom + prénom). */
export function hasStructuredName(profile: NamedProfile): boolean {
  return (
    normalizeNamePart(profile.lastName).length > 0 &&
    normalizeNamePart(profile.firstName).length > 0
  );
}

/**
 * Nom affichable d'un profil : privilégie les trois parties explicites
 * (Nom/Postnom/Prénom) lorsqu'elles sont connues ; sinon retombe sur la valeur
 * historique `fullName` (profils migrés, jamais réécrits d'office).
 */
export function resolveDisplayName(profile: NamedProfile): string {
  if (hasStructuredName(profile)) {
    return composeFullName({
      lastName: profile.lastName ?? "",
      postName: profile.postName,
      firstName: profile.firstName ?? "",
    });
  }
  return normalizeNamePart(profile.fullName);
}
