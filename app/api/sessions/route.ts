import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@/lib/auth";
import { NextResponse } from "next/server";

const BREAKS = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];

function div(a: number, b: number) { return ~~(a / b); }
function mod(a: number, b: number) { return a - ~~(a / b) * b; }

function g2d(gy: number, gm: number, gd: number): number {
  let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * mod(gm + 9, 12) + 2, 5) + gd - 34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

function d2g(jdn: number) {
  let l = jdn + 68569;
  let n = div(4 * l, 146097);
  l = l - div(146097 * n + 3, 4);
  let i = div(4000 * (l + 1), 1461001);
  l = l - div(1461 * i, 4) + 31;
  let j = div(80 * l, 2447);
  const gd = l - div(2447 * j, 80);
  l = div(j, 11);
  const gm = j + 2 - 12 * l;
  const gy = 100 * (n - 49) + i + l;
  return { gy, gm, gd };
}

function d2j(jdn: number) {
  const gy = d2g(jdn).gy;
  let jy = gy - 621;
  const r = jalCal(jy);
  const jdn1f = g2d(gy, 3, r.march);
  let k = jdn - jdn1f;
  if (k >= 0) {
    if (k <= 185) return { jy, jm: 1 + div(k, 31), jd: mod(k, 31) + 1 };
    k -= 186;
  } else {
    jy -= 1;
    k += 179;
    if (r.leap === 1) k += 1;
  }
  return { jy, jm: 7 + div(k, 30), jd: mod(k, 30) + 1 };
}

function j2d(jy: number, jm: number, jd: number): number {
  const r = jalCalShort(jy);
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

function jalCalCore(jy: number) {
  const gy = jy + 621;
  let leapJ = -14;
  let jp = BREAKS[0];
  let jm = 0;
  let jump = 0;
  for (let i = 1; i < BREAKS.length; i += 1) {
    jm = BREAKS[i];
    jump = jm - jp;
    if (jy < jm) break;
    leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }
  const n = jy - jp;
  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;
  return { gy, march, jump, n };
}

function leapFromCycle(jump: number, n: number) {
  let adjusted = n;
  if (jump - n < 6) adjusted = n - jump + div(jump + 4, 33) * 33;
  let leap = mod(mod(adjusted + 1, 33) - 1, 4);
  if (leap === -1) leap = 4;
  return leap;
}

function jalCal(jy: number) {
  const { gy, march, jump, n } = jalCalCore(jy);
  return { leap: leapFromCycle(jump, n), gy, march };
}

function jalCalShort(jy: number) {
  const { gy, march } = jalCalCore(jy);
  return { gy, march };
}

function gregToJalaliStr(date: Date): string {
  const { jy, jm, jd } = d2j(g2d(date.getFullYear(), date.getMonth() + 1, date.getDate()));
  return `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`;
}

function toEnglishDigits(str: string) {
  return str.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
}

function jalaliStrToDate(jalaliStr: string): Date {
  const normalized = toEnglishDigits(jalaliStr);
  const parts = normalized.split("/");
  if (parts.length !== 3) return new Date(NaN);
  const [jy, jm, jd] = parts.map(Number);
  if (isNaN(jy) || isNaN(jm) || isNaN(jd)) return new Date(NaN);
  const g = d2g(j2d(jy, jm, jd));
  return new Date(g.gy, g.gm - 1, g.gd);
}

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
      date: gregToJalaliStr(s.sessionDate),
      time: `${pad(timeHours)}:${pad(timeMinutes)}`,
      language: s.language,
      type: s.sessionType,
      status: s.status.toLowerCase(),
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
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const gregDate = jalaliStrToDate(sessionDate);
  if (isNaN(gregDate.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const timeParts = startTime.split(":");
  const timeDate = new Date();
  timeDate.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0, 0);

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
        status: "pending",
        paymentStatus: "paid",
      },
    });

    return NextResponse.json({
      id: created.id,
      date: gregToJalaliStr(created.sessionDate),
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
