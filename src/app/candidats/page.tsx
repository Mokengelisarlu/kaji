import { PlaceholderPage, placeholderMetadata } from "@/components/ui/placeholder-page";

export const metadata = placeholderMetadata(
  "Créer mon profil",
  "Construisez votre présence professionnelle dans le vivier Kaji.",
);

export default function Page() {
  return (
    <PlaceholderPage
      title="Créer mon profil"
      description="Construisez votre présence professionnelle dans le vivier Kaji."
      status="La création de profil et l'espace candidat sont en cours. L'inscription sera possible prochainement ; le vivier, lui, est déjà consultable."
    />
  );
}
