import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@/lib/auth";
import { NextResponse } from "next/server";

function div(a: number, b: number) { return ~~(a / b); }
function mod(a: number, b: number) { return a - ~~(a / b) * b; }

const BREAKS = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];

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

function jalCal(jy: number) {
  const { gy, march, jump, n } = jalCalCore(jy);
  return { leap: leapFromCycle(jump, n), gy, march };
}

function leapFromCycle(jump: number, n: number) {
  let adjusted = n;
  if (jump - n < 6) adjusted = n - jump + div(jump + 4, 33) * 33;
  let leap = mod(mod(adjusted + 1, 33) - 1, 4);
  if (leap === -1) leap = 4;
  return leap;
}

function gregToJalaliStr(date: Date): string {
  const { jy, jm, jd } = d2j(g2d(date.getFullYear(), date.getMonth() + 1, date.getDate()));
  return `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`;
}

export async function GET() {
  const sess = await getServerSession(authOptions);
  if (!sess?.user?.id || sess.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessions = await prisma.session.findMany({
    orderBy: { requestedAt: "desc" },
    include: {
      user: {
        select: {
          fullname: true,
          email: true,
          fluencyLevel: true,
        },
      },
    },
  });

  const mapped = sessions.map((s) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const timeHours = s.startTime.getHours();
    const timeMinutes = s.startTime.getMinutes();

    return {
      id: s.id,
      studentName: s.user.fullname,
      studentEmail: s.user.email ?? "",
      date: gregToJalaliStr(s.sessionDate),
      time: `${pad(timeHours)}:${pad(timeMinutes)}`,
      language: s.language,
      level: s.user.fluencyLevel || "A1",
      type: s.sessionType,
      reason: s.reasonForLearning,
      status: s.status,
      meetLink: s.meetUrl || "",
    };
  });

  return NextResponse.json(mapped);
}

export async function PATCH(request: Request) {
  const sess = await getServerSession(authOptions);
  if (!sess?.user?.id || sess.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, status, meetUrl } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing session id" }, { status: 400 });
  }

  const existing = await prisma.session.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};
  if (status && status !== existing.status) {
    updateData.status = status;
    if (status === "Approved") updateData.approvedAt = new Date();
    if (status === "Canceled") updateData.cancelledAt = new Date();
  }
  if (meetUrl !== undefined) {
    updateData.meetUrl = meetUrl || null;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const oldStatus = existing.status;
    const newStatus = updateData.status as string | undefined;

    if (newStatus && newStatus !== oldStatus) {
      await tx.sessionAuditLog.create({
        data: {
          sessionId: id,
          userId: parseInt(sess.user.id, 10),
          oldStatus,
          newStatus,
        },
      });
    }

    return tx.session.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            fullname: true,
            email: true,
            fluencyLevel: true,
          },
        },
      },
    });
  });

  const pad = (n: number) => String(n).padStart(2, "0");
  const timeHours = updated.startTime.getHours();
  const timeMinutes = updated.startTime.getMinutes();

  return NextResponse.json({
    id: updated.id,
    studentName: updated.user.fullname,
    studentEmail: updated.user.email,
    date: gregToJalaliStr(updated.sessionDate),
    time: `${pad(timeHours)}:${pad(timeMinutes)}`,
    language: updated.language,
    level: updated.user.fluencyLevel || "A1",
    type: updated.sessionType,
    reason: updated.reasonForLearning,
    status: updated.status,
    meetLink: updated.meetUrl || "",
  });
}
