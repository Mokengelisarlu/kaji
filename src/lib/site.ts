/**
 * Constantes de marque et de navigation.
 * Kaji.com = marque publique. Mokengeli SARLU = société opératrice.
 */
export const BRAND = {
  /** Marque principale, utilisée en tête de tous les écrans. */
  name: "Kaji.com",
  shortName: "Kaji",
  tagline: "Talent & Professional Mediation Platform",
  /** Société opératrice : contexte administratif, juridique, contractuel. */
  operator: "Mokengeli SARLU",
  operatorLabel: "Operated by Mokengeli SARLU",
  domain: "kaji.com",
  /**
   * Ancien domaine. Conservé pour la traçabilité administrative uniquement,
   * jamais affiché dans l'interface publique.
   */
  legacyDomain: "jobs.mokengelisarlu.com",
  locale: "fr-FR",
} as const;

export type NavLink = {
  readonly href: string;
  readonly label: string;
  readonly description?: string;
};

export type NavSection = {
  readonly title: string;
  readonly links: readonly NavLink[];
};

export const PUBLIC_NAV: readonly NavLink[] = [
  { href: "/talents", label: "Talents" },
  { href: "/opportunites", label: "Opportunités" },
  { href: "/entreprises", label: "Entreprises" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

/** Liens du footer, regroupés par intention. */
export const FOOTER_NAV: readonly NavSection[] = [
  {
    title: "Talents",
    links: [
      { href: "/talents", label: "Annuaire des talents" },
      { href: "/candidats", label: "Créer mon profil" },
      { href: "/opportunites", label: "Opportunités" },
    ],
  },
  {
    title: "Entreprises",
    links: [
      { href: "/entreprise/inscription", label: "Créer un compte entreprise" },
      { href: "/entreprise/demandes", label: "Déposer un besoin" },
      { href: "/entreprises", label: "Confier un recrutement" },
    ],
  },
  {
    title: "Kaji",
    links: [
      { href: "/a-propos", label: "À propos" },
      { href: "/contact", label: "Nous contacter" },
      { href: "/talents", label: "Comment ça marche" },
    ],
  },
];

/** Liens légaux — mentions obligatoires, opérateur nommé explicitement. */
export const LEGAL_NAV: readonly NavLink[] = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/confidentialite", label: "Confidentialité" },
];

/** Cibles principales de conversion, partagées par le header et les sections CTA. */
export const PRIMARY_CTA = {
  employer: { href: "/entreprise/inscription", label: "Je cherche un talent" },
  candidate: { href: "/candidats", label: "Créer mon profil" },
} as const;
