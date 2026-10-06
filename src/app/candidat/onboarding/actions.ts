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
  
  if (result.status === "success" && result.talentUrl) {
    // `?profil=cree` déclenche l'accusé de réception sur la fiche
    // (`ProfileCreatedToast`) : l'action ne peut pas toaster elle-même.
    redirect(`${result.talentUrl}?profil=cree`);
  }
  
  return result;
}

export type { CandidateProfileState } from "@/lib/use-cases/candidate-profile";
