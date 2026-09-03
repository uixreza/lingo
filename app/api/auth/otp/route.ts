import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/auth";
import { sendOtpSms, checkOtpRateLimit } from "@/lib/sms";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || !/^09\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "شماره موبایل نامعتبر است" },
        { status: 400 },
      );
    }

    const allowed = await checkOtpRateLimit(phone);
    if (!allowed) {
      return NextResponse.json(
        { error: "درخواست‌های شما بیش از حد مجاز است؛ لطفاً چند دقیقه صبر کنید" },
        { status: 429 },
      );
    }

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return NextResponse.json(
        { error: "کاربری با این شماره یافت نشد" },
        { status: 404 },
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        {
          error:
            "حساب شما مسدود شده است؛ برای اطلاعات بیشتر با تیم پشتیبانی تماس بگیرید",
        },
        { status: 403 },
      );
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.oTP.create({
      data: { phone, code, expiresAt },
    });

    await sendOtpSms(phone, code, user.fullname);

    return NextResponse.json(
      { message: "کد تأیید ارسال شد", expiresIn: 300 },
      { status: 200 },
    );
  } catch (error) {
    console.error("OTP error:", error);
    const message =
      error instanceof Error && error.message.includes("SMS")
        ? "ارسال پیامک با خطا مواجه شد؛ لطفاً دوباره تلاش کنید"
        : "خطای داخلی سرور";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
