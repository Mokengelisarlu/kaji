"use client";

import { Toaster as SonnerToaster } from "sonner";

import { cn } from "@/lib/utils";

/**
 * Notifications temporaires (04-design-system.md §40.7).
 *
 * Rendu une seule fois par `app/layout.tsx` : le conteneur vit à la racine,
 * donc un toast survit à la navigation. Une page ne monte jamais son propre
 * `Toaster`.
 *
 * Aucune couleur n'est écrite ici. Le thème de sonner (fonds, bords, tons,
 * rayon, ombres) est redéfini avec les tokens `@theme` dans `globals.css`,
 * section « Toasts ».
 */
export function Toaster({ className }: { className?: string }) {
  return (
    <SonnerToaster
      className={cn(className)}
      position="top-right"
      richColors
      expand
      closeButton
      customAriaLabel="Notifications"
      toastOptions={{ closeButtonAriaLabel: "Fermer la notification" }}
    />
  );
}
