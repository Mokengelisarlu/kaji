"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
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
  const { userId } = await auth();
  if (!userId) {
    redirect("/connexion");
  }

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
  const { userId } = await auth();
  if (!userId) {
    redirect("/connexion");
  }

  await deleteCandidateProfileForUser(userId);
  redirect("/candidat/onboarding?profil=supprime");
}

export type { CandidateProfileState } from "@/lib/use-cases/candidate-profile";