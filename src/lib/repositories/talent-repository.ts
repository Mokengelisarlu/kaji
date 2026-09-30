import type {
  PaginatedTalents,
  PublicTalent,
  PublicTalentProfile,
  TalentDirectoryFacets,
  TalentFilters,
} from "@/lib/domain/talent";

/**
 * Interface d'accès aux talents (§30, couche Data Access).
 *
 * Le MVP public est alimenté par `lib/repositories/mock-talent-repository.ts`.
 * Le passage à Drizzle/PostgreSQL consiste à fournir une seconde implémentation
 * de cette interface et à changer une seule ligne dans
 * `lib/repositories/index.ts`. Aucun composant, aucun use case, aucune page
 * n'est impacté.
 *
 * Contrat implicite de sécurité : toute implémentation ne doit exposer que des
 * `PublicTalent`. Les données privées d'un candidat n'ont pas à exposer de
 * méthode ici.
 */
export interface TalentRepository {
  /** Liste paginée et filtrée. `filters` doit être déjà validé. */
  list(filters: TalentFilters): Promise<PaginatedTalents>;

  /**
   * Fiche publique d'un talent.
   * Retourne `null` si le candidat n'existe pas ou si sa fiche n'est pas
   * publiable (profil `ON_REQUEST`, `PRIVATE`, ou candidat archivé).
   */
  findPublishedById(candidateId: string): Promise<PublicTalent | null>;

  /**
   * Fiche publique complète, parcours inclus.
   *
   * C'est la **seule** voie d'accès à l'expérience, à la formation et aux
   * certifications depuis une page. Elle renvoie un `PublicTalentProfile`,
   * c'est-à-dire une projection vérifiée : aucune implémentation ne doit
   *exposer un enregistrement interne (`MockTalentRecord`, ligne SQL) à ce niveau,
   * sinon la confidentialité devient dépendante de la discipline de chaque
   * page plutôt que du type.
   */
  findPublishedProfileById(candidateId: string): Promise<PublicTalentProfile | null>;

  /** Facettes de filtrage (catégories, domaines, villes, compétences, langues). */
  getDirectoryFacets(): Promise<TalentDirectoryFacets>;
}
