import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@/lib/auth";
import { Prisma, FluencyLevel } from "@/app/generated/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

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

export async function POST(request: Request) {
  const sess = await getServerSession(authOptions);
  if (!sess?.user?.id || sess.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 400 });
  }

  const fullname = typeof body.fullname === "string" ? body.fullname.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const password = typeof body.password === "string" ? body.password.trim() : "";

  if (!fullname) {
    return NextResponse.json(
      { error: "نام و نام خانوادگی الزامی است" },
      { status: 400 },
    );
  }

  if (!/^09\d{9}$/.test(phone)) {
    return NextResponse.json(
      { error: "شماره موبایل معتبر نیست" },
      { status: 400 },
    );
  }

  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: "رمز عبور باید حداقل ۸ کاراکتر باشد" },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    return NextResponse.json(
      { error: "این شماره موبایل قبلاً ثبت شده است" },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          fullname,
          phone,
          fluencyLevel: FluencyLevel.A1,
          passwordHash,
        },
      });

      const wallet = await tx.wallet.create({
        data: { userId: newUser.id, balance: 150000, lastCharge: 0 },
      });

      await tx.transaction.create({
        data: {
          userId: newUser.id,
          walletId: wallet.id,
          amount: 150000,
          balanceBefore: 0,
          balanceAfter: 150000,
          description: "هدیه خوش‌آمدگویی ثبت‌نام",
          paymentMethod: "Gift",
          status: "completed",
          completedAt: new Date(),
        },
      });

      return newUser;
    });

    return NextResponse.json(
      {
        id: user.id,
        fullname: user.fullname,
        phone: user.phone,
        email: user.email,
        avatarSeed: user.avatarSeed,
        isPro: user.IsPro,
        fluencyLevel: user.fluencyLevel,
        isVerified: user.isVerified,
        isActive: user.isActive,
        role: user.role,
        badges: user.badges,
        createdAt: user.createdAt,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Error creating user:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}