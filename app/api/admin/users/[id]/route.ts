import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@/lib/auth";
import { NextResponse } from "next/server";

const FLUENCY_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
const ROLES = ["Admin", "Teacher", "Client"] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const sess = await getServerSession(authOptions);
  if (!sess?.user?.id || sess.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = parseInt(id, 10);
  if (isNaN(userId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};

  if (body.fullname !== undefined) {
    const fullname = typeof body.fullname === "string" ? body.fullname.trim() : "";
    if (!fullname) {
      return NextResponse.json({ error: "نام و نام خانوادگی الزامی است" }, { status: 400 });
    }
    data.fullname = fullname;
  }

  if (body.phone !== undefined) {
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    if (!/^09\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "شماره موبایل معتبر نیست" },
        { status: 400 },
      );
    }
    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing && existing.id !== userId) {
      return NextResponse.json(
        { error: "این شماره موبایل قبلاً ثبت شده است" },
        { status: 400 },
      );
    }
    data.phone = phone;
  }

  if (body.email !== undefined) {
    const email = typeof body.email === "string" ? body.email.trim() : "";
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== userId) {
        return NextResponse.json(
          { error: "این ایمیل قبلاً ثبت شده است" },
          { status: 400 },
        );
      }
      data.email = email;
    } else {
      data.email = null;
    }
  }

  if (body.fluencyLevel !== undefined) {
    const level = body.fluencyLevel as string;
    if (!FLUENCY_LEVELS.includes(level as (typeof FLUENCY_LEVELS)[number])) {
      return NextResponse.json({ error: "سطح زبان معتبر نیست" }, { status: 400 });
    }
    data.fluencyLevel = level;
  }

  if (body.role !== undefined) {
    const role = body.role as string;
    if (!ROLES.includes(role as (typeof ROLES)[number])) {
      return NextResponse.json({ error: "نقش معتبر نیست" }, { status: 400 });
    }
    data.role = role;
  }

  if (body.isActive !== undefined) {
    data.isActive = Boolean(body.isActive);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "فیلدی برای ویرایش ارسال نشده است" }, { status: 400 });
  }

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        fullname: true,
        phone: true,
        email: true,
        avatarSeed: true,
        IsPro: true,
        fluencyLevel: true,
        isVerified: true,
        isActive: true,
        progress: true,
        role: true,
        badges: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      ...updated,
      isPro: updated.IsPro,
    });
  } catch (err) {
    console.error("Error updating user:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const sess = await getServerSession(authOptions);
  if (!sess?.user?.id || sess.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = parseInt(id, 10);
  if (isNaN(userId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  if (parseInt(sess.user.id, 10) === userId) {
    return NextResponse.json(
      { error: "امکان حذف حساب خودتان وجود ندارد" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });
  }

  try {
    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting user:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}