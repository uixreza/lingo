"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Save,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Check,
  GraduationCap,
  Languages,
  Award,
  Banknote,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageSkeleton } from "@/components/dashboard/Skeletons";
import toast from "react-hot-toast";

type Mentor = {
  id: number;
  name: string;
  title: string | null;
  photoUrl: string | null;
  bio: string | null;
  certifications: string[];
  languages: string[];
  experience: string | null;
  education: string | null;
};

const EMPTY: Mentor = {
  id: 0,
  name: "",
  title: "",
  photoUrl: null,
  bio: "",
  certifications: [],
  languages: [],
  experience: "",
  education: "",
};

const FIXED_LANGS = [
  { code: "en", label: "English", fa: "انگلیسی", flag: "🇬🇧" },
  { code: "de", label: "German", fa: "آلمانی", flag: "🇩🇪" },
  { code: "tr", label: "Turkish", fa: "ترکی", flag: "🇹🇷" },
];

const FIXED_CERTS = ["TTC", "TOEFL", "TESOL", "IELTS", "DUOLINGO"];

const inputClass =
  "w-full bg-[var(--dash-bg)]/70 text-[var(--dash-text)] rounded-xl px-4 py-3 text-sm outline-none border border-[var(--dash-muted)]/15 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.22)] transition-all placeholder:text-[var(--dash-muted)]/60";
const labelClass =
  "block text-sm font-medium text-[var(--dash-muted)] mb-2";

const cardClass =
  "relative overflow-hidden rounded-2xl border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-bg)]/40 p-6";
const accentBar =
  "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent";

const iconTile =
  "p-2 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400";

export default function MentorTab() {
  const [mentor, setMentor] = useState<Mentor>(EMPTY);
  const [accountName, setAccountName] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [discountPercentInput, setDiscountPercentInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/admin/mentor");
        if (!res.ok) return;
        const data = await res.json();
        if (data.mentor) setMentor(data.mentor);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    void run();
    fetch("/api/account")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && typeof d.name === "string") setAccountName(d.name);
      })
      .catch(() => {});
    fetch("/api/sessions/price")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        if (typeof d.privatePrice === "number") {
          setPriceInput(String(d.privatePrice));
        }
        if (typeof d.discountPercent === "number") {
          setDiscountPercentInput(String(d.discountPercent));
        }
      })
      .catch(() => {});
  }, []);

  const update = (patch: Partial<Mentor>) =>
    setMentor((prev) => ({ ...prev, ...patch }));

  const toggleLang = (code: string) => {
    const lang = FIXED_LANGS.find((l) => l.code === code);
    if (!lang) return;
    const next = mentor.languages.includes(lang.label)
      ? mentor.languages.filter((l) => l !== lang.label)
      : [...mentor.languages, lang.label];
    update({ languages: next });
  };

  const toggleCert = (cert: string) => {
    const next = mentor.certifications.includes(cert)
      ? mentor.certifications.filter((c) => c !== cert)
      : [...mentor.certifications, cert];
    update({ certifications: next });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/mentor/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.url) {
        update({ photoUrl: data.url });
        toast.success("عکس با موفقیت آپلود شد");
      } else {
        toast.error(data?.error ?? "خطا در آپلود تصویر");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const persistMentor = async (patch: Partial<Mentor>): Promise<boolean> => {
    try {
      const res = await fetch("/api/admin/mentor", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...mentor, ...patch }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.error ?? "خطا در ذخیره اطلاعات");
        return false;
      }
      if (data.mentor) setMentor(data.mentor);
      return true;
    } catch {
      toast.error("خطا در ارتباط با سرور");
      return false;
    }
  };

  const persistPrice = async (): Promise<boolean> => {
    const digits = priceInput
      .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
      .replace(/\D/g, "");
    const discountDigits = discountPercentInput
      .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
      .replace(/\D/g, "");
    let p = 0;
    if (digits !== "") {
      p = parseInt(digits, 10);
      if (!Number.isFinite(p) || p < 0) {
        toast.error("قیمت کلاس خصوصی معتبر نیست");
        return false;
      }
    }
    const discount = discountDigits === "" ? 0 : parseInt(discountDigits, 10);
    if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
      toast.error("درصد تخفیف باید بین ۰ تا ۱۰۰ باشد");
      return false;
    }
    try {
      const res = await fetch("/api/sessions/price", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ privatePrice: p, discountPercent: discount }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.error ?? "خطا در ذخیره قیمت");
        return false;
      }
      if (typeof data?.privatePrice === "number") {
        setPriceInput(String(data.privatePrice));
      }
      if (typeof data?.discountPercent === "number") {
        setDiscountPercentInput(String(data.discountPercent));
      }
      return true;
    } catch {
      toast.error("خطا در ارتباط با سرور");
      return false;
    }
  };

  const handleSave = async () => {
    const name = mentor.name.trim() || accountName.trim();
    if (!name) {
      toast.error("نام کامل در تب پروفایل تنظیم نشده است");
      return;
    }
    setSaving(true);
    const res = await Promise.all([
      persistMentor({ name }),
      persistPrice(),
    ]);
    setSaving(false);
    if (res.every(Boolean)) toast.success("اطلاعات با موفقیت ذخیره شد");
  };

  const handleDeletePhoto = async () => {
    setSaving(true);
    const ok = await persistMentor({ photoUrl: null });
    setSaving(false);
    if (ok) {
      update({ photoUrl: null });
      toast.success("عکس با موفقیت حذف شد");
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-green-500/10">
            <GraduationCap className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--dash-text)]">
              اطلاعات مدرس
            </h2>
            <p className="text-xs text-[var(--dash-muted)] mt-1">
              این اطلاعات در صفحه جلسات برای دانشجوها نمایش داده می‌شود
            </p>
          </div>
        </div>
        <motion.button
          whileHover={saving || uploading ? {} : { scale: 1.02 }}
          whileTap={saving || uploading ? {} : { scale: 0.98 }}
          onClick={handleSave}
          disabled={saving || uploading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-black transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-l from-green-500 to-emerald-500 shadow-lg shadow-green-500/25 hover:shadow-green-500/40">
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "در حال ذخیره..." : "ذخیره"}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 gap-6 items-start">
        {/* Side column: photo + languages */}
        <div className="space-y-6">
          <div className={cardClass}>
            <div className={accentBar} />
            <div className="flex items-center gap-2 mb-4">
              <div className={iconTile}>
                <ImageIcon className="h-4 w-4" />
              </div>
              <label className="text-sm font-bold text-[var(--dash-text)]">
                عکس پروفایل
              </label>
            </div>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative aspect-square max-w-xs mx-auto rounded-2xl border-2 border-dashed border-[var(--dash-muted)]/30 bg-[var(--dash-bg)]/60 flex items-center justify-center cursor-pointer hover:border-green-500/50 transition-colors overflow-hidden">
              {mentor.photoUrl ? (
                <Image
                  src={mentor.photoUrl}
                  alt="عکس مدرس"
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="text-center px-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--hover-bg)] flex items-center justify-center mx-auto mb-2">
                    <ImageIcon className="h-6 w-6 text-[var(--dash-muted)]" />
                  </div>
                  <p className="text-xs text-[var(--dash-muted)]">
                    {uploading
                      ? "در حال آپلود..."
                      : "کلیک کنید تا عکس مدرس را آپلود کنید"}
                  </p>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              )}
              {mentor.photoUrl && !uploading && (
                <button
                  onClick={handleDeletePhoto}
                  disabled={saving}
                  title="حذف عکس"
                  className="absolute bottom-2 left-2 p-2.5 rounded-xl bg-black/60 text-red-400 backdrop-blur-md border border-white/10 hover:bg-red-500 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
          </div>

          <div className={cardClass}>
            <div className={accentBar} />
            <div className="flex items-center gap-2 mb-4">
              <div className={iconTile}>
                <Languages className="h-4 w-4" />
              </div>
              <label className="text-sm font-bold text-[var(--dash-text)]">
                زبان‌های تدریس
              </label>
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {FIXED_LANGS.map((lang) => {
                const active = (mentor.languages ?? []).includes(lang.label);
                return (
                  <motion.button
                    key={lang.code}
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleLang(lang.code)}
                    className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200 border ${
                      active
                        ? "bg-green-500/10 border-green-500/50 text-[var(--dash-text)] shadow-lg shadow-green-500/5"
                        : "bg-[var(--dash-bg)]/60 border-transparent text-[var(--dash-muted)] hover:border-[var(--dash-muted)]/30 hover:bg-[var(--dash-bg)]"
                    }`}>
                    <span className="flex items-center gap-2.5">
                      <span className="text-lg leading-none">{lang.flag}</span>
                      <span className="font-semibold">{lang.label}</span>
                      <span className="text-xs text-[var(--dash-muted)]">
                        {lang.fa}
                      </span>
                    </span>
                    <span
                      className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        active
                          ? "bg-green-500 border-green-500 text-black"
                          : "border-[var(--dash-muted)]/40 text-transparent"
                      }`}>
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main column: fields */}
        <div className="space-y-6">
          <div className={cardClass}>
            <div className={accentBar} />
            <label className={labelClass}>عنوان / تخصص</label>
            <input
              value={mentor.title ?? ""}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="مثلاً مدرس زبان انگلیسی"
              className={inputClass}
            />
          </div>

          <div className={cardClass}>
            <div className={accentBar} />
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>سابقه تدریس</label>
                <input
                  value={mentor.experience ?? ""}
                  onChange={(e) => update({ experience: e.target.value })}
                  placeholder="مثلاً ۳ سال سابقه تدریس"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>دانشگاه / تحصیلات</label>
                <input
                  value={mentor.education ?? ""}
                  onChange={(e) => update({ education: e.target.value })}
                  placeholder="مثلاً دانشگاه بجنورد"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <div className={accentBar} />
            <label className={labelClass}>درباره مدرس</label>
            <textarea
              value={mentor.bio ?? ""}
              onChange={(e) => update({ bio: e.target.value })}
              rows={5}
              placeholder="توضیح کوتاهی درباره مدرس بنویسید..."
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className={cardClass}>
            <div className={accentBar} />
            <div className="flex items-center gap-2 mb-4">
              <div className={iconTile}>
                <Award className="h-4 w-4" />
              </div>
              <label className="text-sm font-bold text-[var(--dash-text)]">
                مدارک و گواهینامه‌ها
              </label>
            </div>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {FIXED_CERTS.map((cert) => {
                const active = (mentor.certifications ?? []).includes(cert);
                return (
                  <motion.button
                    key={cert}
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleCert(cert)}
                    className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 border ${
                      active
                        ? "bg-green-500/10 border-green-500/50 text-[var(--dash-text)]"
                        : "bg-[var(--dash-bg)]/60 border-transparent text-[var(--dash-muted)] hover:border-[var(--dash-muted)]/30 hover:bg-[var(--dash-bg)]"
                    }`}>
                    {cert}
                    <span
                      className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        active
                          ? "bg-green-500 border-green-500 text-black"
                          : "border-[var(--dash-muted)]/40 text-transparent"
                      }`}>
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className={cardClass}>
            <div className={accentBar} />
            <div className="flex items-center gap-2 mb-4">
              <div className={iconTile}>
                <Banknote className="h-4 w-4" />
              </div>
              <label className="text-sm font-bold text-[var(--dash-text)]">
                قیمت کلاس خصوصی
              </label>
            </div>
            <div className="relative max-w-sm">
              <input
                value={priceInput}
                onChange={(e) =>
                  setPriceInput(e.target.value.replace(/[^0-9۰-۹]/g, ""))
                }
                inputMode="numeric"
                placeholder="مثلاً 350000"
                className={`${inputClass} pl-16`}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[var(--dash-muted)] font-medium">
                تومان
              </span>
            </div>
            <div className="mt-3 text-xs text-[var(--dash-muted)]">
              {priceInput.replace(/[۰-۹]/g, (d) =>
                String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)),
              )
                ? Number(
                    priceInput
                      .replace(/[۰-۹]/g, (d) =>
                        String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)),
                      )
                      .replace(/\D/g, ""),
                  ).toLocaleString("fa-IR") + " تومان"
                : "مبلغ را وارد کنید"}
            </div>

            <div className="mt-5 pt-5 border-t border-[var(--dash-muted)]/10">
              <label className={labelClass}>درصد تخفیف</label>
              <div className="relative max-w-sm">
                <input
                  value={discountPercentInput}
                  onChange={(e) =>
                    setDiscountPercentInput(
                      e.target.value.replace(/[^0-9۰-۹]/g, ""),
                    )
                  }
                  inputMode="numeric"
                  placeholder="مثلاً 20"
                  className={`${inputClass} pl-12`}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[var(--dash-muted)] font-medium">
                  ٪
                </span>
              </div>
              <div className="mt-2 text-xs text-[var(--dash-muted)]">
                {discountPercentInput.replace(/[۰-۹]/g, (d) =>
                  String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)),
                )
                  ? (() => {
                      const price = Number(
                        priceInput
                          .replace(/[۰-۹]/g, (d) =>
                            String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)),
                          )
                          .replace(/\D/g, ""),
                      );
                      const discount = Number(
                        discountPercentInput
                          .replace(/[۰-۹]/g, (d) =>
                            String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)),
                          )
                          .replace(/\D/g, ""),
                      );
                      if (!price || !discount) {
                        return `${discount}٪ تخفیف اعمال می‌شود`;
                      }
                      const finalPrice = Math.round(
                        (price * (100 - discount)) / 100,
                      );
                      return `${discount}٪ تخفیف → قیمت نهایی ${finalPrice.toLocaleString("fa-IR")} تومان`;
                    })()
                  : "۰٪ به معنای بدون تخفیف است"}
              </div>
              <p className="mt-1 text-xs text-[var(--dash-muted)]/70">
                این تخفیف هنگام رزرو کلاس خصوصی به دانشجو نمایش داده می‌شود
              </p>
            </div>
            <p className="mt-3 text-xs text-[var(--dash-muted)]/70">
              این مبلغ هنگام رزرو کلاس خصوصی از دانشجو دریافت می‌شود
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}