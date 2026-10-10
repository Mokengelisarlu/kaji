export const CANDIDATE_PROFILE_DRAFT_KEY = "kaji-candidate-profile-draft";

export type CandidateProfileDraftSkill = { label: string; level: string; yearsOfPractice: string };

export type CandidateProfileDraftLanguage = { code: string; level: string };

export type CandidateProfileDraftExperience = {
  title: string;
  organization: string;
  location: string;
  startDate: string;
  isCurrent: boolean;
  endDate: string;
  summary: string;
  achievements: string;
};

export type CandidateProfileDraftEducation = {
  diploma: string;
  school: string;
  field: string;
  startDate: string;
  endDate: string;
};

export type CandidateProfileDraftCertification = {
  name: string;
  issuer: string;
  issuedAt: string;
  expiresAt: string;
};

export type CandidateProfileDraftArrays = {
  skills: CandidateProfileDraftSkill[];
  languages: CandidateProfileDraftLanguage[];
  experiences: CandidateProfileDraftExperience[];
  education: CandidateProfileDraftEducation[];
  certifications: CandidateProfileDraftCertification[];
};

export type CandidateProfileDraft = {
  /** Étape courante du formulaire (1–6). */
  step: number;
  /** Champs simples (texte, sélecteur, zone de texte) indexés par `name`. */
  values: Record<string, string>;
  /** Cases à cocher : `name` → valeurs cochées (case décochée = tableau vide). */
  checked: Record<string, string[]>;
  /** Sections à lignes dynamiques : le nombre ET le contenu des lignes sont conservés. */
  arrays: CandidateProfileDraftArrays;
};

export const EMPTY_DRAFT_ARRAYS: CandidateProfileDraftArrays = {
  skills: [],
  languages: [],
  experiences: [],
  education: [],
  certifications: [],
};

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toStringRecord(value: unknown): Record<string, string> {
  if (!isPlainObject(value)) return {};
  const result: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === "string") result[key] = entry;
  }
  return result;
}

function toStringArrayRecord(value: unknown): Record<string, string[]> {
  if (!isPlainObject(value)) return {};
  const result: Record<string, string[]> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (Array.isArray(entry)) {
      result[key] = entry.filter((item): item is string => typeof item === "string");
    }
  }
  return result;
}

function asList(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asRow(value: unknown): Record<string, unknown> {
  return isPlainObject(value) ? value : {};
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function bool(value: unknown): boolean {
  return value === true;
}

function toStringArrays(value: unknown): CandidateProfileDraftArrays {
  const input = isPlainObject(value) ? value : {};
  return {
    skills: asList(input.skills).map((entry) => {
      const row = asRow(entry);
      return { label: str(row.label), level: str(row.level), yearsOfPractice: str(row.yearsOfPractice) };
    }),
    languages: asList(input.languages).map((entry) => {
      const row = asRow(entry);
      return { code: str(row.code), level: str(row.level) };
    }),
    experiences: asList(input.experiences).map((entry) => {
      const row = asRow(entry);
      return {
        title: str(row.title),
        organization: str(row.organization),
        location: str(row.location),
        startDate: str(row.startDate),
        isCurrent: bool(row.isCurrent),
        endDate: str(row.endDate),
        summary: str(row.summary),
        achievements: str(row.achievements),
      };
    }),
    education: asList(input.education).map((entry) => {
      const row = asRow(entry);
      return {
        diploma: str(row.diploma),
        school: str(row.school),
        field: str(row.field),
        startDate: str(row.startDate),
        endDate: str(row.endDate),
      };
    }),
    certifications: asList(input.certifications).map((entry) => {
      const row = asRow(entry);
      return {
        name: str(row.name),
        issuer: str(row.issuer),
        issuedAt: str(row.issuedAt),
        expiresAt: str(row.expiresAt),
      };
    }),
  };
}

export function saveCandidateProfileDraft(draft: CandidateProfileDraft): void {
  const storage = getStorage();
  if (!storage) return;

  storage.setItem(CANDIDATE_PROFILE_DRAFT_KEY, JSON.stringify(draft));
}

export function loadCandidateProfileDraft(): CandidateProfileDraft | null {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const serialized = storage.getItem(CANDIDATE_PROFILE_DRAFT_KEY);
    if (!serialized) return null;

    const parsed = JSON.parse(serialized) as unknown;
    if (!isPlainObject(parsed) || typeof parsed.step !== "number") {
      return null;
    }

    return {
      step: Math.min(Math.max(Math.trunc(parsed.step), 1), 6),
      values: toStringRecord(parsed.values),
      checked: toStringArrayRecord(parsed.checked),
      arrays: toStringArrays(parsed.arrays),
    };
  } catch {
    return null;
  }
}

export function clearCandidateProfileDraft(): void {
  const storage = getStorage();
  if (!storage) return;

  storage.removeItem(CANDIDATE_PROFILE_DRAFT_KEY);
}
