import type { TalentRepository } from "./talent-repository";
import { DrizzleTalentRepository } from "./drizzle/drizzle-talent-repository";

/**
 * Point de bascule unique entre les sources de données.
 *
 * Le MVP public s'appuie sur PostgreSQL via Drizzle. Aucune page, aucun
 * composant, aucun use case n'importe une autre source : il suffit de changer
 * cette ligne pour revenir au vivier de démonstration.
 */
export const talentRepository: TalentRepository = new DrizzleTalentRepository();

export type { TalentRepository };
export { MockTalentRepository } from "./mock-talent-repository";