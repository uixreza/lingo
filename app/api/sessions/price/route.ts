import { prisma } from "@/lib/auth";
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
