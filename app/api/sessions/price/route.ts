import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const sessionPrice = await prisma.sessionPrice.findFirst();
  console.log(sessionPrice?.privatePrice)
  if (!sessionPrice) {
    return NextResponse.json({ privatePrice: 350000 });
  }
  return NextResponse.json({
    privatePrice: Number(sessionPrice.privatePrice),
  });
}

export async function PUT(request: Request) {
  const sess = await getServerSession(authOptions);
  if (!sess?.user?.id || sess.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { privatePrice?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const price =
    typeof body.privatePrice === "number" &&
    Number.isFinite(body.privatePrice) &&
    body.privatePrice >= 0
      ? Math.round(body.privatePrice)
      : undefined;

  if (price === undefined) {
    return NextResponse.json(
      { error: "privatePrice must be a non-negative number" },
      { status: 400 },
    );
  }

  const existing = await prisma.sessionPrice.findFirst();
  const sessionPrice = existing
    ? await prisma.sessionPrice.update({
        where: { id: existing.id },
        data: { privatePrice: BigInt(price) },
      })
    : await prisma.sessionPrice.create({ data: { privatePrice: BigInt(price) } });

  return NextResponse.json({ privatePrice: Number(sessionPrice.privatePrice) });
}
