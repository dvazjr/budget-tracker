import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/lib/rate-limit";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // Rate-limit login attempts per email to slow brute-force attacks.
        const emailKey = credentials.email.toLowerCase().trim();
        const rl = checkRateLimit(`login:${emailKey}`, { limit: 10, windowMs: 15 * 60 * 1000 });
        if (!rl.allowed) {
          throw new Error("Too many login attempts. Please try again later.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        // Use a constant-time comparison path even when user not found
        // to prevent user enumeration via timing attacks.
        const dummyHash = "$2b$10$invalidhashfortimingprotectiononly00000000000000000000";
        const isPasswordValid = user
          ? await bcrypt.compare(credentials.password, user.password)
          : await bcrypt.compare(credentials.password, dummyHash);

        if (!user || !isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,     // 24 hours — shorter window for a financial app
    updateAge: 60 * 60,        // Refresh the token every hour of activity
  },
  // Harden the session cookie: HttpOnly, Secure (HTTPS-only), SameSite=strict.
  // The __Secure- prefix tells browsers to only send the cookie over HTTPS.
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
        path: "/",
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
