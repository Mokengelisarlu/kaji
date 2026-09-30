import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * États de données vides, de chargement et d'erreur (§41).
 *
 * Tous les écrans de liste doivent rendre l'un de ces trois états.
 * Ils partagent volontairement la même structure et la même largeur.
 */

function Frame({
  icon,
  title,
  description,
  action,
  className,
  tone = "neutral",
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
  tone?: "neutral" | "error";
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-14 text-center",
        tone === "error" ? "border-danger-100 bg-danger-50/40" : "border-border bg-surface",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "grid size-12 place-items-center rounded-full",
          tone === "error" ? "bg-danger-100 text-danger-700" : "bg-surface-muted text-muted-foreground",
        )}
      >
        {icon}
      </div>
      <div className="flex max-w-md flex-col gap-1.5">
        <p className="text-lg font-semibold">{title}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Frame icon={icon} title={title} description={description} action={action} className={className} />
  );
}

export function ErrorState({
  icon,
  title = "Une erreur est survenue",
  description,
  action,
  className,
}: {
  icon: ReactNode;
  title?: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Frame
      icon={icon}
      title={title}
      description={description}
      action={action}
      className={className}
      tone="error"
    />
  );
}

/** Squelettes de chargement — pas de spinner seul, la structure est annoncée. */
export function LoadingState({
  label = "Chargement en cours",
  className,
  rows = 3,
}: {
  label?: string;
  className?: string;
  rows?: number;
}) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={cn("flex flex-col gap-3", className)}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="bg-surface animate-pulse rounded-xl border p-5"
          style={{ animationDelay: `${index * 90}ms` }}
        >
          <div className="bg-surface-muted mb-4 h-4 w-1/3 animate-pulse rounded" />
          <div className="bg-surface-muted mb-2 h-3 w-3/4 animate-pulse rounded" />
          <div className="bg-surface-muted h-3 w-1/2 animate-pulse rounded" />
        </div>
      ))}
    </div>
  );
}
