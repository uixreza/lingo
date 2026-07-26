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

  const [totalIncomeAgg, todayAgg, weekAgg, monthAgg, totalStudents, totalSessions, sessions] = await Promise.all([
    prisma.session.aggregate({
      where: { paymentStatus: "paid" },
      _sum: { amountPaid: true },
    }),
    prisma.session.aggregate({
      where: { paymentStatus: "paid", requestedAt: { gte: startOfDay } },
      _sum: { amountPaid: true },
    }),
    prisma.session.aggregate({
      where: { paymentStatus: "paid", requestedAt: { gte: startOfWeek } },
      _sum: { amountPaid: true },
    }),
    prisma.session.aggregate({
      where: { paymentStatus: "paid", requestedAt: { gte: startOfMonth } },
      _sum: { amountPaid: true },
    }),
    prisma.user.count({ where: { role: "Client" } }),
    prisma.session.count(),
    prisma.session.findMany({
      where: { paymentStatus: "paid" },
      orderBy: { requestedAt: "desc" },
      take: 50,
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

  const pad = (n: number) => String(n).padStart(2, "0");

  return NextResponse.json({
    totalIncome: Number(totalIncomeAgg._sum.amountPaid ?? 0),
    todayIncome: Number(todayAgg._sum.amountPaid ?? 0),
    weekIncome: Number(weekAgg._sum.amountPaid ?? 0),
    monthIncome: Number(monthAgg._sum.amountPaid ?? 0),
    totalStudents,
    totalSessions,
    recentSessions: sessions.map((s) => ({
      id: s.id,
      studentName: s.user.fullname,
      amount: Number(s.amountPaid),
      type: s.sessionType,
      date: `${s.sessionDate.getFullYear()}/${pad(s.sessionDate.getMonth() + 1)}/${pad(s.sessionDate.getDate())}`,
    })),
  });
}
