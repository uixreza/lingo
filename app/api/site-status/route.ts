import { prisma } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const status = await prisma.siteStatus.findUnique({ where: { id: 1 } });
    return NextResponse.json({
      shutdown: status?.shutdown ?? false,
      updating: status?.updating ?? false,
    });
  } catch {
    return NextResponse.json({ shutdown: false, updating: false });
  }
}
