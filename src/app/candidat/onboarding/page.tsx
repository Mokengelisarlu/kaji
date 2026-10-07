import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CandidateProfileForm } from "./candidate-profile-form";
import { DraftReminder } from "./draft-reminder";

export default async function CandidatOnboardingPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/connexion");
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Créer mon profil</h1>
        <p className="text-gray-600">
          Complétez votre profil pour apparaître dans le vivier de talents Kaji.
        </p>
      </div>
      <DraftReminder />
      <CandidateProfileForm />
    </div>
  );
}
