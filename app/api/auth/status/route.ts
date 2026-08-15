import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions, prisma } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const phone = (url.searchParams.get("phone") ?? "").trim();
  if (phone) {
    if (!/^09\d{9}$/.test(phone)) {
      return NextResponse.json({ banned: false }, { status: 200 });
    }
    const user = await prisma.user.findUnique({
      where: { phone },
      select: { isActive: true },
    });
    return NextResponse.json({ banned: user ? !user.isActive : false });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ banned: false }, { status: 200 });
  }
  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id, 10) },
    select: { isActive: true },
  });
  return NextResponse.json({ banned: user ? !user.isActive : false });
}