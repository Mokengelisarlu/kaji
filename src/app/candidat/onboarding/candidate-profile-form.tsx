"use client";

import { useActionState, useEffect, useRef, useState, type ChangeEvent } from "react";
import { submitCandidateProfile, type CandidateProfileState } from "./actions";
import {
  clearCandidateProfileDraft,
  loadCandidateProfileDraft,
  saveCandidateProfileDraft,
  type CandidateProfileDraftCertification,
  type CandidateProfileDraftEducation,
  type CandidateProfileDraftExperience,
  type CandidateProfileDraftLanguage,
  type CandidateProfileDraftSkill,
} from "@/lib/candidate-profile-draft";
import {
  PROFILE_VISIBILITY,
  PROFILE_VISIBILITY_LABEL,
  AVAILABILITY_TYPE,
  AVAILABILITY_TYPE_LABEL,
  CONTRACT_TYPE,
  CONTRACT_TYPE_LABEL,
  LANGUAGE_CODE,
  LANGUAGE_CODE_LABEL,
  LANGUAGE_LEVEL,
  LANGUAGE_LEVEL_LABEL,
} from "@/lib/domain/enums";

const RDC_PROVINCES = [
  "Kinshasa",
  "Kongo-Central",
  "Kwango",
  "Kwilu",
  "Mai-Ndombe",
  "Kasaï",
  "Kasaï-Central",
  "Kasaï-Oriental",
  "Lomami",
  "Sankuru",
  "Maniema",
  "Sud-Kivu",
  "Nord-Kivu",
  "Ituri",
  "Haut-Uele",
  "Tshopo",
  "Bas-Uele",
  "Nord-Ubangi",
  "Mongala",
  "Sud-Ubangi",
  "Équateur",
  "Tshuapa",
  "Tanganyika",
  "Haut-Lomami",
  "Lualaba",
  "Haut-Katanga",
] as const;

const initialState: CandidateProfileState = {
  status: "idle",
  errors: {},
};

const STEP_BY_FIELD: Record<string, number> = {
  nom: 1, postnom: 1, prenom: 1, civilite: 1, sexe: 1, dateNaissance: 1, lieuNaissance: 1, nationalite: 1,
  province: 2, city: 2, country: 2, commune: 2, quartier: 2, adresse: 2, telephone: 2,
  headline: 3, categoryLabel: 3, domainLabels: 3, summary: 3, yearsOfExperience: 3,
  declaredAvailability: 3, desiredContractTypes: 3, isRemoteEligible: 3,
  experiences: 4, education: 4,
  skills: 5, languages: 5, certifications: 5,
  profileVisibility: 6,
};

const DEFAULT_VALUES: Record<string, string> = {
  civilite: "",
  sexe: "",
  nationalite: "Congolaise",
  country: "République Démocratique du Congo",
  profileVisibility: PROFILE_VISIBILITY.PUBLIC,
};

const emptySkill = (): CandidateProfileDraftSkill => ({ label: "", level: "3", yearsOfPractice: "" });
const emptyLanguage = (): CandidateProfileDraftLanguage => ({ code: LANGUAGE_CODE.FR, level: LANGUAGE_LEVEL.NATIVE });
const emptyExperience = (): CandidateProfileDraftExperience => ({
  title: "",
  organization: "",
  location: "",
  startDate: "",
  isCurrent: false,
  endDate: "",
  summary: "",
  achievements: "",
});
const emptyEducation = (): CandidateProfileDraftEducation => ({
  diploma: "",
  school: "",
  field: "",
  startDate: "",
  endDate: "",
});
const emptyCertification = (): CandidateProfileDraftCertification => ({
  name: "",
  issuer: "",
  issuedAt: "",
  expiresAt: "",
});

/**
 * Formulaire d'inscription candidat (6 étapes).
 *
 * Tous les champs sont *contrôlés* par l'état React : c'est ce qui garantit
 * qu'aucune donnée n'est perdue lorsque l'action serveur renvoie une erreur
 * de validation (React réinitialise les champs non contrôlés après une action
 * de formulaire, pas les champs contrôlés).
 *
 * Le brouillon complet (étape, champs simples, cases à cocher, lignes
 * dynamiques) est sauvegardé dans `localStorage` à chaque modification et
 * restauré au retour, puis effacé uniquement après création réussie du profil.
 */
export function CandidateProfileForm() {
  const [initialDraft] = useState(() => loadCandidateProfileDraft());
  const [step, setStep] = useState(initialDraft?.step ?? 1);

  const [values, setValues] = useState<Record<string, string>>(() => ({
    ...DEFAULT_VALUES,
    ...(initialDraft?.values ?? {}),
  }));
  const [checked, setChecked] = useState<Record<string, string[]>>(() => initialDraft?.checked ?? {});
  const [skills, setSkills] = useState<CandidateProfileDraftSkill[]>(() =>
    initialDraft?.arrays.skills.length ? initialDraft.arrays.skills : [emptySkill()],
  );
  const [languages, setLanguages] = useState<CandidateProfileDraftLanguage[]>(() =>
    initialDraft?.arrays.languages.length ? initialDraft.arrays.languages : [emptyLanguage()],
  );
  const [experiences, setExperiences] = useState<CandidateProfileDraftExperience[]>(() =>
    initialDraft?.arrays.experiences.length ? initialDraft.arrays.experiences : [emptyExperience()],
  );
  const [education, setEducation] = useState<CandidateProfileDraftEducation[]>(() =>
    initialDraft?.arrays.education.length ? initialDraft.arrays.education : [emptyEducation()],
  );
  const [certifications, setCertifications] = useState<CandidateProfileDraftCertification[]>(() =>
    initialDraft?.arrays.certifications.length ? initialDraft.arrays.certifications : [emptyCertification()],
  );

  const [state, formAction, pending] = useActionState(
    async (prev: CandidateProfileState, formData: FormData) => {
      const result = await submitCandidateProfile(prev, formData);
      if (result.status === "invalid") {
        const first = Object.keys(result.errors)[0];
        const root = first?.split(".")[0];
        if (first) setStep(STEP_BY_FIELD[first] ?? (root ? STEP_BY_FIELD[root] : undefined) ?? 1);
      }
      return result;
    },
    initialState,
  );

  const dirty = useRef(false);
  const touch = () => {
    dirty.current = true;
  };

  const isRemoteEligible = checked.isRemoteEligible === undefined ? true : checked.isRemoteEligible.length > 0;
  const desiredContractTypes = checked.desiredContractTypes ?? [];

  const setField = (name: string) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    touch();
    const { value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const bind = (name: string) => ({
    name,
    value: values[name] ?? "",
    onChange: setField(name),
  });

  const toggleChecked = (name: string, value: string, next: boolean) => {
    touch();
    setChecked((prev) => {
      const list = new Set(prev[name] ?? []);
      if (next) list.add(value);
      else list.delete(value);
      return { ...prev, [name]: [...list] };
    });
  };

  const updateSkill = (index: number, patch: Partial<CandidateProfileDraftSkill>) => {
    touch();
    setSkills((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };
  const addSkill = () => {
    touch();
    setSkills((rows) => [...rows, emptySkill()]);
  };
  const removeSkill = (index: number) => {
    touch();
    setSkills((rows) => rows.filter((_, i) => i !== index));
  };

  const updateLanguage = (index: number, patch: Partial<CandidateProfileDraftLanguage>) => {
    touch();
    setLanguages((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };
  const addLanguage = () => {
    touch();
    setLanguages((rows) => [...rows, emptyLanguage()]);
  };
  const removeLanguage = (index: number) => {
    touch();
    setLanguages((rows) => rows.filter((_, i) => i !== index));
  };

  const updateExperience = (index: number, patch: Partial<CandidateProfileDraftExperience>) => {
    touch();
    setExperiences((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };
  const addExperience = () => {
    touch();
    setExperiences((rows) => [...rows, emptyExperience()]);
  };
  const removeExperience = (index: number) => {
    touch();
    setExperiences((rows) => rows.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, patch: Partial<CandidateProfileDraftEducation>) => {
    touch();
    setEducation((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };
  const addEducation = () => {
    touch();
    setEducation((rows) => [...rows, emptyEducation()]);
  };
  const removeEducation = (index: number) => {
    touch();
    setEducation((rows) => rows.filter((_, i) => i !== index));
  };

  const updateCertification = (index: number, patch: Partial<CandidateProfileDraftCertification>) => {
    touch();
    setCertifications((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };
  const addCertification = () => {
    touch();
    setCertifications((rows) => [...rows, emptyCertification()]);
  };
  const removeCertification = (index: number) => {
    touch();
    setCertifications((rows) => rows.filter((_, i) => i !== index));
  };

  // Sauvegarde du brouillon à chaque modification (jamais avant la première
  // interaction : un visiteur qui arrive ne doit pas créer de faux brouillon).
  useEffect(() => {
    if (!dirty.current) return;
    saveCandidateProfileDraft({
      step,
      values,
      checked,
      arrays: { skills, languages, experiences, education, certifications },
    });
  }, [step, values, checked, skills, languages, experiences, education, certifications]);

  useEffect(() => {
    if (state.status === "success") clearCandidateProfileDraft();
  }, [state.status]);

  const nextStep = () => {
    touch();
    setStep((current) => Math.min(current + 1, 6));
  };
  const prevStep = () => {
    touch();
    setStep((current) => Math.max(current - 1, 1));
  };

  return (
    <form action={formAction} noValidate className="space-y-8">
      <div className="flex items-center justify-between text-sm text-gray-600">
        {[1,2,3,4,5,6].map(s => (
          <div key={s} className={`flex-1 text-center ${step === s ? "font-semibold text-blue-600" : ""}`}>
            Étape {s}/6
          </div>
        ))}
      </div>
      
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

      <section className={`rounded-lg border p-6 space-y-4 ${step === 1 ? "" : "hidden"}`}>
        <h2 className="text-lg font-semibold">1. Identité</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Civilité</label>
              <select {...bind("civilite")} className="w-full rounded-md border px-3 py-2">
                <option value="">Sélectionner...</option>
                <option value="M">Monsieur</option>
                <option value="Mme">Madame</option>
                <option value="Mlle">Mademoiselle</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sexe</label>
              <select {...bind("sexe")} className="w-full rounded-md border px-3 py-2">
                <option value="">Sélectionner...</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom *</label>
              <input {...bind("nom")} className="w-full rounded-md border px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Postnom</label>
              <input {...bind("postnom")} className="w-full rounded-md border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prénom *</label>
              <input {...bind("prenom")} className="w-full rounded-md border px-3 py-2" required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date de naissance</label>
              <input type="date" {...bind("dateNaissance")} className="w-full rounded-md border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Lieu de naissance</label>
              <input {...bind("lieuNaissance")} className="w-full rounded-md border px-3 py-2" placeholder="Ville, RDC" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nationalité</label>
            <input {...bind("nationalite")} className="w-full rounded-md border px-3 py-2" />
          </div>
      </section>

      <section className={`rounded-lg border p-6 space-y-4 ${step === 2 ? "" : "hidden"}`}>
        <h2 className="text-lg font-semibold">2. Contact & Localisation (RDC)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Province *</label>
              <select {...bind("province")} className="w-full rounded-md border px-3 py-2" required>
                <option value="">Sélectionner...</option>
                {RDC_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ville / Territoire *</label>
              <input {...bind("city")} className="w-full rounded-md border px-3 py-2" required placeholder="Ex. Lubumbashi" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Commune</label>
              <input {...bind("commune")} className="w-full rounded-md border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quartier</label>
              <input {...bind("quartier")} className="w-full rounded-md border px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Adresse</label>
            <input {...bind("adresse")} className="w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Numéro de téléphone</label>
            <input {...bind("telephone")} className="w-full rounded-md border px-3 py-2" placeholder="+243..." />
          </div>
          <input type="hidden" {...bind("country")} />
      </section>

      <section className={`rounded-lg border p-6 space-y-4 ${step === 3 ? "" : "hidden"}`}>
        <h2 className="text-lg font-semibold">3. Profil professionnel</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Titre professionnel *</label>
            <input {...bind("headline")} className="w-full rounded-md border px-3 py-2" required placeholder="Ex. Ingénieur Informaticien" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Catégorie *</label>
              <input {...bind("categoryLabel")} className="w-full rounded-md border px-3 py-2" required placeholder="Ex. Technologies de l'Information" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Domaines (séparés par virgules)</label>
              <input {...bind("domainLabels")} className="w-full rounded-md border px-3 py-2" placeholder="Ex. Développement, Réseaux, Cybersécurité" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Résumé professionnel *</label>
            <textarea {...bind("summary")} rows={4} className="w-full rounded-md border px-3 py-2" required placeholder="Décrivez brièvement votre profil, vos réalisations et objectifs..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Années d&apos;expérience *</label>
              <input type="number" {...bind("yearsOfExperience")} className="w-full rounded-md border px-3 py-2" required min="0" max="50" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Disponibilité déclarée</label>
              <select {...bind("declaredAvailability")} className="w-full rounded-md border px-3 py-2">
                <option value="">Sélectionner...</option>
                {Object.values(AVAILABILITY_TYPE).map(avail => (
                  <option key={avail} value={avail}>{AVAILABILITY_TYPE_LABEL[avail]}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Types de contrat recherchés</label>
            <div className="flex flex-wrap gap-4">
              {Object.values(CONTRACT_TYPE).map(type => (
                <label key={type} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="desiredContractTypes"
                    value={type}
                    checked={desiredContractTypes.includes(type)}
                    onChange={(e) => toggleChecked("desiredContractTypes", type, e.target.checked)}
                  />
                  {CONTRACT_TYPE_LABEL[type]}
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isRemoteEligible"
              id="remote"
              checked={isRemoteEligible}
              onChange={(e) => toggleChecked("isRemoteEligible", "on", e.target.checked)}
            />
            <label htmlFor="remote" className="text-sm">Eligible au télétravail / remote</label>
          </div>
      </section>

      <section className={`rounded-lg border p-6 space-y-4 ${step === 4 ? "" : "hidden"}`}>
        <h2 className="text-lg font-semibold">4. Expériences & Formation</h2>
          <div>
            <h3 className="font-medium mb-3">Expériences professionnelles</h3>
            {experiences.map((experience, i) => (
              <div key={i} className="space-y-2 border rounded-md p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input name={`experiences[${i}].title`} value={experience.title} onChange={(e) => updateExperience(i, { title: e.target.value })} placeholder="Intitulé du poste" className="rounded-md border px-3 py-2" />
                  <input name={`experiences[${i}].organization`} value={experience.organization} onChange={(e) => updateExperience(i, { organization: e.target.value })} placeholder="Entreprise/Organisation" className="rounded-md border px-3 py-2" />
                </div>
                <input name={`experiences[${i}].location`} value={experience.location} onChange={(e) => updateExperience(i, { location: e.target.value })} placeholder="Lieu (Ville, RDC)" className="w-full rounded-md border px-3 py-2" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input type="month" name={`experiences[${i}].startDate`} value={experience.startDate} onChange={(e) => updateExperience(i, { startDate: e.target.value })} className="rounded-md border px-3 py-2" />
                  <input type="month" name={`experiences[${i}].endDate`} value={experience.endDate} onChange={(e) => updateExperience(i, { endDate: e.target.value })} className="rounded-md border px-3 py-2" />
                  <div className="flex items-center gap-2">
                    <input type="checkbox" name={`experiences[${i}].isCurrent`} id={`exp-current-${i}`} checked={experience.isCurrent} onChange={(e) => updateExperience(i, { isCurrent: e.target.checked })} />
                    <label htmlFor={`exp-current-${i}`} className="text-sm">Poste actuel</label>
                  </div>
                </div>
                <textarea name={`experiences[${i}].summary`} value={experience.summary} onChange={(e) => updateExperience(i, { summary: e.target.value })} rows={2} placeholder="Description des missions" className="w-full rounded-md border px-3 py-2" />
                <textarea name={`experiences[${i}].achievements`} value={experience.achievements} onChange={(e) => updateExperience(i, { achievements: e.target.value })} rows={2} placeholder="Réalisations marquantes (une par ligne)" className="w-full rounded-md border px-3 py-2" />
                {i > 0 && (
                  <button type="button" onClick={() => removeExperience(i)} className="text-sm text-red-600">Supprimer cette expérience</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addExperience} className="text-sm text-blue-600 underline">Ajouter une expérience</button>
          </div>

          <div className="mt-6">
            <h3 className="font-medium mb-3">Formations</h3>
            {education.map((item, i) => (
              <div key={i} className="space-y-2 border rounded-md p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input name={`education[${i}].diploma`} value={item.diploma} onChange={(e) => updateEducation(i, { diploma: e.target.value })} placeholder="Diplôme / Qualification" className="rounded-md border px-3 py-2" />
                  <input name={`education[${i}].school`} value={item.school} onChange={(e) => updateEducation(i, { school: e.target.value })} placeholder="Établissement (Université/Institut)" className="rounded-md border px-3 py-2" />
                </div>
                <input name={`education[${i}].field`} value={item.field} onChange={(e) => updateEducation(i, { field: e.target.value })} placeholder="Filière / Spécialisation" className="w-full rounded-md border px-3 py-2" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="month" name={`education[${i}].startDate`} value={item.startDate} onChange={(e) => updateEducation(i, { startDate: e.target.value })} aria-label="Début (mois et année)" className="rounded-md border px-3 py-2" />
                  <input type="month" name={`education[${i}].endDate`} value={item.endDate} onChange={(e) => updateEducation(i, { endDate: e.target.value })} aria-label="Fin (mois et année)" className="rounded-md border px-3 py-2" />
                </div>
                {i > 0 && (
                  <button type="button" onClick={() => removeEducation(i)} className="text-sm text-red-600">Supprimer cette formation</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addEducation} className="text-sm text-blue-600 underline">Ajouter une formation</button>
          </div>
      </section>

      <section className={`rounded-lg border p-6 space-y-4 ${step === 5 ? "" : "hidden"}`}>
        <h2 className="text-lg font-semibold">5. Compétences, Langues & Certifications</h2>
          <div>
            <h3 className="font-medium mb-3">Compétences *</h3>
            {skills.map((skill, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-2 border rounded-md p-4 mb-4">
                <input name={`skills[${i}].label`} value={skill.label} onChange={(e) => updateSkill(i, { label: e.target.value })} placeholder="Compétence (ex. Excel, Java, Gestion)" className="rounded-md border px-3 py-2" />
                <select name={`skills[${i}].level`} value={skill.level} onChange={(e) => updateSkill(i, { level: e.target.value })} className="rounded-md border px-3 py-2">
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>Niveau {n}</option>)}
                </select>
                <input type="number" name={`skills[${i}].yearsOfPractice`} value={skill.yearsOfPractice} onChange={(e) => updateSkill(i, { yearsOfPractice: e.target.value })} placeholder="Années d'usage" className="rounded-md border px-3 py-2" min="0" max="50" />
                {i > 0 && (
                  <button type="button" onClick={() => removeSkill(i)} className="text-sm text-red-600">Supprimer</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addSkill} className="text-sm text-blue-600 underline">Ajouter une compétence</button>
          </div>

          <div className="mt-6">
            <h3 className="font-medium mb-3">Langues *</h3>
            {languages.map((language, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-2 border rounded-md p-4 mb-4">
                <select name={`languages[${i}].code`} value={language.code} onChange={(e) => updateLanguage(i, { code: e.target.value })} className="rounded-md border px-3 py-2">
                  {Object.values(LANGUAGE_CODE).map(code => (
                    <option key={code} value={code}>{LANGUAGE_CODE_LABEL[code]}</option>
                  ))}
                </select>
                <select name={`languages[${i}].level`} value={language.level} onChange={(e) => updateLanguage(i, { level: e.target.value })} className="rounded-md border px-3 py-2">
                  {Object.values(LANGUAGE_LEVEL).map(level => (
                    <option key={level} value={level}>{LANGUAGE_LEVEL_LABEL[level]}</option>
                  ))}
                </select>
                {i > 0 && (
                  <button type="button" onClick={() => removeLanguage(i)} className="text-sm text-red-600">Supprimer</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addLanguage} className="text-sm text-blue-600 underline">Ajouter une langue</button>
          </div>

          <div className="mt-6">
            <h3 className="font-medium mb-3">Certifications</h3>
            {certifications.map((certification, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-2 border rounded-md p-4 mb-4">
                <input name={`certifications[${i}].name`} value={certification.name} onChange={(e) => updateCertification(i, { name: e.target.value })} placeholder="Nom de la certification" className="rounded-md border px-3 py-2" />
                <input name={`certifications[${i}].issuer`} value={certification.issuer} onChange={(e) => updateCertification(i, { issuer: e.target.value })} placeholder="Organisme délivreur" className="rounded-md border px-3 py-2" />
                <input type="month" name={`certifications[${i}].issuedAt`} value={certification.issuedAt} onChange={(e) => updateCertification(i, { issuedAt: e.target.value })} aria-label="Obtention (mois et année)" className="rounded-md border px-3 py-2" />
                <input type="month" name={`certifications[${i}].expiresAt`} value={certification.expiresAt} onChange={(e) => updateCertification(i, { expiresAt: e.target.value })} aria-label="Expiration (mois et année, si applicable)" className="rounded-md border px-3 py-2" />
                {i > 0 && (
                  <button type="button" onClick={() => removeCertification(i)} className="text-sm text-red-600">Supprimer</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addCertification} className="text-sm text-blue-600 underline">Ajouter une certification</button>
          </div>
      </section>

      <section className={`rounded-lg border p-6 space-y-4 ${step === 6 ? "" : "hidden"}`}>
        <h2 className="text-lg font-semibold">6. Visibilité & Finalisation</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Visibilité du profil *</label>
            <select {...bind("profileVisibility")} className="w-full rounded-md border px-3 py-2" required>
              {Object.values(PROFILE_VISIBILITY).map(vis => (
                <option key={vis} value={vis}>{PROFILE_VISIBILITY_LABEL[vis]}</option>
              ))}
            </select>
            <div className="text-xs text-gray-600 mt-2 space-y-1">
              <p><strong>Public</strong> : Votre profil est visible dans l&apos;annuaire des talents au niveau national et international.</p>
              <p><strong>Visible sur demande</strong> : Non listé publiquement, uniquement accessible sur demande explicite d&apos;une entreprise.</p>
              <p><strong>Privé</strong> : Masqué de tout canal externe. Vous restez visible uniquement à vous-même.</p>
            </div>
          </div>
          <div className="rounded-md border bg-blue-50 p-4 text-sm text-blue-800">
            En soumettant ce formulaire, vous confirmez que les informations fournies sont exactes et conformes à la réalité de votre parcours professionnel en RDC.
          </div>
      </section>

      <div className="flex justify-between">
        {step > 1 && (
          <button type="button" onClick={prevStep} className="rounded-md border px-4 py-2 hover:bg-gray-50">
            ← Précédent
          </button>
        )}
        {step < 6 && (
          <button type="button" onClick={nextStep} className="ml-auto rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Suivant →
          </button>
        )}
        {step === 6 && (
          <button type="submit" disabled={pending} className="ml-auto rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50">
            {pending ? "Création du profil..." : "Terminer l'inscription"}
          </button>
        )}
      </div>
    </form>
  );
}
