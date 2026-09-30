import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@/components/ui/slot";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        neutral: "border-border bg-surface-muted text-muted-foreground",
        brand: "border-kaji-200 bg-kaji-50 text-kaji-800",
        accent: "border-or-200 bg-or-50 text-or-800",
        success: "border-success-100 bg-success-50 text-success-700",
        warning: "border-warning-100 bg-warning-50 text-warning-700",
        danger: "border-danger-100 bg-danger-50 text-danger-700",
        info: "border-info-100 bg-info-50 text-info-700",
        solid: "border-transparent bg-primary text-primary-foreground",
      },
      size: {
        sm: "px-2 py-0.5 text-2xs [&_svg]:size-3",
        md: "px-2.5 py-1 text-xs [&_svg]:size-3.5",
      },
    },
    defaultVariants: {
      tone: "neutral",
      size: "md",
    },
  },
);

export type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
  };

export function Badge({ className, tone, size, asChild, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp data-slot="badge" className={cn(badgeVariants({ tone, size }), className)} {...props} />
  );
}

export { badgeVariants };
