import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const sess = await getServerSession(authOptions);
  if (!sess?.user?.id || sess.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 8, 1), 30);

  const where: { phone?: { contains: string } } = {};
  if (q) {
    where.phone = { contains: q };
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "asc" },
    take: limit,
    select: {
      id: true,
      fullname: true,
      phone: true,
      avatarSeed: true,
      IsPro: true,
      wallet: { select: { balance: true, lastCharge: true } },
    },
  });

  return NextResponse.json(
    users.map((u) => ({
      id: u.id,
      fullname: u.fullname,
      phone: u.phone,
      avatarSeed: u.avatarSeed,
      isPro: u.IsPro,
      balance: Number(u.wallet?.balance ?? 0),
    })),
  );
}