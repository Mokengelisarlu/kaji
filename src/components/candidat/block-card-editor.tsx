"use client";

import { useActionState, useState } from "react";
import { Pencil, X } from "lucide-react";
import {
  updateAvailabilityBlock,
  updateCertificationsBlock,
  updateEducationBlock,
  updateExperiencesBlock,
  updateLanguagesBlock,
  updateSkillsBlock,
  updateSummaryBlock,
} from "@/app/candidat/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import {
  AVAILABILITY_TYPE,
  AVAILABILITY_TYPE_LABEL,
  CONTRACT_TYPE,
  CONTRACT_TYPE_LABEL,
  LANGUAGE_CODE,
  LANGUAGE_CODE_LABEL,
  LANGUAGE_LEVEL,
  LANGUAGE_LEVEL_LABEL,
} from "@/lib/domain/enums";
import type { CandidateProfileState } from "@/lib/use-cases/candidate-profile";

/**
 * Valeurs initiales d'un bloc, chargées depuis le profil côté serveur.
 * Chaque variante transporte exactement les données de son bloc : le
 * composant ne lit que la clé correspondant à `variant`.
 */
export type BlockEditorInitial =
  | { readonly variant: "summary"; readonly summary: string }
  | {
      readonly variant: "availability";
      readonly declaredAvailability?: string;
      readonly desiredContractTypes: readonly string[];
      readonly isRemoteEligible: boolean;
    }
  | {
      readonly variant: "skills";
      readonly skills: readonly { label: string; level: number; yearsOfPractice?: number }[];
    }
  | {
      readonly variant: "languages";
      readonly languages: readonly { code: string; level: string }[];
    }
  | {
      readonly variant: "experiences";
      readonly experiences: readonly {
        title: string;
        organization: string;
        location?: string;
        startDate: string;
        isCurrent: boolean;
        endDate?: string;
        summary?: string;
        achievements: readonly string[];
      }[];
    }
  | {
      readonly variant: "education";
      readonly education: readonly { diploma: string; school: string; field?: string; startDate?: string; endDate?: string }[];
    }
  | {
      readonly variant: "certifications";
      readonly certifications: readonly { name: string; issuer: string; issuedAt?: string; expiresAt?: string }[];
    };

const BLOCK_ACTIONS = {
  summary: updateSummaryBlock,
  availability: updateAvailabilityBlock,
  skills: updateSkillsBlock,
  languages: updateLanguagesBlock,
  experiences: updateExperiencesBlock,
  education: updateEducationBlock,
  certifications: updateCertificationsBlock,
} as const;

const idleState: CandidateProfileState = { status: "idle", errors: {} };

export function BlockCardEditor({
  editor,
  title,
  children,
}: {
  editor: BlockEditorInitial;
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={`Modifier le bloc ${title}`}
        className="text-subtle-foreground hover:text-foreground hover:border-ring focus-visible:ring-ring/35 absolute top-3.5 right-3.5 z-10 grid size-8 place-items-center rounded-md border border-transparent focus-visible:ring-[3px] focus-visible:outline-none"
      >
        {open ? <X aria-hidden="true" className="size-4" /> : <Pencil aria-hidden="true" className="size-4" />}
      </button>

      {children}

      {open && (
        <section aria-label={`Éditer ${title}`} className="border-border bg-surface mt-2 rounded-lg border p-4 sm:p-5">
          <VariantForm editor={editor} onCancel={() => setOpen(false)} />
        </section>
      )}
    </div>
  );
}

function VariantForm({ editor, onCancel }: { editor: BlockEditorInitial; onCancel: () => void }) {
  const [state, formAction, pending] = useActionState(BLOCK_ACTIONS[editor.variant], idleState);

  return (
    <form action={formAction} noValidate className="space-y-4">
      {state.status === "error" && (
        <div className="border-border bg-danger-50 text-danger-700 rounded-md border px-3 py-2 text-sm">
          {state.message || "Une erreur est survenue."}
        </div>
      )}
      {state.status === "invalid" && (
        <div className="text-danger-700 rounded-md px-3 py-2 text-sm">
          <p className="font-medium">Veuillez corriger :</p>
          <ul className="mt-0.5 list-disc pl-5">
            {Object.values(state.errors)
              .flat()
              .slice(0, 3)
              .map((message, idx) => (
                <li key={idx}>{message}</li>
              ))}
          </ul>
        </div>
      )}

      {editor.variant === "summary" && <SummaryFields initial={editor.summary} />}
      {editor.variant === "availability" && <AvailabilityFields editor={editor} />}
      {editor.variant === "skills" && <SkillsFields initial={editor.skills} />}
      {editor.variant === "languages" && <LanguagesFields initial={editor.languages} />}
      {editor.variant === "experiences" && <ExperiencesFields initial={editor.experiences} />}
      {editor.variant === "education" && <EducationFields initial={editor.education} />}
      {editor.variant === "certifications" && <CertificationsFields initial={editor.certifications} />}

      <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Champs par bloc                                                     */
/* ------------------------------------------------------------------ */

function SummaryFields({ initial }: { initial: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="block-summary">Résumé professionnel</Label>
      <Textarea id="block-summary" name="summary" rows={6} defaultValue={initial} required />
    </div>
  );
}

function AvailabilityFields({
  editor,
}: {
  editor: Extract<BlockEditorInitial, { variant: "availability" }>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="block-availability">Disponibilité déclarée</Label>
        <Select id="block-availability" name="declaredAvailability" defaultValue={editor.declaredAvailability ?? ""}>
          <option value="">Sélectionner…</option>
          {Object.values(AVAILABILITY_TYPE).map((type) => (
            <option key={type} value={type}>
              {AVAILABILITY_TYPE_LABEL[type]}
            </option>
          ))}
        </Select>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-foreground text-sm font-medium">Types de contrat recherchés</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {Object.values(CONTRACT_TYPE).map((type) => (
            <label key={type} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="desiredContractTypes"
                value={type}
                defaultChecked={editor.desiredContractTypes.includes(type)}
              />
              {CONTRACT_TYPE_LABEL[type]}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isRemoteEligible" defaultChecked={editor.isRemoteEligible} />
        Ouvert au télétravail
      </label>
      <p className="text-subtle-foreground text-xs">
        La disponibilité affichée reste vérifiée par l&apos;équipe Kaji.
      </p>
    </div>
  );
}

function SkillsFields({
  initial,
}: {
  initial: Extract<BlockEditorInitial, { variant: "skills" }>["skills"];
}) {
  const [rows, setRows] = useState(() => {
    const mapped = initial.map((s) => ({
      label: s.label,
      level: String(s.level),
      yearsOfPractice: s.yearsOfPractice !== undefined ? String(s.yearsOfPractice) : "",
    }));
    return mapped.length > 0 ? mapped : [{ label: "", level: "3", yearsOfPractice: "" }];
  });
  const add = () => setRows([...rows, { label: "", level: "3", yearsOfPractice: "" }]);

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, i) => (
        <div key={i} className="border-border flex flex-col gap-2 rounded-md border p-3 sm:flex-row">
          <Input name={`skills[${i}].label`} defaultValue={row.label} placeholder="Compétence (ex. Excel, Java, Gestion)" />
          <Select name={`skills[${i}].level`} defaultValue={row.level} className="sm:w-32">
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                Niveau {n}
              </option>
            ))}
          </Select>
          <Input
            type="number"
            name={`skills[${i}].yearsOfPractice`}
            defaultValue={row.yearsOfPractice}
            placeholder="Années d'usage"
            min={0}
            max={50}
            className="sm:w-40"
          />
          {i > 0 && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setRows(rows.filter((_, idx) => idx !== i))}>
              Supprimer
            </Button>
          )}
        </div>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={add} className="self-start">
        + Ajouter une compétence
      </Button>
    </div>
  );
}

function LanguagesFields({
  initial,
}: {
  initial: Extract<BlockEditorInitial, { variant: "languages" }>["languages"];
}) {
  const [rows, setRows] = useState(() => {
    const mapped = initial.map((l) => ({ code: l.code, level: l.level }));
    return mapped.length > 0 ? mapped : [{ code: "", level: "" }];
  });
  const add = () => setRows([...rows, { code: "", level: "" }]);

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, i) => (
        <div key={i} className="border-border flex flex-col gap-2 rounded-md border p-3 sm:flex-row">
          <Select name={`languages[${i}].code`} defaultValue={row.code}>
            <option value="">Langue…</option>
            {Object.values(LANGUAGE_CODE).map((code) => (
              <option key={code} value={code}>
                {LANGUAGE_CODE_LABEL[code]}
              </option>
            ))}
          </Select>
          <Select name={`languages[${i}].level`} defaultValue={row.level}>
            <option value="">Niveau…</option>
            {Object.values(LANGUAGE_LEVEL).map((level) => (
              <option key={level} value={level}>
                {LANGUAGE_LEVEL_LABEL[level]}
              </option>
            ))}
          </Select>
          {i > 0 && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setRows(rows.filter((_, idx) => idx !== i))}>
              Supprimer
            </Button>
          )}
        </div>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={add} className="self-start">
        + Ajouter une langue
      </Button>
    </div>
  );
}

function ExperiencesFields({
  initial,
}: {
  initial: Extract<BlockEditorInitial, { variant: "experiences" }>["experiences"];
}) {
  const [rows, setRows] = useState(() => {
    const mapped = initial.map((e) => ({
      title: e.title,
      organization: e.organization,
      location: e.location ?? "",
      startDate: e.startDate,
      isCurrent: e.isCurrent,
      endDate: e.endDate ?? "",
      summary: e.summary ?? "",
      achievements: e.achievements.join("\n"),
    }));
    return mapped.length > 0 ? mapped : [{ title: "", organization: "", location: "", startDate: "", isCurrent: false, endDate: "", summary: "", achievements: "" }];
  });
  const add = () => setRows([...rows, { title: "", organization: "", location: "", startDate: "", isCurrent: false, endDate: "", summary: "", achievements: "" }]);

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, i) => (
        <fieldset key={i} className="border-border flex flex-col gap-2 rounded-md border p-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Input name={`experiences[${i}].title`} defaultValue={row.title} placeholder="Intitulé du poste" />
            <Input name={`experiences[${i}].organization`} defaultValue={row.organization} placeholder="Entreprise / Organisation" />
          </div>
          <Input name={`experiences[${i}].location`} defaultValue={row.location} placeholder="Lieu (Ville, RDC)" />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Input type="month" name={`experiences[${i}].startDate`} defaultValue={row.startDate} />
            <Input type="month" name={`experiences[${i}].endDate`} defaultValue={row.endDate} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name={`experiences[${i}].isCurrent`} defaultChecked={row.isCurrent} />
              Poste actuel
            </label>
          </div>
          <Textarea name={`experiences[${i}].summary`} defaultValue={row.summary} rows={2} placeholder="Description des missions" />
          <Textarea name={`experiences[${i}].achievements`} defaultValue={row.achievements} rows={2} placeholder="Réalisations marquantes (une par ligne)" />
          {i > 0 && (
            <div className="flex justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={() => setRows(rows.filter((_, idx) => idx !== i))}>
                Supprimer cette expérience
              </Button>
            </div>
          )}
        </fieldset>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={add} className="self-start">
        + Ajouter une expérience
      </Button>
    </div>
  );
}

function EducationFields({
  initial,
}: {
  initial: Extract<BlockEditorInitial, { variant: "education" }>["education"];
}) {
  const [rows, setRows] = useState(() => {
    const mapped = initial.map((e) => ({
      diploma: e.diploma,
      school: e.school,
      field: e.field ?? "",
      startDate: e.startDate ?? "",
      endDate: e.endDate ?? "",
    }));
    return mapped.length > 0 ? mapped : [{ diploma: "", school: "", field: "", startDate: "", endDate: "" }];
  });
  const add = () => setRows([...rows, { diploma: "", school: "", field: "", startDate: "", endDate: "" }]);

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, i) => (
        <fieldset key={i} className="border-border flex flex-col gap-2 rounded-md border p-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Input name={`education[${i}].diploma`} defaultValue={row.diploma} placeholder="Diplôme / Qualification" />
            <Input name={`education[${i}].school`} defaultValue={row.school} placeholder="Établissement" />
          </div>
          <Input name={`education[${i}].field`} defaultValue={row.field} placeholder="Filière / Spécialisation" />
          <div className="grid grid-cols-2 gap-2">
            <Input type="month" name={`education[${i}].startDate`} defaultValue={row.startDate} aria-label="Début (mois et année)" />
            <Input type="month" name={`education[${i}].endDate`} defaultValue={row.endDate} aria-label="Fin (mois et année)" />
          </div>
          {i > 0 && (
            <div className="flex justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={() => setRows(rows.filter((_, idx) => idx !== i))}>
                Supprimer cette formation
              </Button>
            </div>
          )}
        </fieldset>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={add} className="self-start">
        + Ajouter une formation
      </Button>
    </div>
  );
}

function CertificationsFields({
  initial,
}: {
  initial: Extract<BlockEditorInitial, { variant: "certifications" }>["certifications"];
}) {
  const [rows, setRows] = useState(() => {
    const mapped = initial.map((c) => ({
      name: c.name,
      issuer: c.issuer,
      issuedAt: c.issuedAt ?? "",
      expiresAt: c.expiresAt ?? "",
    }));
    return mapped.length > 0 ? mapped : [{ name: "", issuer: "", issuedAt: "", expiresAt: "" }];
  });
  const add = () => setRows([...rows, { name: "", issuer: "", issuedAt: "", expiresAt: "" }]);

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, i) => (
        <fieldset key={i} className="border-border flex flex-col gap-2 rounded-md border p-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Input name={`certifications[${i}].name`} defaultValue={row.name} placeholder="Nom de la certification" />
            <Input name={`certifications[${i}].issuer`} defaultValue={row.issuer} placeholder="Organisme délivreur" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input type="month" name={`certifications[${i}].issuedAt`} defaultValue={row.issuedAt} aria-label="Obtention (mois et année)" />
            <Input type="month" name={`certifications[${i}].expiresAt`} defaultValue={row.expiresAt} aria-label="Expiration (mois et année, si applicable)" />
          </div>
          {i > 0 && (
            <div className="flex justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={() => setRows(rows.filter((_, idx) => idx !== i))}>
                Supprimer cette certification
              </Button>
            </div>
          )}
        </fieldset>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={add} className="self-start">
        + Ajouter une certification
      </Button>
    </div>
  );
}