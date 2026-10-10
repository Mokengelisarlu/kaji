"use server";

import { redirect } from "next/navigation";
import { requirePermission, requireSession } from "@/lib/auth/guard";
import { ACTION, RESOURCE } from "@/lib/domain/permissions";
import {
  deleteCandidateProfileForUser,
  evaluateCandidateProfileUpdate,
  getCandidateProfileForUser,
  type CandidateProfileState,
} from "@/lib/use-cases/candidate-profile";

export async function updateCandidateProfile(
  _previous: CandidateProfileState,
  formData: FormData,
): Promise<CandidateProfileState> {
  const { userId } = await requirePermission(ACTION.UPDATE, RESOURCE.CANDIDATE_PROFILE);

  const profile = await getCandidateProfileForUser(userId);
  if (!profile) {
    redirect("/candidat/onboarding");
  }

  const result = await evaluateCandidateProfileUpdate(formData, profile.candidateId, userId);

  if (result.status === "success") {
    // Retour au tableau de bord : il affiche le profil à jour (`?profil=mis-a-jour`).
    redirect("/candidat/dashboard?profil=mis-a-jour");
  }

  return result;
}

export async function deleteCandidateProfile(): Promise<void> {
  // Le retrait d'une fiche n'est pas un `DELETE` de la matrice (§20) : le
  // candidat ne dispose que de `R/U` sur son profil. L'identité et
  // l'appartenance sont vérifiées ici et dans le repository ; la transition
  // vers un statut archivé relève d'un futur workflow.
  const { userId } = await requireSession();

  await deleteCandidateProfileForUser(userId);
  redirect("/candidat/onboarding?profil=supprime");
}

export type { CandidateProfileState } from "@/lib/use-cases/candidate-profile";