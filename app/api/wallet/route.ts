import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt(session.user.id, 10);

  const [wallet, transactionCount] = await Promise.all([
    prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.transaction.count({ where: { userId } }),
  ]);

  if (!wallet) {
    return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
  }

  const mapTransaction = (t: {
    id: number;
    amount: bigint;
    balanceBefore: bigint;
    balanceAfter: bigint;
    description: string | null;
    referenceId: string | null;
    status: string;
    createdAt: Date;
  }) => ({
    id: t.id,
    amount: Number(t.amount),
    balanceBefore: Number(t.balanceBefore),
    balanceAfter: Number(t.balanceAfter),
    description: t.description,
    referenceId: t.referenceId,
    status: t.status,
    createdAt: t.createdAt.toISOString(),
  });

  return NextResponse.json({
    balance: Number(wallet.balance),
    lastCharge: Number(wallet.lastCharge),
    isActive: wallet.isActive,
    transactionCount,
    recentTransactions: wallet.transactions.slice(0, 10).map(mapTransaction),
    invoices: wallet.transactions.map(mapTransaction),
  });
}
