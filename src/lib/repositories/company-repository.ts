import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { companies } from "@/lib/db/schema";
import type { CompanySize } from "@/lib/domain/enums";
import type { CompanySubmissionInput } from "@/lib/validation/company";

/**
 * Entreprise persistée, telle que lue par les écrans authentifiés.
 *
 * Aucun champ n'est exposé publiquement : ce type ne franchit jamais la
 * frontière du rendu serveur côté visiteur.
 */
export type Company = {
  readonly id: string;
  readonly ownerClerkUserId: string;
  readonly name: string;
  readonly legalName?: string;
  readonly sector: string;
  readonly size: CompanySize;
  readonly city: string;
  readonly country: string;
  readonly website?: string;
  readonly contactName: string;
  readonly contactEmail: string;
  readonly contactPhone?: string;
  readonly description: string;
  readonly isVerified: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type CompanyRow = typeof companies.$inferSelect;

function toCompany(row: CompanyRow): Company {
  return {
    id: row.id,
    ownerClerkUserId: row.ownerClerkUserId,
    name: row.name,
    legalName: row.legalName ?? undefined,
    sector: row.sector,
    size: row.size as CompanySize,
    city: row.city,
    country: row.country,
    website: row.website ?? undefined,
    contactName: row.contactName,
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone ?? undefined,
    description: row.description,
    isVerified: row.isVerified,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getCompanyByOwner(clerkUserId: string): Promise<Company | null> {
  const row = await db.query.companies.findFirst({
    where: eq(companies.ownerClerkUserId, clerkUserId),
  });
  return row ? toCompany(row) : null;
}

/**
 * Crée ou met à jour l'entreprise du titulaire.
 *
 * L'unicité porte sur `owner_clerk_user_id` : un compte employeur possède au
 * plus une entreprise, et le `onConflict` garantit qu'un second envoi du
 * formulaire met à jour la fiche au lieu d'en créer une seconde. Le champ
 * `isVerified` n'est jamais réécrit ici : seule l'équipe le modifie.
 */
export async function upsertCompanyForOwner(
  clerkUserId: string,
  input: CompanySubmissionInput,
): Promise<Company> {
  const now = new Date();
  const values = {
    ownerClerkUserId: clerkUserId,
    name: input.name,
    legalName: input.legalName,
    sector: input.sector,
    size: input.size,
    city: input.city,
    country: input.country,
    website: input.website,
    contactName: input.contactName,
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone,
    description: input.description,
    updatedAt: now,
  };

  const rows = await db
    .insert(companies)
    .values({ ...values, createdAt: now })
    .onConflictDoUpdate({ target: companies.ownerClerkUserId, set: values })
    .returning();

  const row = rows[0];
  if (!row) {
    throw new Error("Failed to upsert company");
  }
  return toCompany(row);
}
