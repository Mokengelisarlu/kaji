import { PlaceholderPage, placeholderMetadata } from "@/components/ui/placeholder-page";

export const metadata = placeholderMetadata(
  "Contact",
  "Écrivez à l'équipe Kaji : besoins de recrutement, questions, signalements.",
);

export default function Page() {
  return (
    <PlaceholderPage
      title="Contact"
      description="Écrivez à l'équipe Kaji : besoins de recrutement, questions, signalements."
      status="Le formulaire de contact arrive avec la phase opérationnelle. Toute demande de profil se fait aujourd'hui via le CTA des fiches talents."
    />
  );
}
