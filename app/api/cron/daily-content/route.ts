import { NextResponse } from "next/server";
import { prisma } from "@/lib/auth";
import { DAILY_WORDS, DAILY_PHRASAL_VERBS } from "@/lib/daily-content-bank";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DICTIONARY_API = "https://api.dictionaryapi.dev/api/v2/entries/en/";

type DictEntry = {
  word?: string;
  partOfSpeech?: string;
  meanings?: Array<{
    partOfSpeech?: string;
    definitions?: Array<{
      definition?: string;
      example?: string;
    }>;
  }>;
};

function todayIndex() {
  return Math.floor(Date.now() / 86_400_000);
}

function isAuthorized(request: Request) {
  if (request.headers.get("x-vercel-cron") === "1") return true;
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && auth === `Bearer ${secret}`);
}

async function fetchDict(word: string) {
  const res = await fetch(`${DICTIONARY_API}${encodeURIComponent(word)}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`dictionaryapi.dev responded ${res.status}`);
  const data = (await res.json()) as DictEntry[];
  const entry = data?.[0];
  if (!entry) throw new Error("empty dictionary response");

  let partOfSpeech: string | null = null;
  let definition = "";
  let example = "";

  for (const meaning of entry.meanings ?? []) {
    for (const def of meaning.definitions ?? []) {
      const d = def.definition?.trim() ?? "";
      if (!d) continue;
      partOfSpeech = meaning.partOfSpeech ?? null;
      definition = d;
      example = def.example?.trim() ?? "";
      if (example) return { partOfSpeech, definition, example };
    }
  }

  if (definition) return { partOfSpeech, definition, example };
  throw new Error("no usable definition found");
}

async function saveWordOfDay(word: string) {
  const content = await fetchDict(word);
  return prisma.wordOfDay.create({
    data: {
      word,
      definition: content.definition,
      example: content.example || `The word "${word}" appeared in today's lesson.`,
      partOfSpeech: content.partOfSpeech,
    },
  });
}

async function savePhraseOfDay(fallback: {
  phrase: string;
  definition: string;
  example: string;
}) {
  try {
    const content = await fetchDict(fallback.phrase);
    return prisma.phrasalVerbOfDay.create({
      data: {
        phrasalVerb: fallback.phrase,
        definition: content.definition,
        example: content.example,
      },
    });
  } catch {
    return prisma.phrasalVerbOfDay.create({
      data: {
        phrasalVerb: fallback.phrase,
        definition: fallback.definition,
        example: fallback.example,
      },
    });
  }
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);

  const [latestWord, latestPhrase] = await Promise.all([
    prisma.wordOfDay.findFirst({ orderBy: { updatedAt: "desc" } }),
    prisma.phrasalVerbOfDay.findFirst({ orderBy: { updatedAt: "desc" } }),
  ]);

  const wordAlreadyToday = latestWord && latestWord.updatedAt >= startOfToday;
  const phraseAlreadyToday =
    latestPhrase && latestPhrase.updatedAt >= startOfToday;

  let createdWord = null;
  let createdPhrase = null;
  const skipWord = Boolean(wordAlreadyToday);
  const skipPhrase = Boolean(phraseAlreadyToday);

  if (!skipWord) {
    let index = todayIndex() % DAILY_WORDS.length;
    if (
      latestWord &&
      latestWord.word.toLowerCase() === DAILY_WORDS[index].toLowerCase()
    ) {
      index = (index + 1) % DAILY_WORDS.length;
    }
    try {
      createdWord = await saveWordOfDay(DAILY_WORDS[index]);
    } catch (err) {
      console.error(`[cron] word failed for "${DAILY_WORDS[index]}":`, err);
    }
  }

  if (!skipPhrase) {
    let index = todayIndex() % DAILY_PHRASAL_VERBS.length;
    if (
      latestPhrase &&
      latestPhrase.phrasalVerb.toLowerCase() ===
        DAILY_PHRASAL_VERBS[index].phrase.toLowerCase()
    ) {
      index = (index + 1) % DAILY_PHRASAL_VERBS.length;
    }
    try {
      createdPhrase = await savePhraseOfDay(DAILY_PHRASAL_VERBS[index]);
    } catch (err) {
      console.error(
        `[cron] phrasal verb failed for "${DAILY_PHRASAL_VERBS[index].phrase}":`,
        err,
      );
    }
  }

  return NextResponse.json({
    ok: true,
    skippedWord: skipWord,
    skippedPhrase: skipPhrase,
    word: createdWord ? { id: createdWord.id, word: createdWord.word } : null,
    phrase: createdPhrase
      ? { id: createdPhrase.id, phrasalVerb: createdPhrase.phrasalVerb }
      : null,
  });
}