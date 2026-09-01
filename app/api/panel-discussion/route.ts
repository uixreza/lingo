import { NextResponse } from "next/server";
import { prisma } from "@/lib/auth";

export async function GET() {
  const record = await prisma.panelDiscussion.findFirst();

  return NextResponse.json({
    topic: record?.topic ?? null,
    link: record?.link ?? null,
  });
}
