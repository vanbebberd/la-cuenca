import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    // Login por email.
    // - La cuenta admin (ADMIN_EMAIL) SIEMPRE exige ADMIN_PASSWORD.
    // - USER normal: passwordless (se crea la cuenta al vuelo).
    // - BUSINESS_OWNER: passwordless bloqueado SOLO si Google OAuth está
    //   configurado (para no dejar sin acceso a dueños que hoy entran por email).
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        if (!email) return null;
        try {
          const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
          const isAdminEmail = !!adminEmail && adminEmail === email;

          if (isAdminEmail) {
            const expected = process.env.ADMIN_PASSWORD;
            if (!expected || credentials?.password !== expected) {
              console.warn("[auth] login admin rechazado: contraseña incorrecta o ADMIN_PASSWORD sin configurar");
              return null;
            }
            const user = await prisma.user.upsert({
              where: { email },
              update: { role: "ADMIN" },
              create: { email, name: email.split("@")[0], role: "ADMIN" },
            });
            return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role };
          }

          const existing = await prisma.user.findUnique({ where: { email } });
          const googleConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
          if (existing && existing.role !== "USER" && googleConfigured) {
            console.warn(`[auth] login passwordless bloqueado para cuenta privilegiada: ${email} — debe usar Google`);
            return null;
          }

          const user = existing ?? (await prisma.user.create({
            data: { email, name: email.split("@")[0], role: "USER" },
          }));
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
        token.roleSyncedAt = Date.now();
        return token;
      }
      // Re-sincroniza el rol desde la DB cada pocos minutos, así una
      // promoción/degradación aplica sin re-login y un token privilegiado
      // obsoleto no sobrevive indefinidamente.
      const STALE_MS = 5 * 60 * 1000;
      const syncedAt = typeof token.roleSyncedAt === "number" ? token.roleSyncedAt : 0;
      if (token.sub && Date.now() - syncedAt > STALE_MS) {
        try {
          const fresh = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { role: true },
          });
          if (fresh) token.role = fresh.role;
          token.roleSyncedAt = Date.now();
        } catch (e) {
          console.error("[auth] jwt: no se pudo re-sincronizar rol:", e);
        }
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
