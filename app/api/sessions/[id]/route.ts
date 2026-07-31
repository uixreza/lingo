import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const sess = await getServerSession(authOptions);
  if (!sess?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt(sess.user.id, 10);
  const sessionId = parseInt((await ctx.params).id, 10);
  if (isNaN(sessionId)) {
    return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const session = await tx.session.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) {
      return { kind: "error", status: 404, error: "جلسه یافت نشد" } as const;
    }
    if (session.status === "Approved") {
      return {
        kind: "error",
        status: 400,
        error: "این جلسه توسط استاد تأیید شده است و امکان لغو آن وجود ندارد",
      } as const;
    }
    if (session.status === "Canceled") {
      return {
        kind: "error",
        status: 400,
        error: "این جلسه قبلاً لغو شده است",
      } as const;
    }

    const amount = Number(session.amountPaid);

    if (amount > 0) {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) {
        return {
          kind: "error",
          status: 404,
          error: "کیف پول شما یافت نشد",
        } as const;
      }
      await tx.wallet.update({
        where: { userId },
        data: { balance: { increment: amount } },
      });
      await tx.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          amount: BigInt(amount),
          balanceBefore: BigInt(Number(wallet.balance)),
          balanceAfter: BigInt(Number(wallet.balance) + amount),
          description: "بازگشت وجه لغو جلسه",
          status: "completed",
        },
      });
    }

    await tx.sessionAuditLog.create({
      data: {
        sessionId,
        userId,
        oldStatus: session.status,
        newStatus: "Canceled",
      },
    });

    const updated = await tx.session.update({
      where: { id: sessionId },
      data: { status: "Canceled", cancelledAt: new Date() },
    });

    return { kind: "success", id: updated.id } as const;
  });

  if (result.kind === "error") {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ id: result.id, status: "Canceled" });
}
