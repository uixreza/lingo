"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BookOpen,
  ChevronLeft,
  CheckCircle2,
  Clock,
  Info,
  Lightbulb,
  MessagesSquare,
  Sigma,
  Sparkles,
  Volume2,
} from "lucide-react";
import { AuthorAvatar } from "./AuthorAvatar";
import { toPersianDigits } from "./utils";
import type { PostCard, PostDetail } from "@/lib/blog";

export type Tone = "emerald" | "sky" | "slate";

export type FormulaNode = { text: string; tone: Tone };

export type LearningExample = {
  en: string;
  fa: string;
  analysis: string;
  highlight: string[];
};

export type LearningPreset = {
  nodes: FormulaNode[];
  legend: { label: string; tone: Tone }[];
  examples: LearningExample[];
  wrong: string;
  right: string;
  pitfallNote: string;
  takeaways: string[];
};

const PRESENT_PERFECT: LearningPreset = {
  nodes: [
    { text: "Subject", tone: "sky" },
    { text: "have / has", tone: "emerald" },
    { text: "V3 (Past Participle)", tone: "sky" },
    { text: "Object / Time marker", tone: "slate" },
  ],
  legend: [
    { label: "فاعل (Subject)", tone: "sky" },
    { label: "فعل کمکی: have / has", tone: "emerald" },
    { label: "فعل سوم: V3", tone: "sky" },
    { label: "مفعول و نشانه‌های زمان", tone: "slate" },
  ],
  examples: [
    {
      en: "I have finished my homework.",
      fa: "من تکالیفم را تمام کرده‌ام.",
      analysis:
        "have + finished (V3) → نتیجه‌ی کار در زمان حال مهم است، نه لحظه‌ی انجام آن.",
      highlight: ["have finished"],
    },
    {
      en: "She has lived in Tehran since 2015.",
      fa: "او از سال ۲۰۱۵ در تهران زندگی می‌کند.",
      analysis:
        "has + lived → وضعیتی که از گذشته تا امروز ادامه دارد؛ since برای نقطه‌ی شروع به کار می‌رود.",
      highlight: ["has lived", "since 2015"],
    },
    {
      en: "They haven't seen the movie yet.",
      fa: "آن‌ها هنوز فیلم را ندیده‌اند.",
      analysis:
        "منفی: have/has + not + V3؛ واژه‌ی yet معمولاً در جمله‌های منفی یا پرسشی می‌آید.",
      highlight: ["haven't seen"],
    },
  ],
  wrong: "She has went to school.",
  right: "She has gone to school.",
  pitfallNote:
    "بعد از has باید از فرم سوم فعل (V3) استفاده کنیم؛ واژه‌ی went فرم گذشته‌ی ساده است و اینجا غلط می‌شود.",
  takeaways: [
    "برای he / she / it از has و برای I / you / we / they از have استفاده می‌شود.",
    "بعد از فعل کمکی همیشه فرم سوم فعل (V3) می‌آید، نه فرم گذشته.",
    "since برای نقطه‌ی شروع و for برای مدت زمان به کار می‌رود.",
  ],
};

const PRESENT_SIMPLE: LearningPreset = {
  nodes: [
    { text: "Subject", tone: "sky" },
    { text: "do / does", tone: "emerald" },
    { text: "Verb (V1)", tone: "sky" },
    { text: "Complement", tone: "slate" },
  ],
  legend: [
    { label: "فاعل (Subject)", tone: "sky" },
    { label: "فعل کمکی: do / does در پرسش و منفی", tone: "emerald" },
    { label: "فعل اصلی با s / es برای سوم شخص مفرد", tone: "sky" },
    { label: "مکمل جمله", tone: "slate" },
  ],
  examples: [
    {
      en: "Water boils at 100 degrees.",
      fa: "آب در درجه‌ی ۱۰۰ جوش می‌آید.",
      analysis:
        "واقعیت علمی + فاعل سوم شخص مفرد → به فعل boils حرف s اضافه شده است.",
      highlight: ["boils"],
    },
    {
      en: "He doesn't like coffee.",
      fa: "او قهوه دوست ندارد.",
      analysis:
        "منفی: does + not + فعل ساده؛ بعد از doesn't فعل اصلی بدون s می‌آید.",
      highlight: ["doesn't like"],
    },
    {
      en: "Do you study English every day?",
      fa: "آیا تو هر روز انگلیسی می‌خوانی؟",
      analysis:
        "پرسشی: Do / Does + فاعل + فعل اصلی؛ پاسخ کوتاه با همان فعل کمکی داده می‌شود.",
      highlight: ["Do you study"],
    },
  ],
  wrong: "She go to school every day.",
  right: "She goes to school every day.",
  pitfallNote:
    "برای he / she / it باید به فعل s یا es اضافه شود؛ در جمله‌ی خبری ساده فعل کمکی نداریم.",
  takeaways: [
    "برای سوم شخص مفرد (he / she / it) در زمان حال ساده به فعل s یا es اضافه می‌شود.",
    "در منفی و پرسش از do / does کمک می‌گیریم و فعل اصلی به شکل ساده می‌آید.",
    "قیدهایی مانند always ،every day و usually با این زمان همراه می‌شوند.",
  ],
};

const GENERIC: LearningPreset = {
  nodes: [
    { text: "Subject", tone: "sky" },
    { text: "Verb", tone: "emerald" },
    { text: "Object / Complement", tone: "slate" },
  ],
  legend: [
    { label: "فاعل (Subject)", tone: "sky" },
    { label: "فعل اصلی (Main Verb)", tone: "emerald" },
    { label: "مفعول و مکمل", tone: "slate" },
  ],
  examples: [
    {
      en: "Reading every day builds a strong habit.",
      fa: "خواندن روزانه عادتی قوی می‌سازد.",
      analysis: "فاعل اسم مصدری + فعل سوم شخص مفرد → ساختار خبری زمان حال ساده.",
      highlight: ["builds"],
    },
    {
      en: "Can you say that again?",
      fa: "می‌توانی دوباره بگویی؟",
      analysis: "فعل کمکی can ابتدای جمله می‌آید و فعل اصلی بدون to می‌آید.",
      highlight: ["Can you say"],
    },
    {
      en: "This pattern is easy to remember.",
      fa: "این الگو به خاطر سپردنش آسان است.",
      analysis: "صفت + ساختار to-infinitive بعد از آن برای بیان ارزش‌یابی به کار می‌رود.",
      highlight: ["is easy"],
    },
  ],
  wrong: "He don't know the answer.",
  right: "He doesn't know the answer.",
  pitfallNote:
    "برای he / she / it در منفی از doesn't استفاده می‌شود و فعل اصلی به شکل ساده باقی می‌ماند.",
  takeaways: [
    "ترتیب پایه‌ی جمله در انگلیسی Subject + Verb + Object است.",
    "در جمله‌های منفی و پرسشی از فعل کمکی مناسب کمک بگیرید.",
    "به نشانه‌های زمان در جمله دقت کنید تا زمان فعل درست انتخاب شود.",
  ],
};

export function getLearningPreset(post: PostDetail): LearningPreset {
  const haystack = `${post.title} ${post.tags.join(" ")}`.toLowerCase();
  if (
    haystack.includes("present perfect") ||
    haystack.includes("حال کامل") ||
    haystack.includes("کامل")
  ) {
    return PRESENT_PERFECT;
  }
  if (
    haystack.includes("present simple") ||
    haystack.includes("حال ساده") ||
    haystack.includes("ساده")
  ) {
    return PRESENT_SIMPLE;
  }
  return GENERIC;
}

const NODE_TONES: Record<Tone, string> = {
  emerald: "border-green-500/40 bg-green-500/10 text-green-400",
  sky: "border-sky-500/40 bg-sky-500/10 text-sky-400",
  slate: "border-white/10 bg-white/[0.04] text-[#94A3B8]",
};

const DOT_TONES: Record<Tone, string> = {
  emerald: "bg-green-400",
  sky: "bg-sky-400",
  slate: "bg-[#94A3B8]",
};

export function TakeawayCallout({ items }: { items: string[] }) {
  return (
    <aside className="relative overflow-hidden rounded-xl border border-green-500/25 bg-green-500/[0.06] p-5 sm:p-6">
      <span className="absolute inset-y-0 right-0 w-1 bg-green-400" />
      <div className="mb-3 flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-green-400" />
        <h2 className="text-sm font-bold text-white">نکات کلیدی این مطلب</h2>
      </div>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
            <span className="text-sm leading-relaxed text-[#b0b8c1]">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function FormulaCard({ preset }: { preset: LearningPreset }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Sigma className="h-5 w-5 text-green-400" />
        <h2 className="text-sm font-bold text-white">فرمول ساختاری جمله</h2>
        <span className="mr-auto rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-[11px] text-sky-400">
          نمودار دستوری
        </span>
      </div>

      <div
        dir="ltr"
        className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 font-mono text-sm sm:text-base">
        {preset.nodes.map((node, index) => (
          <Fragment key={node.text}>
            {index > 0 && (
              <span className="text-[#666] select-none" aria-hidden="true">
                +
              </span>
            )}
            <span
              className={`rounded-lg border px-3 py-2 ${NODE_TONES[node.tone]}`}>
              {node.text}
            </span>
          </Fragment>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 border-t border-white/5 pt-4">
        {preset.legend.map((item) => (
          <span
            key={item.label}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-[#9aa3ad]">
            <span className={`h-1.5 w-1.5 rounded-full ${DOT_TONES[item.tone]}`} />
            {item.label}
          </span>
        ))}
      </div>
    </section>
  );
}

function renderSentence(example: LearningExample) {
  if (example.highlight.length === 0) return example.en;
  const pattern = example.highlight
    .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const parts = example.en.split(new RegExp(`(${pattern})`, "g"));
  return parts.map((part, index) =>
    example.highlight.includes(part) ? (
      <em key={index} className="not-italic font-semibold text-green-400">
        {part}
      </em>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}

function ExampleCard({ example }: { example: LearningExample }) {
  const [speaking, setSpeaking] = useState(false);

  function speak() {
    try {
      const synth = window.speechSynthesis;
      if (!synth) return;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(example.en);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      setSpeaking(true);
      synth.speak(utterance);
    } catch {
      setSpeaking(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <p
        dir="ltr"
        className="text-left text-lg font-medium leading-relaxed text-white sm:text-xl">
        {renderSentence(example)}
      </p>

      <button
        type="button"
        onClick={speak}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs text-green-400 transition-colors hover:border-green-500/50 hover:bg-green-500/15">
        <Volume2 className="h-3.5 w-3.5" />
        {speaking ? "در حال پخش..." : "پخش تلفظ"}
      </button>

      <p className="mt-3 text-sm leading-relaxed text-[#9aa3ad]">
        {example.fa}
      </p>

      <div className="mt-3 rounded-lg border border-sky-500/20 bg-sky-500/10 p-3">
        <p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-sky-400">
          <Info className="h-3.5 w-3.5" />
          تحلیل دستوری
        </p>
        <p className="text-[13px] leading-relaxed text-sky-100/80">
          {example.analysis}
        </p>
      </div>
    </div>
  );
}

export function ExampleCards({ preset }: { preset: LearningPreset }) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <MessagesSquare className="h-5 w-5 text-green-400" />
        <h2 className="text-sm font-bold text-white">
          مثال‌های دوزبانه و تمرین
        </h2>
      </div>
      <div className="space-y-4">
        {preset.examples.map((example) => (
          <ExampleCard key={example.en} example={example} />
        ))}
      </div>
    </section>
  );
}

export function WarningCallout({ preset }: { preset: LearningPreset }) {
  return (
    <aside className="rounded-xl border border-rose-500/30 bg-rose-500/[0.08] p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-rose-400" />
        <h2 className="text-sm font-bold text-white">اشتباهات رایج</h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3.5">
          <p className="mb-2 text-[11px] font-bold text-rose-400">اشتباه</p>
          <p dir="ltr" className="text-left font-mono text-sm text-rose-300">
            {preset.wrong}
          </p>
        </div>
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3.5">
          <p className="mb-2 text-[11px] font-bold text-green-400">درست</p>
          <p dir="ltr" className="text-left font-mono text-sm text-green-300">
            {preset.right}
          </p>
        </div>
      </div>

      <p className="mt-3 flex items-start gap-2 text-[13px] leading-relaxed text-[#b0b8c1]">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
        {preset.pitfallNote}
      </p>
    </aside>
  );
}

export function AuthorBioCard({
  name,
  seed,
}: {
  name: string;
  seed: string | null;
}) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <AuthorAvatar seed={seed} name={name} size={64} />
        <div className="min-w-0">
          <p className="text-xs text-[#666]">درباره نویسنده</p>
          <h3 className="mt-1 text-lg font-bold text-white">{name}</h3>
          <p className="mt-0.5 text-sm text-green-400">
            مدرس ارشد زبان انگلیسی و مدرس محتوای لینگوفم
          </p>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-[#9aa3ad]">
            {name} بیش از هشت سال است که آموزش گرامر، مکالمه و مهارت‌های کاربردی
            زبان انگلیسی را دنبال می‌کند و در لینگوفم مجموعه مقاله‌های کاربردی
            برای زبان‌آموزان فارسی‌زبان می‌نویسد. تمرکز او بر یادگیری ساختاری
            و تمرین‌های مثال‌محور است.
          </p>
        </div>
      </div>
    </section>
  );
}

const MOCK_RELATED: PostCard[] = [
  {
    id: 101,
    title: "مرور جملات پرسشی در زمان حال استمراری",
    slug: "",
    thumbnailUrl: null,
    thumbnailGradient: null,
    tags: ["گرامر"],
    summary: "ساختار پرسش و منفی در زمان استمراری با مثال‌های کاربردی.",
    date: "1404/01/01",
    author: "تیم آموزش لینگوفم",
    authorAvatarSeed: null,
  },
  {
    id: 102,
    title: "۱۰ اصطلاح رایج مکالمه روزمره انگلیسی",
    slug: "",
    thumbnailUrl: null,
    thumbnailGradient: null,
    tags: ["مکالمه"],
    summary: "پرکاربردترین عبارت‌های مکالمه روزمره برای مکالمه‌ی طبیعی.",
    date: "1404/01/01",
    author: "تیم آموزش لینگوفم",
    authorAvatarSeed: null,
  },
];

export function RelatedList({ posts }: { posts: PostCard[] }) {
  const linked = posts.length > 0;
  const items = linked ? posts : MOCK_RELATED;

  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
        <BookOpen className="h-4 w-4 text-green-400" />
        همچنین بخوانید
      </h3>
      <div className="space-y-2">
        {items.map((item, index) => {
          const key = linked ? item.id : `mock-${index}`;
          const base = linked
            ? "group cursor-pointer transition-colors hover:border-green-500/30 hover:bg-green-500/[0.05]"
            : "opacity-90";

          const inner = (
            <>
              <div className="min-w-0">
                <p
                  className={`text-sm font-semibold leading-snug line-clamp-2 ${
                    linked ? "text-white group-hover:text-green-400 transition-colors" : "text-white"
                  }`}>
                  {item.title}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[#666]">
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-green-400/90">
                    {item.tags[0] ? `#${item.tags[0]}` : "#آموزش"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {toPersianDigits(String(4 + (item.id % 5)))} دقیقه
                  </span>
                </div>
              </div>
              {linked && (
                <ChevronLeft className="h-4 w-4 shrink-0 text-[#555] transition-colors group-hover:text-green-400" />
              )}
            </>
          );

          const className = `flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 ${base}`;

          return linked ? (
            <Link key={key} href={`/blog/${item.slug}`} className={className}>
              {inner}
            </Link>
          ) : (
            <div key={key} className={className}>
              {inner}
            </div>
          );
        })}
      </div>
    </section>
  );
}

