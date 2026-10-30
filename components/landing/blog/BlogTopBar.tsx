"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Check,
  Share2,
} from "lucide-react";

const SAVE_EVENT = "lingofam:save-sync";

function getSavedSnapshot(key: string) {
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function subscribeToSave(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(SAVE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(SAVE_EVENT, onChange);
  };
}

export default function BlogTopBar({ postId }: { postId: number }) {
  const storageKey = `lingofam-blog-save-${postId}`;
  const [copied, setCopied] = useState(false);

  const saved = useSyncExternalStore(
    subscribeToSave,
    () => getSavedSnapshot(storageKey),
    () => false,
  );

  function toggleSave() {
    try {
      const next = window.localStorage.getItem(storageKey) !== "1";
      window.localStorage.setItem(storageKey, next ? "1" : "0");
    } catch {
      window.dispatchEvent(new Event(SAVE_EVENT));
      return;
    }
    window.dispatchEvent(new Event(SAVE_EVENT));
  }

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const pill =
    "inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-2 text-sm text-[#ccc] backdrop-blur-sm transition-colors hover:border-green-500/40 hover:text-green-400";

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050505]/70 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-[#ccc] backdrop-blur-sm transition-colors hover:border-green-500/40 hover:text-green-400">
          <ArrowRight className="h-4 w-4" />
          بازگشت به وبلاگ
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSave}
            aria-pressed={saved}
            className={`${pill} ${saved ? "border-green-500/40 text-green-400" : ""}`}>
            {saved ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {saved ? "ذخیره شد" : "ذخیره"}
            </span>
          </button>

          <button type="button" onClick={share} className={pill}>
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {copied ? "کپی شد" : "اشتراک‌گذاری"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
