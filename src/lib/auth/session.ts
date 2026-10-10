import { auth } from "@clerk/nextjs/server";

import type { Role } from "@/lib/domain/enums";
import { resolveRole } from "./role";

/**
 * Session serveur résolue.
 *
 * `userId` et `role` proviennent tous deux de `auth()` (Clerk). Aucun champ
 * n'est lu depuis le client, directement ou indirectement (§20.2).
 */
export type Session = {
  readonly userId: string;
  readonly role: Role;
};

/**
 * Lit la session Clerk courante et en dérive l'identité et le rôle.
 *
 * Renvoie `null` pour un visiteur non authentifié ; le rôle, lui, n'est jamais
 * `null` pour un utilisateur connecté (repli `CANDIDATE`, voir `role.ts`).
 */
export async function getSession(): Promise<Session | null> {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return null;
  }
  return { userId, role: resolveRole(sessionClaims) };
}
