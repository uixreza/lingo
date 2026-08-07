import { prisma } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [marquee, word, phrasalVerb] = await Promise.all([
      prisma.marqueeText.findMany({
        where: { isActive: true },
        orderBy: { id: "asc" },
        select: { text: true },
      }),
      prisma.wordOfDay.findFirst({ orderBy: { updatedAt: "desc" } }),
      prisma.phrasalVerbOfDay.findFirst({ orderBy: { updatedAt: "desc" } }),
    ]);

    return NextResponse.json({
      marquee: marquee.map((m) => m.text),
      word: word
        ? {
            word: word.word,
            partOfSpeech: word.partOfSpeech,
            meaning: word.definition,
            example: word.example,
          }
        : null,
      phrasalVerb: phrasalVerb
        ? {
            word: phrasalVerb.phrasalVerb,
            partOfSpeech: "phrasal verb",
            meaning: phrasalVerb.definition,
            example: phrasalVerb.example,
          }
        : null,
    });
  } catch (err) {
    console.error("Error fetching daily content:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}