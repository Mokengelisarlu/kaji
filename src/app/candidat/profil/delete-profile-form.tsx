"use client";

import { useState } from "react";
import { deleteCandidateProfile } from "./actions";
import { Button } from "@/components/ui/button";

export function DeleteProfileForm() {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <form action={deleteCandidateProfile} className="space-y-3">
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          name="confirm"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
          className="mt-0.5 size-4"
        />
        <span>
          Je comprends que cette action est <strong>définitive</strong> : mon profil sera retiré de
          l&apos;annuaire et mes informations supprimées.
        </span>
      </label>
      <Button type="submit" variant="danger" disabled={!confirmed}>
        Supprimer mon profil
      </Button>
    </form>
  );
}