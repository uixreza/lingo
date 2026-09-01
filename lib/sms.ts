import { prisma } from "@/lib/auth";

const MELIPAYAMAK_API_URL =
  "https://console.melipayamak.com/api/send/simple/df369fbf41d746da9e611d9e8e38c7f1";
const MELIPAYAMAK_FROM = "50004001939632";

const OTP_RATE_LIMIT = 5;
const OTP_RATE_WINDOW_MINUTES = 10;

export async function checkOtpRateLimit(phone: string): Promise<boolean> {
  const since = new Date(Date.now() - OTP_RATE_WINDOW_MINUTES * 60 * 1000);
  const count = await prisma.oTP.count({
    where: {
      phone,
      createdAt: { gte: since },
    },
  });
  return count < OTP_RATE_LIMIT;
}

export async function sendOtpSms(
  phone: string,
  code: string,
  purpose: "login" | "signup",
  name: string,
): Promise<void> {
  const label = purpose === "login" ? "ورود" : "ثبت‌نام";
  const message = [
    `👋 سلام ${name} عزیز!`,
    ``,
    `لینگوفام ✨`,
    `کد ${label} شما:`,
    ``,
    `🔑 ${code}`,
    ``,
    `این کد رو با کسی به اشتراک نذار.`,
    `موفق باشی ❤️`,
  ].join("\n");

  const body = JSON.stringify({
    from: MELIPAYAMAK_FROM,
    to: phone,
    text: message,
  });

  const res = await fetch(MELIPAYAMAK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("SMS send failed:", res.status, text);
    throw new Error("Failed to send SMS");
  }
}
