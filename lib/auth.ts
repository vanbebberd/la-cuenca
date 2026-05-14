import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    // Login directo por email (para desarrollo/admin sin OAuth)
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        try {
          const isAdmin = !!process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL === credentials.email;
          const user = await prisma.user.upsert({
            where: { email: credentials.email },
            update: isAdmin ? { role: "ADMIN" } : {},
            create: {
              email: credentials.email,
              name: credentials.email.split("@")[0],
              role: isAdmin ? "ADMIN" : "USER",
            },
          });
          return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role };
        } catch (e) {
          console.error("[auth] authorize error:", e);
          return null;
        }
      },
    }),

    // Google OAuth (cuando esté configurado)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })]
      : []),
  ],
  callbacks: {
    session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.sub!;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        // On sign-in, role comes fresh from the upsert in authorize()
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
};
