"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import {
  clearCandidateProfileDraft,
  loadCandidateProfileDraft,
} from "@/lib/candidate-profile-draft";

/**
 * Rappel de reprise : un profil « à moitié rempli » existe en localStorage
 * mais n'a jamais été enregistré en base. Le formulaire reprend automatiquement
 * là où l'utilisateur s'est arrêté ; ce bandeau rend l'état explicite.
 */
export function DraftReminder() {
  const [draft] = useState(() => loadCandidateProfileDraft());
  if (!draft) return null;

  const restart = () => {
    clearCandidateProfileDraft();
    window.location.reload();
  };

  return (
    <Alert tone="warning" title="Votre profil n'est pas encore enregistré" className="mb-6">
      <p>
        Vous aviez commencé votre profil (étape&nbsp;{draft.step}/6) mais il n&apos;a pas encore été
        créé. Vos informations ont été conservées : poursuivez là où vous vous êtes arrêté,
        ou repartez de zéro.
      </p>
      <div className="mt-3">
        <Button type="button" variant="ghost" size="sm" onClick={restart}>
          Recommencer le formulaire
        </Button>
      </div>
    </Alert>
  );
}