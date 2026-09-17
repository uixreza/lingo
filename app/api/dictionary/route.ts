import { NextResponse } from "next/server";

const POS_MAP: Record<string, string> = {
  n: "noun",
  v: "verb",
  adj: "adjective",
  adv: "adverb",
  u: "unknown",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get("word");
  if (!word) {
    return NextResponse.json({ error: "Missing word parameter" }, { status: 400 });
  }

  try {
    const [defRes, synRes, antRes] = await Promise.all([
      fetch(`https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&md=d&max=1`),
      fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&max=8`),
      fetch(`https://api.datamuse.com/words?rel_ant=${encodeURIComponent(word)}&max=8`),
    ]);

    const defs = defRes.ok ? await defRes.json() : [];
    const syns = synRes.ok ? await synRes.json() : [];
    const ants = antRes.ok ? await antRes.json() : [];

    if (!defs.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const grouped: Record<string, string[]> = {};
    for (const d of defs[0].defs || []) {
      const sep = d.indexOf("\t");
      const rawPos = d.substring(0, sep).trim();
      const definition = d.substring(sep + 1).trim();
      const pos = POS_MAP[rawPos] || rawPos;
      if (!grouped[pos]) grouped[pos] = [];
      grouped[pos].push(definition);
    }

    const meanings = Object.entries(grouped).map(([partOfSpeech, definitions]) => ({
      partOfSpeech,
      definitions,
    }));

    return NextResponse.json([
      {
        word: defs[0].word,
        phonetic: null,
        meanings,
        synonyms: syns.map((s: { word: string }) => s.word),
        antonyms: ants.map((a: { word: string }) => a.word),
        sourceUrls: ["https://www.datamuse.com"],
      },
    ]);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 502 });
  }
}
