export const CANDIDATE_PROFILE_DRAFT_KEY = "kaji-candidate-profile-draft";

export type CandidateProfileDraft = {
  step: number;
  values: Record<string, string>;
};

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
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

    const parsed = JSON.parse(serialized) as Partial<CandidateProfileDraft>;
    if (
      typeof parsed.step !== "number" ||
      !parsed.values ||
      typeof parsed.values !== "object" ||
      Array.isArray(parsed.values)
    ) {
      return null;
    }

    return {
      step: Math.min(Math.max(Math.trunc(parsed.step), 1), 6),
      values: parsed.values,
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
