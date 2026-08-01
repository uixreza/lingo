import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@/lib/auth";
import { NextResponse } from "next/server";
import { serializeReply, serializeTicket } from "@/lib/tickets";

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt(session.user.id, 10);
  const ticketId = parseInt((await ctx.params).id, 10);
  if (isNaN(ticketId)) {
    return NextResponse.json({ error: "Invalid ticket id" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const { message } = body;
  if (!message?.trim()) {
    return NextResponse.json(
      { error: "متن پاسخ الزامی است" },
      { status: 400 },
    );
  }

  const ticket = await prisma.ticket.findFirst({
    where: { id: ticketId, userId },
  });
  if (!ticket) {
    return NextResponse.json({ error: "تیکت یافت نشد" }, { status: 404 });
  }
  if (ticket.status === "Resolved" || ticket.status === "Closed") {
    return NextResponse.json(
      { error: "این تیکت بسته شده است و امکان ارسال پاسخ وجود ندارد" },
      { status: 400 },
    );
  }

  const reply = await prisma.ticketReply.create({
    data: {
      ticketId,
      message: String(message).trim(),
      isAdmin: false,
      userName: session.user.fullname || "کاربر لینگوفم",
    },
  });

  const updatedTicket = await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: ticket.status },
    include: {
      user: { select: { fullname: true, email: true } },
      replies: { orderBy: { createdAt: "asc" } },
    },
  });

  return NextResponse.json({
    reply: serializeReply(reply),
    ticket: serializeTicket(updatedTicket),
  });
}
