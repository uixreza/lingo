import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@/lib/auth";
import { Prisma } from "@/app/generated/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const sess = await getServerSession(authOptions);
  if (!sess?.user?.id || sess.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = Math.min(
    Math.max(parseInt(url.searchParams.get("limit") ?? "20", 10) || 20, 1),
    50,
  );
  const offset = Math.max(parseInt(url.searchParams.get("offset") ?? "0", 10) || 0, 0);
  const search = (url.searchParams.get("search") ?? "").trim();

  const where: Prisma.UserWhereInput | undefined = search
    ? {
        OR: [
          { fullname: { contains: search, mode: "insensitive" } },
          { phone: { contains: search } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }
    : undefined;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip: offset,
      take: limit,
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullname: true,
        phone: true,
        email: true,
        avatarSeed: true,
        IsPro: true,
        fluencyLevel: true,
        isVerified: true,
        isActive: true,
        progress: true,
        role: true,
        badges: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    users: users.map((u) => ({
      ...u,
      isPro: u.IsPro,
    })),
    total,
    hasMore: offset + users.length < total,
  });
}