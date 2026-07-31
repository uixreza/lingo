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

  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);

  const [upcoming, privateSessions] = await Promise.all([
    prisma.session.findMany({
      where: {
        userId,
        status: "Approved",
        sessionDate: { gte: startOfToday },
      },
      orderBy: [{ sessionDate: "asc" }, { startTime: "asc" }],
      select: {
        id: true,
        sessionDate: true,
        startTime: true,
        language: true,
        meetUrl: true,
      },
    }),
    prisma.session.count({
      where: { userId, sessionType: "Private" },
    }),
  ]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return NextResponse.json({
    upcomingCount: upcoming.length,
    upcomingSessions: upcoming.slice(0, 3).map((s) => ({
      id: s.id,
      date: moment(s.sessionDate).format("jYYYY/jMM/jDD"),
      time: `${pad(s.startTime.getHours())}:${pad(s.startTime.getMinutes())}`,
      language: s.language,
      meetLink: s.meetUrl,
    })),
    privateSessions,
  });
}
