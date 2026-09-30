import { PlaceholderPage, placeholderMetadata } from "@/components/ui/placeholder-page";

export const metadata = placeholderMetadata(
  "Entreprises",
  "Confiez votre recrutement à une équipe de médiation professionnelle.",
);

export default function Page() {
  return (
    <PlaceholderPage
      title="Entreprises"
      description="Confiez votre recrutement à une équipe de médiation professionnelle."
      status="L'espace entreprise (inscription, dépôt de besoin, suivi des demandes) arrive dans une phase ultérieure. Vous pouvez d'ores et déjà parcourir le vivier."
    />
  );
}
