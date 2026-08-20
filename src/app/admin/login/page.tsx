import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  verifySessionToken,
  SESSION_COOKIE_NAME,
  isAdminConfigured,
} from "@/lib/admin-auth";
import { isGoogleOAuthConfigured } from "@/lib/google-auth";
import LoginForm from "./login-form";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  const authed = token ? await verifySessionToken(token) : false;
  if (authed) redirect("/admin");
  return (
    <LoginForm
      passwordConfigured={isAdminConfigured()}
      googleConfigured={isGoogleOAuthConfigured()}
    />
  );
}
