"use server";

import { currentUser } from "@clerk/nextjs/server";
import { requireSession } from "@/lib/auth/guard";
import {
  evaluateCandidateProfileSubmission,
  type CandidateProfileState,
} from "@/lib/use-cases/candidate-profile";
import { redirect } from "next/navigation";

export async function submitCandidateProfile(
  _previous: CandidateProfileState,
  formData: FormData,
): Promise<CandidateProfileState> {
  const { userId } = await requireSession();
  const user = await currentUser();
  const email =
    user?.emailAddresses.find((address) => address.id === user.primaryEmailAddressId)?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress;

  const result = await evaluateCandidateProfileSubmission(formData, userId, email);
  
  if (result.status === "success") {
    // Retour au tableau de bord : il affiche le profil fraîchement créé.
    // `?profil=cree` déclenche l'accusé de réception (`ProfileCreatedToast`) :
    // l'action ne peut pas toaster elle-même.
    redirect("/candidat/dashboard?profil=cree");
  }
  
  return result;
}

export type { CandidateProfileState } from "@/lib/use-cases/candidate-profile";
