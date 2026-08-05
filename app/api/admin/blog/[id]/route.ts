import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const sess = await getServerSession(authOptions);
  if (!sess?.user?.id || sess.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const postId = parseInt(id, 10);
  if (!Number.isInteger(postId)) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  try {
    await prisma.post.delete({ where: { id: postId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "پست یافت نشد" }, { status: 404 });
  }
}