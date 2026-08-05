import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { saveImage } from "@/lib/storage";

export async function POST(request: Request) {
  const sess = await getServerSession(authOptions);
  if (!sess?.user?.id || sess.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let file: File | null = null;
  try {
    const form = await request.formData();
    const value = form.get("file");
    file = value instanceof File ? value : null;
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ error: "فایلی ارسال نشده است" }, { status: 400 });
  }

  try {
    const url = await saveImage(file);
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطا در آپلود";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}