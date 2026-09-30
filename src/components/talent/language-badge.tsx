import { Badge } from "@/components/ui/badge";
import {
  LANGUAGE_CODE_LABEL,
  LANGUAGE_CODE_SHORT,
  LANGUAGE_LEVEL,
  LANGUAGE_LEVEL_LABEL,
} from "@/lib/domain/enums";
import type { LanguageSkill } from "@/lib/domain/talent";
import { cn } from "@/lib/utils";

/**
 * Jeton de langue.
 *
 * `level` est l'auto-déclaration du candidat, jamais une évaluation Kaji.
 * Le libellé complet est toujours présent dans le `title` et le `abbr` afin
 * que le code court ne soit jamais la seule information lue par un lecteur
 * d'écran.
 */
export function LanguageBadge({
  language,
  className,
}: {
  language: LanguageSkill;
  className?: string;
}) {
  const isFluent =
    language.level === LANGUAGE_LEVEL.NATIVE || language.level === LANGUAGE_LEVEL.PROFESSIONAL;

  return (
    <Badge
      tone={isFluent ? "brand" : "neutral"}
      size="sm"
      className={cn("font-normal", className)}
      title={`${LANGUAGE_CODE_LABEL[language.code]} — ${LANGUAGE_LEVEL_LABEL[language.level]}`}
    >
      <abbr title={LANGUAGE_CODE_LABEL[language.code]} className="no-underline">
        {LANGUAGE_CODE_SHORT[language.code]}
      </abbr>
      <span className="sr-only">
        {LANGUAGE_CODE_LABEL[language.code]} — {LANGUAGE_LEVEL_LABEL[language.level]}
      </span>
    </Badge>
  );
}
