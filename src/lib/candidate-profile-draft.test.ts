import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearCandidateProfileDraft,
  loadCandidateProfileDraft,
  saveCandidateProfileDraft,
} from "./candidate-profile-draft";

const storage = new Map<string, string>();

beforeEach(() => {
  storage.clear();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    },
  });
});

afterEach(() => vi.unstubAllGlobals());

describe("candidate profile draft", () => {
  it("sauvegarde l'étape et les valeurs, puis les restaure", () => {
    const draft = {
      step: 4,
      values: {
        nom: "Mbuyi",
        prenom: "Jean",
        city: "Lubumbashi",
        "skills[0].label": "Python",
      },
    };

    saveCandidateProfileDraft(draft);

    expect(loadCandidateProfileDraft()).toEqual(draft);
  });

  it("efface le brouillon", () => {
    saveCandidateProfileDraft({ step: 2, values: { city: "Kampala" } });
    clearCandidateProfileDraft();

    expect(loadCandidateProfileDraft()).toBeNull();
  });
});
