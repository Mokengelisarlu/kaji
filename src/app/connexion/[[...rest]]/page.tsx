import { SignIn } from "@clerk/nextjs";

export default function ConnexionPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn
        fallbackRedirectUrl="/candidat/dashboard"
        signUpUrl="/inscription"
      />
    </div>
  );
}
