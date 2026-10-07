"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function AuthControls({ className }: { className?: string }) {
  const { isSignedIn } = useUser();
  return (
    <div className={className}>
      {!isSignedIn ? (
        <>
          <SignInButton mode="modal" fallbackRedirectUrl="/candidat/dashboard">
            <Button variant="ghost" size="sm">Se connecter</Button>
          </SignInButton>
          <SignUpButton mode="modal" fallbackRedirectUrl="/candidat/onboarding">
            <Button size="sm">S&apos;inscrire</Button>
          </SignUpButton>
        </>
      ) : (
        <>
          <Button asChild variant="ghost" size="sm">
            <Link href="/candidat/dashboard">Tableau de bord</Link>
          </Button>
          <UserButton  />
        </>
      )}
    </div>
  );
}

export function AuthControlsMobile({ className }: { className?: string }) {
  const { isSignedIn } = useUser();
  return (
    <div className={className}>
      {!isSignedIn ? (
        <>
          <SignInButton mode="modal" fallbackRedirectUrl="/candidat/dashboard">
            <Button variant="ghost" block>Se connecter</Button>
          </SignInButton>
          <SignUpButton mode="modal" fallbackRedirectUrl="/candidat/onboarding">
            <Button block>S&apos;inscrire</Button>
          </SignUpButton>
        </>
      ) : (
        <div className="flex flex-col gap-2">
          <Button asChild variant="ghost" block>
            <Link href="/candidat/dashboard">Tableau de bord</Link>
          </Button>
          <div className="flex justify-center">
            <UserButton  />
          </div>
        </div>
      )}
    </div>
  );
}
