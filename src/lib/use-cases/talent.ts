import type {
  PaginatedTalents,
  PublicTalent,
  PublicTalentProfile,
  TalentDirectoryFacets,
  TalentFilters,
} from "@/lib/domain/talent";
import { EFFECTIVE_AVAILABILITY } from "@/lib/domain/enums";
import { talentRepository } from "@/lib/repositories";

/**
 * Use cases publics de l'annuaire des talents (§30, couche Application).
 *
 * Rôle : orchestrer, valider, composer des DTO. Aucune logique de
 * présentation ici, aucune requête SQL ici. Ces fonctions sont la seule
 * surface que les pages consomment.
 */

export type TalentDirectoryResult = {
  readonly talents: PaginatedTalents;
  readonly facets: TalentDirectoryFacets;
  /** Messages d'avertissement issus de la validation des filtres. */
  readonly filterIssues: readonly string[];
};

export type TalentDirectoryQuery = {
  readonly filters: TalentFilters;
  readonly filterIssues?: readonly string[];
};

export async function browseTalentDirectory(
  query: TalentDirectoryQuery,
): Promise<TalentDirectoryResult> {
  const { filters, filterIssues = [] } = query;

  const [talents, facets] = await Promise.all([
    talentRepository.list(filters),
    talentRepository.getDirectoryFacets(),
  ]);

  return { talents, facets, filterIssues };
}

export async function getTalentProfile(
  candidateId: string,
): Promise<PublicTalentProfile | null> {
  return talentRepository.findPublishedProfileById(candidateId);
}

/**
 * Chiffres du vivier affichés en page d'accueil.
 *
 * Ces valeurs sont **calculées** à partir du vivier réel et jamais écrites en
 * dur : un chiffre en dur sur une page publique est une promesse que le code ne
 * peut pas tenir, et il devient faux en silence dès que la base change.
 *
 * Aucun délai de shortlist n'est exposé ici. Le seul engagement de service
 * publié est « 48 h ouvrées » pour une demande de profil (§16.2) ; tout autre
 * délai affiché contredirait cet engagement.
 */
export type TalentPoolStats = {
  /** Profils publiés, tous statuts de disponibilité confondus. */
  readonly totalPublished: number;
  /** Profils publiés dont la vérification est établie. */
  readonly verifiedCount: number;
  /** Profils publiés réellement disponibles ou ouverts aux opportunités. */
  readonly availableCount: number;
  /** Part vérifiée, en pourcentage entier arrondi. 0 si le vivier est vide. */
  readonly verifiedRatio: number;
};

export async function getTalentPoolStats(): Promise<TalentPoolStats> {
  const { totalPublished, verifiedCount, availableCount } =
    await talentRepository.getDirectoryFacets();

  return {
    totalPublished,
    verifiedCount,
    availableCount,
    verifiedRatio: totalPublished === 0 ? 0 : Math.round((verifiedCount / totalPublished) * 100),
  };
}

/**
 * Talents mis en avant sur la page d'accueil.
 *
 * Sélection : profils vérifiés, dans un vivier actif, triés par ancienneté
 * pour mettre en avant l'expérience. L'interpolation sur la « qualité » d'une
 * personne est exclue par construction.
 */
export async function getFeaturedTalents(limit: number): Promise<readonly PublicTalent[]> {
  const result = await talentRepository.list({
    query: "",
    categorySlugs: [],
    domainSlugs: [],
    citySlugs: [],
    experience: [0, 50],
    skillLabels: [],
    languageCodes: [],
    availabilities: [],
    contractTypes: [],
    verifiedOnly: true,
    poolKinds: [],
    sort: "experience_desc",
    page: 1,
    pageSize: limit,
  });

  return result.items.filter((talent) => talent.availability !== EFFECTIVE_AVAILABILITY.UNAVAILABLE);
}
