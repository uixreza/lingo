import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const MELIPAYAMAK_API_URL =
  "https://console.melipayamak.com/api/receive/credit/df369fbf41d746da9e611d9e8e38c7f1";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(MELIPAYAMAK_API_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Melipayamak credit API error:", res.status, text);
      return NextResponse.json(
        { error: "Failed to fetch credit" },
        { status: 502 },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("SMS credit fetch error:", error);
    return NextResponse.json(
      { error: "خطای داخلی سرور" },
      { status: 500 },
    );
  }
}
