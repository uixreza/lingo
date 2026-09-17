"use client";

import { useState, useCallback } from "react";
import { Search, Volume2, BookOpen, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/contexts/LanguageContext";

interface Meaning {
  partOfSpeech: string;
  definitions: string[];
}

interface DictionaryEntry {
  word: string;
  phonetic: string | null;
  meanings: Meaning[];
  synonyms: string[];
  antonyms: string[];
  sourceUrls?: string[];
}

export default function DictionaryPage() {
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DictionaryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const search = useCallback(async (word: string) => {
    const trimmed = word.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const res = await fetch(
        `/api/dictionary?word=${encodeURIComponent(trimmed)}`,
      );
      if (!res.ok) {
        setResults([]);
        setError(t("dict.noResults"));
        return;
      }
      const data: DictionaryEntry[] = await res.json();
      setResults(data);
    } catch {
      setError(t("dict.error"));
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    search(query);
  };

  const cardClass =
    "relative overflow-hidden rounded-2xl border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)]/80 backdrop-blur-xl shadow-lg";

  return (
    <div className="space-y-6 pb-24" dir="ltr">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--dash-text)] flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-[var(--dash-accent)]" />
          {t("sidebar.dictionary")}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--dash-muted)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("dict.search")}
          className="w-full pl-12 pr-14 py-4 rounded-2xl border border-[var(--dash-muted)]/20 bg-[var(--dash-sides)]/80 backdrop-blur-xl text-[var(--dash-text)] placeholder:text-[var(--dash-muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--dash-accent)]/50 text-lg transition-all"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-[var(--dash-accent)] text-white disabled:opacity-40 hover:bg-[var(--dash-accent)]/80 transition-all">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ArrowRight className="h-5 w-5" />
          )}
        </button>
      </form>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--dash-accent)]" />
          </motion.div>
        )}

        {!loading && error && searched && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`${cardClass} p-8 text-center`}>
            <p className="text-[var(--dash-muted)] text-lg">{error}</p>
          </motion.div>
        )}

        {!loading && results.length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4">
            {results.map((entry, idx) => (
              <div key={idx} className={`${cardClass} p-6`}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl font-extrabold text-[var(--dash-text)]">
                    {entry.word}
                  </h2>
                  {entry.phonetic && (
                    <span className="text-sm text-[var(--dash-muted)] bg-[var(--hover-bg)] px-3 py-1 rounded-full">
                      {entry.phonetic}
                    </span>
                  )}
                </div>

                {entry.synonyms.length > 0 && (
                  <div className="mb-4 flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold text-[var(--dash-muted)]">
                      {t("dict.synonyms")}:
                    </span>
                    {entry.synonyms.slice(0, 6).map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setQuery(s);
                          search(s);
                        }}
                        className="px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium hover:bg-green-500/20 transition-all cursor-pointer">
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {entry.antonyms.length > 0 && (
                  <div className="mb-4 flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold text-[var(--dash-muted)]">
                      {t("dict.antonyms")}:
                    </span>
                    {entry.antonyms.slice(0, 6).map((a) => (
                      <button
                        key={a}
                        onClick={() => {
                          setQuery(a);
                          search(a);
                        }}
                        className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all cursor-pointer">
                        {a}
                      </button>
                    ))}
                  </div>
                )}

                <div className="space-y-5">
                  {entry.meanings.map((meaning, mi) => (
                    <div key={mi}>
                      <span className="inline-block px-3 py-1 rounded-full bg-[var(--dash-accent)]/10 text-[var(--dash-accent)] text-xs font-bold uppercase mb-2">
                        {meaning.partOfSpeech}
                      </span>
                      <ol className="space-y-2 list-decimal list-inside">
                        {meaning.definitions.slice(0, 3).map((def, di) => (
                          <li
                            key={di}
                            className="text-sm text-[var(--dash-text)]/80 leading-relaxed">
                            {def}
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {!loading && !searched && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${cardClass} p-12 text-center`}>
            <BookOpen className="h-16 w-16 mx-auto text-[var(--dash-muted)]/30 mb-4" />
            <p className="text-[var(--dash-muted)] text-lg">
              {t("dict.search")}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
