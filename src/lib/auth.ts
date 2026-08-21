// =============================================================================
// Smart Land - Meta OAuth via NextAuth (v4).
// Facebook + Instagram analytics scopes are requested at login, and the long
// lived Meta access token is stored in the signed session cookie so the user
// is recognised automatically on return (persistent session).
// =============================================================================
import { NextAuthOptions } from "next-auth";
import FacebookProvider from "next-auth/providers/facebook";
import {
  FACEBOOK_SCOPES,
  exchangeForLongLivedToken,
} from "@/lib/meta-graph";

declare module "next-auth" {
  interface Session {
    /** Long-lived Meta (Facebook/Instagram) access token — server side only. */
    accessToken?: string;
    provider?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    expiresAt?: number;
    provider?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    FacebookProvider({
      clientId:
        process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ||
        process.env.FACEBOOK_APP_ID ||
        "",
      clientSecret: process.env.FACEBOOK_APP_SECRET || "",
      authorization: {
        url: `https://www.facebook.com/v20.0/dialog/oauth?`,
        params: { scope: FACEBOOK_SCOPES },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    // Persistent session: keep the user logged in ~60 days (aligned with the
    // long-lived Meta token); re-connect is only needed after expiry.
    maxAge: 60 * 60 * 24 * 60,
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        const rawAccessToken = account.access_token as string;
        token.accessToken = rawAccessToken;
        token.expiresAt = account.expires_at ?? undefined;
        token.provider = "facebook";
        // Upgrade the short-lived Facebook token to a 60-day long-lived one.
        const longLived = await exchangeForLongLivedToken(rawAccessToken);
        if (longLived) token.accessToken = longLived;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose the Meta token to authenticated server routes via the Graph
      // proxy. The raw token never reaches the browser.
      session.accessToken = token.accessToken;
      return session;
    },
  },
};