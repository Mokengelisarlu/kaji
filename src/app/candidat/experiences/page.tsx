import Link from "next/link";
import { requireSession } from "@/lib/auth/guard";

export default async function CandidatPage() {
  await requireSession();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link href="/candidat/dashboard" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
          ← Retour au tableau de bord
        </Link>
        <h1 className="text-3xl font-bold">Page en construction</h1>
        <p className="text-gray-600 mt-2">
          Cette section sera complétée prochainement.
        </p>
      </div>
    </div>
  );
}
