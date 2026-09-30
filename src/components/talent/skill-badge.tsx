import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Jeton de compétence. Le niveau auto-déclaré n'est pas une note de qualité. */
export function SkillBadge({
  label,
  className,
  level,
}: {
  label: string;
  className?: string;
  level?: number;
}) {
  const title =
    level === undefined
      ? label
      : `${label} — niveau auto-déclaré ${level}/5`;

  return (
    <Badge tone="neutral" size="sm" className={cn("font-normal", className)} title={title}>
      {label}
    </Badge>
  );
}
