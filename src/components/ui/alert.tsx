import { cva, type VariantProps } from "class-variance-authority";
import { AlertTriangle, CircleCheck, Info, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";

const alertVariants = cva("rounded-lg border p-4 text-sm", {
  variants: {
    tone: {
      info: "border-info-100 bg-info-50 text-info-900",
      success: "border-success-100 bg-success-50 text-success-900",
      warning: "border-warning-100 bg-warning-50 text-warning-900",
      danger: "border-danger-100 bg-danger-50 text-danger-900",
      neutral: "border-border bg-surface-muted text-foreground",
    },
  },
  defaultVariants: { tone: "info" },
});

type Tone = NonNullable<VariantProps<typeof alertVariants>["tone"]>;

const TONE_ICON: Record<Tone, typeof Info> = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: AlertTriangle,
  neutral: Info,
};

export function Alert({
  className,
  tone,
  title,
  children,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants> & { title?: string }) {
  const resolvedTone: Tone = tone ?? "info";
  const Icon = TONE_ICON[resolvedTone];

  return (
    <div
      role={resolvedTone === "danger" ? "alert" : "status"}
      className={cn(alertVariants({ tone: resolvedTone }), className)}
      {...props}
    >
      <div className="flex gap-3">
        <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <div className="flex min-w-0 flex-col gap-1">
          {title !== undefined && <p className="font-semibold">{title}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
