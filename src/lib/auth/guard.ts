import { redirect } from "next/navigation";

import { authorize, type Action, type Resource } from "@/lib/domain/permissions";
import { getSession, type Session } from "./session";

/**
 * Refus d'autorisation côté serveur.
 *
 * Levée par `requirePermission` lorsqu'un utilisateur authentifié demande une
 * action que la matrice ne lui accorde pas. C'est un **refus**, pas une erreur
 * technique : il ne doit jamais être rattrapé pour « laisser passer ».
 */
export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Exige une session authentifiée, sinon redirige vers la connexion.
 *
 * Le rôle renvoyé provient de la session serveur ; il n'est jamais accepté en
 * paramètre par l'appelant (§20.2).
 */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    return redirect("/connexion");
  }
  return session;
}

/**
 * Exige une autorisation précise (matrice §20), en plus de l'authentification.
 *
 * Refus par défaut : toute paire `(action, resource)` absente de la matrice est
 * rejetée. L'appelant ne fournit jamais de rôle ; il est dérivé de la session.
 * En cas de refus, lève `AuthorizationError` — une élévation de privilège ne
 * peut donc pas être contournée silencieusement par un `if` mal placé.
 */
export async function requirePermission(action: Action, resource: Resource): Promise<Session> {
  const session = await requireSession();
  const result = authorize(session.role, action, resource);
  if (!result.allowed) {
    throw new AuthorizationError(result.reason);
  }
  return session;
}
