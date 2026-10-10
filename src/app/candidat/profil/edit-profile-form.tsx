"use client";

import { useActionState, useState } from "react";
import { updateCandidateProfile, type CandidateProfileState } from "./actions";
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
  PROFILE_VISIBILITY,
  PROFILE_VISIBILITY_LABEL,
} from "@/lib/domain/enums";

type SkillRow = { label: string; level: number; yearsOfPractice: string };
type LanguageRow = { code: string; level: string };
type ExperienceRow = {
  title: string;
  organization: string;
  location: string;
  startDate: string;
  isCurrent: boolean;
  endDate: string;
  summary: string;
  achievements: string;
};
type EducationRow = { diploma: string; school: string; field: string; startYear: string; endYear: string };
type CertificationRow = { name: string; issuer: string; issuedYear: string; expiresAt: string };

export type EditProfileInitialValues = {
  readonly fullName: string;
  readonly email: string;
  readonly phone: string;
  readonly headline: string;
  readonly categoryLabel: string;
  readonly domainLabels: string;
  readonly city: string;
  readonly country: string;
  readonly isRemoteEligible: boolean;
  readonly yearsOfExperience: number;
  readonly summary: string;
  readonly declaredAvailability: string;
  readonly desiredContractTypes: readonly string[];
  readonly profileVisibility: string;
  readonly skills: readonly SkillRow[];
  readonly languages: readonly LanguageRow[];
  readonly experiences: readonly ExperienceRow[];
  readonly education: readonly EducationRow[];
  readonly certifications: readonly CertificationRow[];
};

const initialState: CandidateProfileState = {
  status: "idle",
  errors: {},
};

export function EditProfileForm({ initial }: { readonly initial: EditProfileInitialValues }) {
  const [skills, setSkills] = useState<SkillRow[]>(() =>
    initial.skills.map((s) => ({ label: s.label, level: s.level, yearsOfPractice: String(s.yearsOfPractice ?? "") })),
  );
  const [languages, setLanguages] = useState<LanguageRow[]>(() =>
    initial.languages.map((l) => ({ code: l.code, level: l.level })),
  );
  const [contracts, setContracts] = useState<string[]>(() => [...initial.desiredContractTypes]);
  const [experiences, setExperiences] = useState<ExperienceRow[]>(() => initial.experiences.map((e) => ({ ...e })));
  const [education, setEducation] = useState<EducationRow[]>(() => initial.education.map((e) => ({ ...e })));
  const [certifications, setCertifications] = useState<CertificationRow[]>(() =>
    initial.certifications.map((c) => ({ ...c })),
  );
  const [state, formAction, pending] = useActionState(updateCandidateProfile, initialState);

  const addSkill = () => setSkills([...skills, { label: "", level: 3, yearsOfPractice: "" }]);
  const removeSkill = (i: number) => setSkills(skills.filter((_, idx) => idx !== i));
  const addLanguage = () => setLanguages([...languages, { code: "FR", level: "PROFESSIONAL" }]);
  const removeLanguage = (i: number) => setLanguages(languages.filter((_, idx) => idx !== i));
  const toggleContract = (value: string) =>
    setContracts((prev) => (prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]));

  const emptyExperience = (): ExperienceRow => ({
    title: "",
    organization: "",
    location: "",
    startDate: "",
    isCurrent: false,
    endDate: "",
    summary: "",
    achievements: "",
  });
  const addExperience = () => setExperiences([...experiences, emptyExperience()]);
  const removeExperience = (i: number) => setExperiences(experiences.filter((_, idx) => idx !== i));

  const emptyEducation = (): EducationRow => ({ diploma: "", school: "", field: "", startYear: "", endYear: "" });
  const addEducation = () => setEducation([...education, emptyEducation()]);
  const removeEducation = (i: number) => setEducation(education.filter((_, idx) => idx !== i));

  const emptyCertification = (): CertificationRow => ({ name: "", issuer: "", issuedYear: "", expiresAt: "" });
  const addCertification = () => setCertifications([...certifications, emptyCertification()]);
  const removeCertification = (i: number) => setCertifications(certifications.filter((_, idx) => idx !== i));

  return (
    <form action={formAction} noValidate className="space-y-8">
      {state.status === "error" && (
        <div className="rounded-md border border-red-300 bg-red-50 p-4 text-red-800">
          {state.message || "Une erreur est survenue."}
        </div>
      )}

      {state.status === "invalid" && (
        <div className="rounded-md border border-red-300 bg-red-50 p-4 text-red-800">
          <p className="font-medium">Veuillez corriger les champs en erreur :</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            {Object.entries(state.errors).map(([field, messages]) => (
              <li key={field}>{messages[0]}</li>
            ))}
          </ul>
        </div>
      )}

      <section className="rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Identité & profil professionnel</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Nom complet *</Label>
            <Input id="fullName" name="fullName" defaultValue={initial.fullName} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="headline">Titre professionnel *</Label>
            <Input id="headline" name="headline" defaultValue={initial.headline} required placeholder="Ex. Ingénieur Informaticien" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" defaultValue={initial.email} readOnly disabled />
            <p className="text-muted-foreground text-xs">L&apos;e-mail est géré par votre compte.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="telephone">Numéro de téléphone</Label>
            <Input id="telephone" name="telephone" type="tel" defaultValue={initial.phone} placeholder="+243..." />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="categoryLabel">Catégorie *</Label>
            <Input id="categoryLabel" name="categoryLabel" defaultValue={initial.categoryLabel} required placeholder="Ex. Technologies de l'Information" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="domainLabels">Domaines (séparés par virgules)</Label>
            <Input id="domainLabels" name="domainLabels" defaultValue={initial.domainLabels} placeholder="Ex. Développement, Réseaux" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="city">Ville / Territoire *</Label>
            <Input id="city" name="city" defaultValue={initial.city} required placeholder="Ex. Lubumbashi" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="country">Pays</Label>
            <Input id="country" name="country" defaultValue={initial.country} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="yearsOfExperience">Années d&apos;expérience *</Label>
            <Input id="yearsOfExperience" name="yearsOfExperience" type="number" min={0} max={50} defaultValue={initial.yearsOfExperience} required />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="summary">Résumé professionnel *</Label>
          <Textarea id="summary" name="summary" rows={4} defaultValue={initial.summary} required />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" name="isRemoteEligible" id="remote" defaultChecked={initial.isRemoteEligible} className="size-4" />
          <Label htmlFor="remote" className="font-normal">Eligible au télétravail / remote</Label>
        </div>
      </section>

      <section className="rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Disponibilité & visibilité</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="declaredAvailability">Disponibilité déclarée</Label>
            <Select id="declaredAvailability" name="declaredAvailability" defaultValue={initial.declaredAvailability}>
              <option value="">Sélectionner...</option>
              {Object.values(AVAILABILITY_TYPE).map((avail) => (
                <option key={avail} value={avail}>{AVAILABILITY_TYPE_LABEL[avail]}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profileVisibility">Visibilité du profil *</Label>
            <Select id="profileVisibility" name="profileVisibility" defaultValue={initial.profileVisibility} required>
              {Object.values(PROFILE_VISIBILITY).map((vis) => (
                <option key={vis} value={vis}>{PROFILE_VISIBILITY_LABEL[vis]}</option>
              ))}
            </Select>
          </div>
        </div>
        <div>
          <Label>Types de contrat recherchés</Label>
          <div className="flex flex-wrap gap-4 mt-1.5">
            {Object.values(CONTRACT_TYPE).map((type) => (
              <label key={type} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="desiredContractTypes"
                  value={type}
                  checked={contracts.includes(type)}
                  onChange={() => toggleContract(type)}
                />
                {CONTRACT_TYPE_LABEL[type]}
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Compétences & langues</h2>

        <div>
          <Label>Compétences *</Label>
          <div className="mt-2 space-y-3">
            {skills.map((skill, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-2 border rounded-md p-4">
                <Input name={`skills[${i}].label`} defaultValue={skill.label} placeholder="Compétence (ex. Excel, Java, Gestion)" required />
                <Select name={`skills[${i}].level`} defaultValue={skill.level}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>Niveau {n}</option>
                  ))}
                </Select>
                <Input type="number" name={`skills[${i}].yearsOfPractice`} placeholder="Années d'usage" min={0} max={50} defaultValue={skill.yearsOfPractice} />
                {i > 0 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeSkill(i)}>Supprimer</Button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addSkill} className="text-sm text-blue-600 underline mt-2">Ajouter une compétence</button>
        </div>

        <div className="pt-4">
          <Label>Langues *</Label>
          <div className="mt-2 space-y-3">
            {languages.map((lang, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-[2fr_2fr_auto] gap-2 border rounded-md p-4">
                <Select name={`languages[${i}].code`} defaultValue={lang.code}>
                  {Object.values(LANGUAGE_CODE).map((code) => (
                    <option key={code} value={code}>{LANGUAGE_CODE_LABEL[code]}</option>
                  ))}
                </Select>
                <Select name={`languages[${i}].level`} defaultValue={lang.level}>
                  {Object.values(LANGUAGE_LEVEL).map((level) => (
                    <option key={level} value={level}>{LANGUAGE_LEVEL_LABEL[level]}</option>
                  ))}
                </Select>
                {i > 0 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeLanguage(i)}>Supprimer</Button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addLanguage} className="text-sm text-blue-600 underline mt-2">Ajouter une langue</button>
        </div>
      </section>

      <section className="rounded-lg border p-6 space-y-6">
        <h2 className="text-lg font-semibold">Parcours professionnel</h2>

        <div>
          <Label>Expériences professionnelles</Label>
          <div className="mt-2 space-y-3">
            {experiences.map((exp, i) => (
              <div key={i} className="space-y-3 border rounded-md p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input name={`experiences[${i}].title`} defaultValue={exp.title} placeholder="Intitulé du poste" />
                  <Input name={`experiences[${i}].organization`} defaultValue={exp.organization} placeholder="Entreprise / Organisation" />
                </div>
                <Input name={`experiences[${i}].location`} defaultValue={exp.location} placeholder="Lieu (Ville, Pays)" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input type="date" name={`experiences[${i}].startDate`} defaultValue={exp.startDate} />
                  <Input type="date" name={`experiences[${i}].endDate`} defaultValue={exp.endDate} />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name={`experiences[${i}].isCurrent`} defaultChecked={exp.isCurrent} className="size-4" />
                    Poste actuel
                  </label>
                </div>
                <Textarea name={`experiences[${i}].summary`} defaultValue={exp.summary} rows={2} placeholder="Description des missions" />
                <Textarea name={`experiences[${i}].achievements`} defaultValue={exp.achievements} rows={2} placeholder="Réalisations marquantes (une par ligne)" />
                {i > 0 && (
                  <div className="flex justify-end">
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeExperience(i)}>Supprimer cette expérience</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addExperience} className="text-sm text-blue-600 underline mt-2">Ajouter une expérience</button>
        </div>

        <div>
          <Label>Formations</Label>
          <div className="mt-2 space-y-3">
            {education.map((edu, i) => (
              <div key={i} className="space-y-3 border rounded-md p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input name={`education[${i}].diploma`} defaultValue={edu.diploma} placeholder="Diplôme / Qualification" />
                  <Input name={`education[${i}].school`} defaultValue={edu.school} placeholder="Établissement" />
                </div>
                <Input name={`education[${i}].field`} defaultValue={edu.field} placeholder="Filière / Spécialisation" />
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" name={`education[${i}].startYear`} defaultValue={edu.startYear} placeholder="Année début" min={1900} max={2100} />
                  <Input type="number" name={`education[${i}].endYear`} defaultValue={edu.endYear} placeholder="Année d'obtention" min={1900} max={2100} />
                </div>
                {i > 0 && (
                  <div className="flex justify-end">
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeEducation(i)}>Supprimer cette formation</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addEducation} className="text-sm text-blue-600 underline mt-2">Ajouter une formation</button>
        </div>

        <div>
          <Label>Certifications</Label>
          <div className="mt-2 space-y-3">
            {certifications.map((cert, i) => (
              <div key={i} className="space-y-3 border rounded-md p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input name={`certifications[${i}].name`} defaultValue={cert.name} placeholder="Nom de la certification" />
                  <Input name={`certifications[${i}].issuer`} defaultValue={cert.issuer} placeholder="Organisme délivreur" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" name={`certifications[${i}].issuedYear`} defaultValue={cert.issuedYear} placeholder="Année d'obtention" min={1900} max={2100} />
                  <Input type="date" name={`certifications[${i}].expiresAt`} defaultValue={cert.expiresAt} />
                </div>
                {i > 0 && (
                  <div className="flex justify-end">
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeCertification(i)}>Supprimer cette certification</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addCertification} className="text-sm text-blue-600 underline mt-2">Ajouter une certification</button>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </div>
    </form>
  );
}