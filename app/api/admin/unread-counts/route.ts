import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const sess = await getServerSession(authOptions);
  if (!sess?.user?.id || sess.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [sessions, tickets] = await Promise.all([
    prisma.session.count({ where: { status: "Pending" } }),
    prisma.ticket.count({ where: { status: "Open" } }),
  ]);

  return NextResponse.json({ sessions, tickets });
}
