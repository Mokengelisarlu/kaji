"use client";

import { useClerk } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

/**
 * Déconnexion suivie d'un retour sur l'inscription entreprise.
 *
 * Rend un bouton du design system : `SignOutButton` de Clerk impose son propre
 * `<button>` non stylable, on préfère `useClerk().signOut` pour garder la
 * cohérence visuelle et le contrôle de la redirection.
 */
export function SwitchAccountButton({ children }: { readonly children?: React.ReactNode }) {
  const { signOut } = useClerk();

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={() => {
        void signOut({ redirectUrl: "/entreprise/inscription" });
      }}
    >
      {children ?? "Changer de compte"}
    </Button>
  );
}
