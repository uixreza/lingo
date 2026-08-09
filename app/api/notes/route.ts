import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt(session.user.id, 10);

  const notes = await prisma.notebookNote.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { localId: true, text: true, updatedAt: true },
  });

  return NextResponse.json({ notes });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt(session.user.id, 10);

  let body: { localId?: string; text?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const localId = typeof body.localId === "string" ? body.localId.trim() : "";
  const text = typeof body.text === "string" ? body.text : "";

  if (!localId || localId.length > 64) {
    return NextResponse.json({ error: "Invalid localId" }, { status: 400 });
  }
  if (!text.trim()) {
    return NextResponse.json({ error: "Empty note" }, { status: 400 });
  }

  const note = await prisma.notebookNote.upsert({
    where: { userId_localId: { userId, localId } },
    create: { userId, localId, text },
    update: { text },
    select: { localId: true, text: true, updatedAt: true },
  });

  return NextResponse.json({ note }, { status: 200 });
}