import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const sess = await getServerSession(authOptions);
  if (!sess?.user?.id || sess.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mentor = await prisma.mentor.findFirst({ orderBy: { id: "asc" } });
  return NextResponse.json({
    mentor: mentor
      ? {
          ...mentor,
          certifications: mentor.certifications ?? [],
          languages: mentor.languages ?? [],
        }
      : null,
  });
}

export async function PUT(request: Request) {
  const sess = await getServerSession(authOptions);
  if (!sess?.user?.id || sess.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const str = (v: unknown, max: number) =>
    typeof v === "string" ? v.trim().slice(0, max) || null : undefined;
  const certs = Array.isArray(body.certifications)
    ? body.certifications
        .filter((c): c is string => typeof c === "string" && !!c.trim())
        .map((c) => c.trim().slice(0, 50))
        .slice(0, 10)
    : undefined;

  const allowedLangs = new Set(["English", "German", "Turkish"]);
  const languages = Array.isArray(body.languages)
    ? body.languages
        .filter(
          (l): l is string =>
            typeof l === "string" && allowedLangs.has(l.trim()),
        )
        .map((l) => l.trim())
        .slice(0, 3)
    : undefined;

  const data: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) {
    data.name = body.name.trim().slice(0, 100);
  }
  const title = str(body.title, 200);
  if (title !== undefined) data.title = title;
  const photoUrl =
    typeof body.photoUrl === "string"
      ? str(body.photoUrl, 500)
      : body.photoUrl === null
        ? null
        : undefined;
  if (photoUrl !== undefined) data.photoUrl = photoUrl;
  const bio = str(body.bio, 2000);
  if (bio !== undefined) data.bio = bio;
  if (certs !== undefined) data.certifications = certs;
  if (languages !== undefined) data.languages = languages;
  const experience = str(body.experience, 500);
  if (experience !== undefined) data.experience = experience;
  const education = str(body.education, 500);
  if (education !== undefined) data.education = education;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const existing = await prisma.mentor.findFirst({ orderBy: { id: "asc" } });

  try {
    const mentor = existing
      ? await prisma.mentor.update({ where: { id: existing.id }, data })
      : await prisma.mentor.create({
          data: { name: (data.name as string) ?? "مدرس", ...data },
        });

    return NextResponse.json({ mentor });
  } catch (err) {
    console.error("mentor PUT error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}