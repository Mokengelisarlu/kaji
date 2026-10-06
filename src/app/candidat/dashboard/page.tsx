import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function CandidatDashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/connexion");
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tableau de bord</h1>
        <p className="text-gray-600">
          Gérez votre profil et suivez votre progression.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/candidat/profil" className="rounded-lg border p-6 hover:bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">Profil</h2>
          <p className="text-gray-600">Identité, résumé et métier</p>
        </Link>
        <Link href="/candidat/experiences" className="rounded-lg border p-6 hover:bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">Expériences</h2>
          <p className="text-gray-600">Gérez vos expériences professionnelles</p>
        </Link>
        <Link href="/candidat/formations" className="rounded-lg border p-6 hover:bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">Formations</h2>
          <p className="text-gray-600">Gérez vos diplômes et formations</p>
        </Link>
        <Link href="/candidat/competences" className="rounded-lg border p-6 hover:bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">Compétences</h2>
          <p className="text-gray-600">Compétences, langues et certifications</p>
        </Link>
        <Link href="/candidat/documents" className="rounded-lg border p-6 hover:bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">Documents</h2>
          <p className="text-gray-600">Gérez vos documents</p>
        </Link>
        <Link href="/candidat/parametres" className="rounded-lg border p-6 hover:bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">Paramètres</h2>
          <p className="text-gray-600">Disponibilité, visibilité et compte</p>
        </Link>
      </div>
    </div>
  );
}
