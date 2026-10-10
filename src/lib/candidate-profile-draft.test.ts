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
  it("sauvegarde l'étape, les valeurs, les cases et les lignes dynamiques, puis les restaure", () => {
    const draft = {
      step: 4,
      values: {
        nom: "Mbuyi",
        prenom: "Jean",
        city: "Lubumbashi",
      },
      checked: {
        desiredContractTypes: ["CDI", "CDD"],
        isRemoteEligible: ["on"],
      },
      arrays: {
        skills: [{ label: "Python", level: "4", yearsOfPractice: "3" }],
        languages: [{ code: "FR", level: "NATIVE" }],
        experiences: [
          {
            title: "Développeur",
            organization: "Kaji",
            location: "Lubumbashi",
            startDate: "2020-01",
            isCurrent: true,
            endDate: "",
            summary: "Missions",
            achievements: "ligne 1\nligne 2",
          },
        ],
        education: [{ diploma: "Licence", school: "UNILU", field: "Info", startDate: "2015-09", endDate: "2019-06" }],
        certifications: [{ name: "ACCA", issuer: "ACCA", issuedAt: "2021-03", expiresAt: "" }],
      },
    };

    saveCandidateProfileDraft(draft);

    expect(loadCandidateProfileDraft()).toEqual(draft);
  });

  it("tolère un brouillon ancien (valeurs seules) et complète les champs manquants", () => {
    storage.set("kaji-candidate-profile-draft", JSON.stringify({ step: 2, values: { city: "Kampala" } }));

    expect(loadCandidateProfileDraft()).toEqual({
      step: 2,
      values: { city: "Kampala" },
      checked: {},
      arrays: { skills: [], languages: [], experiences: [], education: [], certifications: [] },
    });
  });

  it("ignore un brouillon corrompu", () => {
    storage.set("kaji-candidate-profile-draft", "{ not-json");
    expect(loadCandidateProfileDraft()).toBeNull();
  });

  it("efface le brouillon", () => {
    saveCandidateProfileDraft({
      step: 2,
      values: { city: "Kampala" },
      checked: {},
      arrays: { skills: [], languages: [], experiences: [], education: [], certifications: [] },
    });
    clearCandidateProfileDraft();

    expect(loadCandidateProfileDraft()).toBeNull();
  });
});
