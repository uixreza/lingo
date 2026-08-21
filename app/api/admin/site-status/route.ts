import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@/lib/auth";
import { NextResponse } from "next/server";

async function getOrCreate() {
  const existing = await prisma.siteStatus.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return prisma.siteStatus.create({ data: { id: 1 } });
}

export async function GET() {
  const sess = await getServerSession(authOptions);
  if (!sess?.user?.id || sess.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = await getOrCreate();
  return NextResponse.json({
    shutdown: status.shutdown,
    updating: status.updating,
  });
}

export async function PUT(request: Request) {
  const sess = await getServerSession(authOptions);
  if (!sess?.user?.id || sess.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const shutdown = body.shutdown === true;
  const updating = body.updating === true;

  if (shutdown && updating) {
    return NextResponse.json(
      { error: "امکان فعال‌سازی هر دو حالت همزمان وجود ندارد" },
      { status: 400 },
    );
  }

  const status = await getOrCreate();
  const updated = await prisma.siteStatus.update({
    where: { id: status.id },
    data: { shutdown, updating },
  });

  return NextResponse.json({
    shutdown: updated.shutdown,
    updating: updated.updating,
  });
}
