import { clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { ROLE, type Role } from "@/lib/domain/enums";
import { getCandidateProfileByClerkUserId } from "@/lib/repositories/candidate-repository";
import { requireSession } from "./guard";
import type { Session } from "./session";

/**
 * Attribution du rôle employeur (§20).
 *
 * Deux responsabilités, volontairement isolées du reste de l'autorisation :
 *
 * - `setEmployerRole` écrit `publicMetadata.role = EMPLOYER` via Clerk. C'est
 *   le **seul** endroit du code qui attribue un rôle ; aucun rôle n'est lu
 *   depuis le client.
 * - `requireEmployerAccess` protège l'espace entreprise (`dashboard`,
 *   `onboarding`). Un utilisateur dont la fiche candidat existe déjà n'est
 *   jamais converti en entreprise : on le renvoie vers la page d'inscription,
 *   qui lui demande de se connecter avec un compte entreprise (jamais de
 *   bascule silencieuse de rôle).
 */

/** Vrai si le rôle de session est celui d'une entreprise. */
export function isEmployer(role: Role): boolean {
  return role === ROLE.EMPLOYER;
}

/**
 * Fixe le rôle employeur pour un utilisateur authentifié.
 *
 * Ne touche pas aux autres clés de `publicMetadata` : l'appel transmet
 * uniquement `role`.
 */
export async function setEmployerRole(userId: string): Promise<void> {
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { role: ROLE.EMPLOYER },
  });
}

/**
 * Barrière de l'espace entreprise (tableau de bord et onboarding).
 *
 * Autorisé si l'utilisateur porte déjà le rôle `EMPLOYER`, ou s'il vient de
 * créer un compte et ne possède pas encore de fiche candidat (nouveau compte
 * entreprise). Toute autre identité — un candidat ou prestataire existant — est
 * redirigée vers l'inscription entreprise pour se connecter avec le bon compte.
 */
export async function requireEmployerAccess(): Promise<Session> {
  const session = await requireSession();
  if (isEmployer(session.role)) {
    return session;
  }

  const candidateProfile = await getCandidateProfileByClerkUserId(session.userId);
  if (candidateProfile) {
    redirect("/entreprise/inscription?raison=compte");
  }

  return session;
}

/** Destination après création ou connexion d'un compte entreprise : le tableau de bord. */
export const EMPLOYER_DASHBOARD_PATH = "/entreprise/dashboard";

/** Saisie / correction des informations entreprise. */
export const EMPLOYER_ONBOARDING_PATH = "/entreprise/onboarding";

/** Cible de création / connexion d'un compte entreprise. */
export const EMPLOYER_SIGNUP_PATH = "/entreprise/inscription";
