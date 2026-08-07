import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@/lib/auth";
import { NextResponse } from "next/server";

type ChargeType = "Card-to-Card" | "Gateway";

function isValidChargeType(v: string | undefined): v is ChargeType {
  return v === "Gateway" || v === "Card-to-Card";
}

export async function POST(req: Request) {
  const sess = await getServerSession(authOptions);
  if (!sess?.user?.id || sess.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { userId?: number; amount?: number; chargeType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 400 });
  }

  const { userId, amount, chargeType } = body;
  if (!userId || !amount) {
    return NextResponse.json(
      { error: "کاربر و مبلغ الزامی است" },
      { status: 400 },
    );
  }
  if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    return NextResponse.json({ error: "مبلغ وارد شده معتبر نیست" }, { status: 400 });
  }
  const type: ChargeType =
    isValidChargeType(chargeType) ? chargeType : "Card-to-Card";

  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: { id: true, fullname: true, phone: true, wallet: true },
  });
  if (!user) {
    return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });
  }

  const chargeAmount = BigInt(Math.round(Number(amount)));

  const wallet = user.wallet;
  if (!wallet) {
    return NextResponse.json({ error: "این کاربر کیف پول ندارد" }, { status: 400 });
  }

  const balance = Number(wallet.balance);
  const balanceAfter = balance + Number(chargeAmount);

  await prisma.$transaction([
    prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: { increment: chargeAmount },
        lastCharge: chargeAmount,
      },
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        walletId: wallet.id,
        amount: chargeAmount,
        balanceBefore: BigInt(balance),
        balanceAfter: BigInt(balanceAfter),
        description:
          type === "Gateway" ? "شارژ کیف پول (درگاه)" : "شارژ کیف پول (کارت به کارت)",
        paymentMethod: type,
        status: "completed",
        completedAt: new Date(),
      },
    }),
  ]);

  return NextResponse.json({
    success: true,
    fullname: user.fullname,
    phone: user.phone,
    addedAmount: Number(chargeAmount),
    balanceAfter,
  });
}