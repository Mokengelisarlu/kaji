import type { BadgeProps } from "@/components/ui/badge";
import { Badge } from "@/components/ui/badge";
import { AVAILABILITY_PRESENTATION } from "@/components/talent/availability-presentation";
import type { EffectiveAvailability } from "@/lib/domain/enums";

/**
 * Disponibilité effective d'un talent (§3.1, §9).
 *
 * Affiche la valeur calculée par `resolveEffectiveAvailability`, jamais la
 * simple déclaration du candidat.
 */
export function AvailabilityBadge({
  availability,
  size = "md",
  className,
}: {
  availability: EffectiveAvailability;
  size?: BadgeProps["size"];
  className?: string;
}) {
  const presentation = AVAILABILITY_PRESENTATION[availability];

  return (
    <Badge tone={presentation.tone} size={size} className={className} title={presentation.description}>
      <presentation.Icon aria-hidden="true" />
      {presentation.label}
    </Badge>
  );
}
