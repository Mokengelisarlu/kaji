import { PlaceholderPage, placeholderMetadata } from "@/components/ui/placeholder-page";

export const metadata = placeholderMetadata(
  "Mes demandes de recrutement",
  "Suivez vos demandes, shortlists, entretiens et recrutements depuis un espace unique.",
);

export default function Page() {
  return (
    <PlaceholderPage
      title="Mes demandes de recrutement"
      description="Suivez vos demandes, shortlists, entretiens et recrutements depuis un espace unique."
      status="Le suivi des demandes est lié au workflow de recrutement, en cours de construction."
    />
  );
}
