"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={close}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-md rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 p-5 sm:p-8 shadow-2xl mx-2 sm:mx-0">
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LoginForm({ close }: { close: () => void }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loginMode, setLoginMode] = useState<"password" | "otp">("password");
  const [phoneError, setPhoneError] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const resetTimer = useCallback(() => {
    setTimer(60);
    setCanResend(false);
  }, []);

  useEffect(() => {
    if (!showOtp || canResend) return;
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer, canResend, showOtp]);

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
    inputsRef.current[Math.min(data.length, 5)]?.focus();
  };

  const handleSwitchToOtp = () => {
    if (phone.length !== 11) {
      setPhoneError(true);
      return;
    }
    setPhoneError(false);
    setLoginMode("otp");
    setShowOtp(true);
    setTimer(60);
    setCanResend(false);
    setOtp(Array(6).fill(""));
    setTimeout(() => inputsRef.current[0]?.focus(), 100);
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

  return (
    <motion.form
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      className="flex flex-col gap-5"
      onSubmit={(e) => e.preventDefault()}>
      <Field label="شماره موبایل">
        <input
          type="tel"
          placeholder="مثلاً ۰۹۱۲۳۴۵۶۷۸۹"
          maxLength={11}
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value.replace(/\D/g, "").slice(0, 11));
            setPhoneError(false);
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
            لطفاً ابتدا شماره موبایل خود را وارد کنید
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
                    onClick={resetTimer}
                    className="flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 transition-colors">
                    <RefreshCw size={13} />
                    ارسال مجدد کد
                  </button>
                ) : (
                  <span className="text-xs text-[#666]">
                    ارسال مجدد تا {formatTime(timer)}
                  </span>
                )}
              </div>
            </Field>
          </motion.div>
        )
      )}

      <div className="flex gap-3 items-center">
        <motion.button
          variants={{
            hidden: { opacity: 0, y: 12 },
            show: { opacity: 1, y: 0 },
          }}
          whileHover={canSubmit ? { scale: 1.02 } : undefined}
          whileTap={canSubmit ? { scale: 0.98 } : undefined}
          type="submit"
          disabled={!canSubmit}
          className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
            canSubmit
              ? "bg-green-500 hover:bg-green-400 text-black cursor-pointer"
              : "bg-green-500/30 text-black/40 cursor-not-allowed"
          }`}>
          ورود
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
          <span className="bg-[#050505] px-3 text-xs text-[#555]">
            سایر روش‌ها
          </span>
        </div>
      </div>

      <motion.button
        variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={handleSwitchToOtp}
        className="w-full py-3 rounded-xl border border-green-500/30 text-green-400 hover:bg-green-500/10 font-medium text-sm transition-all duration-200">
        ورود با کد یکبار مصرف
      </motion.button>
    </motion.form>
  );
}

function SignupForm({ close }: { close: () => void }) {
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const resetTimer = useCallback(() => {
    setTimer(60);
    setCanResend(false);
  }, []);

  useEffect(() => {
    if (!showOtp || canResend) return;
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer, canResend, showOtp]);

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
    (!showOtp || allOtpFilled);

  const inputStyle =
    "w-10 sm:w-11 h-12 sm:h-14 text-center text-lg sm:text-xl font-bold text-white bg-white/5 border border-white/10 rounded-xl outline-none focus:border-green-500/50 transition-colors";

  const handleRequestCode = async () => {
    if (phone.length !== 11) {
      setPhoneError("لطفاً ابتدا شماره موبایل خود را وارد کنید");
      return;
    }
    setPhoneError("");
    setLoading(true);
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
      setTimer(60);
      setCanResend(false);
      setOtp(Array(6).fill(""));
      setTimeout(() => inputsRef.current[0]?.focus(), 100);
      toast.success(data.message);
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
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
    setLoading(true);
    try {
      const code = otp.join("");
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullname: fullName, password, phone, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(true);
        return;
      }
      toast.success("ثبت‌نام با موفقیت انجام شد. اکنون می‌توانید وارد شوید");
      setTimeout(close, 1500);
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
              phoneError ? "border-red-500/60" : "border-white/10 focus:border-green-500/50"
            }`}
          />
          <button
            type="button"
            onClick={handleRequestCode}
            disabled={showOtp || loading}
            className="shrink-0 px-4 py-3 rounded-xl bg-green-500 hover:bg-green-400 disabled:bg-green-500/30 disabled:cursor-not-allowed text-black font-semibold text-sm transition-all duration-200 active:scale-[0.98] flex items-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? "در حال ارسال" : "دریافت کد"}
          </button>
        </div>
        {phoneError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-xs mt-1.5 pr-1"
          >
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
                  disabled={loading}
                  className="flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 transition-colors">
                  {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
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
        <span>قوانین و مقررات را می‌پذیرم</span>
      </motion.label>

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
          {loading ? "در حال ثبت‌نام" : "ثبت‌نام"}
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
