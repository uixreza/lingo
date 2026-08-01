import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@/lib/auth";
import { NextResponse } from "next/server";
import {
  serializeTicket,
  strToCategory,
  strToPriority,
} from "@/lib/tickets";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt(session.user.id, 10);

  const tickets = await prisma.ticket.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      user: { select: { fullname: true, email: true } },
      replies: { orderBy: { createdAt: "asc" } },
    },
  });

  return NextResponse.json(tickets.map(serializeTicket));
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt(session.user.id, 10);
  const body = await request.json().catch(() => ({}));
  const { title, message, category, priority } = body;

  if (!title?.trim() || !message?.trim()) {
    return NextResponse.json(
      { error: "عنوان و توضیحات تیکت الزامی است" },
      { status: 400 },
    );
  }

  const categoryVal =
    strToCategory[category as keyof typeof strToCategory] ?? "General";
  const priorityVal =
    strToPriority[priority as keyof typeof strToPriority] ?? "Medium";

  const ticket = await prisma.ticket.create({
    data: {
      userId,
      title: String(title).trim(),
      message: String(message).trim(),
      category: categoryVal,
      priority: priorityVal,
      status: "Open",
    },
    include: {
      user: { select: { fullname: true, email: true } },
      replies: { orderBy: { createdAt: "asc" } },
    },
  });

  return NextResponse.json(serializeTicket(ticket), { status: 201 });
}
