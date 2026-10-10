"use client";

import { useActionState, useState, type ChangeEvent, type ReactNode } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { COMPANY_SIZE, COMPANY_SIZE_LABEL } from "@/lib/domain/enums";
import type { Company } from "@/lib/repositories/company-repository";
import { submitCompany, type CompanyFormState } from "./actions";

const initialState: CompanyFormState = { status: "idle", errors: {} };

type Props = {
  readonly company: Company | null;
  readonly defaultEmail: string;
  readonly saved: boolean;
};

export function CompanyForm({ company, defaultEmail, saved }: Props) {
  const [state, formAction, pending] = useActionState(submitCompany, initialState);

  const [values, setValues] = useState<Record<string, string>>({
    name: company?.name ?? "",
    legalName: company?.legalName ?? "",
    sector: company?.sector ?? "",
    size: company?.size ?? "",
    city: company?.city ?? "",
    country: company?.country ?? "République Démocratique du Congo",
    website: company?.website ?? "",
    contactName: company?.contactName ?? "",
    contactEmail: company?.contactEmail ?? defaultEmail,
    contactPhone: company?.contactPhone ?? "",
    description: company?.description ?? "",
  });

  const setField =
    (name: string) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { value } = event.target;
      setValues((previous) => ({ ...previous, [name]: value }));
    };

  const bind = (name: string) => ({
    name,
    value: values[name] ?? "",
    onChange: setField(name),
  });

  const errorOf = (name: string) => state.errors[name]?.[0];

  const fieldId = (name: string) => `company-${name}`;

  return (
    <form action={formAction} noValidate className="space-y-8">
      {saved && (
        <Alert tone="success" title="Informations enregistrées">
          Votre entreprise a bien été enregistrée. L’équipe Kaji la vérifie avant
          toute mise en relation.
        </Alert>
      )}

      {state.status === "error" && (
        <Alert tone="danger" title="Enregistrement impossible">
          {state.message ?? "Une erreur est survenue. Réessayez dans un instant."}
        </Alert>
      )}

      {state.status === "invalid" && (
        <Alert tone="danger" title="Veuillez corriger les champs en erreur">
          <ul className="list-disc space-y-1 pl-5">
            {Object.entries(state.errors).map(([field, messages]) => (
              <li key={field}>{messages[0]}</li>
            ))}
          </ul>
        </Alert>
      )}

      <fieldset className="space-y-5">
        <legend className="text-base font-semibold">L’entreprise</legend>

        <Field label="Nom de l’entreprise" name="name" required error={errorOf("name")}>
          <Input id={fieldId("name")} autoComplete="organization" {...bind("name")} />
        </Field>

        <Field label="Raison sociale" name="legalName" error={errorOf("legalName")}>
          <Input id={fieldId("legalName")} {...bind("legalName")} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Secteur d’activité" name="sector" required error={errorOf("sector")}>
            <Input id={fieldId("sector")} placeholder="Ex. Logistique, Santé, Informatique" {...bind("sector")} />
          </Field>

          <Field label="Taille" name="size" required error={errorOf("size")}>
            <Select id={fieldId("size")} {...bind("size")}>
              <option value="">Sélectionner…</option>
              {Object.values(COMPANY_SIZE).map((size) => (
                <option key={size} value={size}>
                  {COMPANY_SIZE_LABEL[size]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Ville" name="city" required error={errorOf("city")}>
            <Input id={fieldId("city")} placeholder="Ex. Kinshasa" {...bind("city")} />
          </Field>

          <Field label="Pays" name="country" error={errorOf("country")}>
            <Input id={fieldId("country")} {...bind("country")} />
          </Field>
        </div>

        <Field
          label="Site web"
          name="website"
          hint="Facultatif — commence par http:// ou https://."
          error={errorOf("website")}
        >
          <Input id={fieldId("website")} type="url" placeholder="https://" {...bind("website")} />
        </Field>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-base font-semibold">Contact pour le recrutement</legend>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nom du contact" name="contactName" required error={errorOf("contactName")}>
            <Input id={fieldId("contactName")} autoComplete="name" {...bind("contactName")} />
          </Field>

          <Field label="Téléphone" name="contactPhone" error={errorOf("contactPhone")}>
            <Input id={fieldId("contactPhone")} type="tel" placeholder="+243…" {...bind("contactPhone")} />
          </Field>
        </div>

        <Field label="Adresse électronique" name="contactEmail" required error={errorOf("contactEmail")}>
          <Input id={fieldId("contactEmail")} type="email" autoComplete="email" {...bind("contactEmail")} />
        </Field>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-base font-semibold">Présentation</legend>

        <Field
          label="Présentez votre entreprise et vos besoins"
          name="description"
          required
          hint="Métiers recherchés, contexte, ce qui ferait réussir le recrutement."
          error={errorOf("description")}
        >
          <Textarea id={fieldId("description")} rows={6} {...bind("description")} />
        </Field>
      </fieldset>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Enregistrement…"
            : company
              ? "Mettre à jour mon entreprise"
              : "Enregistrer mon entreprise"}
        </Button>
        <p className="text-muted-foreground text-xs">
          Ces informations ne sont pas publiques. Elles servent à la vérification.
        </p>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  hint,
  error,
  children,
}: {
  readonly label: string;
  readonly name: string;
  readonly required?: boolean;
  readonly hint?: string;
  readonly error?: string;
  readonly children: ReactNode;
}) {
  const id = `company-${name}`;

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </Label>
      {children}
      {hint !== undefined && error === undefined && (
        <p id={`${id}-hint`} className="text-subtle-foreground text-xs">
          {hint}
        </p>
      )}
      {error !== undefined && (
        <p id={`${id}-error`} className="text-danger-700 text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
