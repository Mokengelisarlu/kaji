import { PlaceholderPage, placeholderMetadata } from "@/components/ui/placeholder-page";

export const metadata = placeholderMetadata(
  "Mentions légales",
  "Éditeur, hébergeur et conditions d'utilisation de Kaji.com.",
);

export default function Page() {
  return (
    <PlaceholderPage
      title="Mentions légales"
      description="Éditeur, hébergeur et conditions d'utilisation de Kaji.com."
      status="Les mentions légales complètes seront publiées avant la mise en production du service."
    />
  );
}
