"use server";

import { auth } from "@clerk/nextjs/server";
import {
  evaluateCandidateProfileSubmission,
  type CandidateProfileState,
} from "@/lib/use-cases/candidate-profile";
import { redirect } from "next/navigation";

export async function submitCandidateProfile(
  _previous: CandidateProfileState,
  formData: FormData,
): Promise<CandidateProfileState> {
  const { userId } = await auth();
  
  const result = await evaluateCandidateProfileSubmission(formData, userId ?? undefined);
  
  if (result.status === "success") {
    // Retour au tableau de bord : il affiche le profil fraîchement créé.
    // `?profil=cree` déclenche l'accusé de réception (`ProfileCreatedToast`) :
    // l'action ne peut pas toaster elle-même.
    redirect("/candidat/dashboard?profil=cree");
  }
  
  return result;
}

export type { CandidateProfileState } from "@/lib/use-cases/candidate-profile";
