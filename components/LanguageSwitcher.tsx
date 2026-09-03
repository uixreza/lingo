"use client";

import { useLang } from "@/contexts/LanguageContext";
import { locales, localeNames, type Locale } from "@/i18n";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLang();

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
      <Globe className="h-3.5 w-3.5 text-[#888] mx-1" />
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
            locale === l
              ? "bg-green-500 text-black"
              : "text-[#888] hover:text-white hover:bg-white/10"
          }`}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
