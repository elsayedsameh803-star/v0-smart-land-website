import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in | Smart Land",
  description:
    "Sign in once to Smart Land with Google, GitHub, Facebook, Apple or Email — your session stays active, no repeated logins.",
};

interface PageProps {
  params: { locale: string };
}

export default function LoginPage({ params }: PageProps) {
  const locale = params.locale || "en";
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4 sm:px-6 py-24">
      <div className="w-full max-w-md">
        <LoginForm locale={locale} />
      </div>
    </div>
  );
}