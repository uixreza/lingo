import { PrismaClient } from "@/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrisma() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const prisma = globalForPrisma.prisma ?? createPrisma();
globalForPrisma.prisma = prisma;

export { prisma };

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
            return {
              id: String(user.id),
              phone: user.phone,
              fullname: user.fullname,
              role: user.role,
              gender: user.gender,
              avatarSeed: user.avatarSeed,
            };
          }

          if (!password) return null;
          const user = await prisma.user.findUnique({ where: { phone } });
          if (!user || !user.isActive) return null;
          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) return null;
          return {
            id: String(user.id),
            phone: user.phone,
            fullname: user.fullname,
            role: user.role,
            gender: user.gender,
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.phone = user.phone!;
        token.fullname = user.fullname!;
        token.role = user.role!;
        token.gender = user.gender as "Male" | "Female";
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
          gender: token.gender as "Male" | "Female",
          avatarSeed: token.avatarSeed as string | undefined,
        },
      };
    },
  },
  pages: { signIn: "/" },
};
