import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const sessionPrice = await prisma.sessionPrice.findFirst();
  return NextResponse.json({
    privatePrice: Number(sessionPrice?.privatePrice ?? 350000),
    discountPercent: Number(sessionPrice?.discountPercent ?? 0),
    inClassExtra: Number(sessionPrice?.inClassExtra ?? 100),
  });
}

export async function PUT(request: Request) {
  const sess = await getServerSession(authOptions);
  if (!sess?.user?.id || sess.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    privatePrice?: unknown;
    discountPercent?: unknown;
    inClassExtra?: unknown;
  };
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

  const discount =
    typeof body.discountPercent === "number" &&
    Number.isFinite(body.discountPercent) &&
    body.discountPercent >= 0 &&
    body.discountPercent <= 100
      ? Math.round(body.discountPercent)
      : undefined;

  if (price === undefined) {
    return NextResponse.json(
      { error: "privatePrice must be a non-negative number" },
      { status: 400 },
    );
  }

  const inClassExtra =
    typeof body.inClassExtra === "number" &&
    Number.isFinite(body.inClassExtra) &&
    body.inClassExtra >= 0
      ? Math.round(body.inClassExtra)
      : undefined;

  const existing = await prisma.sessionPrice.findFirst();
  const sessionPrice = existing
    ? await prisma.sessionPrice.update({
        where: { id: existing.id },
        data: {
          privatePrice: BigInt(price),
          ...(discount !== undefined ? { discountPercent: discount } : {}),
          ...(inClassExtra !== undefined ? { inClassExtra } : {}),
        },
      })
    : await prisma.sessionPrice.create({
        data: {
          privatePrice: BigInt(price),
          discountPercent: discount ?? 0,
          inClassExtra: inClassExtra ?? 100,
        },
      });

  return NextResponse.json({
    privatePrice: Number(sessionPrice.privatePrice),
    discountPercent: Number(sessionPrice.discountPercent),
    inClassExtra: Number(sessionPrice.inClassExtra),
  });
}