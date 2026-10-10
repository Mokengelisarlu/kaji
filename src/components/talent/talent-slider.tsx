"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { TalentCard } from "@/components/talent/talent-card";
import type { PublicTalent } from "@/lib/domain/talent";
import { cn } from "@/lib/utils";

/** Intervalle entre deux cartes, en millisecondes. */
const AUTO_ADVANCE_MS = 4000;

/**
 * Carrousel lent des profils mis en avant (hero entreprise).
 *
 * Fait défiler les cartes une à une, chaque carte glissant d'un écran à
 * l'autre sans interaction. Comportements de sécurité :
 * - la lecture **s'interrompt** au survol et à la prise de focus : une carte
 *   que l'on lit ne doit pas être remplacée en dessous du curseur ;
 * - avec `prefers-reduced-motion`, la lecture automatique est désactivée et le
 *   glissement devient instantané, la navigation manuelle restant disponible ;
 * - les cartes hors de l'écran sont `inert` : elles ne sont ni tabulables, ni
 *   annoncées, et donc pas une source de liens fantômes pour un lecteur
 *   d'écran.
 */
export function TalentSlider({
  talents,
  className,
}: {
  talents: readonly PublicTalent[];
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const count = talents.length;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const goTo = useCallback(
    (target: number) => {
      setIndex(((target % count) + count) % count);
    },
    [count],
  );

  const previous = useCallback(() => goTo(index - 1), [goTo, index]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);

  useEffect(() => {
    if (reducedMotion || paused || count <= 1) {
      return;
    }
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [count, paused, reducedMotion]);

  if (count === 0) {
    return null;
  }

  if (count === 1) {
    const [only] = talents;
    return only ? <TalentCard talent={only} className={className} /> : null;
  }

  return (
    <div
      className={cn("flex flex-col gap-4", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        aria-roledescription="carrousel"
        aria-label="Profils sélectionnés"
        className="overflow-hidden"
      >
        <div
          className={cn(
            "flex",
            !reducedMotion && "transition-transform duration-700 ease-in-out",
          )}
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {talents.map((talent, i) => (
            <div
              key={talent.candidateId}
              className="w-full shrink-0"
              aria-hidden={i !== index}
              inert={i !== index}
            >
              <TalentCard talent={talent} className="w-full" />
            </div>
          ))}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        Profil {index + 1} sur {count}
      </p>

      <div className="flex items-center justify-between gap-3">
        <div
          className="flex items-center gap-1.5"
          role="tablist"
          aria-label={`Sélectionner un profil (${count} disponibles)`}
        >
          {talents.map((talent, i) => (
            <button
              key={talent.candidateId}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Afficher le profil de ${talent.fullName}`}
              onClick={() => goTo(i)}
              className={cn(
                "h-2 rounded-full transition-all",
                i === index ? "w-6 bg-kaji-700" : "w-2 bg-kaji-300 hover:bg-kaji-400",
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={previous}
            aria-label="Profil précédent"
            className="hover:text-kaji-700 text-muted-foreground rounded-full p-1.5 transition-colors"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Profil suivant"
            className="hover:text-kaji-700 text-muted-foreground rounded-full p-1.5 transition-colors"
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}