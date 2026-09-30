import { cn } from "@/lib/utils";

/** Conteneur de mise en page : largeur et gouttières maximales cohérentes. */
export function Container({
  className,
  size = "default",
  as: Tag = "div",
  ...props
}: React.ComponentProps<"div"> & {
  size?: "default" | "wide" | "narrow";
  as?: "div" | "section" | "header" | "footer" | "main" | "nav";
}) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        size === "default" && "max-w-6xl",
        size === "wide" && "max-w-7xl",
        size === "narrow" && "max-w-3xl",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Section de page. `spacing` contrôle l'échelle du vide vertical ;
 * `divider` ajoute un filet horizontal discret entre deux sections.
 */
export function Section({
  className,
  spacing = "md",
  divider = false,
  ...props
}: React.ComponentProps<"section"> & {
  spacing?: "sm" | "md" | "lg";
  divider?: boolean;
}) {
  return (
    <section
      className={cn(
        spacing === "sm" && "py-10 sm:py-12",
        spacing === "md" && "py-14 sm:py-20",
        spacing === "lg" && "py-16 sm:py-24 lg:py-28",
        divider && "border-border border-t",
        className,
      )}
      {...props}
    />
  );
}

/** Titre de section : surtitre optionnel, titre, sous-titre. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  as: Tag = "h2",
  className,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "mx-auto max-w-2xl text-center",
        className,
      )}
    >
      {eyebrow !== undefined && (
        <p className="text-accent-foreground/80 text-or-700 text-2xs font-semibold tracking-[0.14em] uppercase">
          {eyebrow}
        </p>
      )}
      <Tag className="text-2xl sm:text-3xl">{title}</Tag>
      {description !== undefined && (
        <p className="text-muted-foreground text-base sm:text-lg">{description}</p>
      )}
      {children}
    </div>
  );
}
