// =============================================================================
// Smart Land - NextAuth v4 configuration.
//
// SEPARATION (important): logging in to Smart Land is DIFFERENT from linking
// a Social account for analytics.
//
//   * Login providers  : Google, Facebook, Apple, Email (identity only).
//   * Social linking   : Facebook (Meta) via the `facebook-meta` provider id
//                         — used ONLY by the /social page and the explicit
//                         "connect for analytics" action. The analytics access
//                         token lives in the session ONLY when the user linked.
//
// This file preserves the existing Meta session shape used by /api/meta/overview.
// =============================================================================
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
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

export const authOptions: NextAuthOptions = {
  providers: [
    // Identity-first login with Google (optional — depends on env keys).
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    // Identity-first login with Apple (optional).
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID || "",
      clientSecret: process.env.APPLE_CLIENT_SECRET || "",
    }),
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
    FacebookProvider({
      id: "facebook",
      name: "Facebook",
      clientId:
        process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ||
        process.env.FACEBOOK_APP_ID ||
        process.env.META_APP_ID ||
        "",
      clientSecret:
        process.env.FACEBOOK_APP_SECRET || process.env.META_APP_SECRET || "",
      authorization: {
        params: { scope: "email,public_profile" },
      },
    }),
    // Explicit social LINK (analytics). Separate provider id so the analytics
    // token is ONLY granted after this explicit connection.
    FacebookProvider({
      id: "facebook-meta",
      name: "Facebook Analytics",
      clientId:
        process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ||
        process.env.FACEBOOK_APP_ID ||
        process.env.META_APP_ID ||
        "",
      clientSecret:
        process.env.FACEBOOK_APP_SECRET || process.env.META_APP_SECRET || "",
      authorization: {
        params: { scope: FACEBOOK_SCOPES },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    // ~60 day persistent session. Re-connect only needed after it expires.
    maxAge: 60 * 60 * 24 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login?error=oauth",
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