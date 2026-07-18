import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt(session.user.id, 10);

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const mapped = notifications.map((n) => ({
    id: String(n.id),
    type: n.type,
    title: n.title,
    message: n.message,
    time: n.createdAt.toISOString(),
    read: n.read,
  }));

  return NextResponse.json(mapped);
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt(session.user.id, 10);
  const body = await request.json().catch(() => ({}));
  const { id } = body;

  if (id) {
    await prisma.notification.updateMany({
      where: { id: parseInt(id, 10), userId },
      data: { read: true },
    });
  } else {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt(session.user.id, 10);
  const body = await request.json().catch(() => ({}));
  const { id, clearRead } = body;

  if (clearRead) {
    await prisma.notification.deleteMany({
      where: { userId, read: true },
    });
  } else if (id) {
    await prisma.notification.deleteMany({
      where: { id: parseInt(id, 10), userId },
    });
  }

  return NextResponse.json({ success: true });
}
