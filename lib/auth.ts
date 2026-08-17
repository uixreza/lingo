import { PrismaClient } from "@/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrisma() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 5_000,
    connectionTimeoutMillis: 10_000,
  });
  pool.on("error", (err) => {
    console.error("Unexpected pg pool error:", err.message);
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const prisma = globalForPrisma.prisma ?? createPrisma();
globalForPrisma.prisma = prisma;

export { prisma };

const LOYALTY_THRESHOLD_MS = 365.25 * 24 * 60 * 60 * 1000;

export async function ensureLoyaltyBadge(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdAt: true, badges: true },
  });
  if (!user) return;
  const hasOneYear = Date.now() - new Date(user.createdAt).getTime() >= LOYALTY_THRESHOLD_MS;
  if (!hasOneYear || user.badges.includes("Loyalty")) return;
  await prisma.user.update({
    where: { id: userId },
    data: { badges: { push: "Loyalty" } },
  });
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {},
      async authorize(credentials) {
        try {
          const { phone, password, otp, mode } = credentials as {
            phone?: string;
            password?: string;
            otp?: string;
            mode?: string;
          };

          if (!phone || !/^09\d{9}$/.test(phone)) return null;

          if (mode === "otp") {
            if (!otp) return null;
            const otpRecord = await prisma.oTP.findFirst({
              where: { phone, code: otp, isUsed: false, expiresAt: { gte: new Date() } },
            });
            if (!otpRecord) return null;
            await prisma.oTP.update({
              where: { id: otpRecord.id },
              data: { isUsed: true },
            });
            const user = await prisma.user.findUnique({ where: { phone } });
            if (!user || !user.isActive) return null;
            await prisma.user.update({
              where: { id: user.id },
              data: { lastLoginAt: new Date() },
            });
            return {
              id: String(user.id),
              phone: user.phone,
              fullname: user.fullname,
              role: user.role,
              avatarSeed: user.avatarSeed,
            };
          }

          if (!password) return null;
          const user = await prisma.user.findUnique({ where: { phone } });
          if (!user || !user.isActive) return null;
          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) return null;
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });
          return {
            id: String(user.id),
            phone: user.phone,
            fullname: user.fullname,
            role: user.role,
            avatarSeed: user.avatarSeed,
            };
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session?.user) {
        if (session.user.fullname) token.fullname = session.user.fullname;
        if (session.user.avatarSeed !== undefined)
          token.avatarSeed = session.user.avatarSeed;
      }
      if (user) {
        token.id = user.id!;
        token.phone = user.phone!;
        token.fullname = user.fullname!;
        token.role = user.role!;
        token.avatarSeed = user.avatarSeed as string | undefined;
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          id: token.id as string,
          phone: token.phone as string,
          fullname: token.fullname as string,
          role: token.role as string,
          avatarSeed: token.avatarSeed as string | undefined,
        },
      };
    },
  },
  pages: { signIn: "/" },
};
