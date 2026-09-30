import Link from "next/link";
import { BadgeCheck, Briefcase, MapPin } from "lucide-react";

import { AvailabilityBadge } from "@/components/talent/availability-badge";
import { LanguageBadge } from "@/components/talent/language-badge";
import { SkillBadge } from "@/components/talent/skill-badge";
import { Badge } from "@/components/ui/badge";
import type { PublicTalent } from "@/lib/domain/talent";
import { POOL_KIND, POOL_KIND_LABEL } from "@/lib/domain/enums";
import { cn } from "@/lib/utils";

const MAX_VISIBLE_SKILLS = 4;

function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

/**
 * Carte talent de l'annuaire (§40).
 *
 * La carte entière est cliquable via un unique lien sur le titre : imbriquer
 * plusieurs liens dans une carte produit une navigation clavier ambiguë.
 */
export function TalentCard({
  talent,
  className,
}: {
  talent: PublicTalent;
  className?: string;
}) {
  const href = `/talents/${talent.candidateId}`;
  const visibleSkills = talent.skills.slice(0, MAX_VISIBLE_SKILLS);
  const hiddenSkillCount = talent.skills.length - visibleSkills.length;

  return (
    <article
      className={cn(
        "group bg-surface border-border relative flex flex-col rounded-xl border p-5 shadow-xs transition-shadow hover:shadow-md",
        "focus-within:border-ring focus-within:ring-ring/30 focus-within:ring-[3px]",
        className,
      )}
    >
      <header className="flex items-start gap-3">
        <div
          aria-hidden="true"
          className="bg-kaji-100 text-kaji-800 grid size-11 shrink-0 place-items-center rounded-full text-sm font-semibold"
        >
          {initials(talent.fullName)}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold">
            <Link
              href={href}
              className="after:absolute after:inset-0 focus-visible:outline-none"
            >
              {talent.fullName}
            </Link>
          </h3>
          <p className="text-muted-foreground mt-0.5 line-clamp-2 text-sm">{talent.headline}</p>
        </div>

        {talent.isVerified && (
          <Badge
            tone="accent"
            size="sm"
            className="shrink-0"
            title="Profil vérifié par l'équipe Kaji"
          >
            <BadgeCheck aria-hidden="true" />
            <span className="sr-only">Profil vérifié par Kaji. </span>
            Vérifié
          </Badge>
        )}
      </header>

      <dl className="text-muted-foreground mt-4 flex flex-col gap-1.5 text-sm">
        <div className="flex items-center gap-2">
          <dt className="sr-only">Catégorie</dt>
          <Briefcase aria-hidden="true" className="text-subtle-foreground size-4 shrink-0" />
          <dd className="truncate">{talent.categoryLabel}</dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="sr-only">Localisation</dt>
          <MapPin aria-hidden="true" className="text-subtle-foreground size-4 shrink-0" />
          <dd className="truncate">
            {talent.location.city}
            {talent.location.isRemoteEligible && " · télétravail possible"}
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="sr-only">Expérience</dt>
          <dd className="text-subtle-foreground pl-6 text-xs">
            {talent.yearsOfExperience} an{talent.yearsOfExperience > 1 ? "s" : ""} d
            expérience
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <AvailabilityBadge availability={talent.availability} size="sm" />
        {talent.poolKind === POOL_KIND.PRESTATAIRE_POOL && (
          <Badge tone="info" size="sm">
            {POOL_KIND_LABEL[talent.poolKind]}
          </Badge>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {visibleSkills.map((skill) => (
          <SkillBadge key={skill.id} label={skill.label} level={skill.level} />
        ))}
        {hiddenSkillCount > 0 && (
          <Badge tone="neutral" size="sm" className="font-normal">
            +{hiddenSkillCount}
          </Badge>
        )}
      </div>

      {talent.languages.length > 0 && (
        <div className="border-border mt-4 flex items-center gap-1.5 border-t pt-4">
          <span className="text-subtle-foreground mr-1 text-xs">Langues</span>
          {talent.languages.slice(0, 4).map((language) => (
            <LanguageBadge key={language.code} language={language} />
          ))}
        </div>
      )}
    </article>
  );
}
