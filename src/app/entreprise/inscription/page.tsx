import { PlaceholderPage, placeholderMetadata } from "@/components/ui/placeholder-page";

export const metadata = placeholderMetadata(
  "Créer un compte entreprise",
  "Déclarez votre entreprise, faites-la vérifier, puis déposez votre premier besoin de recrutement.",
);

export default function Page() {
  return (
    <PlaceholderPage
      title="Créer un compte entreprise"
      description="Déclarez votre entreprise, faites-la vérifier, puis déposez votre premier besoin de recrutement."
      status="L'espace entreprise arrive dans une phase ultérieure. En attendant, parcourez le vivier pour découvrir la profondeur des profils que nous constituons."
    />
  );
}
