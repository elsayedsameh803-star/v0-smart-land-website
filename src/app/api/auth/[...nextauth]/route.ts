import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// NextAuth handler mounted at /api/auth/[...nextauth].
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// Force server-side execution (no caching of the auth handler).
export const dynamic = "force-dynamic";