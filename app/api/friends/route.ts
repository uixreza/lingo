import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentUserId = parseInt(session.user.id, 10);

  const requests = await prisma.friend.findMany({
    where: { receiverId: currentUserId, status: "Pending" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      sender: {
        select: {
          id: true,
          fullname: true,
          avatarSeed: true,
          IsPro: true,
        },
      },
    },
  });

  return NextResponse.json({
    requests: requests.map((r) => ({
      id: r.id,
      sender: {
        id: r.sender.id,
        fullname: r.sender.fullname,
        avatarSeed: r.sender.avatarSeed,
        isPro: r.sender.IsPro,
      },
    })),
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const senderId = parseInt(session.user.id, 10);
  const body = await req.json().catch(() => null);
  const receiverId = body?.receiverId;

  if (!Number.isInteger(receiverId)) {
    return NextResponse.json({ error: "Invalid receiverId" }, { status: 400 });
  }
  if (receiverId === senderId) {
    return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 });
  }

  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
    select: { id: true },
  });
  if (!receiver) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const existing = await prisma.friend.findFirst({
    where: {
      OR: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    },
  });

  if (existing) {
    if (existing.status === "Accepted") {
      return NextResponse.json({ friendStatus: "friends" });
    }
    return NextResponse.json({
      friendStatus: "pending",
      friendIncoming: existing.receiverId === senderId,
    });
  }

  await prisma.friend.create({
    data: { senderId, receiverId, status: "Pending" },
  });

  return NextResponse.json(
    { friendStatus: "pending", friendIncoming: false },
    { status: 201 },
  );
}

export async function DELETE(req: Request) {
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

  await prisma.friend.deleteMany({
    where: {
      OR: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId },
      ],
    },
  });

  return NextResponse.json({ friendStatus: "none" });
}