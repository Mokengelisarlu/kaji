/**
 * Référentiels de l'annuaire public.
 *
 * ⚠️ DONNÉES FICTIVES (§44). Ces référentiels servent à valider l'UX et
 * l'architecture. Ils ne doivent jamais être présentés comme des personnes
 * réelles. Les remplacer par les tables `talent_category`, `talent_domain`
 * et `location` lors du branchement PostgreSQL.
 */

import type { Location, TalentCategory, TalentDomain } from "@/lib/domain/talent";

export const TALENT_CATEGORIES: readonly TalentCategory[] = [
  {
    slug: "informatique",
    label: "Informatique & Tech",
    description: "Développement, infrastructure, data, cybersécurité et support.",
    count: 148,
  },
  {
    slug: "ingenierie",
    label: "Ingénierie & Technique",
    description: "Génie civil, électrique, mécanique, industrielle et maintenance.",
    count: 96,
  },
  {
    slug: "gestion",
    label: "Gestion & Administration",
    description: "Comptabilité, achats, RH, logistique et administration des ventes.",
    count: 121,
  },
  {
    slug: "sante",
    label: "Santé & Bien-être",
    description: "Infirmier, médecin, pharmacien, sage-femme et personnel soignant.",
    count: 64,
  },
  {
    slug: "education",
    label: "Éducation & Formation",
    description: "Enseignement, recherche, formation professionnelle etustain.",
    count: 58,
  },
  {
    slug: "commerce",
    label: "Commerce & Relation client",
    description: "Vente, marketing, relation client, import-export et distribution.",
    count: 103,
  },
  {
    slug: "artisanat",
    label: "Artisanat & Services",
    description: "Construction, couture, coiffure, restauration et maintenance.",
    count: 77,
  },
  {
    slug: "agriculture",
    label: "Agriculture & Agro",
    description: "Agronomie, élevage, transformation et sécurité alimentaire.",
    count: 42,
  },
] as const;

export const TALENT_DOMAINS: readonly TalentDomain[] = [
  { slug: "technologie", label: "Technologie" },
  { slug: "energie", label: "Énergie" },
  { slug: "batiment", label: "Bâtiment & Construction" },
  { slug: "finance", label: "Finance & Assurance" },
  { slug: "sante-privee", label: "Santé privée" },
  { slug: "industrie", label: "Industrie" },
  { slug: "agroalimentaire", label: "Agroalimentaire" },
  { slug: "retail", label: "Commerce de détail" },
  { slug: "logistique", label: "Logistique & Transport" },
  { slug: "hotellerie", label: "Hôtellerie & Tourisme" },
  { slug: "ONG", label: "ONG & International" },
] as const;

export const LOCATIONS: readonly Location[] = [
  { citySlug: "kinshasa", city: "Kinshasa", country: "RDC", isRemoteEligible: true },
  { citySlug: "lubumbashi", city: "Lubumbashi", country: "RDC", isRemoteEligible: false },
  { citySlug: "goma", city: "Goma", country: "RDC", isRemoteEligible: false },
  { citySlug: "mbuji-mayi", city: "Mbuji-Mayi", country: "RDC", isRemoteEligible: false },
  { citySlug: "douala", city: "Douala", country: "Cameroun", isRemoteEligible: true },
  { citySlug: "yaounde", city: "Yaoundé", country: "Cameroun", isRemoteEligible: false },
  { citySlug: "abidjan", city: "Abidjan", country: "Côte d'Ivoire", isRemoteEligible: true },
  { citySlug: "dakar", city: "Dakar", country: "Sénégal", isRemoteEligible: true },
  { citySlug: "brazzaville", city: "Brazzaville", country: "Congo", isRemoteEligible: false },
  { citySlug: "kinshasa-province", city: "Province de Kinshasa", country: "RDC", isRemoteEligible: true },
] as const;

export const CATEGORY_BY_SLUG: ReadonlyMap<string, TalentCategory> = new Map(
  TALENT_CATEGORIES.map((category) => [category.slug, category]),
);

export const DOMAIN_BY_SLUG: ReadonlyMap<string, TalentDomain> = new Map(
  TALENT_DOMAINS.map((domain) => [domain.slug, domain]),
);

export const LOCATION_BY_SLUG: ReadonlyMap<string, Location> = new Map(
  LOCATIONS.map((location) => [location.citySlug, location]),
);
