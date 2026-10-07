"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
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

async function requireProfile() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/connexion");
  }
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