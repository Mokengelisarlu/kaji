import type { TalentRepository } from "./talent-repository";
import { MockTalentRepository } from "./mock-talent-repository";

/**
 * Point de bascule unique entre les sources de données.
 *
 * Tant que `lib/repositories/drizzle-talent-repository.ts` n'existe pas, le
 * MVP public s'appuie sur le vivier de démonstration. Le jour du branchement
 * PostgreSQL, seule la ligne ci-dessous change :
 *
 * ```ts
 * export const talentRepository: TalentRepository = new DrizzleTalentRepository(db);
 * ```
 *
 * Aucune page, aucun composant, aucun use case n'importe une autre source.
 */
export const talentRepository: TalentRepository = new MockTalentRepository();

export type { TalentRepository };
export { MockTalentRepository } from "./mock-talent-repository";
