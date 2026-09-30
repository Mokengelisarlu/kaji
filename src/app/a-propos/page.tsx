import { PlaceholderPage, placeholderMetadata } from "@/components/ui/placeholder-page";

export const metadata = placeholderMetadata(
  "À propos de Kaji",
  "Une plateforme de talents et de médiation professionnelle exploitée par Mokengeli SARLU.",
);

export default function Page() {
  return (
    <PlaceholderPage
      title="À propos de Kaji"
      description="Une plateforme de talents et de médiation professionnelle exploitée par Mokengeli SARLU."
      status="La page institutionnelle est en préparation. En attendant, le fonctionnement est décrit sur la page d'accueil."
    />
  );
}
