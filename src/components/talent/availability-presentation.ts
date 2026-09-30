import { Ban, CircleCheck, CircleDot, Clock, Hourglass } from "lucide-react";

import { EFFECTIVE_AVAILABILITY, type EffectiveAvailability } from "@/lib/domain/enums";
import type { BadgeProps } from "@/components/ui/badge";

/**
 * Présentation de la disponibilité effective (§3.1, §3.2, §9).
 *
 * Centralisée pour que le badge, le résumé des filtres et les tooltips
 * racontent exactement la même chose. `REQUIRES_CONFIRMATION` doit être
 * formulé honnêtement : c'est ce qui empêche une entreprise de croire à tort
 * qu'un profil est mobilisable.
 */

export type AvailabilityPresentation = {
  readonly label: string;
  readonly tone: NonNullable<BadgeProps["tone"]>;
  readonly Icon: typeof Clock;
  readonly description: string;
};

export const AVAILABILITY_PRESENTATION: Record<EffectiveAvailability, AvailabilityPresentation> = {
  [EFFECTIVE_AVAILABILITY.AVAILABLE]: {
    label: "Disponible",
    tone: "success",
    Icon: CircleCheck,
    description: "Profil à jour et candidat déclaré disponible immédiatement.",
  },
  [EFFECTIVE_AVAILABILITY.AVAILABLE_WITH_DELAY]: {
    label: "Disponible sous délai",
    tone: "success",
    Icon: Clock,
    description: "Profil à jour, candidature avec un préavis.",
  },
  [EFFECTIVE_AVAILABILITY.OPEN]: {
    label: "Ouvert aux opportunités",
    tone: "brand",
    Icon: CircleDot,
    description: "Candidat à l'écoute d'opportunités, sans urgence déclarée.",
  },
  [EFFECTIVE_AVAILABILITY.REQUIRES_CONFIRMATION]: {
    label: "Disponibilité à reconfirmer",
    tone: "warning",
    Icon: Hourglass,
    description:
      "Profil non actualisé depuis plus de 30 jours. Kaji vérifie la disponibilité auprès du candidat avant toute présentation.",
  },
  [EFFECTIVE_AVAILABILITY.UNAVAILABLE]: {
    label: "Indisponible",
    tone: "neutral",
    Icon: Ban,
    description: "Le candidat n'est pas orienté vers de nouvelles opportunités actuellement.",
  },
};

export function availabilityDescription(availability: EffectiveAvailability): string {
  return AVAILABILITY_PRESENTATION[availability].description;
}
