// =============================================================================
// Smart Land - NextAuth v4 configuration.
//
// SEPARATION (important): logging in to Smart Land is DIFFERENT from linking
// a Social account for analytics.
//
//   * Login providers  : Google, GitHub, Facebook, Apple, Email (identity only).
//   * Social linking   : Facebook (Meta) via the `facebook-meta` provider id
//                         — used ONLY by the /social page and the explicit
//                         "connect for analytics" action. The analytics access
//                         token lives in the session ONLY when the user linked.
//
// This file preserves the existing Meta session shape used by /api/meta/overview.
// =============================================================================
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import AppleProvider from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";
import { FACEBOOK_SCOPES, exchangeForLongLivedToken } from "@/lib/meta-graph";

declare module "next-auth" {
  interface Session {
    /** Meta analytics token — present only after an explicit Facebook/Meta LINK. */
    accessToken?: string;
    /** True only when the visitor linked Facebook for analytics in this session. */
    metaLinked?: boolean;
    provider?: string;
    /** Plain login identity (google / facebook / apple / email). */
    loginMethod?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    metaLinked?: boolean;
    expiresAt?: number;
    loginMethod?: string;
  }
}

// Facebook identity uses several possible env-var names — resolve once.
// Values pasted into Vercel sometimes carry a trailing newline or stray
// spaces — Google/Meta reject such secrets with `invalid_client`, so every
// credential is trimmed once here before use.
const clean = (v: string | undefined): string => (v || "").trim();
const facebookAppId = clean(
  process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ||
    process.env.FACEBOOK_APP_ID ||
    process.env.FACEBOOK_CLIENT_ID ||
    process.env.META_APP_ID
);
const facebookAppSecret = clean(
  process.env.FACEBOOK_CLIENT_SECRET ||
    process.env.FACEBOOK_APP_SECRET ||
    process.env.META_APP_SECRET
);
const googleClientId = clean(process.env.GOOGLE_CLIENT_ID);
const googleClientSecret = clean(process.env.GOOGLE_CLIENT_SECRET);
// NOTE: in production NEXTAUTH_URL MUST be set (e.g. https://smart-land-theta.vercel.app)
// so the OAuth redirect_uri and cookies are pinned to ONE origin. Without it
// NextAuth infers the host per-request, which can break the Google state/CSRF
// check and bounce the visitor back to /login after consent (login loop).

export const authOptions: NextAuthOptions = {
  // Register OAuth providers ONLY when their credentials exist. An empty
  // clientId renders dead provider buttons and can corrupt the callback flow.
  providers: [
    // Identity-first login with Google (optional — depends on env keys).
    ...(googleClientId && googleClientSecret
      ? [
          GoogleProvider({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          }),
        ]
      : []),
    // Identity-first login with GitHub (optional — depends on env keys).
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? [
          GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            authorization: { params: { scope: "read:user user:email" } },
          }),
        ]
      : []),
    // Identity-first login with Apple (optional).
    ...(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET
      ? [
          AppleProvider({
            clientId: clean(process.env.APPLE_CLIENT_ID),
            clientSecret: clean(process.env.APPLE_CLIENT_SECRET),
          }),
        ]
      : []),
    // Email login via OTP/credentials (optional).
    CredentialsProvider({
      id: "email",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        if (
          credentials?.email &&
          /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(credentials.email)
        ) {
          const email = credentials.email.toLowerCase();
          return { id: email, email, name: email.split("@")[0] };
        }
        return null;
      },
    }),
    // Login with Facebook = IDENTITY only (scope below carries no analytics).
    // Explicit social LINK (analytics) = separate provider id so the analytics
    // token is ONLY granted after that explicit connection.
    ...(facebookAppId && facebookAppSecret
      ? [
          FacebookProvider({
            id: "facebook",
            name: "Facebook",
            clientId: facebookAppId,
            clientSecret: facebookAppSecret,
            authorization: {
              params: { scope: "email,public_profile" },
            },
          }),
          FacebookProvider({
            id: "facebook-meta",
            name: "Facebook Analytics",
            clientId: facebookAppId,
            clientSecret: facebookAppSecret,
            authorization: {
              params: { scope: FACEBOOK_SCOPES },
            },
          }),
        ]
      : []),
  ],
  secret: clean(process.env.NEXTAUTH_SECRET) || clean(process.env.ADMIN_SESSION_SECRET),
  // Surface the REAL OAuth failure reason in the server (Vercel) logs —
  // e.g. invalid_client (bad secret) or access_denied (Testing mode).
  // Grep the runtime logs for "nextauth-error" to see the exact cause.
  logger: {
    error(code: string, ...message: unknown[]): void {
      console.error("[nextauth-error]", code, ...message);
    },
    warn(code: string, ...message: unknown[]): void {
      console.warn("[nextauth-warn]", code, ...message);
    },
  },
  session: {
    strategy: "jwt",
    // ~60 day persistent session. Re-connect only needed after it expires.
    maxAge: 60 * 60 * 24 * 60,
  },
  pages: {
    signIn: "/login",
    // NOTE: do NOT bake a pre-filled `?error=…` into this URL. NextAuth
    // APPENDS the real error code (OAuthCallback / AccessDenied / …) itself;
    // a pre-filled duplicate `error` param MASKS the actual code in the URL
    // (the browser keeps the FIRST value) and makes diagnosis impossible.
    error: "/login",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.loginMethod = providerToLoginMethod(account.provider);
        // Only the explicit facebook-meta link stores an analytics token.
        if (account.provider === "facebook-meta" && account.access_token) {
          token.accessToken = account.access_token;
          token.metaLinked = true;
          token.expiresAt = account.expires_at ?? undefined;
          const longLived = await exchangeForLongLivedToken(account.access_token);
          if (longLived) token.accessToken = longLived;
        } else if (token.metaLinked) {
          // keep a previously linked analytics token valid across sign-ins
        } else {
          token.accessToken = undefined;
          token.metaLinked = false;
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.loginMethod = token.loginMethod || undefined;
      if (token.metaLinked && token.accessToken) {
        session.accessToken = token.accessToken;
        session.metaLinked = true;
      } else {
        session.accessToken = undefined;
        session.metaLinked = false;
      }
      return session;
    },
  },
};

function providerToLoginMethod(provider: string): string {
  if (provider === "facebook-meta") return "facebook";
  if (provider === "email") return "email";
  return provider;
}