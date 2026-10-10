"use server";

import { redirect } from "next/navigation";

import {
  EMPLOYER_DASHBOARD_PATH,
  requireEmployerAccess,
  setEmployerRole,
} from "@/lib/auth/employer";
import {
  evaluateCompanySubmission,
  type CompanyFormState,
} from "@/lib/use-cases/company";

/**
 * Enregistrement des informations entreprise.
 *
 * La barrière `requireEmployerAccess` est la même que celle de la page : un
 * compte déjà candidat ne peut pas atteindre cette action. Le rôle employeur
 * n'est attribué qu'après un dépôt réussi — jamais avant, jamais depuis le
 * client (§20).
 */
export async function submitCompany(
  _previous: CompanyFormState,
  formData: FormData,
): Promise<CompanyFormState> {
  const { userId } = await requireEmployerAccess();

  const result = await evaluateCompanySubmission(formData, userId);

  if (result.status === "success") {
    await setEmployerRole(userId);
    redirect(`${EMPLOYER_DASHBOARD_PATH}?enregistre=1`);
  }

  return result;
}

export type { CompanyFormState } from "@/lib/use-cases/company";
