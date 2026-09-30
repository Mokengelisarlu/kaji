import { cn } from "@/lib/utils";

export function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-border bg-surface text-foreground placeholder:text-subtle-foreground h-11 w-full rounded-md border px-3.5 text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/35 focus-visible:ring-[3px] focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="select"
      className={cn(
        "border-border bg-surface text-foreground h-11 w-full cursor-pointer rounded-md border px-3.5 text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/35 focus-visible:ring-[3px] focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-border bg-surface text-foreground placeholder:text-subtle-foreground w-full rounded-md border px-3.5 py-2.5 text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/35 focus-visible:ring-[3px] focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn("text-foreground text-sm font-medium", className)}
      {...props}
    />
  );
}

/** Champ de recherche avec icône et bouton de réinitialisation. */
export function SearchInput({
  className,
  onClear,
  ...props
}: React.ComponentProps<"input"> & { onClear?: () => void }) {
  return (
    <div className={cn("relative", className)}>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-subtle-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" strokeLinecap="round" />
      </svg>
      <Input type="search" className="pr-10 pl-10" {...props} />
      {onClear !== undefined && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Effacer la recherche"
          className="text-subtle-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-md focus-visible:ring-[3px] focus-visible:outline-none"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="size-4"
          >
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
