import Link from "next/link";
import Image from "next/image";
import heroImage from "@/assets/Hero.jpeg";
import section2Image from "@/assets/section2.jpeg";
import card1Image from "@/assets/card1.jpeg";
import card2Image from "@/assets/card2.jpeg";
import card3Image from "@/assets/card3.jpeg";
import card4Image from "@/assets/card4.jpeg";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarCheck,
  ClipboardList,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { TalentCard } from "@/components/talent/talent-card";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { getFeaturedTalents, getTalentPoolStats } from "@/lib/use-cases/talent";
import { TALENT_CATEGORIES } from "@/lib/mock/referentials";
import { BRAND, PRIMARY_CTA } from "@/lib/site";

/* ------------------------------------------------------------------ */
/* Sections statiques                                                  */
/* ------------------------------------------------------------------ */

const TRUST_POINTS = [
  {
    Icon: ShieldCheck,
    title: "Données personnelles maîtrisées",
    description:
      "Coordonnées, documents et notes internes ne sont jamais publics. Une entreprise demande un accès, Kaji l'accorde.",
  },
  {
    Icon: BadgeCheck,
    title: "Profils vérifiés par l'équipe",
    description:
      "La vérification conditionne la publication : un profil non vérifié reste dans le vivier, mais n'est jamais mis en avant ni proposé en accès.",
  },
  {
    Icon: Briefcase,
    title: "Deux viviers distincts",
    description:
      "Talents salariés et prestataires ne sont pas mélangés : le modèle et l'accompagnement diffèrent.",
  },
  {
    Icon: Building2,
    title: "Opérateur identifié",
    description:
      `${BRAND.name} est le produit. ${BRAND.operator} est la société qui l'exploite et porte les engagements contractuels.`,
  },
] as const;

/**
 * Cycle de médiation résumé pour l'accueil (§18.2).
 *
 * Les dix étapes du cycle réel sont regroupées en quatre. Chaque ligne renvoie à
 * une étape de §18.2 : ce bloc ne raconte pas une version simplifiée du modèle,
 * il le tronque. Le détail appartient à `EC-08` et à l'espace RH.
 */
const MEDIATION_STEPS = [
  {
    Icon: ClipboardList,
    title: "Décrire le besoin",
    description: "L'entreprise dépose un besoin réel : métier, compétences, urgence, contrat.",
  },
  {
    Icon: Search,
    title: "Analyser et qualifier",
    description: "Un médiateur reformule le besoin et vérifie sa faisabilité avant toute recherche.",
  },
  {
    Icon: Scale,
    title: "Arbitrer une shortlist",
    description: "Le moteur propose, l'humain décide. Trois à cinq profils, justifiés un par un.",
  },
  {
    Icon: CalendarCheck,
    title: "Présenter et organiser",
    description: "Les profils sont présentés, les disponibilités confirmées, les entretiens planifiés.",
  },
] as const;

const CATEGORY_IMAGE_BY_SLUG: Readonly<Record<string, typeof card1Image>> = {
  informatique: card4Image,
  ingenierie: card3Image,
  gestion: card2Image,
  sante: card1Image,
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default async function HomePage() {
  const [featuredTalents, poolStats] = await Promise.all([
    getFeaturedTalents(6),
    getTalentPoolStats(),
  ]);
  const topCategories = TALENT_CATEGORIES.slice(0, 4);

  return (
    <>
      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-border overflow-hidden border-b bg-surface">
        <Container
          size="wide"
          className="grid items-center gap-4 pt-12 sm:pt-16 lg:grid-cols-2 lg:gap-8 lg:pt-20"
        >
          <div className="flex flex-col items-start gap-5 py-4 sm:gap-6 lg:py-10">
            <p className="bg-kaji-50 text-kaji-700 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-2xs font-semibold tracking-[0.12em] uppercase">
              <Sparkles aria-hidden="true" className="size-3.5" />
              Vérification · Médiation · Mise en relation
            </p>

            <h1 className="max-w-xl text-4xl sm:text-5xl lg:text-6xl">
              Votre talent mérite les bonnes opportunités.
            </h1>

            <p className="text-muted-foreground max-w-xl text-base sm:text-lg">
              {BRAND.name} rapproche les talents et les entreprises grâce à un vivier qualifié,
              des informations vérifiées et un accompagnement humain à chaque étape.
            </p>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
              <Button asChild size="lg">
                <Link href="/talents">
                  Découvrir le vivier
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href={PRIMARY_CTA.employer.href}>{PRIMARY_CTA.employer.label}</Link>
              </Button>
              <Link
                href={PRIMARY_CTA.candidate.href}
                className="text-primary hover:text-primary-hover text-sm font-medium underline underline-offset-4 sm:ml-1"
              >
                {PRIMARY_CTA.candidate.label}
              </Link>
            </div>

            <dl className="border-border text-muted-foreground mt-3 grid w-full max-w-lg grid-cols-3 gap-3 border-t pt-5 text-sm">
              <div className="flex flex-col gap-0.5">
                <dt className="sr-only">Profils publiés</dt>
                <dd className="text-foreground text-xl font-semibold">{poolStats.totalPublished}</dd>
                <dd className="text-xs">profils publiés</dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="sr-only">Profils vérifiés</dt>
                <dd className="text-foreground text-xl font-semibold">
                  {poolStats.verifiedRatio}&nbsp;%
                </dd>
                <dd className="text-xs">vérifiés par l’équipe</dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="sr-only">Profils disponibles</dt>
                <dd className="text-foreground text-xl font-semibold">
                  {poolStats.availableCount}
                </dd>
                <dd className="text-xs">disponibles maintenant</dd>
              </div>
            </dl>
          </div>

          <div className="relative mx-auto aspect-[1199/1312] w-full max-w-[29rem] self-end lg:mx-0 lg:justify-self-end">
            <Image
              src={heroImage}
              alt="Talent souriante avec un ordinateur portable"
              width={heroImage.width}
              height={heroImage.height}
              priority
              sizes="(max-width: 1024px) 90vw, 29rem"
              className="absolute inset-0 z-10 h-full w-full object-contain object-bottom"
            />
            <div className="absolute left-[6%] top-[18%] z-20 flex w-32 flex-col items-start text-left text-kaji-700">
              <span className="font-display -rotate-6 text-sm leading-tight italic sm:text-base">
                Votre avenir
                <br />
                commence ici
              </span>
              <svg
                aria-hidden="true"
                className="ml-7 mt-1 h-12 w-16 sm:h-14 sm:w-[4.5rem]"
                viewBox="0 0 100 70"
                fill="none"
              >
                <path
                  d="M12 5c0 20 10 35 29 47"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
                <path
                  d="m28 48 14 6-2-15"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Écosystème                                                        */}
      {/* ---------------------------------------------------------------- */}
      <Section spacing="md">
        <Container size="wide">
          <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
            <div className="relative aspect-[1089/976] overflow-hidden rounded-md">
              <Image
                src={section2Image}
                alt="Professionnels en situation de formation, de travail et de collaboration"
                fill
                sizes="(max-width: 1024px) 90vw, 48vw"
                className="object-cover"
              />
            </div>

            <div>
              <SectionHeading
                eyebrow="Notre plateforme"
                title="Un vivier encadré, pas une diffusion de masse"
                description="Chaque profil est vérifié, sa disponibilité confirmée, et chaque mise en relation suivie par un interlocuteur identifié."
              />
              <ul className="mt-7 divide-y divide-border">
                {[
                  ["Profils vérifiés", "Des informations qualifiées par notre équipe."],
                  ["Disponibilités confirmées", "Des mises en relation au bon moment."],
                  ["Accompagnement humain", "Un interlocuteur vous suit à chaque étape."],
                  ["Données protégées", "Vos informations restent sous votre contrôle."],
                ].map(([title, description]) => (
                  <li key={title} className="flex items-start gap-3 py-3.5">
                    <BadgeCheck aria-hidden="true" className="text-primary mt-0.5 size-5 shrink-0" />
                    <span className="flex flex-1 flex-col gap-0.5">
                      <span className="text-sm font-semibold">{title}</span>
                      <span className="text-muted-foreground text-sm">{description}</span>
                    </span>
                    <ArrowRight aria-hidden="true" className="text-subtle-foreground mt-1 size-4 shrink-0" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* Opportunités                                                      */}
      {/* ---------------------------------------------------------------- */}
      <Section spacing="md" className="bg-surface-muted">
        <Container size="wide">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(15rem,0.8fr)_minmax(0,2.2fr)] lg:gap-10">
            <div className="flex flex-col items-start gap-5">
              <SectionHeading
                eyebrow="Parcourez le vivier"
                title="Des talents, des métiers, des entreprises"
                description="Parcourez les profils du vivier par domaine et trouvez les compétences dont votre projet a besoin."
              />
              <Button asChild variant="secondary" size="sm" className="shrink-0">
                <Link href="/talents">
                  Explorer tout le vivier
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {topCategories.map((category) => (
                <li key={category.slug} className="min-w-0">
                  <Link
                    href={`/talents?category=${category.slug}`}
                    className="group border-border bg-surface hover:border-kaji-300 hover:shadow-sm flex h-full flex-col overflow-hidden rounded-md border transition-colors"
                  >
                    <span className="relative block aspect-[4/3] overflow-hidden bg-surface-muted">
                      <Image
                        src={CATEGORY_IMAGE_BY_SLUG[category.slug] ?? card1Image}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 42vw, 16vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </span>
                    <span className="flex flex-1 flex-col gap-2 p-3">
                      <span className="flex items-start justify-between gap-1">
                        <span className="text-sm leading-tight font-semibold">{category.label}</span>
                        <ArrowRight
                          aria-hidden="true"
                          className="text-subtle-foreground group-hover:text-primary size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                        />
                      </span>
                      <span className="text-muted-foreground mt-auto text-xs">{category.description}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* Comment ça marche                                                  */}
      {/* ---------------------------------------------------------------- */}
      <Section divider spacing="md">
        <Container size="wide">
          <SectionHeading
            eyebrow="Comment ça marche"
            title="Un parcours encadré, du besoin au placement"
            description="Quatre temps, un seul interlocuteur, et une décision humaine à chaque profil présenté."
          />

          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {MEDIATION_STEPS.map((step, index) => (
              <li key={step.title} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="border-border text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-full border">
                    <step.Icon aria-hidden="true" className="size-4" />
                  </span>
                  <span className="text-or-600 font-display text-sm font-semibold">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="text-base font-semibold sm:text-lg">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* Talents sélectionnés                                              */}
      {/* ---------------------------------------------------------------- */}
      {featuredTalents.length > 0 && (
        <Section divider spacing="md">
          <Container size="wide">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                eyebrow="Sélection de l'équipe"
                title="Quelques profils du vivier"
                description="Profils vérifiés, à jour, dont la disponibilité a été confirmée récemment."
              />
              <Button asChild variant="secondary" size="sm" className="shrink-0">
                <Link href="/talents">
                  Explorer le vivier
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredTalents.map((talent) => (
                <li key={talent.candidateId} className="flex">
                  <TalentCard talent={talent} className="w-full" />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Pourquoi Kaji                                                     */}
      {/* ---------------------------------------------------------------- */}
      <Section spacing="md" className="border-y border-kaji-800 bg-kaji-950 text-white">
        <Container size="wide">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-or-300 text-2xs font-semibold tracking-[0.14em] uppercase">
              Pourquoi Kaji
            </p>
            <h2 className="mt-3 text-2xl text-white sm:text-3xl">
              La technologie organise, l&apos;humain décide
            </h2>
            <p className="text-kaji-100/80 mt-3 text-base sm:text-lg">
              Un vivier structuré, des règles explicites, et une équipe qui assume la décision de
              présenter — ou non — un profil.
            </p>
          </div>

          <div className="mt-10 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div
              aria-hidden="true"
              className="relative mx-auto aspect-square w-full max-w-[30rem]"
            >
              <div className="absolute inset-[9%] rounded-full border border-kaji-700/70" />

              <span className="absolute left-1/2 top-[22%] h-[11%] -translate-x-1/2 border-l-2 border-dashed border-kaji-400/80" />
              <span className="absolute left-[19%] top-1/2 w-[12%] -translate-y-1/2 border-t-2 border-dashed border-kaji-400/80" />
              <span className="absolute left-[64%] top-[42%] w-[19%] origin-left -rotate-[27deg] border-t-2 border-dashed border-kaji-400/80" />
              <span className="absolute left-[63%] top-[59%] w-[18%] origin-left rotate-[31deg] border-t-2 border-dashed border-kaji-400/80" />

              <div className="absolute left-1/2 top-[9%] flex -translate-x-1/2 flex-col items-center gap-1.5">
                <span className="flex size-16 items-center justify-center rounded-full border-2 border-or-400 bg-kaji-900 text-or-300 shadow-md sm:size-[4.5rem]">
                  <Sparkles className="size-6" />
                </span>
                <span className="text-xs font-semibold text-kaji-100">Kaji</span>
              </div>

              <div className="absolute left-[5%] top-[41%] flex flex-col items-center gap-1.5">
                <span className="flex size-16 items-center justify-center rounded-full border-2 border-kaji-500 bg-kaji-900 text-kaji-100 shadow-md sm:size-[4.5rem]">
                  <ShieldCheck className="size-6" />
                </span>
                <span className="text-xs font-medium text-kaji-100">Données</span>
              </div>

              <div className="absolute right-[8%] top-[24%] flex flex-col items-center gap-1.5">
                <span className="flex size-16 items-center justify-center rounded-full border-2 border-kaji-500 bg-kaji-900 text-kaji-100 shadow-md sm:size-[4.5rem]">
                  <Building2 className="size-6" />
                </span>
                <span className="text-xs font-medium text-kaji-100">Entreprises</span>
              </div>

              <div className="absolute bottom-[16%] right-[16%] flex flex-col items-center gap-1.5">
                <span className="flex size-16 items-center justify-center rounded-full border-2 border-or-400 bg-kaji-900 text-or-300 shadow-md sm:size-[4.5rem]">
                  <BadgeCheck className="size-6" />
                </span>
                <span className="text-xs font-medium text-kaji-100">Profils vérifiés</span>
              </div>

              <div className="absolute left-1/2 top-1/2 size-[38%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-4 border-kaji-500 bg-kaji-900 p-1.5 shadow-lg shadow-kaji-950/60">
                <Image
                  src={card1Image}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 38vw, 12rem"
                  className="rounded-full object-cover"
                />
              </div>
            </div>

            <ul className="divide-y divide-kaji-700/70">
              {TRUST_POINTS.map((point) => (
                <li key={point.title} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-kaji-700 bg-kaji-900 text-or-300">
                    <point.Icon aria-hidden="true" className="size-5" />
                  </span>
                  <span className="flex flex-col gap-1.5">
                    <h3 className="text-base font-semibold text-white sm:text-lg">
                      {point.title}
                    </h3>
                    <p className="text-kaji-100/75 text-sm leading-relaxed">
                      {point.description}
                    </p>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

    </>
  );
}
