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

  const amountPaid = sessionType === "Private" ? 400000 : 150000;

  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    return NextResponse.json({ error: "کیف پولی برای شما یافت نشد" }, { status: 404 });
  }

  const currentBalance = Number(wallet.balance);
  if (currentBalance < amountPaid) {
    return NextResponse.json({
      error: "موجودی کیف پول کافی نیست",
      balance: currentBalance,
      required: amountPaid,
    }, { status: 402 });
  }

  try {
    await prisma.wallet.update({
      where: { userId },
      data: { balance: { decrement: amountPaid } },
    });

    const newBalance = currentBalance - amountPaid;

    await prisma.transaction.create({
      data: {
        userId,
        amount: BigInt(-amountPaid),
        balanceBefore: BigInt(currentBalance),
        balanceAfter: BigInt(newBalance),
        description: sessionType === "Private" ? "رزرو جلسه خصوصی" : "رزرو جلسه عمومی",
        status: "completed",
      },
    });

    const created = await prisma.session.create({
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
