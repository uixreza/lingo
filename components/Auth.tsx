"use client";

import { useState, useEffect, useRef } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

type Tab = "login" | "signup";

export default function Auth() {
  const { isOpen, close } = useAuth();
  const [tab, setTab] = useState<Tab>("login");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] lg:flex lg:items-center lg:justify-center lg:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={close}
          />

          <div className="fixed bottom-0 inset-x-0 z-[100] max-h-[92dvh] overflow-y-auto bg-white/5 backdrop-blur-2xl border border-white/10 rounded-t-3xl p-5 sm:p-8 shadow-2xl animate-[sheet-up_0.3s_ease-out] lg:static lg:animate-none lg:rounded-3xl lg:w-full lg:max-w-md">
            {/* Drag Handle (mobile only) */}
            <div className="flex justify-center pt-0 pb-3 lg:hidden">
              <div className="w-12 h-1.5 bg-white/25 rounded-full" />
            </div>

            <div className="flex mb-8 rounded-xl bg-white/5 p-1">
              <motion.button
                onClick={() => setTab("login")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === "login"
                    ? "bg-green-500 text-black"
                    : "text-[#888] hover:text-white"
                }`}>
                ورود
              </motion.button>
              <motion.button
                onClick={() => setTab("signup")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === "signup"
                    ? "bg-green-500 text-black"
                    : "text-[#888] hover:text-white"
                }`}>
                ثبت‌نام
              </motion.button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}>
                {tab === "login" ? (
                  <LoginForm close={close} />
                ) : (
                  <SignupForm close={close} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LoginForm({ close }: { close: () => void }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loginMode, setLoginMode] = useState<"password" | "otp">("password");
  const [phoneError, setPhoneError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [timer, setTimer] = useState(300);
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const canResend = timer <= 0;
  const otpCooldown = loginMode === "otp" && timer > 0;

  useEffect(() => {
    if (!showOtp || timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer, showOtp]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...otp];
    for (let i = 0; i < 6; i++) next[i] = data[i] || "";
    setOtp(next);
    const nextFocus = Math.min(data.length, 5);
    inputsRef.current[nextFocus]?.focus();
  };

  const handleSwitchToOtp = () => {
    if (phone.length !== 11) {
      setPhoneError("لطفاً ابتدا شماره موبایل خود را وارد کنید");
      return;
    }
    setPhoneError("");
    setLoginMode("otp");
    setShowOtp(true);
    setTimer(300);
    setOtp(Array(6).fill(""));
    handleRequestOtp();
  };

  const handleRequestOtp = async () => {
    if (phone.length !== 11) {
      setPhoneError("لطفاً ابتدا شماره موبایل خود را وارد کنید");
      return;
    }
    setPhoneError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPhoneError(data.error);
        toast.error(data.error);
        return;
      }
      if (data.code) console.log("Login OTP:", data.code);
      setShowOtp(true);
      setTimer(300);
      setOtp(Array(6).fill(""));
      setTimeout(() => inputsRef.current[0]?.focus(), 100);
      toast.success(data.message);
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const allOtpFilled = otp.every((d) => d !== "");
  const canSubmit =
    loginMode === "password"
      ? phone.length === 11 && password.length >= 1
      : phone.length === 11 && allOtpFilled;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const inputStyle =
    "w-10 sm:w-11 h-12 sm:h-14 text-center text-lg sm:text-xl font-bold text-white bg-white/5 border border-white/10 rounded-xl outline-none focus:border-green-500/50 transition-colors";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoginError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        phone,
        ...(loginMode === "password"
          ? { password, mode: "password" }
          : { otp: otp.join(""), mode: "otp" }),
        redirect: false,
      });

      if (result?.error) {
        const bannedMsg =
          "حساب شما مسدود شده است؛ برای اطلاعات بیشتر با تیم پشتیبانی تماس بگیرید";
        try {
          const statusRes = await fetch(
            `/api/auth/status?phone=${encodeURIComponent(phone)}`,
          );
          const status = await statusRes.json();
          if (status?.banned) {
            setLoginError(bannedMsg);
            toast.error(bannedMsg);
            return;
          }
        } catch {
          // fall through to generic error
        }
        setLoginError("شماره موبایل یا رمز عبور اشتباه است");
        toast.error("شماره موبایل یا رمز عبور اشتباه است");
        return;
      }

      toast.success("با موفقیت وارد شدید");
      close();
      setTimeout(() => router.push("/dashboard"), 300);
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      className="flex flex-col gap-5"
      onSubmit={handleSubmit}>
      <Field label="شماره موبایل">
        <input
          type="tel"
          placeholder="مثلاً ۰۹۱۲۳۴۵۶۷۸۹"
          maxLength={11}
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value.replace(/\D/g, "").slice(0, 11));
            setPhoneError("");
          }}
          className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-[#555] text-sm outline-none transition-colors ${
            phoneError
              ? "border-red-500/60"
              : "border-white/10 focus:border-green-500/50"
          }`}
        />
        {phoneError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-xs mt-1.5 pr-1">
            {phoneError}
          </motion.p>
        )}
      </Field>

      {loginMode === "password" ? (
        <Field label="رمز عبور">
          <input
            type="password"
            autoComplete="new-password"
            placeholder="رمز عبور خود را وارد کنید"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[#555] text-sm outline-none focus:border-green-500/50 transition-colors"
          />
        </Field>
      ) : (
        showOtp && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}>
            <Field label="کد تأیید">
              <div
                className="flex flex-row-reverse items-center justify-between gap-2 sm:gap-2.5"
                onPaste={handleOtpPaste}>
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputsRef.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className={inputStyle}
                  />
                ))}
              </div>
              <div className="flex items-center justify-start mt-3 h-5">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={loading}
                    className="flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 transition-colors">
                    {loading ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <RefreshCw size={13} />
                    )}
                    ارسال مجدد کد
                  </button>
                ) : (
                  <span className="text-xs text-[#666]">
                    ارسال مجدد تا {formatTime(timer)}
                  </span>
                )}
              </div>
              {loginError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs mt-1.5 pr-1">
                  {loginError}
                </motion.p>
              )}
            </Field>
          </motion.div>
        )
      )}

      {loginError && loginMode === "password" && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-xs pr-1">
          {loginError}
        </motion.p>
      )}

      <div className="flex gap-3 items-center">
        <motion.button
          variants={{
            hidden: { opacity: 0, y: 12 },
            show: { opacity: 1, y: 0 },
          }}
          whileHover={canSubmit && !loading ? { scale: 1.02 } : undefined}
          whileTap={canSubmit && !loading ? { scale: 0.98 } : undefined}
          type="submit"
          disabled={!canSubmit || loading}
          className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
            canSubmit && !loading
              ? "bg-green-500 hover:bg-green-400 text-black cursor-pointer"
              : "bg-green-500/30 text-black/40 cursor-not-allowed"
          }`}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? "در حال ورود" : "ورود"}
        </motion.button>
        <motion.button
          variants={{
            hidden: { opacity: 0, y: 12 },
            show: { opacity: 1, y: 0 },
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={close}
          className="px-4 py-2 rounded-xl border border-white/10 text-[#888] hover:text-white hover:bg-white/5 text-xs font-medium">
          انصراف
        </motion.button>
      </div>

      <div className="relative my-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/5" />
        </div>
        <div className="relative flex justify-center">
          <span className=" px-3 text-xs text-[#555]">سایر روش‌ها</span>
        </div>
      </div>

      <motion.button
        variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
        whileHover={!otpCooldown && !loading ? { scale: 1.02 } : undefined}
        whileTap={!otpCooldown && !loading ? { scale: 0.98 } : undefined}
        type="button"
        onClick={handleSwitchToOtp}
        disabled={otpCooldown || loading}
        className={`w-full py-3 rounded-xl border font-medium text-sm transition-all duration-200 ${
          otpCooldown || loading
            ? "border-white/10 text-[#666] cursor-not-allowed"
            : "border-green-500/30 text-green-400 hover:bg-green-500/10 cursor-pointer"
        }`}>
        {otpCooldown ? `ارسال مجدد تا ${formatTime(timer)}` : "ورود با کد یکبار مصرف"}
      </motion.button>
    </motion.form>
  );
}

function SignupForm({ close }: { close: () => void }) {
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [timer, setTimer] = useState(300);
  const [agreed, setAgreed] = useState(true);
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const canResend = timer <= 0;

  useEffect(() => {
    if (!showOtp || timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer, showOtp]);

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...otp];
    for (let i = 0; i < 6; i++) next[i] = data[i] || "";
    setOtp(next);
    setOtpError(false);
    const nextFocus = Math.min(data.length, 5);
    inputsRef.current[nextFocus]?.focus();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const allOtpFilled = otp.every((d) => d !== "");
  const canSubmit =
    agreed &&
    fullName.trim().length >= 2 &&
    password.length >= 8 &&
    phone.length === 11 &&
    allOtpFilled;

  const inputStyle =
    "w-10 sm:w-11 h-12 sm:h-14 text-center text-lg sm:text-xl font-bold text-white bg-white/5 border border-white/10 rounded-xl outline-none focus:border-green-500/50 transition-colors";

  const handleRequestCode = async () => {
    if (phone.length !== 11) {
      setPhoneError("لطفاً ابتدا شماره موبایل خود را وارد کنید");
      return;
    }
    setPhoneError("");
    setSending(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullname: fullName, password, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPhoneError(data.error);
        toast.error(data.error);
        return;
      }
      if (data.code) console.log("OTP code:", data.code);
      setShowOtp(true);
      setTimer(300);
      setOtp(Array(6).fill(""));
      setTimeout(() => inputsRef.current[0]?.focus(), 100);
      toast.success(data.message);
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setSending(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setOtpError(false);
    if (digit && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setOtpError(false);
    setSubmitting(true);
    try {
      const code = otp.join("");
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: fullName,
          password,
          phone,
          otp: code,
        }),
      });
      if (!res.ok) {
        setOtpError(true);
        return;
      }
      toast.success("ثبت‌نام با موفقیت انجام شد. اکنون می‌توانید وارد شوید");
      setTimeout(close, 1500);
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.form
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      className="flex flex-col gap-5"
      onSubmit={handleSubmit}>
      {!showOtp && (
        <>
          <Field label="نام و نام خانوادگی">
            <input
              type="text"
              placeholder="نام و نام خانوادگی خود را وارد کنید"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[#555] text-sm outline-none focus:border-green-500/50 transition-colors"
            />
          </Field>

          <Field label="رمز عبور">
            <input
              type="password"
              placeholder="حداقل ۸ کاراکتر"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[#555] text-sm outline-none focus:border-green-500/50 transition-colors"
            />
          </Field>
        </>
      )}

      <Field label="شماره موبایل">
        <div className="flex gap-2">
          <input
            type="tel"
            placeholder="مثلاً ۰۹۱۲۳۴۵۶۷۸۹"
            maxLength={11}
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value.replace(/\D/g, "").slice(0, 11));
              setPhoneError("");
            }}
            className={`flex-1 px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-[#555] text-sm outline-none transition-colors ${
              phoneError
                ? "border-red-500/60"
                : "border-white/10 focus:border-green-500/50"
            }`}
          />
          <button
            type="button"
            onClick={handleRequestCode}
            disabled={showOtp || sending}
            className="shrink-0 px-4 py-3 rounded-xl bg-green-500 hover:bg-green-400 disabled:bg-green-500/30 disabled:cursor-not-allowed text-black font-semibold text-sm transition-all duration-200 active:scale-[0.98] flex items-center gap-2">
            {sending ? <Loader2 size={16} className="animate-spin" /> : null}
            {sending ? "در حال ارسال" : "دریافت کد"}
          </button>
        </div>
        {phoneError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-xs mt-1.5 pr-1">
            {phoneError}
          </motion.p>
        )}
      </Field>

      {showOtp && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}>
          <Field label="کد تأیید">
            <div
              className="flex flex-row-reverse items-center justify-between gap-2 sm:gap-2.5"
              onPaste={handleOtpPaste}>
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputsRef.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className={inputStyle}
                />
              ))}
            </div>
            <div className="flex items-center justify-start mt-3 h-5">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleRequestCode}
                  disabled={sending}
                  className="flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 transition-colors">
                  {sending ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <RefreshCw size={13} />
                  )}
                  ارسال مجدد کد
                </button>
              ) : (
                <span className="text-xs text-[#666]">
                  ارسال مجدد تا {formatTime(timer)}
                </span>
              )}
            </div>
            {otpError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-xs mt-1.5 pr-1">
                کد تأیید نامعتبر است
              </motion.p>
            )}
          </Field>
        </motion.div>
      )}

      <motion.label
        variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
        className="flex items-center gap-2 text-xs text-[#888] cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="w-4 h-4 rounded border-white/20 bg-white/5 text-green-500 accent-green-500 cursor-pointer"
        />
        <span>
          <Link href="/policy" target="_blank" className="underline underline-offset-2 hover:text-green-400 transition-colors">
            قوانین و مقررات
          </Link>
          {" را می‌پذیرم"}
        </span>
      </motion.label>

      <div className="flex gap-3 items-center">
        <motion.button
          variants={{
            hidden: { opacity: 0, y: 12 },
            show: { opacity: 1, y: 0 },
          }}
          whileHover={canSubmit && !submitting ? { scale: 1.02 } : undefined}
          whileTap={canSubmit && !submitting ? { scale: 0.98 } : undefined}
          type="submit"
          disabled={!canSubmit || submitting}
          className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
            canSubmit && !submitting
              ? "bg-green-500 hover:bg-green-400 text-black cursor-pointer"
              : "bg-green-500/30 text-black/40 cursor-not-allowed"
          }`}>
          {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
          {submitting ? "در حال ثبت‌نام" : "ثبت‌نام"}
        </motion.button>
        <motion.button
          variants={{
            hidden: { opacity: 0, y: 12 },
            show: { opacity: 1, y: 0 },
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={close}
          className="px-4 py-2 rounded-xl border border-white/10 text-[#888] hover:text-white hover:bg-white/5 text-xs font-medium">
          انصراف
        </motion.button>
      </div>
    </motion.form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div>
      <label className="block text-xs text-[#888] mb-1.5 pr-1">{label}</label>
      {children}
    </motion.div>
  );
}
