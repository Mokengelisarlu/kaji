import { PlaceholderPage, placeholderMetadata } from "@/components/ui/placeholder-page";

export const metadata = placeholderMetadata(
  "Opportunités",
  "Les offres et missions publiées par notre équipe après vérification du besoin.",
);

export default function Page() {
  return (
    <PlaceholderPage
      title="Opportunités"
      description="Les offres et missions publiées par notre équipe après vérification du besoin."
      status="La publication des opportunités arrive avec le workflow de recrutement (demandes, matching, shortlists). L'annuaire des talents est dès à présent consultable."
    />
  );
}
