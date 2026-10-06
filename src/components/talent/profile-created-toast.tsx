"use client";

import { useEffect } from "react";
import { toast } from "sonner";

/**
 * Accusé de réception après création d'un profil candidat
 * (04-design-system.md §40.7).
 *
 * Une action serveur ne peut pas appeler `toast()` : elle se termine par un
 * `redirect()`, et le client n'apprend jamais le résultat. Le signal voyage
 * donc dans l'URL (`?profil=cree`), puis le paramètre est retiré de
 * `history.replaceState` — un rechargement de la fiche ne répète pas le
 * message.
 *
 * Le libellé ne prétend rien d'autre que ce qui est vrai quelle que soit la
 * visibilité choisie : le profil est enregistré, il n'est pas dit « publié ».
 */
export function ProfileCreatedToast({ created }: { readonly created: boolean }) {
  useEffect(() => {
    if (!created) return;

    toast.success("Profil créé.", {
      description: "Vos informations sont enregistrées ; vous pourrez les compléter à tout moment.",
    });

    const url = new URL(window.location.href);
    url.searchParams.delete("profil");
    window.history.replaceState(null, "", url);
  }, [created]);

  return null;
}
