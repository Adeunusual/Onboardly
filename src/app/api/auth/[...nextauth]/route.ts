// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import { NEXTAUTH_SECRET } from "@/config/env";

const ADMIN_EMAILS = new Set<string>(["ridoy@sspgroup.com", "atanda.faruq@sspgroup.com"]);

const handler = NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    }),
  ],

  // Use our custom /login page
  pages: {
    signIn: "/login",
  },

  callbacks: {
    async signIn({ user }) {
      // No email from Azure → treat as failure
      if (!user?.email) {
        return "/login?errorMsg=" + encodeURIComponent("Unable to read email from your Microsoft account.");
      }

      const email = user.email.toLowerCase();

      // Hard-coded admin allowlist
      if (!ADMIN_EMAILS.has(email)) {
        return "/login?errorMsg=" + encodeURIComponent("You are not authorized to access this application.");
      }

      // Allowed → continue normal flow
      return true;
    },

    async jwt({ token, user }) {
      // Attach fields expected by your AppJWT / currentUser
      if (user) {
        token.userId = (user as any).id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).userId = (token as any).userId;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Preserve callbackUrl like "/dashboard" when passed from signIn
      if (url.startsWith("/")) return `${baseUrl}${url}`;

      try {
        const target = new URL(url);
        if (target.origin === baseUrl) return url;
      } catch {
        // ignore parse error; fall back below
      }

      return baseUrl;
    },
  },

  secret: NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
