"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Loader2,
  Plus,
  Zap,
  Trash2,
  X,
  Check,
  ChevronUp,
  ChevronDown,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

interface Word {
  id: number;
  word: string;
  definition: string;
  example: string;
  partOfSpeech: string | null;
  updatedAt: string;
}

interface PhrasalVerb {
  id: number;
  phrasalVerb: string;
  definition: string;
  example: string;
  updatedAt: string;
}

const inputClass =
  "w-full bg-[var(--dash-bg)]/70 text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm outline-none border border-[var(--dash-muted)]/15 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.22)] transition-all placeholder:text-[var(--dash-muted)]/60";
const labelClass = "block text-xs font-medium text-[var(--dash-muted)] mb-1.5";

const WHEEL_ITEM_HEIGHT = 68;
const VISIBLE_ITEMS = 5;

function WheelSelector<T extends { id: number; definition: string }>({
  items,
  activeIndex,
  onSelect,
  onActivate,
  onDelete,
  getLabel,
  color,
}: {
  items: T[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onActivate: (item: T) => void;
  onDelete: (item: T) => void;
  getLabel: (item: T) => string;
  color: "green" | "purple";
}) {
  const half = Math.floor(VISIBLE_ITEMS / 2);
  const isGreen = color === "green";

  const scrollUp = () => {
    if (activeIndex > 0) onSelect(activeIndex - 1);
  };

  const scrollDown = () => {
    if (activeIndex < items.length - 1) onSelect(activeIndex + 1);
  };

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-72 rounded-2xl border border-dashed border-[var(--dash-muted)]/20">
        <p className="text-sm text-[var(--dash-muted)]">No items yet</p>
      </div>
    );
  }

  const offset = -activeIndex * WHEEL_ITEM_HEIGHT;

  return (
    <div className="relative h-72 flex flex-col items-center">
      {/* Highlight bar for center */}
      <div
        className="absolute rounded-xl pointer-events-none transition-all duration-300"
        style={{
          top: "50%",
          left: "5%",
          right: "5%",
          height: WHEEL_ITEM_HEIGHT - 8,
          transform: "translateY(-50%)",
          backgroundColor: isGreen ? "rgba(34,197,94,0.06)" : "rgba(168,85,247,0.06)",
          border: `1px solid ${isGreen ? "rgba(34,197,94,0.25)" : "rgba(168,85,247,0.25)"}`,
        }}
      />

      {/* Top fade */}
      <div className="absolute top-0 inset-x-0 h-14 bg-gradient-to-b from-[var(--dash-sides)] to-transparent z-10 pointer-events-none rounded-t-2xl" />
      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-[var(--dash-sides)] to-transparent z-10 pointer-events-none rounded-b-2xl" />

      {/* Scroll up button */}
      <button
        onClick={scrollUp}
        disabled={activeIndex === 0}
        className="absolute top-0 z-20 p-1.5 rounded-full bg-[var(--hover-bg-strong)] hover:bg-[var(--hover-bg)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
        <ChevronUp className="h-4 w-4 text-[var(--dash-text)]" />
      </button>

      {/* Wheel container */}
      <div
        className="flex-1 w-full overflow-hidden relative"
        style={{ paddingTop: (WHEEL_ITEM_HEIGHT * VISIBLE_ITEMS) / 2 - WHEEL_ITEM_HEIGHT / 2 }}>
        <div
          className="w-full transition-transform duration-300 ease-out"
          style={{ transform: `translateY(${offset}px)` }}>
          {items.map((item, index) => {
            const distance = Math.abs(index - activeIndex);
            const isCenter = index === activeIndex;
            const scale = isCenter ? 1 : Math.max(0.78, 1 - distance * 0.06);
            const opacity = isCenter ? 1 : Math.max(0.25, 1 - distance * 0.25);
            const blur = isCenter ? 0 : Math.min(distance * 2, 4);

            return (
              <div
                key={item.id}
                onClick={() => onSelect(index)}
                className="w-full px-3 cursor-pointer"
                style={{ height: WHEEL_ITEM_HEIGHT }}>
                <div
                  className="h-full flex items-center justify-between px-4 rounded-xl border transition-all duration-200"
                  style={{
                    opacity,
                    transform: `scale(${scale})`,
                    filter: `blur(${blur}px)`,
                    borderColor: isCenter
                      ? isGreen ? "rgba(34,197,94,0.35)" : "rgba(168,85,247,0.35)"
                      : "rgba(128,128,128,0.1)",
                    backgroundColor: isCenter
                      ? isGreen ? "rgba(34,197,94,0.08)" : "rgba(168,85,247,0.08)"
                      : isGreen ? "rgba(34,197,94,0.03)" : "rgba(168,85,247,0.03)",
                  }}>
                  <div className="min-w-0 flex-1">
                    <p
                      className="font-bold text-sm truncate"
                      style={{ color: "var(--dash-text)" }}>
                      {getLabel(item)}
                    </p>
                    <p
                      className="text-xs truncate"
                      style={{ color: "var(--dash-muted)" }}>
                      {item.definition}
                    </p>
                  </div>
                  {isCenter && (
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onActivate(item);
                        }}
                        className="p-1.5 rounded-lg hover:bg-[var(--hover-bg)] transition-colors"
                        aria-label="Activate">
                        <Zap className="h-3.5 w-3.5 text-amber-500" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item);
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                        aria-label="Delete">
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scroll down button */}
      <button
        onClick={scrollDown}
        disabled={activeIndex === items.length - 1}
        className="absolute bottom-0 z-20 p-1.5 rounded-full bg-[var(--hover-bg-strong)] hover:bg-[var(--hover-bg)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
        <ChevronDown className="h-4 w-4 text-[var(--dash-text)]" />
      </button>
    </div>
  );
}

export default function WeeklyContentPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [phrasalVerbs, setPhrasalVerbs] = useState<PhrasalVerb[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    kind: string;
    id: number;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [wordForm, setWordForm] = useState({
    word: "",
    definition: "",
    example: "",
    partOfSpeech: "",
  });
  const [phraseForm, setPhraseForm] = useState({
    phrasalVerb: "",
    definition: "",
    example: "",
  });

  const [editingWord, setEditingWord] = useState<number | null>(null);
  const [editingPhrase, setEditingPhrase] = useState<number | null>(null);

  const [wordIndex, setWordIndex] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);

  const [panelTopic, setPanelTopic] = useState("");
  const [panelLink, setPanelLink] = useState("");
  const [panelSaving, setPanelSaving] = useState(false);
  const [panelLoading, setPanelLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/management/weekly");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setWords(data.words);
      setPhrasalVerbs(data.phrasalVerbs);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (words.length > 0 && wordIndex >= words.length) {
      setWordIndex(words.length - 1);
    }
  }, [words.length, wordIndex]);

  useEffect(() => {
    if (phrasalVerbs.length > 0 && phraseIndex >= phrasalVerbs.length) {
      setPhraseIndex(phrasalVerbs.length - 1);
    }
  }, [phrasalVerbs.length, phraseIndex]);

  useEffect(() => {
    const fetchPanel = async () => {
      setPanelLoading(true);
      try {
        const res = await fetch("/api/admin/panel-discussion");
        if (res.ok) {
          const data = await res.json();
          setPanelTopic(data.topic ?? "");
          setPanelLink(data.link ?? "");
        }
      } catch {
        // silent
      } finally {
        setPanelLoading(false);
      }
    };
    void fetchPanel();
  }, []);

  const handleSavePanel = async () => {
    setPanelSaving(true);
    try {
      const res = await fetch("/api/admin/panel-discussion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: panelTopic, link: panelLink }),
      });
      if (res.ok) {
        toast.success("Panel discussion saved");
      } else {
        toast.error("Failed to save");
      }
    } catch {
      toast.error("Connection error");
    } finally {
      setPanelSaving(false);
    }
  };

  const handleDeletePanel = async () => {
    setPanelSaving(true);
    try {
      const res = await fetch("/api/admin/panel-discussion", {
        method: "DELETE",
      });
      if (res.ok) {
        setPanelTopic("");
        setPanelLink("");
        toast.success("Panel discussion deleted");
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Connection error");
    } finally {
      setPanelSaving(false);
    }
  };

  const handleSaveWord = async () => {
    if (!wordForm.word || !wordForm.definition || !wordForm.example) {
      toast.error("Please fill all fields");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/management/weekly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "word", id: editingWord, ...wordForm }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(editingWord ? "Word updated" : "Word added");
      setWordForm({ word: "", definition: "", example: "", partOfSpeech: "" });
      setEditingWord(null);
      fetchData();
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePhrase = async () => {
    if (!phraseForm.phrasalVerb || !phraseForm.definition || !phraseForm.example) {
      toast.error("Please fill all fields");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/management/weekly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "phrasalVerb",
          id: editingPhrase,
          ...phraseForm,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(editingPhrase ? "Phrasal verb updated" : "Phrasal verb added");
      setPhraseForm({ phrasalVerb: "", definition: "", example: "" });
      setEditingPhrase(null);
      fetchData();
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/management/weekly", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deleteTarget),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Deleted");
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const cancelEdit = () => {
    setEditingWord(null);
    setEditingPhrase(null);
    setWordForm({ word: "", definition: "", example: "", partOfSpeech: "" });
    setPhraseForm({ phrasalVerb: "", definition: "", example: "" });
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-green-500/10">
          <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <h1
          className="text-xl font-bold"
          style={{ color: "var(--dash-text)" }}>
          Weekly Content Management
        </h1>
      </motion.div>

      {/* Words Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)]/80 backdrop-blur-xl shadow-lg">
        <div className="p-5 border-b border-[var(--dash-muted)]/10">
          <div className="flex items-center justify-between">
            <h2
              className="text-base font-bold"
              style={{ color: "var(--dash-text)" }}>
              Weekly Words
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400">
              {words.length} items
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Left: Wheel */}
          <div className="p-5 border-b lg:border-b-0 lg:border-r border-[var(--dash-muted)]/10">
            {loading ? (
              <div className="flex items-center justify-center h-72">
                <Loader2 className="h-6 w-6 text-green-500 animate-spin" />
              </div>
            ) : (
              <WheelSelector
                items={words}
                activeIndex={wordIndex}
                onSelect={setWordIndex}
                onActivate={(w) => toast.success(`"${w.word}" activated`)}
                onDelete={(w) => setDeleteTarget({ kind: "word", id: w.id })}
                getLabel={(w) => w.word}
                color="green"
              />
            )}
          </div>

          {/* Right: Inputs */}
          <div className="p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Word</label>
                <input
                  className={inputClass}
                  placeholder="e.g. abundance"
                  value={wordForm.word}
                  onChange={(e) =>
                    setWordForm((f) => ({ ...f, word: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Definition</label>
                <input
                  className={inputClass}
                  placeholder="e.g. a very large quantity"
                  value={wordForm.definition}
                  onChange={(e) =>
                    setWordForm((f) => ({ ...f, definition: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className={labelClass}>Example</label>
                <input
                  className={inputClass}
                  placeholder="e.g. There is an abundance of food."
                  value={wordForm.example}
                  onChange={(e) =>
                    setWordForm((f) => ({ ...f, example: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Part of Speech</label>
                <input
                  className={inputClass}
                  placeholder="noun, verb..."
                  value={wordForm.partOfSpeech}
                  onChange={(e) =>
                    setWordForm((f) => ({ ...f, partOfSpeech: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSaveWord}
                disabled={saving}
                className="flex items-center justify-center gap-2 flex-1 py-3 rounded-xl font-bold text-black transition-all duration-300 bg-gradient-to-l from-green-500 to-emerald-500 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingWord ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {editingWord ? "Update" : "Add"}
              </button>
              {editingWord && (
                <button
                  onClick={cancelEdit}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[var(--dash-muted)]/30 text-sm font-semibold text-[var(--dash-muted)] hover:bg-[var(--dash-bg)] transition-all duration-300">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Phrasal Verbs Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)]/80 backdrop-blur-xl shadow-lg">
        <div className="p-5 border-b border-[var(--dash-muted)]/10">
          <div className="flex items-center justify-between">
            <h2
              className="text-base font-bold"
              style={{ color: "var(--dash-text)" }}>
              Weekly Phrasal Verbs
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400">
              {phrasalVerbs.length} items
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Left: Wheel */}
          <div className="p-5 border-b lg:border-b-0 lg:border-r border-[var(--dash-muted)]/10">
            {loading ? (
              <div className="flex items-center justify-center h-72">
                <Loader2 className="h-6 w-6 text-purple-500 animate-spin" />
              </div>
            ) : (
              <WheelSelector
                items={phrasalVerbs}
                activeIndex={phraseIndex}
                onSelect={setPhraseIndex}
                onActivate={(p) => toast.success(`"${p.phrasalVerb}" activated`)}
                onDelete={(p) =>
                  setDeleteTarget({ kind: "phrasalVerb", id: p.id })
                }
                getLabel={(p) => p.phrasalVerb}
                color="purple"
              />
            )}
          </div>

          {/* Right: Inputs */}
          <div className="p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Phrasal Verb</label>
                <input
                  className={inputClass}
                  placeholder="e.g. give up"
                  value={phraseForm.phrasalVerb}
                  onChange={(e) =>
                    setPhraseForm((f) => ({
                      ...f,
                      phrasalVerb: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Definition</label>
                <input
                  className={inputClass}
                  placeholder="e.g. to stop trying"
                  value={phraseForm.definition}
                  onChange={(e) =>
                    setPhraseForm((f) => ({ ...f, definition: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Example</label>
              <input
                className={inputClass}
                placeholder="e.g. She gave up smoking last year."
                value={phraseForm.example}
                onChange={(e) =>
                  setPhraseForm((f) => ({ ...f, example: e.target.value }))
                }
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSavePhrase}
                disabled={saving}
                className="flex items-center justify-center gap-2 flex-1 py-3 rounded-xl font-bold text-black transition-all duration-300 bg-gradient-to-l from-green-500 to-emerald-500 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingPhrase ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {editingPhrase ? "Update" : "Add"}
              </button>
              {editingPhrase && (
                <button
                  onClick={cancelEdit}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[var(--dash-muted)]/30 text-sm font-semibold text-[var(--dash-muted)] hover:bg-[var(--dash-bg)] transition-all duration-300">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Panel Discussion Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)]/80 backdrop-blur-xl shadow-lg">
        <div className="p-5 border-b border-[var(--dash-muted)]/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10">
              <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2
              className="text-base font-bold"
              style={{ color: "var(--dash-text)" }}>
              Panel Discussion
            </h2>
          </div>
        </div>

        <div className="p-5">
          {panelLoading ? (
            <div className="flex items-center gap-2 text-sm text-[var(--dash-muted)]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Topic</label>
                <input
                  type="text"
                  value={panelTopic}
                  onChange={(e) => setPanelTopic(e.target.value)}
                  placeholder="Enter discussion topic..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Meeting Link</label>
                <input
                  type="url"
                  value={panelLink}
                  onChange={(e) => setPanelLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className={inputClass}
                  style={{ direction: "ltr" }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 mt-4">
            <button
              onClick={handleDeletePanel}
              disabled={panelSaving || panelLoading}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-red-500 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
            <button
              onClick={handleSavePanel}
              disabled={panelSaving || panelLoading}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-l from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {panelSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Save
            </button>
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--dash-sides)] rounded-2xl p-6 shadow-2xl border border-[var(--dash-muted)]/15 max-w-sm w-full mx-4">
              <p
                className="text-center font-bold text-lg mb-2"
                style={{ color: "var(--dash-text)" }}>
                Delete Item
              </p>
              <p
                className="text-center text-sm mb-6"
                style={{ color: "var(--dash-muted)" }}>
                Are you sure you want to delete this item?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50">
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : (
                    "Yes, Delete"
                  )}
                </button>
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-3 rounded-xl font-bold border border-[var(--dash-muted)]/30 text-[var(--dash-muted)] hover:bg-[var(--dash-bg)] transition-colors">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
