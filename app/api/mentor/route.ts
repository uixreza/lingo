import { prisma } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const mentor = await prisma.mentor.findFirst({
    orderBy: { id: "asc" },
  });

  if (!mentor) {
    return NextResponse.json({ mentor: null });
  }

  return NextResponse.json({
    mentor: {
      id: mentor.id,
      name: mentor.name,
      title: mentor.title,
      photoUrl: mentor.photoUrl,
      bio: mentor.bio,
      certifications: mentor.certifications ?? [],
      languages: mentor.languages ?? [],
      experience: mentor.experience,
      education: mentor.education,
    },
  });
}