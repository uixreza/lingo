import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@/lib/auth";
import { NextResponse } from "next/server";
import moment from "moment-jalaali";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt(session.user.id, 10);

  const sessions = await prisma.session.findMany({
    where: { userId },
    orderBy: { requestedAt: "desc" },
    select: {
      id: true,
      sessionDate: true,
      startTime: true,
      language: true,
      sessionType: true,
      status: true,
      meetUrl: true,
      reasonForLearning: true,
      sessionNote: true,
    },
  });

  const mapped = sessions.map((s) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const timeHours = s.startTime.getHours();
    const timeMinutes = s.startTime.getMinutes();

    return {
      id: s.id,
      date: moment(s.sessionDate).format("jYYYY/jMM/jDD"),
      time: `${pad(timeHours)}:${pad(timeMinutes)}`,
      language: s.language,
      type: s.sessionType,
      status: s.status,
      meetLink: s.meetUrl,
      reason: s.reasonForLearning,
    };
  });

  return NextResponse.json(mapped);
}

export async function POST(request: Request) {
  const sess = await getServerSession(authOptions);
  if (!sess?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt(sess.user.id, 10);
  const body = await request.json();
  const { sessionDate, startTime, language, sessionType, reasonForLearning } = body;

  if (!sessionDate || !startTime || !sessionType) {
    if (sessionType !== "Public") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!sessionType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
  }

  let gregDate: Date;
  let timeDate: Date;

  if (sessionType === "Public") {
    gregDate = new Date();
    timeDate = new Date();
  } else {
    const m = moment(sessionDate, "jYYYY/jMM/jDD");
    gregDate = new Date(Date.UTC(m.year(), m.month(), m.date()));
    if (isNaN(gregDate.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const timeParts = startTime.split(":");
    timeDate = new Date();
    timeDate.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0, 0);
  }

  // Price from DB — single source of truth, matches what the UI displays.
  // Fallbacks mirror the price GET route so they can never diverge.
  const sessionPrice = await prisma.sessionPrice.findFirst();
  const amountPaid =
    sessionType === "Private"
      ? Number(sessionPrice?.privatePrice ?? 350000)
      : Number(sessionPrice?.subscriptionPrice ?? 150000);

  // Free session (admin set price to 0): no wallet interaction
  if (amountPaid <= 0) {
    try {
      const created = await prisma.session.create({
        data: {
          userId,
          sessionDate: gregDate,
          startTime: timeDate,
          language: language || "English",
          sessionType: sessionType === "Private" ? "Private" : "Public",
          reasonForLearning: reasonForLearning || null,
          amountPaid: 0,
          status: "Pending",
          paymentStatus: "paid",
        },
      });

      return NextResponse.json({
        id: created.id,
        date: moment(created.sessionDate).format("jYYYY/jMM/jDD"),
        time: `${String(created.startTime.getHours()).padStart(2, "0")}:${String(created.startTime.getMinutes()).padStart(2, "0")}`,
        language: created.language,
        type: created.sessionType,
        status: created.status,
        reason: created.reasonForLearning,
      }, { status: 201 });
    } catch (err) {
      console.error("Session creation error:", err);
      return NextResponse.json({
        error: "خطا در ثبت جلسه",
        detail: err instanceof Error ? err.message : "Unknown error",
      }, { status: 500 });
    }
  }

  try {
    // Atomic debit + transaction record + session creation, all-or-nothing
    const result = await prisma.$transaction(async (tx) => {
      const update = await tx.wallet.updateMany({
        where: { userId, isActive: true, balance: { gte: amountPaid } },
        data: { balance: { decrement: amountPaid } },
      });

      if (update.count === 0) {
        const wallet = await tx.wallet.findUnique({ where: { userId } });
        if (!wallet) {
          return { kind: "error", error: "کیف پولی برای شما یافت نشد", status: 404 } as const;
        }
        if (!wallet.isActive) {
          return { kind: "error", error: "کیف پول شما غیرفعال است", status: 403 } as const;
        }
        return {
          kind: "error",
          error: "موجودی کیف پول کافی نیست",
          status: 402,
          balance: Number(wallet.balance),
          required: amountPaid,
        } as const;
      }

      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new Error("Wallet missing after debit");

      const newBalance = Number(wallet.balance);

      await tx.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          amount: BigInt(-amountPaid),
          balanceBefore: BigInt(newBalance + amountPaid),
          balanceAfter: BigInt(newBalance),
          description: sessionType === "Private" ? "رزرو جلسه خصوصی" : "رزرو جلسه عمومی",
          status: "completed",
        },
      });

      const created = await tx.session.create({
        data: {
          userId,
          sessionDate: gregDate,
          startTime: timeDate,
          language: language || "English",
          sessionType: sessionType === "Private" ? "Private" : "Public",
          reasonForLearning: reasonForLearning || null,
          amountPaid,
          status: "Pending",
          paymentStatus: "paid",
        },
      });

      return { kind: "success", created } as const;
    });

    if (result.kind === "error") {
      return NextResponse.json({
        error: result.error,
        balance: result.balance,
        required: result.required,
      }, { status: result.status });
    }

    const created = result.created;
    return NextResponse.json({
      id: created.id,
      date: moment(created.sessionDate).format("jYYYY/jMM/jDD"),
      time: `${String(created.startTime.getHours()).padStart(2, "0")}:${String(created.startTime.getMinutes()).padStart(2, "0")}`,
      language: created.language,
      type: created.sessionType,
      status: created.status,
      reason: created.reasonForLearning,
    }, { status: 201 });
  } catch (err) {
    console.error("Session creation error:", err);
    return NextResponse.json({
      error: "خطا در ثبت جلسه",
      detail: err instanceof Error ? err.message : "Unknown error",
    }, { status: 500 });
  }
}
