import fa from "./fa";
import en from "./en";

export const locales = ["fa", "en"] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  fa: "فارسی",
  en: "English",
};

export const translations = { fa, en } as const;

export type TranslationKey = keyof typeof fa;
