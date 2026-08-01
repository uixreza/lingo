import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@/lib/auth";
import { NextResponse } from "next/server";
import { serializeTicket } from "@/lib/tickets";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tickets = await prisma.ticket.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      user: { select: { fullname: true, email: true } },
      replies: { orderBy: { createdAt: "asc" } },
    },
  });

  return NextResponse.json(tickets.map(serializeTicket));
}
