import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/auth";
import { FluencyLevel } from "@/app/generated/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { fullname, password, phone, otp } = await req.json();

    if (!fullname || !password || !phone) {
      return NextResponse.json(
        { error: "همه فیلدها الزامی هستند" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "رمز عبور باید حداقل ۸ کاراکتر باشد" },
        { status: 400 }
      );
    }

    if (!/^09\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "شماره موبایل نامعتبر است" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      return NextResponse.json(
        { error: "این شماره موبایل قبلاً ثبت شده است" },
        { status: 409 }
      );
    }

    if (otp) {
      const otpRecord = await prisma.oTP.findFirst({
        where: {
          phone,
          code: otp,
          isUsed: false,
          expiresAt: { gte: new Date() },
        },
      });

      if (!otpRecord) {
        return NextResponse.json(
          { error: "کد تأیید نامعتبر یا منقضی شده است" },
          { status: 400 }
        );
      }

      await prisma.oTP.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });

      const passwordHash = await bcrypt.hash(password, 12);

      const user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            fullname,
            phone,
            email: null,
            dateOfBirth: null,
            fluencyLevel: FluencyLevel.A1,
            passwordHash,
          },
        });

        const wallet = await tx.wallet.create({
          data: { userId: newUser.id, balance: 150000, lastCharge: 0 },
        });

        await tx.transaction.create({
          data: {
            userId: newUser.id,
            walletId: wallet.id,
            amount: 150000,
            balanceBefore: 0,
            balanceAfter: 150000,
            description: "هدیه خوش‌آمدگویی ثبت‌نام",
            paymentMethod: "Gift",
            status: "completed",
            completedAt: new Date(),
          },
        });

        return newUser;
      });

      return NextResponse.json(
        {
          message: "ثبت‌نام با موفقیت انجام شد",
          user: {
            id: user.id,
            fullname: user.fullname,
            phone: user.phone,
            createdAt: user.createdAt,
          },
        },
        { status: 201 }
      );
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.oTP.create({
      data: { phone, code, expiresAt },
    });

    console.log(`OTP for ${phone}: ${code}`);

    return NextResponse.json(
      { message: "کد تأیید ارسال شد", expiresIn: 300, code },
      { status: 200 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "خطای داخلی سرور" },
      { status: 500 }
    );
  }
}
