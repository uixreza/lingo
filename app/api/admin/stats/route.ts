import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const sess = await getServerSession(authOptions);
  if (!sess?.user?.id || sess.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [allTransactions, sessions, monthlyTransactions, monthlySessions] =
    await Promise.all([
      prisma.transaction.findMany({
        where: {
          createdAt: { gte: startOfMonth, lt: startOfNextMonth },
          status: "completed",
        },
        select: { amount: true, createdAt: true },
      }),
      prisma.session.count({
        where: {
          requestedAt: { gte: startOfMonth, lt: startOfNextMonth },
        },
      }),
      prisma.transaction.findMany({
        where: {
          createdAt: { gte: startOfMonth, lt: startOfNextMonth },
          status: "completed",
        },
        select: { amount: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.session.findMany({
        where: {
          requestedAt: { gte: startOfMonth, lt: startOfNextMonth },
        },
        select: { requestedAt: true },
        orderBy: { requestedAt: "asc" },
      }),
    ]);

  const totalVolume = allTransactions.reduce(
    (sum, t) => sum + Math.abs(Number(t.amount)),
    0,
  );
  const transactionCount = allTransactions.length;

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const dailyTransactionTotals: number[] = Array(daysInMonth).fill(0);
  const dailySessionCounts: number[] = Array(daysInMonth).fill(0);

  for (const t of monthlyTransactions) {
    const day = t.createdAt.getDate() - 1;
    dailyTransactionTotals[day] += Math.abs(Number(t.amount));
  }

  for (const s of monthlySessions) {
    const day = s.requestedAt.getDate() - 1;
    dailySessionCounts[day] += 1;
  }

  return NextResponse.json({
    currentMonth: {
      transactionCount,
      transactionVolume: totalVolume,
      sessionCount: sessions,
    },
    dailyTransactions: dailyTransactionTotals,
    dailySessions: dailySessionCounts,
  });
}
