import { PlaceholderPage, placeholderMetadata } from "@/components/ui/placeholder-page";

export const metadata = placeholderMetadata(
  "Politique de confidentialité",
  "Comment Kaji traite les données personnelles des candidats.",
);

export default function Page() {
  return (
    <PlaceholderPage
      title="Politique de confidentialité"
      description="Comment Kaji traite les données personnelles des candidats."
      status="La politique de confidentialité sera publiée et validée avant l'ouverture des comptes."
    />
  );
}
