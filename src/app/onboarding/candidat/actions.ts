"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
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
  const user = await currentUser();
  const email =
    user?.emailAddresses.find((address) => address.id === user.primaryEmailAddressId)?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress;

  const result = await evaluateCandidateProfileSubmission(formData, userId ?? undefined, email);
  
  if (result.status === "success" && result.talentUrl) {
    // `?profil=cree` déclenche l'accusé de réception sur la fiche
    // (`ProfileCreatedToast`) : l'action ne peut pas toaster elle-même.
    redirect(`${result.talentUrl}?profil=cree`);
  }
  
  return result;
}

export type { CandidateProfileState } from "@/lib/use-cases/candidate-profile";
