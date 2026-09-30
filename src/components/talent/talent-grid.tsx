import type { PublicTalent } from "@/lib/domain/talent";
import { TalentCard } from "./talent-card";
import { cn } from "@/lib/utils";

/**
 * Grille de cartes talent. Responsive 1 / 2 / 3 colonnes.
 * En dessous de `sm`, une seule colonne : les cartes contiennent trop
 * d'information pour tenir à deux sur mobile.
 */
export function TalentGrid({
  talents,
  className,
}: {
  talents: readonly PublicTalent[];
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {talents.map((talent) => (
        <li key={talent.candidateId} className="flex">
          <TalentCard talent={talent} className="w-full" />
        </li>
      ))}
    </ul>
  );
}
