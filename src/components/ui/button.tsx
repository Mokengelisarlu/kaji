import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@/components/ui/slot";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:outline-ring",
        accent:
          "bg-accent text-accent-foreground hover:bg-or-600 focus-visible:outline-ring",
        secondary:
          "bg-surface text-foreground border border-border-strong hover:bg-surface-muted focus-visible:outline-ring",
        ghost: "text-foreground hover:bg-surface-muted focus-visible:outline-ring",
        link: "text-primary underline-offset-4 hover:underline focus-visible:outline-ring",
        danger: "bg-danger-600 text-white hover:bg-danger-700 focus-visible:outline-ring",
      },
      size: {
        sm: "h-9 px-3 text-sm [&_svg]:size-4",
        md: "h-11 px-5 text-sm [&_svg]:size-4",
        lg: "h-12 px-6 text-base [&_svg]:size-5",
      },
      block: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      block: false,
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

export type ButtonProps = React.ComponentProps<"button"> &
  ButtonVariants & {
    /** `true` si le bouton rend un `<a>` ou un `<Link>` (navigation). */
    asChild?: boolean;
  };

/**
 * Bouton unique du design system.
 *
 * `asChild` permet d'appliquer exactement le même style à un `<Link>` Next.js
 * sans dupliquer les classes ni imbriquer un bouton interactif dans un lien.
 */
export function Button({ className, variant, size, block, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
