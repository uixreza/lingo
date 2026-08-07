import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const sess = await getServerSession(authOptions);
  if (!sess?.user?.id || sess.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const pad = (n: number) => String(n).padStart(2, "0");
  const fmtDate = (d: Date) =>
    `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;

  const [transactions, totalStudents, totalSessions, paidSessions] = await Promise.all([
    prisma.transaction.findMany({
      where: { status: "completed" },
      select: {
        id: true,
        amount: true,
        createdAt: true,
        paymentMethod: true,
        description: true,
        user: { select: { fullname: true } },
      },
    }),
    prisma.user.count({ where: { role: "Client" } }),
    prisma.session.count(),
    prisma.session.findMany({
      where: { paymentStatus: "paid" },
      orderBy: { requestedAt: "desc" },
      select: {
        id: true,
        user: { select: { fullname: true } },
        sessionDate: true,
        startTime: true,
        sessionType: true,
        amountPaid: true,
        requestedAt: true,
      },
    }),
  ]);

  const deposits = transactions
    .filter((t) => t.amount > BigInt(0))
    .map((t) => ({ ...t, amount: Number(t.amount) }));

  const sum = (items: { amount: number }[]) =>
    items.reduce((acc, t) => acc + t.amount, 0);

  const inRange = (d: Date, from: Date) => d.getTime() >= from.getTime();

  const totalIncome = sum(deposits);
  const todayIncome = sum(deposits.filter((t) => inRange(t.createdAt, startOfDay)));
  const weekIncome = sum(deposits.filter((t) => inRange(t.createdAt, startOfWeek)));
  const monthIncome = sum(deposits.filter((t) => inRange(t.createdAt, startOfMonth)));

  const recentSessions = paidSessions.map((s) => ({
    id: `s-${s.id}`,
    studentName: s.user.fullname,
    amount: Number(s.amountPaid),
    type: s.sessionType,
    date: fmtDate(s.sessionDate),
  }));

  const recentDeposits = deposits
    .slice()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 50)
    .map((t) => ({
      id: `t-${t.id}`,
      studentName: t.user.fullname,
      amount: t.amount,
      type:
        t.paymentMethod === "Card-to-Card"
          ? "کارت به کارت"
          : t.paymentMethod === "Gateway"
            ? "درگاه"
            : "واریز",
      date: fmtDate(t.createdAt),
    }));

  const recent = [...recentDeposits, ...recentSessions]
    .sort((a, b) => (a.date > b.date ? -1 : 1))
    .slice(0, 50);

  return NextResponse.json({
    totalIncome: totalIncome,
    todayIncome,
    weekIncome,
    monthIncome,
    totalStudents,
    totalSessions,
    recentSessions: recent,
  });
}