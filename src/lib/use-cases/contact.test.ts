import { describe, expect, it } from "vitest";

import { CONTRACT_TYPE } from "@/lib/domain/enums";

import {
  createRequestId,
  evaluateContactSubmission,
  unconfiguredTransport,
  type ContactRequestStatus,
  type ContactTransport,
} from "./contact";

/** Besoin valide, prêt à être soumis. */
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
    skills: "Comptabilité, paie",
    location: "Lubumbashi",
    contract: CONTRACT_TYPE.CDI,
    budget: "non-precise",
    budgetAmount: "",
    telephone: "",
  };
  for (const [key, value] of Object.entries({ ...base, ...overrides })) data.set(key, value);
  return data;
}

describe("evaluateContactSubmission — validation", () => {
  it("refuse un formulaire invalide sans appeler le transport", async () => {
    let called = false;
    const transport: ContactTransport = async () => {
      called = true;
      return { status: "deliveryFailed", requestId: "x", message: "y" };
    };

    const state = await evaluateContactSubmission(
      besoinForm({ email: "invalide" }),
      transport,
    );

    expect(state.status).toBe("invalid");
    expect(called).toBe(false);
  });

  it("associe chaque erreur à son champ", async () => {
    const state = await evaluateContactSubmission(
      besoinForm({ email: "invalide", role: "" }),
      unconfiguredTransport,
    );

    expect(state.status).toBe("invalid");
    if (state.status === "invalid") {
      expect(Object.keys(state.errors)).toEqual(expect.arrayContaining(["email", "role"]));
    }
  });

  it("ne conserve qu'un message par champ", async () => {
    const state = await evaluateContactSubmission(
      besoinForm({ telephone: "abc" }),
      unconfiguredTransport,
    );

    expect(state.status).toBe("invalid");
    if (state.status === "invalid") {
      const keys = Object.keys(state.errors);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });
});

describe("evaluateContactSubmission — honnêteté de la livraison", () => {
  it("ne signale jamais « accepted » quand aucun canal n'est configuré", async () => {
    const state = await evaluateContactSubmission(besoinForm(), unconfiguredTransport);
    expect(state.status).not.toBe("accepted");
    expect(state.status).toBe("unconfigured");
  });

  it("résume la demande lue afin de prouver qu'elle est exploitable", async () => {
    const state = await evaluateContactSubmission(besoinForm(), unconfiguredTransport);

    expect(state.status).toBe("unconfigured");
    if (state.status === "unconfigured") {
      expect(state.summary.length).toBe(4);
      expect(state.summary[0]).toContain("Comptable générale");
    }
  });

  it("propage un échec de transport sans le maquiller en succès", async () => {
    const failing: ContactTransport = async (requestId) => ({
      status: "deliveryFailed",
      requestId,
      message: "Service d'envoi indisponible.",
    });

    const state = await evaluateContactSubmission(besoinForm(), failing);

    expect(state.status).toBe("deliveryFailed");
    expect(state.status === "deliveryFailed" && state.message).toBe(
      "Service d'envoi indisponible.",
    );
  });

  it("transmet au transport les données déjà validées", async () => {
    let received: Record<string, unknown> | undefined;
    const spy: ContactTransport = async (requestId, data) => {
      received = data as unknown as Record<string, unknown>;
      return { status: "unconfigured", requestId, summary: [] };
    };

    await evaluateContactSubmission(besoinForm(), spy);

    expect(received?.subject).toBe("besoin");
    expect(received?.role).toBe("Comptable générale");
    expect(received?.consent).toBe("on");
  });

  it("n'envoie pas les données au transport quand la validation échoue", async () => {
    let called = false;
    const spy: ContactTransport = async () => {
      called = true;
      return { status: "unconfigured", requestId: "x", summary: [] };
    };

    await evaluateContactSubmission(besoinForm({ consent: "" }), spy);

    expect(called).toBe(false);
  });
});

describe("evaluateContactSubmission — référence de tentative", () => {
  it("réutilise l'identifiant fourni", async () => {
    const state = await evaluateContactSubmission(
      besoinForm(),
      unconfiguredTransport,
      "req_fixe",
    );
    expect(state.status === "unconfigured" && state.requestId).toBe("req_fixe");
  });

  it("génère des identifiants distincts et préfixés", () => {
    const first = createRequestId();
    const second = createRequestId();
    expect(first.startsWith("req_")).toBe(true);
    expect(first).not.toBe(second);
  });

  it("passe l'identifiant de tentative au transport", async () => {
    let seen: string | undefined;
    const spy: ContactTransport = async (requestId) => {
      seen = requestId;
      return { status: "unconfigured", requestId, summary: [] };
    };

    await evaluateContactSubmission(besoinForm(), spy, "req_suivi");

    expect(seen).toBe("req_suivi");
  });
});

describe("ContactRequestStatus — forme attendue", () => {
  it("décrit un échec de transport avec un message affichable", () => {
    const status: ContactRequestStatus = {
      status: "deliveryFailed",
      requestId: "req_1",
      message: "Indisponible.",
    };
    expect(status.message).toBe("Indisponible.");
  });
});
