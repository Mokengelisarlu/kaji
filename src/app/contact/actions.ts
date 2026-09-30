"use server";

import {
  evaluateContactSubmission,
  unconfiguredTransport,
  type ContactState,
} from "@/lib/use-cases/contact";

/**
 * Action de soumission du formulaire `EC-11` (`design.md` §64.5).
 *
 * ## Pourquoi aucune demande n'est « envoyée »
 *
 * Le formulaire est complet et validé, mais **aucun canal de livraison n'est
 * configuré** : ni service d'envoi, ni webhook, ni base de données. Or le
 * dépôt d'un besoin et la demande d'un profil exigent un accusé de réception
 * (§64.5).
 *
 * Sans canal, un message de confirmation serait un mensonge affiché à
 * l'utilisateur : l'entreprise conclurait à une prise en charge alors qu'aucun
 * médiateur n'a vu la demande. L'action renvoie donc `unconfigured`, et
 * l'interface le dit explicitement.
 *
 * ## Brancher un canal
 *
 * Un seul point à remplacer : le transport passé à
 * `evaluateContactSubmission`. Il doit :
 *
 * 1. résoudre le destinataire depuis la configuration, jamais depuis le
 *    formulaire ;
 * 2. être idempotent sur `requestId`, pour qu'un double-clic ne crée pas
 *    deux demandes ;
 * 3. échouer bruyamment — un transport en erreur produit `deliveryFailed`,
 *    jamais un succès silencieux.
 *
 * La logique de validation et de traçabilité est déjà testée
 * (`src/lib/use-cases/contact.test.ts`) : brancher un transport ne doit pas
 * nécessiter de la réécrire.
 */
export async function submitContactRequest(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  return evaluateContactSubmission(formData, unconfiguredTransport);
}

export type { ContactState } from "@/lib/use-cases/contact";
