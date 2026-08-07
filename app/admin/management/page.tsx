"use client";
import { useState, useEffect } from "react";
import {
  Megaphone,
  BookOpen,
  Sparkles,
  Trash2,
  Plus,
  Save,
  Loader2,
  ListChecks,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageSkeleton } from "@/components/dashboard/Skeletons";
import toast from "react-hot-toast";

type MarqueeItem = {
  id: number;
  text: string;
  isActive: boolean;
};

type WordItem = {
  id: number;
  word: string;
  definition: string;
  example: string;
  partOfSpeech: string | null;
};

type PhraseItem = {
  id: number;
  phrasalVerb: string;
  definition: string;
  example: string;
};

const cardClass =
  "relative overflow-hidden rounded-2xl border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)]/80 backdrop-blur-xl shadow-lg";
const accentBar =
  "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent";
const inputClass =
  "w-full bg-[var(--dash-bg)]/70 text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm outline-none border border-[var(--dash-muted)]/15 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.22)] transition-all placeholder:text-[var(--dash-muted)]/60";
const labelClass = "block text-sm font-medium text-[var(--dash-muted)] mb-2";

const listVariants = {
  initial: { opacity: 0, y: 12 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.3 },
  }),
};

function toFa(value: number | string) {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
}

export default function ManagementPage() {
  const [loading, setLoading] = useState(true);

  const [marquee, setMarquee] = useState<MarqueeItem[]>([]);
  const [marqueeText, setMarqueeText] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleteMarqueeId, setDeleteMarqueeId] = useState<number | null>(null);
  const [deletingMarquee, setDeletingMarquee] = useState(false);

  const [words, setWords] = useState<WordItem[]>([]);
  const [phrases, setPhrases] = useState<PhraseItem[]>([]);
  const [wordForm, setWordForm] = useState({
    word: "",
    partOfSpeech: "",
    meaning: "",
    example: "",
  });
  const [phraseForm, setPhraseForm] = useState({
    phrasalVerb: "",
    meaning: "",
    example: "",
  });
  const [savingWord, setSavingWord] = useState(false);
  const [savingPhrase, setSavingPhrase] = useState(false);
  const [deletingDaily, setDeletingDaily] = useState<{
    kind: "word" | "phrasalVerb";
    id: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const [marqueeRes, dailyRes] = await Promise.all([
          fetch("/api/admin/management/marquee"),
          fetch("/api/admin/management/daily"),
        ]);
        if (marqueeRes.ok && !cancelled) {
          const data: MarqueeItem[] = await marqueeRes.json();
          setMarquee(data);
        }
        if (dailyRes.ok && !cancelled) {
          const data = await dailyRes.json();
          setWords(data.words ?? []);
          setPhrases(data.phrasalVerbs ?? []);
          const latestWord = (data.words ?? [])[0];
          if (latestWord) {
            setWordForm({
              word: latestWord.word,
              partOfSpeech: latestWord.partOfSpeech ?? "",
              meaning: latestWord.definition,
              example: latestWord.example,
            });
          }
          const latestPhrase = (data.phrasalVerbs ?? [])[0];
          if (latestPhrase) {
            setPhraseForm({
              phrasalVerb: latestPhrase.phrasalVerb,
              meaning: latestPhrase.definition,
              example: latestPhrase.example,
            });
          }
        }
      } catch {
        // ignore
      }
      if (!cancelled) setLoading(false);
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const refetchDaily = async () => {
    const res = await fetch("/api/admin/management/daily");
    if (!res.ok) return;
    const data = await res.json();
    setWords(data.words ?? []);
    setPhrases(data.phrasalVerbs ?? []);
    const latestWord = (data.words ?? [])[0];
    if (latestWord) {
      setWordForm({
        word: latestWord.word,
        partOfSpeech: latestWord.partOfSpeech ?? "",
        meaning: latestWord.definition,
        example: latestWord.example,
      });
    }
    const latestPhrase = (data.phrasalVerbs ?? [])[0];
    if (latestPhrase) {
      setPhraseForm({
        phrasalVerb: latestPhrase.phrasalVerb,
        meaning: latestPhrase.definition,
        example: latestPhrase.example,
      });
    }
  };

  const addMarquee = async () => {
    const text = marqueeText.trim();
    if (!text || adding) return;
    setAdding(true);
    try {
      const res = await fetch("/api/admin/management/marquee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "خطا در افزودن اطلاعیه");
        return;
      }
      setMarqueeText("");
      const marqueeRes = await fetch("/api/admin/management/marquee");
      if (marqueeRes.ok) setMarquee(await marqueeRes.json());
      toast.success("اطلاعیه با موفقیت افزوده شد");
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setAdding(false);
    }
  };

  const deleteMarquee = async (id: number) => {
    if (deletingMarquee) return;
    setDeletingMarquee(true);
    try {
      const res = await fetch("/api/admin/management/marquee", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "خطا در حذف اطلاعیه");
        return;
      }
      setMarquee((prev) => prev.filter((m) => m.id !== id));
      toast.success("اطلاعیه حذف شد");
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setDeletingMarquee(false);
      setDeleteMarqueeId(null);
    }
  };

  const saveWord = async () => {
    if (!wordForm.word.trim() || !wordForm.meaning.trim() || !wordForm.example.trim() || savingWord)
      return;
    setSavingWord(true);
    try {
      const res = await fetch("/api/admin/management/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "word",
          id: words[0]?.id,
          word: wordForm.word,
          partOfSpeech: wordForm.partOfSpeech,
          definition: wordForm.meaning,
          example: wordForm.example,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "خطا در ذخیره کلمه");
        return;
      }
      await refetchDaily();
      toast.success("کلمه روز ذخیره شد");
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setSavingWord(false);
    }
  };

  const savePhrase = async () => {
    if (
      !phraseForm.phrasalVerb.trim() ||
      !phraseForm.meaning.trim() ||
      !phraseForm.example.trim() ||
      savingPhrase
    )
      return;
    setSavingPhrase(true);
    try {
      const res = await fetch("/api/admin/management/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "phrasalVerb",
          id: phrases[0]?.id,
          phrasalVerb: phraseForm.phrasalVerb,
          definition: phraseForm.meaning,
          example: phraseForm.example,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "خطا در ذخیره عبارت");
        return;
      }
      await refetchDaily();
      toast.success("عبارت روز ذخیره شد");
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setSavingPhrase(false);
    }
  };

  const deleteDaily = async (kind: "word" | "phrasalVerb", id: number) => {
    if (deletingDaily) return;
    setDeletingDaily({ kind, id });
    try {
      const res = await fetch("/api/admin/management/daily", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "خطا در حذف");
        return;
      }
      await refetchDaily();
      toast.success("حذف شد");
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setDeletingDaily(null);
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Marquee section */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className={`${cardClass} p-6`}>
          <div className={accentBar} />
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-500/10">
                <Megaphone className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-lg font-bold text-[var(--dash-text)]">
                اطلاعیه‌های متحرک
              </h2>
            </div>
            <span className="text-xs bg-[var(--dash-bg)]/60 text-[var(--dash-muted)] px-3 py-1 rounded-full border border-[var(--dash-muted)]/10">
              {toFa(marquee.length)} مورد
            </span>
          </div>

          {/* Add form */}
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={marqueeText}
              onChange={(e) => setMarqueeText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addMarquee();
              }}
              placeholder="متن اطلاعیه جدید..."
              className={inputClass}
            />
            <motion.button
              whileTap={marqueeText.trim() && !adding ? { scale: 0.97 } : {}}
              onClick={addMarquee}
              disabled={!marqueeText.trim() || adding}
              className="shrink-0 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-l from-green-500 to-emerald-500 shadow-lg shadow-green-500/25 hover:shadow-green-500/40">
              {adding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              افزودن
            </motion.button>
          </div>

          {/* List */}
          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pl-1">
            <AnimatePresence initial={false}>
              {marquee.length === 0 ? (
                <div className="text-center py-10">
                  <Megaphone className="h-10 w-10 mx-auto text-[var(--dash-muted)]/40 mb-3" />
                  <p className="text-sm text-[var(--dash-muted)]">
                    هنوز اطلاعیه‌ای افزوده نشده است
                  </p>
                </div>
              ) : (
                marquee.map((item, i) => (
                  <motion.div
                    key={item.id}
                    layout
                    variants={listVariants}
                    custom={i}
                    initial="initial"
                    animate="animate"
                    exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
                    className="rounded-xl bg-[var(--dash-bg)]/60 border border-[var(--dash-muted)]/10 p-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="shrink-0 w-6 h-6 mt-0.5 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-[11px] font-bold flex items-center justify-center">
                          {toFa(i + 1)}
                        </span>
                        <p className="text-sm text-[var(--dash-text)] leading-relaxed min-w-0 break-words">
                          {item.text}
                        </p>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          setDeleteMarqueeId(
                            deleteMarqueeId === item.id ? null : item.id,
                          )
                        }
                        className="shrink-0 p-2 rounded-lg text-[var(--dash-muted)] hover:bg-red-500/10 hover:text-red-500 transition-colors duration-200"
                        title="حذف">
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>

                    <AnimatePresence>
                      {deleteMarqueeId === item.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden">
                          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <p className="text-red-600 dark:text-red-400 text-sm font-medium mb-2">
                              آیا از حذف این اطلاعیه مطمئن هستید؟
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => deleteMarquee(item.id)}
                                className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors duration-200">
                                بله، حذف شود
                              </button>
                              <button
                                onClick={() => setDeleteMarqueeId(null)}
                                className="px-3 py-1.5 bg-[var(--dash-muted)]/20 text-[var(--dash-text)] text-sm rounded-lg hover:bg-[var(--dash-muted)]/30 transition-colors duration-200">
                                انصراف
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* Daily content section */}
        <div className="space-y-6">
          {/* Word of day */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className={`${cardClass} p-6`}>
            <div className={accentBar} />
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-green-500/10">
                  <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-lg font-bold text-[var(--dash-text)]">
                  کلمه روز
                </h2>
              </div>
              <span className="text-xs bg-[var(--dash-bg)]/60 text-[var(--dash-muted)] px-3 py-1 rounded-full border border-[var(--dash-muted)]/10">
                {toFa(words.length)} مورد
              </span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>کلمه</label>
                  <input
                    type="text"
                    value={wordForm.word}
                    onChange={(e) =>
                      setWordForm((prev) => ({
                        ...prev,
                        word: e.target.value,
                      }))
                    }
                    placeholder="مثال: Perseverance"
                    className={inputClass}
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className={labelClass}>نقش دستوری</label>
                  <input
                    type="text"
                    value={wordForm.partOfSpeech}
                    onChange={(e) =>
                      setWordForm((prev) => ({
                        ...prev,
                        partOfSpeech: e.target.value,
                      }))
                    }
                    placeholder="مثال: noun"
                    className={inputClass}
                    dir="ltr"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>معنی</label>
                <input
                  type="text"
                  value={wordForm.meaning}
                  onChange={(e) =>
                    setWordForm((prev) => ({
                      ...prev,
                      meaning: e.target.value,
                    }))
                  }
                  placeholder="معنی فارسی کلمه"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>مثال</label>
                <textarea
                  value={wordForm.example}
                  onChange={(e) =>
                    setWordForm((prev) => ({
                      ...prev,
                      example: e.target.value,
                    }))
                  }
                  placeholder="جمله نمونه انگلیسی..."
                  rows={2}
                  className={`${inputClass} resize-none`}
                  dir="ltr"
                />
              </div>

              <motion.button
                whileTap={
                  wordForm.word.trim() &&
                  wordForm.meaning.trim() &&
                  wordForm.example.trim() &&
                  !savingWord
                    ? { scale: 0.98 }
                    : {}
                }
                onClick={saveWord}
                disabled={
                  !wordForm.word.trim() ||
                  !wordForm.meaning.trim() ||
                  !wordForm.example.trim() ||
                  savingWord
                }
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-l from-green-500 to-emerald-500 shadow-lg shadow-green-500/25 hover:shadow-green-500/40">
                {savingWord ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                ذخیره کلمه روز
              </motion.button>
            </div>

            {/* Word history */}
            {words.length > 1 && (
              <div className="mt-6 pt-5 border-t border-[var(--dash-muted)]/10">
                <div className="flex items-center gap-2 mb-3">
                  <ListChecks className="h-4 w-4 text-[var(--dash-muted)]" />
                  <span className="text-sm font-bold text-[var(--dash-muted)]">
                    سوابق قبلی
                  </span>
                </div>
                <div className="space-y-2 max-h-44 overflow-y-auto pl-1">
                  {words.slice(1).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-[var(--dash-bg)]/60 border border-[var(--dash-muted)]/10 px-3.5 py-2.5">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[var(--dash-text)] truncate" dir="ltr">
                          {item.word}
                        </p>
                        <p className="text-xs text-[var(--dash-muted)] truncate mt-0.5">
                          {item.definition}
                        </p>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => deleteDaily("word", item.id)}
                        disabled={deletingDaily?.kind === "word" && deletingDaily.id === item.id}
                        className="shrink-0 p-2 rounded-lg text-[var(--dash-muted)] hover:bg-red-500/10 hover:text-red-500 transition-colors duration-200"
                        title="حذف">
                        {deletingDaily?.kind === "word" && deletingDaily.id === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </motion.button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.section>

          {/* Phrasal verb of day */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className={`${cardClass} p-6`}>
            <div className={accentBar} />
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                </div>
                <h2 className="text-lg font-bold text-[var(--dash-text)]">
                  عبارت روز
                </h2>
              </div>
              <span className="text-xs bg-[var(--dash-bg)]/60 text-[var(--dash-muted)] px-3 py-1 rounded-full border border-[var(--dash-muted)]/10">
                {toFa(phrases.length)} مورد
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>عبارت</label>
                <input
                  type="text"
                  value={phraseForm.phrasalVerb}
                  onChange={(e) =>
                    setPhraseForm((prev) => ({
                      ...prev,
                      phrasalVerb: e.target.value,
                    }))
                  }
                  placeholder="مثال: Carry On"
                  className={inputClass}
                  dir="ltr"
                />
              </div>
              <div>
                <label className={labelClass}>معنی</label>
                <input
                  type="text"
                  value={phraseForm.meaning}
                  onChange={(e) =>
                    setPhraseForm((prev) => ({
                      ...prev,
                      meaning: e.target.value,
                    }))
                  }
                  placeholder="معنی فارسی عبارت"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>مثال</label>
                <textarea
                  value={phraseForm.example}
                  onChange={(e) =>
                    setPhraseForm((prev) => ({
                      ...prev,
                      example: e.target.value,
                    }))
                  }
                  placeholder="جمله نمونه انگلیسی..."
                  rows={2}
                  className={`${inputClass} resize-none`}
                  dir="ltr"
                />
              </div>

              <motion.button
                whileTap={
                  phraseForm.phrasalVerb.trim() &&
                  phraseForm.meaning.trim() &&
                  phraseForm.example.trim() &&
                  !savingPhrase
                    ? { scale: 0.98 }
                    : {}
                }
                onClick={savePhrase}
                disabled={
                  !phraseForm.phrasalVerb.trim() ||
                  !phraseForm.meaning.trim() ||
                  !phraseForm.example.trim() ||
                  savingPhrase
                }
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-l from-purple-500 to-fuchsia-500 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40">
                {savingPhrase ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                ذخیره عبارت روز
              </motion.button>
            </div>

            {/* Phrase history */}
            {phrases.length > 1 && (
              <div className="mt-6 pt-5 border-t border-[var(--dash-muted)]/10">
                <div className="flex items-center gap-2 mb-3">
                  <ListChecks className="h-4 w-4 text-[var(--dash-muted)]" />
                  <span className="text-sm font-bold text-[var(--dash-muted)]">
                    سوابق قبلی
                  </span>
                </div>
                <div className="space-y-2 max-h-44 overflow-y-auto pl-1">
                  {phrases.slice(1).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-[var(--dash-bg)]/60 border border-[var(--dash-muted)]/10 px-3.5 py-2.5">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[var(--dash-text)] truncate" dir="ltr">
                          {item.phrasalVerb}
                        </p>
                        <p className="text-xs text-[var(--dash-muted)] truncate mt-0.5">
                          {item.definition}
                        </p>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          deleteDaily("phrasalVerb", item.id)
                        }
                        disabled={
                          deletingDaily?.kind === "phrasalVerb" &&
                          deletingDaily.id === item.id
                        }
                        className="shrink-0 p-2 rounded-lg text-[var(--dash-muted)] hover:bg-red-500/10 hover:text-red-500 transition-colors duration-200"
                        title="حذف">
                        {deletingDaily?.kind === "phrasalVerb" &&
                        deletingDaily.id === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </motion.button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.section>
        </div>
      </div>
    </div>
  );
}
