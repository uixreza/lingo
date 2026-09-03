import { prisma } from "@/lib/auth";

const MELIPAYAMAK_API_URL =
  "https://console.melipayamak.com/api/send/shared/df369fbf41d746da9e611d9e8e38c7f1";

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
  name: string,
): Promise<void> {
  const body = JSON.stringify({
    bodyId: 529309,
    to: phone,
    args: [name, code],
  });

  const res = await fetch(MELIPAYAMAK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.recId) {
    console.error("SMS send failed:", res.status, json);
    throw new Error(json?.status || "Failed to send SMS");
  }
}
