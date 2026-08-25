import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const record = await prisma.panelDiscussion.findFirst();
  return NextResponse.json({
    topic: record?.topic ?? null,
    link: record?.link ?? null,
  });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { topic, link } = body as { topic?: string; link?: string };

  const record = await prisma.panelDiscussion.findFirst();

  if (record) {
    await prisma.panelDiscussion.update({
      where: { id: record.id },
      data: {
        ...(topic !== undefined && { topic: topic || null }),
        ...(link !== undefined && { link: link || null }),
      },
    });
  } else {
    await prisma.panelDiscussion.create({
      data: {
        topic: topic ?? null,
        link: link ?? null,
      },
    });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const record = await prisma.panelDiscussion.findFirst();
  if (record) {
    await prisma.panelDiscussion.delete({ where: { id: record.id } });
  }

  return NextResponse.json({ ok: true });
}
