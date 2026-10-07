import { SignUp } from "@clerk/nextjs";

export default function InscriptionPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp
        fallbackRedirectUrl="/candidat/onboarding"
        signInUrl="/connexion"
      />
    </div>
  );
}
