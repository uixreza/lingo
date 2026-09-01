import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const MELIPAYAMAK_API_URL =
  "https://console.melipayamak.com/api/receive/messages/df369fbf41d746da9e611d9e8e38c7f1";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type = "all", index = 0, count = 100 } = await req.json();

    const res = await fetch(MELIPAYAMAK_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, number: "50004001939632", index, count }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Melipayamak messages API error:", res.status, text);
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 502 },
      );
    }

    const data = await res.json();
    console.log("Melipayamak messages response:", JSON.stringify(data, null, 2));
    return NextResponse.json(data);
  } catch (error) {
    console.error("SMS messages fetch error:", error);
    return NextResponse.json(
      { error: "خطای داخلی سرور" },
      { status: 500 },
    );
  }
}
