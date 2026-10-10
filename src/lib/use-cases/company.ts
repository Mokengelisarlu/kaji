import {
  getCompanyByOwner,
  upsertCompanyForOwner,
  type Company,
} from "@/lib/repositories/company-repository";
import { companySchema } from "@/lib/validation/company";

/**
 * Use case « informations entreprise » (`EC-09`).
 *
 * Le composant serveur ne valide rien lui-même : il délègue à ce module, seul
 * point qui connaît à la fois le schéma et le dépôt. La forme du retour suit
 * celle de `CandidateProfileState` pour que les formulaires partagent la même
 * convention d'erreurs.
 */
export type CompanyFormState = {
  readonly status: "idle" | "success" | "error" | "invalid";
  readonly errors: Record<string, string[]>;
  readonly message?: string;
};

function errorsFromZod(
  issues: ReadonlyArray<{ path: ReadonlyArray<string | number | symbol>; message: string }>,
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = issue.path.map((part) => String(part)).join(".") || "form";
    const existing = errors[key];
    if (existing) {
      existing.push(issue.message);
    } else {
      errors[key] = [issue.message];
    }
  }
  return errors;
}

function read(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function getCompanyForUser(clerkUserId: string): Promise<Company | null> {
  return getCompanyByOwner(clerkUserId);
}

export async function evaluateCompanySubmission(
  formData: FormData,
  clerkUserId: string,
): Promise<CompanyFormState> {
  const parsed = companySchema.safeParse({
    name: read(formData, "name"),
    legalName: read(formData, "legalName"),
    sector: read(formData, "sector"),
    size: read(formData, "size"),
    city: read(formData, "city"),
    country: read(formData, "country"),
    website: read(formData, "website"),
    contactName: read(formData, "contactName"),
    contactEmail: read(formData, "contactEmail"),
    contactPhone: read(formData, "contactPhone"),
    description: read(formData, "description"),
  });

  if (!parsed.success) {
    return { status: "invalid", errors: errorsFromZod(parsed.error.issues) };
  }

  try {
    await upsertCompanyForOwner(clerkUserId, parsed.data);
    return {
      status: "success",
      errors: {},
      message: "Votre entreprise a bien été enregistrée. L'équipe Kaji la vérifie avant toute mise en relation.",
    };
  } catch {
    return {
      status: "error",
      errors: {},
      message: "L'enregistrement a échoué. Réessayez dans un instant.",
    };
  }
}
