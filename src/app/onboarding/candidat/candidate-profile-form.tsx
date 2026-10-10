"use client";

import { useActionState, useState } from "react";
import { submitCandidateProfile, type CandidateProfileState } from "./actions";
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

const initialState: CandidateProfileState = {
  status: "idle",
  errors: {},
};

export function CandidateProfileForm() {
  const [state, formAction, pending] = useActionState(submitCandidateProfile, initialState);
  const [skills, setSkills] = useState([{ label: "", level: 3, yearsOfPractice: "" }]);
  const [languages, setLanguages] = useState([{ code: "fr" as const, level: "C2" as const }]);
  const [experiences, setExperiences] = useState([{ title: "", organization: "", location: "", startDate: "", isCurrent: false, endDate: "", summary: "", achievements: "" }]);
  const [education, setEducation] = useState([{ diploma: "", school: "", field: "", startYear: "", endYear: "" }]);
  const [certifications, setCertifications] = useState([{ name: "", issuer: "", issuedYear: "", expiresAt: "" }]);

  const addSkill = () => setSkills([...skills, { label: "", level: 3, yearsOfPractice: "" }]);
  const removeSkill = (i: number) => setSkills(skills.filter((_, idx) => idx !== i));

  const addLanguage = () => setLanguages([...languages, { code: "fr" as const, level: "C2" as const }]);
  const removeLanguage = (i: number) => setLanguages(languages.filter((_, idx) => idx !== i));

  const addExperience = () => setExperiences([...experiences, { title: "", organization: "", location: "", startDate: "", isCurrent: false, endDate: "", summary: "", achievements: "" }]);
  const removeExperience = (i: number) => setExperiences(experiences.filter((_, idx) => idx !== i));

  const addEducation = () => setEducation([...education, { diploma: "", school: "", field: "", startYear: "", endYear: "" }]);
  const removeEducation = (i: number) => setEducation(education.filter((_, idx) => idx !== i));

  const addCertification = () => setCertifications([...certifications, { name: "", issuer: "", issuedYear: "", expiresAt: "" }]);
  const removeCertification = (i: number) => setCertifications(certifications.filter((_, idx) => idx !== i));

  return (
    <form action={formAction} className="space-y-8">
      {state.status === "error" && (
        <div className="rounded-md border border-red-300 bg-red-50 p-4 text-red-800">
          {state.message || "Une erreur est survenue."}
        </div>
      )}

      <section className="rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Identité</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Nom complet *</label>
          <input name="fullName" className="w-full rounded-md border px-3 py-2" required />
          {state.errors.fullName && <p className="text-sm text-red-600 mt-1">{state.errors.fullName[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Titre professionnel *</label>
          <input name="headline" className="w-full rounded-md border px-3 py-2" required placeholder="Ex. Ingénieur DevOps senior" />
          {state.errors.headline && <p className="text-sm text-red-600 mt-1">{state.errors.headline[0]}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Catégorie *</label>
            <input name="categoryLabel" className="w-full rounded-md border px-3 py-2" required placeholder="Ex. Développement" />
            {state.errors.categoryLabel && <p className="text-sm text-red-600 mt-1">{state.errors.categoryLabel[0]}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Domaines (séparés par virgules)</label>
            <input name="domainLabels" className="w-full rounded-md border px-3 py-2" placeholder="Ex. Backend, DevOps" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Ville *</label>
            <input name="city" className="w-full rounded-md border px-3 py-2" required />
            {state.errors.city && <p className="text-sm text-red-600 mt-1">{state.errors.city[0]}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Pays</label>
            <input name="country" className="w-full rounded-md border px-3 py-2" defaultValue="France" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Années d&apos;expérience *</label>
            <input type="number" name="yearsOfExperience" className="w-full rounded-md border px-3 py-2" required min="0" max="50" />
            {state.errors.yearsOfExperience && <p className="text-sm text-red-600 mt-1">{state.errors.yearsOfExperience[0]}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" name="isRemoteEligible" id="remote" defaultChecked />
          <label htmlFor="remote" className="text-sm">Eligible au remote</label>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Résumé professionnel *</label>
          <textarea name="summary" rows={4} className="w-full rounded-md border px-3 py-2" required />
          {state.errors.summary && <p className="text-sm text-red-600 mt-1">{state.errors.summary[0]}</p>}
        </div>
      </section>

      <section className="rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Compétences *</h2>
        {skills.map((_, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-2 border-b pb-4">
            <input name={`skills[${i}].label`} placeholder="Compétence" className="rounded-md border px-3 py-2" />
            <select name={`skills[${i}].level`} className="rounded-md border px-3 py-2">
              {[1,2,3,4,5].map(n => <option key={n} value={n}>Niveau {n}</option>)}
            </select>
            <input type="number" name={`skills[${i}].yearsOfPractice`} placeholder="Années" className="rounded-md border px-3 py-2" min="0" max="50" />
            <button type="button" onClick={() => removeSkill(i)} className="text-sm text-red-600">Supprimer</button>
          </div>
        ))}
        <button type="button" onClick={addSkill} className="text-sm underline">Ajouter une compétence</button>
        {state.errors.skills && <p className="text-sm text-red-600">{state.errors.skills[0]}</p>}
      </section>

      <section className="rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Langues *</h2>
        {languages.map((_, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-4">
            <select name={`languages[${i}].code`} className="rounded-md border px-3 py-2">
              {Object.values(LANGUAGE_CODE).map(code => (
                <option key={code} value={code}>{LANGUAGE_CODE_LABEL[code]}</option>
              ))}
            </select>
            <select name={`languages[${i}].level`} className="rounded-md border px-3 py-2">
              {Object.values(LANGUAGE_LEVEL).map(level => (
                <option key={level} value={level}>{LANGUAGE_LEVEL_LABEL[level]}</option>
              ))}
            </select>
            <button type="button" onClick={() => removeLanguage(i)} className="text-sm text-red-600">Supprimer</button>
          </div>
        ))}
        <button type="button" onClick={addLanguage} className="text-sm underline">Ajouter une langue</button>
        {state.errors.languages && <p className="text-sm text-red-600">{state.errors.languages[0]}</p>}
      </section>

      <section className="rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Expériences (optionnel)</h2>
        {experiences.map((_, i) => (
          <div key={i} className="space-y-2 border-b pb-4">
            <input name={`experiences[${i}].title`} placeholder="Titre du poste *" className="w-full rounded-md border px-3 py-2" />
            <input name={`experiences[${i}].organization`} placeholder="Entreprise *" className="w-full rounded-md border px-3 py-2" />
            <input name={`experiences[${i}].location`} placeholder="Lieu" className="w-full rounded-md border px-3 py-2" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input type="date" name={`experiences[${i}].startDate`} className="rounded-md border px-3 py-2" />
              <input type="date" name={`experiences[${i}].endDate`} className="rounded-md border px-3 py-2" />
              <div className="flex items-center gap-2">
                <input type="checkbox" name={`experiences[${i}].isCurrent`} id={`exp-current-${i}`} />
                <label htmlFor={`exp-current-${i}`} className="text-sm">Poste actuel</label>
              </div>
            </div>
            <textarea name={`experiences[${i}].summary`} rows={2} placeholder="Résumé" className="w-full rounded-md border px-3 py-2" />
            <textarea name={`experiences[${i}].achievements`} rows={2} placeholder="Réalisations (une par ligne)" className="w-full rounded-md border px-3 py-2" />
            <button type="button" onClick={() => removeExperience(i)} className="text-sm text-red-600">Supprimer</button>
          </div>
        ))}
        <button type="button" onClick={addExperience} className="text-sm underline">Ajouter une expérience</button>
      </section>

      <section className="rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Formation (optionnel)</h2>
        {education.map((_, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-2 border-b pb-4">
            <input name={`education[${i}].diploma`} placeholder="Diplôme *" className="rounded-md border px-3 py-2" />
            <input name={`education[${i}].school`} placeholder="Établissement *" className="rounded-md border px-3 py-2" />
            <input name={`education[${i}].field`} placeholder="Domaine" className="rounded-md border px-3 py-2" />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" name={`education[${i}].startYear`} placeholder="Année début" className="rounded-md border px-3 py-2" />
              <input type="number" name={`education[${i}].endYear`} placeholder="Année fin" className="rounded-md border px-3 py-2" />
            </div>
            <button type="button" onClick={() => removeEducation(i)} className="text-sm text-red-600">Supprimer</button>
          </div>
        ))}
        <button type="button" onClick={addEducation} className="text-sm underline">Ajouter une formation</button>
      </section>

      <section className="rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Certifications (optionnel)</h2>
        {certifications.map((_, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-2 border-b pb-4">
            <input name={`certifications[${i}].name`} placeholder="Nom *" className="rounded-md border px-3 py-2" />
            <input name={`certifications[${i}].issuer`} placeholder="Organisme *" className="rounded-md border px-3 py-2" />
            <input type="number" name={`certifications[${i}].issuedYear`} placeholder="Année d'émission" className="rounded-md border px-3 py-2" />
            <input type="date" name={`certifications[${i}].expiresAt`} placeholder="Expire le" className="rounded-md border px-3 py-2" />
            <button type="button" onClick={() => removeCertification(i)} className="text-sm text-red-600">Supprimer</button>
          </div>
        ))}
        <button type="button" onClick={addCertification} className="text-sm underline">Ajouter une certification</button>
      </section>

      <section className="rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Visibilité & disponibilité</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Visibilité du profil *</label>
          <select name="profileVisibility" className="w-full rounded-md border px-3 py-2" required defaultValue={PROFILE_VISIBILITY.PUBLIC}>
            {Object.values(PROFILE_VISIBILITY).map(vis => (
              <option key={vis} value={vis}>{PROFILE_VISIBILITY_LABEL[vis]}</option>
            ))}
          </select>
          <div className="text-xs text-gray-600 mt-2 space-y-1">
            <p><strong>Public</strong> : visible dans l&apos;annuaire et accessible à tous</p>
            <p><strong>Visible sur demande</strong> : non listé publiquement, accessible via lien direct ou sur demande explicite</p>
            <p><strong>Privé</strong> : masqué de tout canal externe</p>
          </div>
          {state.errors.profileVisibility && <p className="text-sm text-red-600 mt-1">{state.errors.profileVisibility[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Disponibilité déclarée</label>
          <select name="declaredAvailability" className="w-full rounded-md border px-3 py-2">
            <option value="">Sélectionner...</option>
            {Object.values(AVAILABILITY_TYPE).map(avail => (
              <option key={avail} value={avail}>{AVAILABILITY_TYPE_LABEL[avail]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Types de contrat recherchés</label>
          <div className="flex flex-wrap gap-4">
            {Object.values(CONTRACT_TYPE).map(type => (
              <label key={type} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="desiredContractTypes" value={type} />
                {CONTRACT_TYPE_LABEL[type]}
              </label>
            ))}
          </div>
        </div>
      </section>

      <button type="submit" disabled={pending} className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
        {pending ? "Création en cours..." : "Créer mon profil"}
      </button>
    </form>
  );
}
