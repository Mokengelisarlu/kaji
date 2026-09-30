"use client";

import Link from "next/link";
import { useActionState } from "react";

import { submitContactRequest, type ContactState } from "@/app/contact/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import {
  BUDGET_LABELS,
  CONTACT_BUDGETS,
  CONTACT_CHANNELS,
  CONTACT_URGENCIES,
  CONTRACT_OPTIONS,
  PROFILE_SUBJECT,
  URGENCY_LABELS,
  type ContactSubject,
} from "@/lib/validation/contact";

const INITIAL: ContactState = { status: "idle" };

const CHANNEL_LABELS: Readonly<Record<(typeof CONTACT_CHANNELS)[number], string>> = {
  email: "Répondre par e-mail",
  telephone: "Être rappelé par téléphone",
};

type Props = {
  readonly subject: ContactSubject;
  /** Identifiant pré-rempli par `EC-03`. */
  readonly candidateId?: string;
  /** Nom du profil demandé, résolu côté serveur. */
  readonly candidateLabel?: string;
};

export function ContactForm({ subject, candidateId, candidateLabel }: Props) {
  const [state, formAction, pending] = useActionState(submitContactRequest, INITIAL);
  const errors = state.status === "invalid" ? state.errors : {};

  return (
    <form action={formAction} noValidate className="flex flex-col gap-8">
      <input type="hidden" name="subject" value={subject} />
      {candidateId !== undefined && (
        <input type="hidden" name="candidateId" value={candidateId} />
      )}

      {subject === PROFILE_SUBJECT && (
        <fieldset className="border-or-600/30 bg-or-50/40 flex flex-col gap-1 rounded-lg border p-4">
          <legend className="text-or-700 text-xs font-medium tracking-wide uppercase">
            Profil demandé
          </legend>
          <p className="text-foreground text-sm font-medium">
            {candidateLabel ?? "Profil sélectionné"}
          </p>
          <p className="text-muted-foreground text-xs">
            Cette demande est rattachée à la fiche consultée. Les coordonnées du
            candidat ne sont ni demandées ni transmises : elles s’établissent au
            placement, avec son accord.
          </p>
        </fieldset>
      )}

      {state.status === "invalid" && (
        <Alert tone="danger" title="Le formulaire n’a pas pu être validé">
          <ul className="ml-4 list-disc">
            {Object.entries(errors).map(([field, message]) => (
              <li key={field}>{message}</li>
            ))}
          </ul>
        </Alert>
      )}

      {state.status === "unconfigured" && (
        <Alert tone="warning" title="Aucun canal de livraison n’est encore configuré">
          <p>
            Vos informations ont été lues et comprises, mais elles n’ont pas été
            transmises : aucun service d’envoi n’est raccordé à cette page. Aucun
            médiateur ne peut donc traiter cette demande en l’état.
          </p>
          {state.summary.length > 0 && (
            <ul className="mt-2 ml-4 list-disc text-xs">
              {state.summary.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
          <p className="mt-2">
            Référence de tentative : <code>{state.requestId}</code>
          </p>
        </Alert>
      )}

      {state.status === "deliveryFailed" && (
        <Alert tone="danger" title="La demande n’a pas pu être transmise">
          <p>{state.message}</p>
          <p className="mt-2">
            Référence de tentative : <code>{state.requestId}</code>
          </p>
        </Alert>
      )}

      {state.status === "accepted" && (
        <Alert tone="success" title="Demande enregistrée">
          <p>{state.message}</p>
          <p className="mt-2">
            Référence de tentative : <code>{state.requestId}</code>
          </p>
        </Alert>
      )}

      {/* Objet et contenu de la demande */}
      {subject === PROFILE_SUBJECT ? (
        <Field
          id="motive"
          label="Pourquoi ce profil vous intéresse"
          error={errors.motive}
          required
        >
          <Textarea
            id="motive"
            name="motive"
            rows={5}
            aria-invalid={errors.motive !== undefined}
            aria-describedby={describedBy("motive", errors.motive)}
            placeholder="Le poste à pourvoir, le contexte, ce que ce profil apporte."
          />
        </Field>
      ) : (
        <>
          <Field
            id="role"
            label="Poste ou mission"
            error={errors.role}
            required
          >
            <Input
              id="role"
              name="role"
              aria-invalid={errors.role !== undefined}
              aria-describedby={describedBy("role", errors.role)}
              placeholder="Développeur backend,归结ant de chiffres, mission de communication…"
            />
          </Field>

          <Field
            id="skills"
            label="Compétences attendues"
            error={errors.skills}
            required
          >
            <Textarea
              id="skills"
              name="skills"
              rows={3}
              aria-invalid={errors.skills !== undefined}
              aria-describedby={describedBy("skills", errors.skills)}
              placeholder="Les compétences indispensables, puis celles qui seraient un plus."
            />
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field
              id="location"
              label="Localisation du poste"
              error={errors.location}
              required
            >
              <Input
                id="location"
                name="location"
                aria-invalid={errors.location !== undefined}
                aria-describedby={describedBy("location", errors.location)}
                placeholder="Ville, département, ou télétravail"
              />
            </Field>

            <Field id="contract" label="Type de contrat" error={errors.contract} required>
              <Select
                id="contract"
                name="contract"
                defaultValue=""
                aria-invalid={errors.contract !== undefined}
                aria-describedby={describedBy("contract", errors.contract)}
              >
                <option value="" disabled>
                  Choisir un type de contrat
                </option>
                {CONTRACT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field id="budget" label="Budget" error={errors.budget}>
              <Select
                id="budget"
                name="budget"
                defaultValue="non-precise"
                aria-describedby={describedBy("budget", errors.budget)}
              >
                {CONTACT_BUDGETS.map((value) => (
                  <option key={value} value={value}>
                    {BUDGET_LABELS[value]}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              id="budgetAmount"
              label="Montant indicatif"
              error={errors.budgetAmount}
              hint="Optionnel si le budget est à définir avec le médiateur."
            >
              <Input
                id="budgetAmount"
                name="budgetAmount"
                aria-invalid={errors.budgetAmount !== undefined}
                aria-describedby={describedBy("budgetAmount", errors.budgetAmount)}
                placeholder="Fourchette, taux journalier…"
              />
            </Field>
          </div>
        </>
      )}

      <Field id="urgency" label="Urgence" error={errors.urgency}>
        <Select
          id="urgency"
          name="urgency"
          defaultValue="normal"
          aria-describedby={describedBy("urgency", errors.urgency)}
        >
          {CONTACT_URGENCIES.map((value) => (
            <option key={value} value={value}>
              {URGENCY_LABELS[value]}
            </option>
          ))}
        </Select>
      </Field>

      {/* Qui répondre */}
      <div className="border-border/70 flex flex-col gap-6 border-t pt-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="name" label="Votre nom" error={errors.name} required>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              aria-invalid={errors.name !== undefined}
              aria-describedby={describedBy("name", errors.name)}
            />
          </Field>

          <Field
            id="organisation"
            label="Organisation"
            error={errors.organisation}
            hint="Optionnelle pour un candidat."
          >
            <Input
              id="organisation"
              name="organisation"
              autoComplete="organization"
              aria-invalid={errors.organisation !== undefined}
              aria-describedby={describedBy("organisation", errors.organisation)}
            />
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            id="email"
            label="Adresse électronique"
            error={errors.email}
            required
          >
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              aria-invalid={errors.email !== undefined}
              aria-describedby={describedBy("email", errors.email)}
            />
          </Field>

          <Field id="channel" label="Canal de réponse préféré" error={errors.channel} required>
            <Select
              id="channel"
              name="channel"
              defaultValue="email"
              aria-describedby={describedBy("channel", errors.channel)}
            >
              {CONTACT_CHANNELS.map((value) => (
                <option key={value} value={value}>
                  {CHANNEL_LABELS[value]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field
          id="telephone"
          label="Téléphone"
          error={errors.telephone}
          hint="Nécessaire uniquement si vous choisissez le rappel téléphonique. Jamais les coordonnées d’un candidat."
        >
          <Input
            id="telephone"
            name="telephone"
            type="tel"
            autoComplete="tel"
            aria-invalid={errors.telephone !== undefined}
            aria-describedby={describedBy("telephone", errors.telephone)}
            placeholder="06 00 00 00 00"
          />
        </Field>
      </div>

      <Field
        id="context"
        label="Contexte"
        error={errors.context}
        hint="Optionnel. Ce qui a déjà été tenté, la raison du poste, la personne à contacter sur place."
      >
        <Textarea
          id="context"
          name="context"
          rows={4}
          aria-invalid={errors.context !== undefined}
          aria-describedby={describedBy("context", errors.context)}
        />
      </Field>

      <div className="border-border/70 flex flex-col gap-4 border-t pt-6">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="consent"
            className="border-border focus-visible:ring-ring mt-0.5 size-4 shrink-0 rounded accent-[var(--color-or-600)] focus-visible:ring-[3px] focus-visible:outline-none"
            aria-invalid={errors.consent !== undefined}
            aria-describedby={describedBy("consent", errors.consent)}
          />
          <span className="text-muted-foreground leading-relaxed">
            J’accepte que ces informations soient utilisées pour traiter ma
            demande. Elles ne sont ni vendues ni transmises à des tiers à des
            fins commerciales.{" "}
            <Link
              href="/confidentialite"
              className="text-or-600 underline underline-offset-2 hover:text-or-700"
            >
              Politique de confidentialité
            </Link>
            .
          </span>
        </label>
        {errors.consent !== undefined && (
          <p id="consent-error" className="text-danger text-xs" role="alert">
            {errors.consent}
          </p>
        )}

        <Button type="submit" disabled={pending} className="sm:self-start">
          {pending ? "Envoi en cours…" : "Déposer la demande"}
        </Button>
      </div>
    </form>
  );
}

type FieldProps = {
  readonly id: string;
  readonly label: string;
  readonly error?: string;
  readonly hint?: string;
  readonly required?: boolean;
  readonly children: React.ReactNode;
};

function Field({ id, label, error, hint, required, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>
        {label}
        {required === true && (
          <span aria-hidden="true" className="text-danger ml-0.5">
            *
          </span>
        )}
      </Label>
      {children}
      {/* Rendue même sans texte : les champs la référencent via
          `aria-describedby`, et un id pointant dans le vide est une
          description que le lecteur d’écran ne peut pas résoudre. Un paragraphe
          vide est ignoré, une référence morte ne l’est pas. */}
      <p id={`${id}-hint`} className="text-muted-foreground text-xs">
        {hint}
      </p>
      {error !== undefined && (
        <p id={`${id}-error`} className="text-danger text-xs" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, error: string | undefined): string | undefined {
  const parts: string[] = [];
  if (error === undefined) {
    parts.push(`${id}-hint`);
  } else {
    parts.push(`${id}-error`);
  }
  return parts.length === 0 ? undefined : parts.join(" ");
}
