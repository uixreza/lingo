import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@/lib/auth";
import { NextResponse } from "next/server";
import {
  serializeReply,
  serializeTicket,
  strToStatus,
} from "@/lib/tickets";

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ticketId = parseInt((await ctx.params).id, 10);
  if (isNaN(ticketId)) {
    return NextResponse.json({ error: "Invalid ticket id" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const status =
    strToStatus[body.status as keyof typeof strToStatus];
  if (!status) {
    return NextResponse.json(
      { error: "وضعیت نامعتبر است" },
      { status: 400 },
    );
  }

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    return NextResponse.json({ error: "تیکت یافت نشد" }, { status: 404 });
  }

  const updated = await prisma.ticket.update({
    where: { id: ticketId },
    data: { status },
    include: {
      user: { select: { fullname: true, email: true } },
      replies: { orderBy: { createdAt: "asc" } },
    },
  });

  return NextResponse.json(serializeTicket(updated));
}

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    return NextResponse.json({ error: "تیکت یافت نشد" }, { status: 404 });
  }

  const [reply] = await prisma.$transaction(async (tx) => {
    const created = await tx.ticketReply.create({
      data: {
        ticketId,
        message: String(message).trim(),
        isAdmin: true,
        userName: session.user.fullname || "پشتیبانی لینگوفم",
      },
    });

    await tx.ticket.update({
      where: { id: ticketId },
      data: { status: ticket.status === "Open" ? "InProgress" : ticket.status },
    });

    await tx.notification.create({
      data: {
        userId: ticket.userId,
        type: "ticket",
        title: "پاسخ جدید به تیکت شما",
        message:
          message.trim().length > 100
            ? `${message.trim().slice(0, 100)}...`
            : message.trim(),
      },
    });

    return [created];
  });

  const updatedTicket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      user: { select: { fullname: true, email: true } },
      replies: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!updatedTicket) {
    return NextResponse.json({ error: "تیکت یافت نشد" }, { status: 404 });
  }

  return NextResponse.json({
    reply: serializeReply(reply),
    ticket: serializeTicket(updatedTicket),
  });
}
