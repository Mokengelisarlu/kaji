"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BRAND, PRIMARY_CTA, PUBLIC_NAV, type NavLink } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Navigation principale.
 *
 * Client uniquement pour le menu mobile et la détection de route active.
 * La liste de liens est une constante serveur importée : aucune donnée
 * sensible n'est exposée dans le bundle.
 */
export function SiteHeaderNav() {
  const pathname = usePathname();
  const menuId = useId();

  /**
   * Le menu est « ouvert pour une URL donnée ». Quand `pathname` change, il
   * n'est simplement plus ouvert : la fermeture est déduite du rendu plutôt
   * que provoquée par un effet, ce qui évite un rendu en cascade.
   */
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt === pathname;

  const setOpen = (next: boolean) => setOpenedAt(next ? pathname : null);

  // Verrouille le défilement de l'arrière-plan quand le menu est ouvert.
  useEffect(() => {
    if (!open) {
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // `Escape` referme le panneau — comportement attendu d'un menu superposé.
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenedAt(null);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <nav aria-label="Navigation principale" className="hidden items-center gap-1 lg:flex">
        {PUBLIC_NAV.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive(link.href) ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive(link.href)
                ? "text-primary bg-kaji-50"
                : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="hidden items-center gap-2 lg:flex">
        <Button asChild variant="secondary" size="sm">
          <Link href={PRIMARY_CTA.candidate.href}>{PRIMARY_CTA.candidate.label}</Link>
        </Button>
        <Button asChild size="sm">
          <Link href={PRIMARY_CTA.employer.href}>{PRIMARY_CTA.employer.label}</Link>
        </Button>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen(!open)}
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        <span className="sr-only">{open ? "Fermer le menu" : "Ouvrir le menu"}</span>
      </Button>

      {open && (
        <div
          id={menuId}
          className="border-border bg-surface fixed inset-x-0 top-16 z-50 border-b p-4 shadow-lg lg:hidden"
        >
          <nav aria-label="Navigation mobile" className="flex flex-col gap-1">
            {PUBLIC_NAV.map((link) => (
              <MobileNavLink key={link.href} link={link} active={isActive(link.href)} />
            ))}
          </nav>
          <div className="border-border mt-4 flex flex-col gap-2 border-t pt-4">
            <Button asChild variant="secondary" block>
              <Link href={PRIMARY_CTA.candidate.href}>{PRIMARY_CTA.candidate.label}</Link>
            </Button>
            <Button asChild block>
              <Link href={PRIMARY_CTA.employer.href}>{PRIMARY_CTA.employer.label}</Link>
            </Button>
          </div>
          <p className="text-subtle-foreground mt-4 text-xs">
            {BRAND.tagline} · {BRAND.operator}
          </p>
        </div>
      )}
    </>
  );
}

function MobileNavLink({ link, active }: { link: NavLink; active: boolean }) {
  return (
    <Link
      href={link.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-md px-3 py-3 text-base font-medium transition-colors",
        active ? "text-primary bg-kaji-50" : "text-foreground hover:bg-surface-muted",
      )}
    >
      {link.label}
    </Link>
  );
}
