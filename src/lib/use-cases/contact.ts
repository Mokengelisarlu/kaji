import {
  contactSchema,
  normaliseContactInput,
  summariseContactRequest,
  type ContactData,
} from "@/lib/validation/contact";

/**
 * Traitement de la soumission du formulaire `EC-11` (`design.md` §64.5).
 *
 * Ce module est **pur** : il ne dépend ni de `next/server`, ni d'un transport
 * réel. Le canal de livraison est injecté. C'est ce qui permet de tester
 * aujourd'hui la garantie la plus importante de la page — qu'aucune
 * soumission n'est présentée à l'utilisateur comme transmise alors qu'elle ne
 * l'a pas été — avant qu'un transport existe.
 */

/** Résultat d'une tentative de livraison. */
export type ContactRequestStatus =
  | {
      readonly status: "unconfigured";
      readonly requestId: string;
      readonly summary: readonly string[];
    }
  | {
      readonly status: "deliveryFailed";
      readonly requestId: string;
      readonly message: string;
    };

export type ContactFieldErrors = Readonly<Record<string, string>>;

export type ContactState =
  | { readonly status: "idle" }
  | { readonly status: "invalid"; readonly errors: ContactFieldErrors }
  | {
      readonly status: "accepted";
      readonly requestId: string;
      /** Message affichable, sans promesse de délai de réponse. */
      readonly message: string;
    }
  | ContactRequestStatus;

/**
 * Point d'intégration du transport.
 *
 * Reçoit uniquement des données **déjà validées**. Ne reçoit jamais d'adresse
 * de destinataire : le destinataire se résout depuis la configuration du
 * déploiement. Un champ « destinataire » dans un formulaire est un champ que
 * l'utilisateur contrôle.
 */
export type ContactTransport = (
  requestId: string,
  data: ContactData,
) => Promise<ContactRequestStatus>;

/**
 * Transport par défaut : aucun canal n'est configuré.
 *
 * Il signale l'absence de livraison au lieu de la simuler. C'est le seul
 * comportement honnête tant qu'aucun service d'envoi n'est branché.
 */
export const unconfiguredTransport: ContactTransport = async (requestId) => ({
  status: "unconfigured",
  requestId,
  summary: [],
});

/**
 * Identifiant de tentative, renvoyé à l'utilisateur comme référence.
 *
 * Le suffixe aléatoire distingue deux soumissions du même navigateur dans la
 * même seconde, sans dépendre d'un compteur global.
 */
export function createRequestId(): string {
  const stamp = Date.now().toString(36);
  const salt = Math.random().toString(36).slice(2, 8);
  return `req_${stamp}_${salt}`;
}

export async function evaluateContactSubmission(
  formData: FormData,
  transport: ContactTransport,
  requestId: string = createRequestId(),
): Promise<ContactState> {
  const parsed = contactSchema.safeParse(normaliseContactInput(formData));

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      // Premier message seulement : une même page de formulaire ne doit pas
      // afficher deux fois la même erreur sous deux libellés.
      if (errors[key] === undefined) {
        errors[key] = issue.message;
      }
    }
    return { status: "invalid", errors };
  }

  const result = await transport(requestId, parsed.data);

  if (result.status === "unconfigured") {
    return { ...result, summary: summariseContactRequest(parsed.data) };
  }

  return result;
}
