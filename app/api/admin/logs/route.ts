import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@/lib/auth";
import { NextResponse } from "next/server";

export type AdminLogType =
  | "register"
  | "login"
  | "transaction"
  | "session"
  | "ticket"
  | "post";

export interface AdminLogEntry {
  id: string;
  type: AdminLogType;
  message: string;
  fullname: string;
  phone: string;
  at: string;
}

export async function GET() {
  const sess = await getServerSession(authOptions);
  if (!sess?.user?.id || sess.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [users, transactions, sessions, tickets, posts] = await Promise.all([
    prisma.user.findMany({
      where: { createdAt: { gte: since } },
      select: { id: true, fullname: true, phone: true, createdAt: true, lastLoginAt: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.transaction.findMany({
      where: { createdAt: { gte: since } },
      select: {
        id: true,
        amount: true,
        description: true,
        createdAt: true,
        user: { select: { fullname: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.session.findMany({
      where: { requestedAt: { gte: since } },
      select: {
        id: true,
        language: true,
        requestedAt: true,
        status: true,
        user: { select: { fullname: true, phone: true } },
      },
      orderBy: { requestedAt: "desc" },
      take: 40,
    }),
    prisma.ticket.findMany({
      where: { createdAt: { gte: since } },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        user: { select: { fullname: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.post.findMany({
      where: { publishedAt: { gte: since } },
      select: {
        id: true,
        title: true,
        publishedAt: true,
        author: { select: { fullname: true, phone: true } },
      },
      orderBy: { publishedAt: "desc" },
      take: 20,
    }),
  ]);

  const entries: AdminLogEntry[] = [];

  for (const u of users) {
    entries.push({
      id: `register-${u.id}`,
      type: "register",
      message: "ثبت‌نام جدید در سامانه",
      fullname: u.fullname,
      phone: u.phone,
      at: u.createdAt.toISOString(),
    });
    if (u.lastLoginAt && u.lastLoginAt >= since) {
      entries.push({
        id: `login-${u.id}`,
        type: "login",
        message: "وارد حساب کاربری شد",
        fullname: u.fullname,
        phone: u.phone,
        at: u.lastLoginAt.toISOString(),
      });
    }
  }

  const financialItems = [
    { label: "شارژ کیف پول", type: "deposit" as const },
    { label: "کسر از کیف پول", type: "withdraw" as const },
    { label: "پرداخت جلسه", type: "session-pay" as const },
    { label: "خرید اشتراک", type: "subscription" as const },
    { label: "بازگشت وجه", type: "refund" as const },
    { label: "کارمزد", type: "fee" as const },
    { label: "هدیه", type: "bonus" as const },
  ];

  let financialIndex = 0;
  for (const t of transactions) {
    const hint = t.description
      ? t.description
      : financialItems[financialIndex % financialItems.length].label;
    financialIndex += 1;
    entries.push({
      id: `transaction-${t.id}`,
      type: "transaction",
      message: `تراکنش مالی: ${hint} (${Math.abs(Number(t.amount)).toLocaleString("fa-IR")} تومان)`,
      fullname: t.user.fullname,
      phone: t.user.phone,
      at: t.createdAt.toISOString(),
    });
  }

  for (const s of sessions) {
    const statusText =
      s.status === "Approved"
        ? "تأیید شد"
        : s.status === "Canceled"
          ? "لغو شد"
          : "در انتظار تأیید";
    entries.push({
      id: `session-${s.id}`,
      type: "session",
      message: `درخواست جلسه «${s.language}» با وضعیت ${statusText}`,
      fullname: s.user.fullname,
      phone: s.user.phone,
      at: s.requestedAt.toISOString(),
    });
  }

  for (const t of tickets) {
    entries.push({
      id: `ticket-${t.id}`,
      type: "ticket",
      message: `تیکت پشتیبانی جدید: ${t.title}`,
      fullname: t.user.fullname,
      phone: t.user.phone,
      at: t.createdAt.toISOString(),
    });
  }

  for (const p of posts) {
    entries.push({
      id: `post-${p.id}`,
      type: "post",
      message: `انتشار مقاله: ${p.title}`,
      fullname: p.author.fullname,
      phone: p.author.phone,
      at: p.publishedAt!.toISOString(),
    });
  }

  entries.sort((a, b) => (a.at < b.at ? 1 : -1));

  return NextResponse.json(entries.slice(0, 80));
}