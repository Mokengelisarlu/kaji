import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DOMAIN_BY_SLUG } from "@/lib/mock/referentials";
import { getCandidateProfileForUser } from "@/lib/use-cases/candidate-profile";
import { DeleteProfileForm } from "./delete-profile-form";
import { EditProfileForm } from "./edit-profile-form";

export default async function CandidatProfilPage({ searchParams }: PageProps<"/candidat/profil">) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/connexion");
  }

  const profile = await getCandidateProfileForUser(userId);
  if (!profile) {
    redirect("/candidat/onboarding");
  }

  const { profil } = await searchParams;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link href="/candidat/dashboard" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
          ← Retour au tableau de bord
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Mon profil</h1>
            <p className="text-gray-600 mt-2">
              Modifiez les informations diffusées dans votre fiche publique.
            </p>
          </div>
          <Button asChild variant="secondary" size="sm">
            <Link href={`/talents/${profile.candidateId}`}>Voir ma fiche publique</Link>
          </Button>
        </div>
      </div>

      {profil === "erreur" && (
        <Alert tone="danger" title="Suppression annulée" className="mb-6">
          La suppression du profil a été annulée. Aucune donnée n&apos;a été modifiée.
        </Alert>
      )}

      <EditProfileForm
        initial={{
          fullName: profile.fullName,
          headline: profile.headline,
          categoryLabel: profile.categoryLabel,
          domainLabels: profile.domainSlugs
            .map((slug) => DOMAIN_BY_SLUG.get(slug)?.label ?? slug)
            .join(", "),
          city: profile.location.city,
          country: profile.location.country,
          isRemoteEligible: profile.location.isRemoteEligible,
          yearsOfExperience: profile.yearsOfExperience,
          summary: profile.summary,
          declaredAvailability: profile.declaredAvailability,
          desiredContractTypes: profile.desiredContractTypes,
          profileVisibility: profile.profileVisibility,
          skills: profile.skills.map(({ label, level, yearsOfPractice }) => ({
            label,
            level,
            yearsOfPractice: Number.isFinite(yearsOfPractice) ? String(yearsOfPractice) : "",
          })),
          languages: profile.languages.map(({ code, level }) => ({ code, level })),
        }}
      />

      <section className="mt-12 rounded-lg border border-red-200 p-6">
        <h2 className="text-lg font-semibold text-red-800">Zone sensible</h2>
        <p className="text-gray-600 text-sm mt-1 mb-4">
          Supprimer votre profil le retire définitivement du vivier Kaji. Les demandes déjà
          transmises à des entreprises ne sont pas affectées.
        </p>
        <DeleteProfileForm />
      </section>
    </div>
  );
}