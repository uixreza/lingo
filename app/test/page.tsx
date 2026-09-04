"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Clock, CheckCircle2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useLang } from "@/contexts/LanguageContext";
import confetti from "canvas-confetti";

function fireConfetti() {
  const colors = ["#22c55e", "#4ade80", "#86efac", "#bbf7d0", "#ffffff"];
  const end = Date.now() + 3 * 1000;

  const frame = () => {
    if (Date.now() > end) return;
    confetti({ particleCount: 2, angle: 60, spread: 55, startVelocity: 60, origin: { x: 0, y: 0.5 }, colors });
    confetti({ particleCount: 2, angle: 120, spread: 55, startVelocity: 60, origin: { x: 1, y: 0.5 }, colors });
    requestAnimationFrame(frame);
  };
  frame();
}

const TOTAL_TIME = 35 * 60;

type Answer = string | null;

const CORRECT_ANSWERS = [
  "b","c","b","b","c","b","b","a","b","b",
  "c","d","b","a","a","b","d","b","b","b",
  "a","b","b","a","c","b","b","b","a","c",
  "b","a","c","c","c","c","b","a","a","c",
  "b","a","c","b","c","a","a","b","a","a",
];

const LEVELS = [
  { min: 0,  max: 10, level: "A1", key: "quiz.levelBeginner" as const },
  { min: 11, max: 20, level: "A2", key: "quiz.levelElementary" as const },
  { min: 21, max: 30, level: "B1", key: "quiz.levelIntermediate" as const },
  { min: 31, max: 40, level: "B2", key: "quiz.levelUpperIntermediate" as const },
  { min: 41, max: 50, level: "C1", key: "quiz.levelAdvanced" as const },
];

const LEVEL_DESC: Record<string, Record<string, string>> = {
  A1: { en: "Can understand and use very basic phrases.", fa: "می‌توان عبارات بسیار پایه را درک و استفاده کرد." },
  A2: { en: "Can understand sentences related to immediate priority areas.", fa: "می‌توان جملات مربوط به نیازهای فوری را درک کرد." },
  B1: { en: "Can understand the main points of clear standard input.", fa: "می‌توان نکات اصلی محتوای استاندارد را درک کرد." },
  B2: { en: "Can understand the main ideas of complex text.", fa: "می‌توان ایده‌های اصلی متن‌های پیچیده را درک کرد." },
  C1: { en: "Can understand a wide range of demanding, longer clauses.", fa: "می‌توان طیف گسترده‌ای از جملات پیچیده را درک کرد." },
};

function getLevel(score: number) {
  return LEVELS.find((l) => score >= l.min && score <= l.max) ?? LEVELS[0];
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const questions = [
  { q: "My name ______ Maria.", opts: ["are","is","am","be"] },
  { q: "I ______ from Spain.", opts: ["is","are","am","be"] },
  { q: "I have ______ apple for breakfast every day.", opts: ["a","an","the","none"] },
  { q: "She is a doctor. ______ works in a big hospital.", opts: ["He","She","It","They"] },
  { q: "We ______ to the cinema last night.", opts: ["go","going","went","will go"] },
  { q: "Is there ______ milk in the fridge?", opts: ["some","any","much","many"] },
  { q: "He is ______ than his brother.", opts: ["tall","taller","tallest","most tall"] },
  { q: "I ______ a new car next month.", opts: ["am buying","buy","bought","will buy"] },
  { q: "If it rains, I ______ stay at home.", opts: ["would","will","won't","am"] },
  { q: "I have been living here ______ 2010.", opts: ["for","since","during","while"] },
  { q: "She asked me ______ I could help her.", opts: ["what","that","if","which"] },
  { q: "He is not very tall, ______ he is strong.", opts: ["because","so","although","but"] },
  { q: "I need to ______ my homework before dinner.", opts: ["make","do","have","take"] },
  { q: "They ______ living in London for five years now.", opts: ["have been","are being","were","had been"] },
  { q: "The movie was ______ boring that I fell asleep.", opts: ["so","such","too","very"] },
  { q: "My father is a very good ______. He can cook many dishes.", opts: ["cooker","cook","chef","waiter"] },
  { q: "By the time he was 30, he ______ three countries.", opts: ["visited","has visited","was visiting","had visited"] },
  { q: "This is the ______ expensive bag in the store.", opts: ["more","most","much","very"] },
  { q: "I'm not used ______ up so early.", opts: ["to get","to getting","getting","get"] },
  { q: "She enjoys ______ books in her free time.", opts: ["to read","reading","read","reads"] },
  { q: "\"How are you?\" is best answered by:", opts: ["I'm fine, thank you. And you?","How are you?","Yes, I am.","Goodbye."] },
  { q: "Choose the correct sentence:", opts: ["She goes always to school by bus.","She always goes to school by bus.","She goes to school by bus always.","Always she goes to school by bus."] },
  { q: "Choose the correct question:", opts: ["Where you live?","Where do you live?","Where live you?","Where are you live?"] },
  { q: "Choose the correct negative sentence:", opts: ["I don't like coffee.","I no like coffee.","I like not coffee.","I don't likes coffee."] },
  { q: "On a menu, \"main course\" is:", opts: ["The drink.","The starter.","The big dish you eat.","The dessert."] },
  { q: "I wish I ______ more time to travel.", opts: ["have","had","have had","will have"] },
  { q: "The car needs ______. It's very dirty.", opts: ["to wash","washing","washed","being washed"] },
  { q: "She is a very ______ person. She always helps others.", opts: ["selfish","generous","lazy","greedy"] },
  { q: "I'm sorry, I didn't ______ to hurt your feelings.", opts: ["mean","intend","think","plan"] },
  { q: "It was the most beautiful city ______ I had ever seen.", opts: ["what","which","that","who"] },
  { q: "He spoke in a quiet voice, ______ made it hard to hear him.", opts: ["who","which","what","whom"] },
  { q: "We would rather ______ to the beach than the mountains.", opts: ["go","to go","going","went"] },
  { q: "The boss insisted on ______ the report by Friday.", opts: ["me to finish","me finishing","my finishing","I finish"] },
  { q: "She didn't even say goodbye, ______ was very rude.", opts: ["that","what","which","who"] },
  { q: "The population of the world is growing ______.", opts: ["slower and slower","more and more","faster and faster","quickly and quickly"] },
  { q: "If I ______ you, I would accept the job offer.", opts: ["am","was","were","have been"] },
  { q: "She is looking forward to ______ her family.", opts: ["see","seeing","be seen","have seen"] },
  { q: "The board of directors ______ meeting at 10 AM tomorrow.", opts: ["is","are","will","has"] },
  { q: "He is ______ a difficult person to work with.", opts: ["such","so","too","very"] },
  { q: "The old building is going to be ______ down.", opts: ["broken","knocked","torn","pulled"] },
  { q: "What does \"revolutionized\" mean in this text?", opts: ["Changed slowly","Changed completely","Made worse","Made easier"] },
  { q: "According to the text, why could constant connectivity be a problem?", opts: ["It is too expensive.","It makes people feel pressure and stress.","It is too slow.","It is only for young people."] },
  { q: "The word \"crucial\" is closest in meaning to:", opts: ["Unimportant","Difficult","Essential","Easy"] },
  { q: "Which of the following was a problem with letters and telephones?", opts: ["They were too fast.","They were often slow and expensive.","They are outdated.","They are difficult to use."] },
  { q: "The main message of the text is:", opts: ["The internet is bad for you.","Telephones are better than email.","We should be careful to find a balance with technology.","Video calls are the best way to communicate."] },
  { q: "The new policy is not popular; it has met with a lot of ______.", opts: ["resistance","assistance","persistence","existence"] },
  { q: "\"Put up with\" means:", opts: ["Endure","Stop","Increase","Ignore"] },
  { q: "Not only ______ late, but he also forgot his homework.", opts: ["he was","was he","he is","is he"] },
  { q: "The singer's performance was so captivating that the audience was completely ______.", opts: ["mesmerized","bored","distracted","offended"] },
  { q: "My boss tends to ______ things, which often leads to mistakes.", opts: ["rush into","hold on","pass out","catch up"] },
];

const readingText = `The internet has revolutionized the way we communicate. In the past, people relied on letters and telephones, which were often slow and expensive. Now, with the click of a button, we can send an email, make a video call, or share photos with anyone in the world. This constant connectivity, however, can have a downside. Many people feel pressured to be available all the time, leading to stress and burnout. Finding a balance between staying connected and having personal time is crucial for our well-being.`;

export default function TestPage() {
  const { t, locale } = useLang();
  const isRtl = locale === "fa";

  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(() => Array(50).fill(null));
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [finished, setFinished] = useState(false);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    if (!started || finished) return;
    if (timeLeft <= 0) { setFinished(true); return; }
    const id = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(id);
  }, [started, finished, timeLeft]);

  useEffect(() => {
    if (finished) fireConfetti();
  }, [finished]);

  const autoAdvancedRef = useRef(new Set<number>());

  useEffect(() => {
    if (!started || finished) return;
    if (answers[current] === null) return;
    if (autoAdvancedRef.current.has(current)) return;
    autoAdvancedRef.current.add(current);
    const t = setTimeout(() => {
      if (current < 49) setCurrent((p) => p + 1);
    }, 300);
    return () => clearTimeout(t);
  }, [answers, current, started, finished]);

  const score = useMemo(() => {
    return answers.reduce((acc, a, i) => acc + (a === CORRECT_ANSWERS[i] ? 1 : 0), 0);
  }, [answers, finished]);

  const level = useMemo(() => getLevel(score), [score]);
  const levelDesc = LEVEL_DESC[level.level]?.[locale] ?? LEVEL_DESC[level.level].en;
  const levelLabel = t(level.key);

  const answeredCount = answers.filter((a) => a !== null).length;

  const selectAnswer = useCallback((qi: number, letter: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[qi] = letter;
      return next;
    });
  }, []);

  const goNext = useCallback(() => setCurrent((p) => Math.min(p + 1, 49)), []);
  const goPrev = useCallback(() => setCurrent((p) => Math.max(p - 1, 0)), []);

  if (!started) {
    return (
      <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full text-center space-y-8"
        >
          <Link href="/" className={`inline-flex items-center gap-2 text-sm text-[#666] hover:text-white transition-colors mb-4 ${isRtl ? "flex-row-reverse" : ""}`}>
            <ArrowLeft size={16} className={isRtl ? "rotate-180" : ""} /> {t("quiz.backToHome")}
          </Link>
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">{t("quiz.title")}</h1>
            <p className="text-[#888] text-sm leading-relaxed max-w-md mx-auto">
              {t("quiz.subtitle")}{" "}
              {t("quiz.timeLimit").replace("{minutes}", "35")}
            </p>
          </div>
          <div className={`bg-[#0a0f0a] rounded-2xl p-6 border border-green-500/10 space-y-4 ${isRtl ? "text-right" : "text-left"}`}>
            <h2 className="text-white font-semibold text-sm">{t("quiz.beforeStart")}</h2>
            <ul className="space-y-2 text-[#888] text-xs leading-relaxed">
              {[t("quiz.rule1"), t("quiz.rule2"), t("quiz.rule3"), t("quiz.rule4")].map((rule, i) => (
                <li key={i} className={`flex items-start gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => setStarted(true)}
            className="px-8 py-3.5 bg-gradient-to-l from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 text-black font-bold rounded-full shadow-lg shadow-green-500/30 transition-all duration-200 text-sm"
          >
            {t("quiz.start")}
          </button>
        </motion.div>
      </div>
    );
  }

  if (finished) {
    if (showReview) {
      return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-[#050505] flex flex-col relative">
      <div className="absolute top-[-200px] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#22c55e]/15 blur-[180px] pointer-events-none" />
          {/* Review header */}
          <div className="sticky top-0 z-40 bg-[#050505]/90 backdrop-blur-xl border-b border-white/5">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
              <button
                onClick={() => setShowReview(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-[#aaa] hover:text-white hover:bg-white/10 transition-all ${isRtl ? "flex-row-reverse" : ""}`}
              >
                <ArrowLeft size={14} className={isRtl ? "rotate-180" : ""} /> {t("quiz.results")}
              </button>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-green-400">{score}<span className="text-sm text-[#666]">/50</span></span>
                <span className="text-sm font-bold text-white">{level.level}</span>
              </div>
            </div>
          </div>

          {/* Desktop: side by side / Mobile: stacked sheet */}
          <div className="flex-1 flex flex-col lg:flex-row max-w-6xl mx-auto w-full">
            {/* Results panel — sticky on desktop */}
            <div className="lg:w-80 lg:shrink-0 p-4 lg:p-6 lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:overflow-y-auto">
              <div className="bg-[#0a0f0a] rounded-2xl p-6 border border-green-500/10 space-y-5">
                <div className="text-center">
                  <div className="text-5xl font-bold text-green-400">{score}<span className="text-xl text-[#666]">/50</span></div>
                </div>
                <div className="space-y-1 text-center">
                  <div className="text-xl font-bold text-white">{level.level} — {levelLabel}</div>
                  <p className="text-[#888] text-xs">{levelDesc}</p>
                </div>
                <div className="w-full bg-[#111] rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(score / 50) * 100}%` }}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      autoAdvancedRef.current.clear();
                      setStarted(false);
                      setCurrent(0);
                      setAnswers(Array(50).fill(null));
                      setTimeLeft(TOTAL_TIME);
                      setFinished(false);
                      setShowReview(false);
                    }}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-l from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <RotateCcw size={13} /> {t("quiz.retake")}
                  </button>
                  <Link
                    href="/"
                    className="flex-1 px-4 py-2.5 border border-white/10 text-[#aaa] hover:text-white hover:bg-white/5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <ArrowLeft size={13} className={isRtl ? "rotate-180" : ""} /> {t("quiz.backToHome")}
                  </Link>
                </div>
              </div>
            </div>

            {/* Review list */}
            <div className="flex-1 p-4 lg:p-6 lg:border-l lg:border-white/5">
              <div className="space-y-3">
                {questions.map((q, i) => {
                  const correct = CORRECT_ANSWERS[i];
                  const userAns = answers[i];
                  const isCorrect = userAns === correct;
                  return (
                    <div key={i} className={`p-4 rounded-xl border ${isCorrect ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                      <div className={`flex items-start gap-2 mb-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded shrink-0 ${isCorrect ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                          {i + 1}
                        </span>
                        <span className="text-white text-sm" dir="ltr">{q.q}</span>
                      </div>
                      <div className={`grid grid-cols-2 gap-1 ${isRtl ? "mr-7" : "ml-7"}`}>
                        {q.opts.map((opt, oi) => {
                          const letter = String.fromCharCode(97 + oi);
                          const isAnswer = letter === correct;
                          const wasSelected = letter === userAns;
                          return (
                            <span
                              key={oi}
                              className={`text-xs px-2 py-1 rounded ${isRtl ? "text-right" : "text-left"} ${
                                isAnswer
                                  ? "bg-green-500/20 text-green-400 font-semibold"
                                  : wasSelected
                                  ? "bg-red-500/20 text-red-400"
                                  : "text-[#666]"
                              }`}
                            >
                              {letter}) {opt}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full text-center space-y-8"
        >
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">{t("quiz.complete")}</h1>
            <p className="text-[#888]">{t("quiz.results")}</p>
          </div>

          <div className="bg-[#0a0f0a] rounded-2xl p-8 border border-green-500/10 space-y-6">
            <div className="text-6xl font-bold text-green-400">{score}<span className="text-2xl text-[#666]">/50</span></div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-white">{level.level} — {levelLabel}</div>
              <p className="text-[#888] text-sm">{levelDesc}</p>
            </div>
            <div className="w-full bg-[#111] rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(score / 50) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowReview(true)}
              className="px-6 py-3 border border-white/20 text-white/80 hover:text-white hover:border-white/40 hover:bg-white/5 rounded-full backdrop-blur-sm transition-all duration-200 text-sm"
            >
              {t("quiz.reviewAnswers")}
            </button>
            <button
              onClick={() => {
                autoAdvancedRef.current.clear();
                setStarted(false);
                setCurrent(0);
                setAnswers(Array(50).fill(null));
                setTimeLeft(TOTAL_TIME);
                setFinished(false);
                setShowReview(false);
              }}
              className={`px-6 py-3 bg-gradient-to-l from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 text-black font-bold rounded-full shadow-lg shadow-green-500/30 transition-all duration-200 text-sm flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}
            >
              <RotateCcw size={14} /> {t("quiz.retake")}
            </button>
          </div>

          <Link href="/" className={`inline-flex items-center gap-1 text-sm text-[#666] hover:text-white transition-colors ${isRtl ? "flex-row-reverse" : ""}`}>
            <ArrowLeft size={14} className={isRtl ? "rotate-180" : ""} /> {t("quiz.backToHome")}
          </Link>
        </motion.div>
      </div>
    );
  }

  const q = questions[current];
  const letters = ["a","b","c","d"];
  const isReadingBlock = current >= 40 && current <= 44;

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-[#050505] flex flex-col relative">
      <div className="absolute top-[-200px] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#22c55e]/15 blur-[180px] pointer-events-none" />
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-[#050505]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className={`text-xs text-[#666] hover:text-white transition-colors flex items-center gap-1 ${isRtl ? "flex-row-reverse" : ""}`}>
            <ArrowLeft size={12} className={isRtl ? "rotate-180" : ""} /> {t("quiz.home")}
          </Link>
          <div className="flex items-center gap-2 text-xs">
            <Clock size={14} className={timeLeft < 300 ? "text-red-400" : "text-green-400"} />
            <span className={timeLeft < 300 ? "text-red-400 font-mono" : "text-[#888] font-mono"}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <span className="text-xs text-[#666]">{answeredCount}/50</span>
        </div>
        <div className="h-0.5 bg-[#111]">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${((current + 1) / 50) * 100}%` }}
          />
        </div>
      </div>

      {/* Centered content: question + nav */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-8">
        <div className="w-full max-w-lg">
          {isReadingBlock && current === 40 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-5 rounded-2xl bg-[#0a0f0a] border border-green-500/10"
            >
              <p className={`text-xs text-green-400 font-semibold mb-3 uppercase tracking-wider ${isRtl ? "text-right" : "text-left"}`}>{t("quiz.readingPassage")}</p>
              <p className="text-sm text-[#aaa] leading-relaxed text-left" dir="ltr">{readingText}</p>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className={`flex items-start gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-lg mt-0.5 shrink-0">
                  {current + 1}
                </span>
                <p className="text-white text-base sm:text-lg leading-relaxed" dir="ltr">{q.q}</p>
              </div>

              <div className={`space-y-2 ${isRtl ? "sm:mr-9" : "sm:ml-9"}`}>
                {q.opts.map((opt, oi) => {
                  const letter = letters[oi];
                  const selected = answers[current] === letter;
                  return (
                    <button
                      key={oi}
                      onClick={() => selectAnswer(current, letter)}
                      dir="ltr"
                      className={`w-full px-4 py-3 rounded-xl border text-sm transition-all duration-150 flex items-center gap-3 ${isRtl ? "flex-row-reverse text-right" : "text-left"} ${
                        selected
                          ? "border-green-500/50 bg-green-500/10 text-green-400"
                          : "border-white/5 bg-[#0a0a0a] text-[#aaa] hover:border-white/15 hover:bg-[#111]"
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${
                        selected ? "border-green-500 bg-green-500 text-black" : "border-[#333] text-[#666]"
                      }`}>
                        {letter}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom nav — fixed */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-4 pointer-events-none">
        <div className="bg-[#0a0f0a]/90 backdrop-blur-xl rounded-2xl ring-1 ring-white/10 px-5 py-3 flex flex-col items-center gap-3 pointer-events-auto">
          {/* Dots / counter */}
          <span className="sm:hidden text-xs font-mono text-[#666]">
            {current + 1}/{questions.length}
          </span>
          <div className="hidden sm:flex gap-1.5">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === current
                    ? "bg-green-400 scale-125"
                    : answers[i] !== null
                    ? "bg-green-500/40"
                    : "bg-[#333]"
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={goPrev}
              disabled={current === 0}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-[#aaa] hover:text-white hover:bg-white/10 hover:border-white/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all ${isRtl ? "flex-row-reverse" : ""}`}
            >
              <ArrowLeft size={14} className={isRtl ? "rotate-180" : ""} /> {t("quiz.prev")}
            </button>

            {current === 49 ? (
              <button
                onClick={() => setFinished(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-green-500/15 border border-green-500/30 text-green-400 hover:bg-green-500/25 transition-all ${isRtl ? "flex-row-reverse" : ""}`}
              >
                {t("quiz.finish")} <CheckCircle2 size={14} />
              </button>
            ) : (
              <button
                onClick={goNext}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-[#aaa] hover:text-white hover:bg-white/10 hover:border-white/20 transition-all ${isRtl ? "flex-row-reverse" : ""}`}
              >
                {t("quiz.next")} <ArrowRight size={14} className={isRtl ? "rotate-180" : ""} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
