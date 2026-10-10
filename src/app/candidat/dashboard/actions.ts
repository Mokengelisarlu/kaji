"use server";

import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { ACTION, RESOURCE } from "@/lib/domain/permissions";
import {
  evaluateAvailabilityUpdate,
  evaluateCertificationsUpdate,
  evaluateEducationUpdate,
  evaluateExperiencesUpdate,
  evaluateLanguagesUpdate,
  evaluateSkillsUpdate,
  evaluateSummaryUpdate,
  getCandidateProfileForUser,
  type CandidateProfileState,
} from "@/lib/use-cases/candidate-profile";

/**
 * Édition d'un bloc du profil : action réservée au titulaire (§20). La matrice
 * accorde `CANDIDATE_PROFILE: UPDATE` au candidat et au prestataire ; toute
 * autre identité est refusée par défaut avant même de toucher au profil.
 */
async function requireProfile() {
  const { userId } = await requirePermission(ACTION.UPDATE, RESOURCE.CANDIDATE_PROFILE);
  const profile = await getCandidateProfileForUser(userId);
  if (!profile) {
    redirect("/candidat/onboarding");
  }
  return { candidateId: profile.candidateId, clerkUserId: userId };
}

export async function updateSummaryBlock(
  _previous: CandidateProfileState,
  formData: FormData,
): Promise<CandidateProfileState> {
  const { candidateId, clerkUserId } = await requireProfile();
  const result = await evaluateSummaryUpdate(formData, candidateId, clerkUserId);
  if (result.status === "success") {
    redirect("/candidat/dashboard?bloc=summary");
  }
  return result;
}

export async function updateAvailabilityBlock(
  _previous: CandidateProfileState,
  formData: FormData,
): Promise<CandidateProfileState> {
  const { candidateId, clerkUserId } = await requireProfile();
  const result = await evaluateAvailabilityUpdate(formData, candidateId, clerkUserId);
  if (result.status === "success") {
    redirect("/candidat/dashboard?bloc=availability");
  }
  return result;
}

export async function updateSkillsBlock(
  _previous: CandidateProfileState,
  formData: FormData,
): Promise<CandidateProfileState> {
  const { candidateId, clerkUserId } = await requireProfile();
  const result = await evaluateSkillsUpdate(formData, candidateId, clerkUserId);
  if (result.status === "success") {
    redirect("/candidat/dashboard?bloc=skills");
  }
  return result;
}

export async function updateLanguagesBlock(
  _previous: CandidateProfileState,
  formData: FormData,
): Promise<CandidateProfileState> {
  const { candidateId, clerkUserId } = await requireProfile();
  const result = await evaluateLanguagesUpdate(formData, candidateId, clerkUserId);
  if (result.status === "success") {
    redirect("/candidat/dashboard?bloc=languages");
  }
  return result;
}

export async function updateExperiencesBlock(
  _previous: CandidateProfileState,
  formData: FormData,
): Promise<CandidateProfileState> {
  const { candidateId, clerkUserId } = await requireProfile();
  const result = await evaluateExperiencesUpdate(formData, candidateId, clerkUserId);
  if (result.status === "success") {
    redirect("/candidat/dashboard?bloc=experiences");
  }
  return result;
}

export async function updateEducationBlock(
  _previous: CandidateProfileState,
  formData: FormData,
): Promise<CandidateProfileState> {
  const { candidateId, clerkUserId } = await requireProfile();
  const result = await evaluateEducationUpdate(formData, candidateId, clerkUserId);
  if (result.status === "success") {
    redirect("/candidat/dashboard?bloc=education");
  }
  return result;
}

export async function updateCertificationsBlock(
  _previous: CandidateProfileState,
  formData: FormData,
): Promise<CandidateProfileState> {
  const { candidateId, clerkUserId } = await requireProfile();
  const result = await evaluateCertificationsUpdate(formData, candidateId, clerkUserId);
  if (result.status === "success") {
    redirect("/candidat/dashboard?bloc=certifications");
  }
  return result;
}