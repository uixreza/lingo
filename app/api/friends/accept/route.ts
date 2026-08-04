import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentUserId = parseInt(session.user.id, 10);
  const body = await req.json().catch(() => null);
  const userId = body?.userId;

  if (!Number.isInteger(userId)) {
    return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
  }

  const friend = await prisma.friend.findFirst({
    where: {
      senderId: userId,
      receiverId: currentUserId,
      status: "Pending",
    },
  });

  if (!friend) {
    return NextResponse.json(
      { error: "No pending request from this user" },
      { status: 404 },
    );
  }

  await prisma.friend.update({
    where: { id: friend.id },
    data: { status: "Accepted" },
  });

  return NextResponse.json({ friendStatus: "friends" });
}