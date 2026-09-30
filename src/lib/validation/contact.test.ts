import { describe, expect, it } from "vitest";

import { CONTRACT_TYPE } from "@/lib/domain/enums";
import {
  contactSchema,
  normaliseContactInput,
  PROFILE_SUBJECT,
  summariseContactRequest,
} from "./contact";

/** Formulaire de besoin minimal valide. */
function besoinForm(overrides: Record<string, string> = {}): FormData {
  const data = new FormData();
  const base: Record<string, string> = {
    subject: "besoin",
    name: "Aline Mbuyi",
    organisation: "Atelier Kasa",
    email: "aline@atelier-kasa.example",
    channel: "email",
    urgency: "normal",
    context: "",
    consent: "on",
    role: "Comptable générale",
    skills: "Comptabilité, paie, déclarations",
    location: "Lubumbashi",
    contract: CONTRACT_TYPE.CDI,
    budget: "salaire-annuel",
    budgetAmount: "1 200 – 1 500 USD",
    telephone: "",
  };
  for (const [key, value] of Object.entries({ ...base, ...overrides })) {
    data.set(key, value);
  }
  return data;
}

/** Formulaire de demande de profil minimal valide. */
function demandeProfilForm(overrides: Record<string, string> = {}): FormData {
  const data = new FormData();
  const base: Record<string, string> = {
    subject: PROFILE_SUBJECT,
    name: "Aline Mbuyi",
    organisation: "Atelier Kasa",
    email: "aline@atelier-kasa.example",
    channel: "email",
    urgency: "normal",
    context: "",
    consent: "on",
    candidateId: "KJ-2025-0007",
    motive: "Réorganisation comptable, besoin deppe auteure sur place.",
    telephone: "",
  };
  for (const [key, value] of Object.entries({ ...base, ...overrides })) {
    data.set(key, value);
  }
  return data;
}

describe("normaliseContactInput — discrimination de l’objet", () => {
  it("construit une charge utile de besoin", () => {
    const payload = normaliseContactInput(besoinForm());
    expect(payload.subject).toBe("besoin");
    expect(payload.role).toBe("Comptable générale");
    expect(payload.candidateId).toBeUndefined();
  });

  it("construit une charge utile de demande de profil", () => {
    const payload = normaliseContactInput(demandeProfilForm());
    expect(payload.subject).toBe(PROFILE_SUBJECT);
    expect(payload.candidateId).toBe("KJ-2025-0007");
    expect(payload.role).toBeUndefined();
  });

  it("retombe sur le dépôt de besoin si l’objet est inconnu", () => {
    const payload = normaliseContactInput(besoinForm({ subject: "objet-forge" }));
    expect(payload.subject).toBe("besoin");
  });

  it("convertit les champs optionnels vides en undefined", () => {
    const payload = normaliseContactInput(
      besoinForm({ context: "", organisation: "" }),
    );
    expect(payload.context).toBeUndefined();
    expect(payload.organisation).toBeUndefined();
  });

  it("conserve un champ optionnel renseigné", () => {
    const payload = normaliseContactInput(besoinForm({ context: "Poste interne." }));
    expect(payload.context).toBe("Poste interne.");
  });
});

describe("contactSchema — besoin valide", () => {
  it("accepte un besoin complet", () => {
    const result = contactSchema.safeParse(normaliseContactInput(besoinForm()));
    expect(result.success).toBe(true);
  });

  it("n’exige pas de téléphone quand le canal est l’e-mail", () => {
    const result = contactSchema.safeParse(
      normaliseContactInput(besoinForm({ channel: "email", telephone: "" })),
    );
    expect(result.success).toBe(true);
  });

  it("normalise les séparateurs du numéro de téléphone", () => {
    const result = contactSchema.safeParse(
      normaliseContactInput(besoinForm({ channel: "telephone", telephone: "06 12 34 56 78" })),
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.telephone).toBe("0612345678");
    }
  });
});

describe("contactSchema — besoins manquants du besoin", () => {
  it.each([
    ["role", "poste"],
    ["skills", "compétences"],
    ["location", "localisation"],
  ])("refuse un besoin sans %s", (field, label) => {
    const result = contactSchema.safeParse(normaliseContactInput(besoinForm({ [field]: "" })));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message.includes(label))).toBe(true);
    }
  });

  it("refuse une adresse électronique mal formée", () => {
    const result = contactSchema.safeParse(normaliseContactInput(besoinForm({ email: "pas-une-adresse" })));
    expect(result.success).toBe(false);
  });

  it("refuse un type de contrat hors enum du domaine", () => {
    const result = contactSchema.safeParse(normaliseContactInput(besoinForm({ contract: "CDI" })));
    // « CDI » est valide ; « freelance » ne l’est pas.
    expect(result.success).toBe(true);
    const forged = contactSchema.safeParse(
      normaliseContactInput(besoinForm({ contract: "freelance" })),
    );
    expect(forged.success).toBe(false);
  });

  it("exige l’acceptation de la politique de confidentialité", () => {
    const result = contactSchema.safeParse(normaliseContactInput(besoinForm({ consent: "" })));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.join(".") === "consent")).toBe(true);
    }
  });
});

describe("contactSchema — cohérence du canal et du budget", () => {
  it("exige un numéro si le canal est le téléphone", () => {
    const result = contactSchema.safeParse(
      normaliseContactInput(besoinForm({ channel: "telephone", telephone: "" })),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.join(".") === "telephone")).toBe(true);
    }
  });

  it("refuse un numéro non français", () => {
    const result = contactSchema.safeParse(
      normaliseContactInput(besoinForm({ channel: "telephone", telephone: "12345" })),
    );
    expect(result.success).toBe(false);
  });

  it("exige un montant si le budget n’est pas « à définir »", () => {
    const result = contactSchema.safeParse(
      normaliseContactInput(besoinForm({ budget: "taux-journalier", budgetAmount: "" })),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.join(".") === "budgetAmount")).toBe(true);
    }
  });

  it("accepte un budget laissé à définir sans montant", () => {
    const result = contactSchema.safeParse(
      normaliseContactInput(besoinForm({ budget: "non-precise", budgetAmount: "" })),
    );
    expect(result.success).toBe(true);
  });
});

describe("contactSchema — demande de profil", () => {
  it("accepte une demande rattachée à un identifiant valide", () => {
    const result = contactSchema.safeParse(normaliseContactInput(demandeProfilForm()));
    expect(result.success).toBe(true);
  });

  it("refuse une demande sans profil rattaché", () => {
    const result = contactSchema.safeParse(
      normaliseContactInput(demandeProfilForm({ candidateId: "" })),
    );
    expect(result.success).toBe(false);
  });

  it.each([
    ["avec espace", "KJ 2025 0007"],
    ["avec chevron", "KJ-2025-0007<script>"],
    ["trop court", "KJ"],
    ["avec séparateur interdit", "KJ-2025-0007/../admin"],
  ])("refuse un identifiant forgé %s", (_label, candidateId) => {
    const result = contactSchema.safeParse(normaliseContactInput(demandeProfilForm({ candidateId })));
    expect(result.success).toBe(false);
  });

  it("refuse une demande sans motif", () => {
    const result = contactSchema.safeParse(normaliseContactInput(demandeProfilForm({ motive: "" })));
    expect(result.success).toBe(false);
  });
});

describe("summariseContactRequest", () => {
  it("résume un besoin par poste, compétences, localisation et contrat", () => {
    const parsed = contactSchema.parse(normaliseContactInput(besoinForm()));
    const summary = summariseContactRequest(parsed);
    expect(summary).toHaveLength(4);
    expect(summary[0]).toContain("Comptable générale");
    expect(summary.some((line) => line.includes(CONTRACT_TYPE.CDI))).toBe(true);
  });

  it("résume une demande de profil par son identifiant", () => {
    const parsed = contactSchema.parse(normaliseContactInput(demandeProfilForm()));
    const summary = summariseContactRequest(parsed);
    expect(summary).toHaveLength(2);
    expect(summary[0]).toContain("KJ-2025-0007");
  });
});
