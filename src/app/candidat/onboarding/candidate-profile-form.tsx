"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitCandidateProfile, type CandidateProfileState } from "./actions";
import {
  clearCandidateProfileDraft,
  loadCandidateProfileDraft,
  saveCandidateProfileDraft,
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
  fullName: 1, nom: 1, prenom: 1, civilite: 1, sexe: 1, dateNaissance: 1, lieuNaissance: 1, nationalite: 1,
  province: 2, city: 2, country: 2, commune: 2, quartier: 2, adresse: 2, telephone: 2,
  headline: 3, categoryLabel: 3, domainLabels: 3, summary: 3, yearsOfExperience: 3,
  declaredAvailability: 3, desiredContractTypes: 3, isRemoteEligible: 3,
  experiences: 4, education: 4,
  skills: 5, languages: 5, certifications: 5,
  profileVisibility: 6,
};

export function CandidateProfileForm() {
  const [initialDraft] = useState(() => loadCandidateProfileDraft());
  const [step, setStep] = useState(initialDraft?.step ?? 1);
  const formRef = useRef<HTMLFormElement>(null);
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

  useEffect(() => {
    if (state.status === "success") clearCandidateProfileDraft();
  }, [state.status]);

  useEffect(() => {
    if (!initialDraft) return;

    const form = formRef.current;
    if (!form) return;

    for (const [name, value] of Object.entries(initialDraft.values)) {
      const field = form.elements.namedItem(name);
      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
        field.value = value;
      }
    }
  }, [initialDraft]);

  const persistDraft = (nextStep: number) => {
    const form = formRef.current;
    if (!form) return;

    const values = Object.fromEntries(
      Array.from(form.elements)
        .filter((element): element is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement =>
          element instanceof HTMLInputElement ||
          element instanceof HTMLSelectElement ||
          element instanceof HTMLTextAreaElement
        )
        .map((element) => [element.name, element.value]),
    );

    saveCandidateProfileDraft({ step: nextStep, values });
  };

  const nextStep = () => {
    const next = Math.min(step + 1, 6);
    setStep(next);
    persistDraft(next);
  };
  const prevStep = () => {
    const previous = Math.max(step - 1, 1);
    setStep(previous);
    persistDraft(previous);
  };

  return (
    <form ref={formRef} action={formAction} noValidate className="space-y-8" onChange={() => persistDraft(step)}>
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
              <select name="civilite" className="w-full rounded-md border px-3 py-2">
                <option value="">Sélectionner...</option>
                <option value="M">Monsieur</option>
                <option value="Mme">Madame</option>
                <option value="Mlle">Mademoiselle</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sexe</label>
              <select name="sexe" className="w-full rounded-md border px-3 py-2">
                <option value="">Sélectionner...</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom *</label>
              <input name="nom" className="w-full rounded-md border px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prénom *</label>
              <input name="prenom" className="w-full rounded-md border px-3 py-2" required />
            </div>
          </div>
          <input type="hidden" name="fullName" value="" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date de naissance</label>
              <input type="date" name="dateNaissance" className="w-full rounded-md border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Lieu de naissance</label>
              <input name="lieuNaissance" className="w-full rounded-md border px-3 py-2" placeholder="Ville, RDC" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nationalité</label>
            <input name="nationalite" className="w-full rounded-md border px-3 py-2" defaultValue="Congolaise" />
          </div>
      </section>

      <section className={`rounded-lg border p-6 space-y-4 ${step === 2 ? "" : "hidden"}`}>
        <h2 className="text-lg font-semibold">2. Contact & Localisation (RDC)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Province *</label>
              <select name="province" className="w-full rounded-md border px-3 py-2" required>
                <option value="">Sélectionner...</option>
                {RDC_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ville / Territoire *</label>
              <input name="city" className="w-full rounded-md border px-3 py-2" required placeholder="Ex. Lubumbashi" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Commune</label>
              <input name="commune" className="w-full rounded-md border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quartier</label>
              <input name="quartier" className="w-full rounded-md border px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Adresse</label>
            <input name="adresse" className="w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Numéro de téléphone</label>
            <input name="telephone" className="w-full rounded-md border px-3 py-2" placeholder="+243..." />
          </div>
          <input type="hidden" name="country" value="République Démocratique du Congo" />
      </section>

      <section className={`rounded-lg border p-6 space-y-4 ${step === 3 ? "" : "hidden"}`}>
        <h2 className="text-lg font-semibold">3. Profil professionnel</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Titre professionnel *</label>
            <input name="headline" className="w-full rounded-md border px-3 py-2" required placeholder="Ex. Ingénieur Informaticien" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Catégorie *</label>
              <input name="categoryLabel" className="w-full rounded-md border px-3 py-2" required placeholder="Ex. Technologies de l'Information" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Domaines (séparés par virgules)</label>
              <input name="domainLabels" className="w-full rounded-md border px-3 py-2" placeholder="Ex. Développement, Réseaux, Cybersécurité" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Résumé professionnel *</label>
            <textarea name="summary" rows={4} className="w-full rounded-md border px-3 py-2" required placeholder="Décrivez brièvement votre profil, vos réalisations et objectifs..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Années d'expérience *</label>
              <input type="number" name="yearsOfExperience" className="w-full rounded-md border px-3 py-2" required min="0" max="50" />
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
          <div className="flex items-center gap-2">
            <input type="checkbox" name="isRemoteEligible" id="remote" defaultChecked />
            <label htmlFor="remote" className="text-sm">Eligible au télétravail / remote</label>
          </div>
      </section>

      <section className={`rounded-lg border p-6 space-y-4 ${step === 4 ? "" : "hidden"}`}>
        <h2 className="text-lg font-semibold">4. Expériences & Formation</h2>
          <div>
            <h3 className="font-medium mb-3">Expériences professionnelles</h3>
            {experiences.map((_, i) => (
              <div key={i} className="space-y-2 border rounded-md p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input name={`experiences[${i}].title`} placeholder="Intitulé du poste" className="rounded-md border px-3 py-2" />
                  <input name={`experiences[${i}].organization`} placeholder="Entreprise/Organisation" className="rounded-md border px-3 py-2" />
                </div>
                <input name={`experiences[${i}].location`} placeholder="Lieu (Ville, RDC)" className="w-full rounded-md border px-3 py-2" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input type="date" name={`experiences[${i}].startDate`} className="rounded-md border px-3 py-2" />
                  <input type="date" name={`experiences[${i}].endDate`} className="rounded-md border px-3 py-2" />
                  <div className="flex items-center gap-2">
                    <input type="checkbox" name={`experiences[${i}].isCurrent`} id={`exp-current-${i}`} />
                    <label htmlFor={`exp-current-${i}`} className="text-sm">Poste actuel</label>
                  </div>
                </div>
                <textarea name={`experiences[${i}].summary`} rows={2} placeholder="Description des missions" className="w-full rounded-md border px-3 py-2" />
                <textarea name={`experiences[${i}].achievements`} rows={2} placeholder="Réalisations marquantes (une par ligne)" className="w-full rounded-md border px-3 py-2" />
                {i > 0 && (
                  <button type="button" onClick={() => removeExperience(i)} className="text-sm text-red-600">Supprimer cette expérience</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addExperience} className="text-sm text-blue-600 underline">Ajouter une expérience</button>
          </div>

          <div className="mt-6">
            <h3 className="font-medium mb-3">Formations</h3>
            {education.map((_, i) => (
              <div key={i} className="space-y-2 border rounded-md p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input name={`education[${i}].diploma`} placeholder="Diplôme / Qualification" className="rounded-md border px-3 py-2" />
                  <input name={`education[${i}].school`} placeholder="Établissement (Université/Institut)" className="rounded-md border px-3 py-2" />
                </div>
                <input name={`education[${i}].field`} placeholder="Filière / Spécialisation" className="w-full rounded-md border px-3 py-2" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" name={`education[${i}].startYear`} placeholder="Année début" className="rounded-md border px-3 py-2" />
                  <input type="number" name={`education[${i}].endYear`} placeholder="Année d'obtention" className="rounded-md border px-3 py-2" />
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
            {skills.map((_, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-2 border rounded-md p-4 mb-4">
                <input name={`skills[${i}].label`} placeholder="Compétence (ex. Excel, Java, Gestion)" className="rounded-md border px-3 py-2" />
                <select name={`skills[${i}].level`} className="rounded-md border px-3 py-2">
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>Niveau {n}</option>)}
                </select>
                <input type="number" name={`skills[${i}].yearsOfPractice`} placeholder="Années d'usage" className="rounded-md border px-3 py-2" min="0" max="50" />
                {i > 0 && (
                  <button type="button" onClick={() => removeSkill(i)} className="text-sm text-red-600">Supprimer</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addSkill} className="text-sm text-blue-600 underline">Ajouter une compétence</button>
          </div>

          <div className="mt-6">
            <h3 className="font-medium mb-3">Langues *</h3>
            {languages.map((_, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-2 border rounded-md p-4 mb-4">
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
                {i > 0 && (
                  <button type="button" onClick={() => removeLanguage(i)} className="text-sm text-red-600">Supprimer</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addLanguage} className="text-sm text-blue-600 underline">Ajouter une langue</button>
          </div>

          <div className="mt-6">
            <h3 className="font-medium mb-3">Certifications</h3>
            {certifications.map((_, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-2 border rounded-md p-4 mb-4">
                <input name={`certifications[${i}].name`} placeholder="Nom de la certification" className="rounded-md border px-3 py-2" />
                <input name={`certifications[${i}].issuer`} placeholder="Organisme délivreur" className="rounded-md border px-3 py-2" />
                <input type="number" name={`certifications[${i}].issuedYear`} placeholder="Année d'obtention" className="rounded-md border px-3 py-2" />
                <input type="date" name={`certifications[${i}].expiresAt`} placeholder="Date d'expiration (si applicable)" className="rounded-md border px-3 py-2" />
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
            <select name="profileVisibility" className="w-full rounded-md border px-3 py-2" required defaultValue={PROFILE_VISIBILITY.PUBLIC}>
              {Object.values(PROFILE_VISIBILITY).map(vis => (
                <option key={vis} value={vis}>{PROFILE_VISIBILITY_LABEL[vis]}</option>
              ))}
            </select>
            <div className="text-xs text-gray-600 mt-2 space-y-1">
              <p><strong>Public</strong> : Votre profil est visible dans l'annuaire des talents au niveau national et international.</p>
              <p><strong>Visible sur demande</strong> : Non listé publiquement, uniquement accessible sur demande explicite d'une entreprise.</p>
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
