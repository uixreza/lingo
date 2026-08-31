import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const sess = await getServerSession(authOptions);
  if (!sess?.user?.id || sess.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [words, phrasalVerbs] = await Promise.all([
    prisma.wordOfDay.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.phrasalVerbOfDay.findMany({ orderBy: { updatedAt: "desc" } }),
  ]);

  return NextResponse.json({ words, phrasalVerbs });
}

export async function POST(request: Request) {
  const sess = await getServerSession(authOptions);
  if (!sess?.user?.id || sess.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { kind, id } = body;

    if (kind === "word") {
      const word = typeof body.word === "string" ? body.word.trim() : "";
      const definition =
        typeof body.definition === "string" ? body.definition.trim() : "";
      const example =
        typeof body.example === "string" ? body.example.trim() : "";

      if (!word || !definition || !example) {
        return NextResponse.json(
          { error: "همه فیلدهای کلمه الزامی است" },
          { status: 400 },
        );
      }

      let wordId = parseInt(id, 10);
      if (isNaN(wordId)) {
        const latest = await prisma.wordOfDay.findFirst({
          orderBy: { updatedAt: "desc" },
          select: { id: true },
        });
        wordId = latest?.id ?? NaN;
      }

      if (!isNaN(wordId)) {
        const updated = await prisma.wordOfDay.update({
          where: { id: wordId },
          data: {
            word,
            definition,
            example,
            partOfSpeech:
              typeof body.partOfSpeech === "string"
                ? body.partOfSpeech.trim() || null
                : null,
          },
        });
        return NextResponse.json(updated);
      }

      const created = await prisma.wordOfDay.create({
        data: {
          word,
          definition,
          example,
          partOfSpeech:
            typeof body.partOfSpeech === "string"
              ? body.partOfSpeech.trim() || null
              : null,
        },
      });
      return NextResponse.json(created, { status: 201 });
    }

    if (kind === "phrasalVerb") {
      const phrasalVerb =
        typeof body.phrasalVerb === "string" ? body.phrasalVerb.trim() : "";
      const definition =
        typeof body.definition === "string" ? body.definition.trim() : "";
      const example =
        typeof body.example === "string" ? body.example.trim() : "";

      if (!phrasalVerb || !definition || !example) {
        return NextResponse.json(
          { error: "همه فیلدهای عبارت الزامی است" },
          { status: 400 },
        );
      }

      let phraseId = parseInt(id, 10);
      if (isNaN(phraseId)) {
        const latest = await prisma.phrasalVerbOfDay.findFirst({
          orderBy: { updatedAt: "desc" },
          select: { id: true },
        });
        phraseId = latest?.id ?? NaN;
      }

      if (!isNaN(phraseId)) {
        const updated = await prisma.phrasalVerbOfDay.update({
          where: { id: phraseId },
          data: { phrasalVerb, definition, example },
        });
        return NextResponse.json(updated);
      }

      const created = await prisma.phrasalVerbOfDay.create({
        data: { phrasalVerb, definition, example },
      });
      return NextResponse.json(created, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  } catch (err) {
    console.error("Error saving weekly content:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const sess = await getServerSession(authOptions);
  if (!sess?.user?.id || sess.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { kind, id } = body;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    if (kind === "word") {
      await prisma.wordOfDay.delete({ where: { id: parsedId } });
    } else if (kind === "phrasalVerb") {
      await prisma.phrasalVerbOfDay.delete({ where: { id: parsedId } });
    } else {
      return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting weekly content:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
