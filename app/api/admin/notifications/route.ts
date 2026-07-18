import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const sess = await getServerSession(authOptions);
  if (!sess?.user?.id || sess.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: {
      id: true,
      fullname: true,
      email: true,
    },
    orderBy: { fullname: "asc" },
  });

  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const sess = await getServerSession(authOptions);
  if (!sess?.user?.id || sess.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, type, title, message } = body;

    if (!type || !title || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (userId === "all") {
      const users = await prisma.user.findMany({
        where: { isActive: true },
        select: { id: true },
      });

      if (users.length === 0) {
        return NextResponse.json({ error: "No active users found" }, { status: 400 });
      }

      await prisma.notification.createMany({
        data: users.map((u) => ({
          userId: u.id,
          type,
          title,
          message,
        })),
      });

      return NextResponse.json({ sent: users.length });
    }

    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    await prisma.notification.create({
      data: {
        userId: parsedUserId,
        type,
        title,
        message,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error creating notification:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
