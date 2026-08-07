"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Wallet,
  CreditCard,
  Shield,
  Zap,
  CheckCircle2,
  Loader2,
  Info,
  Copy,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type WalletData = {
  balance: number;
  lastCharge: number;
  isActive: boolean;
  transactionCount: number;
};

const cardClass =
  "relative overflow-hidden rounded-2xl border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)]/80 backdrop-blur-xl shadow-lg";
const accentBar =
  "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent";

export default function WalletPage() {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [chargeAmount, setChargeAmount] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [formattedAmount, setFormattedAmount] = useState("");
  const [isCharging, setIsCharging] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card-to-card" | "payment-gate">("card-to-card");
  const [copiedCard, setCopiedCard] = useState(false);

  const copyCardNumber = async () => {
    await navigator.clipboard.writeText("6219861910261931");
    setCopiedCard(true);
    setTimeout(() => setCopiedCard(false), 2000);
  };

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await fetch("/api/wallet");
        if (!res.ok) throw new Error("Failed to fetch wallet");
        const data: WalletData = await res.json();
        setWalletData(data);
      } catch (err) {
        console.error("Error fetching wallet:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWallet();
  }, []);

  // Format number with Persian commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("fa-IR").format(num);
  };

  // Convert Persian/Arabic digits to English digits
  const toEnglishDigits = (str: string) => {
    return str
      .replace(/[\u06F0-\u06F9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString())
      .replace(/[\u0660-\u0669]/g, (d) => "0123456789".indexOf(d).toString());
  };

  // Handle input change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const onlyDigits = value.replace(/[^\d\u06F0-\u06F9\u0660-\u0669]/g, "");
    const englishDigits = toEnglishDigits(onlyDigits);

    setChargeAmount(englishDigits);
    const numberValue = englishDigits ? parseInt(englishDigits, 10) : 0;
    setFormattedAmount(numberValue > 0 ? formatNumber(numberValue) : "");
  };

  // Handle charge
  const handleCharge = async () => {
    if (!chargeAmount || parseInt(chargeAmount) === 0) {
      alert("لطفا مبلغ مورد نظر را وارد کنید");
      return;
    }

    setIsCharging(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsCharging(false);
      // Redirect to payment gateway would happen here
      console.log(
        "Redirecting to payment gateway with amount:",
        parseInt(chargeAmount),
      );
    }, 2000);
  };

  const suggestedAmounts = [
    { amount: 50000, label: "۵۰ هزار" },
    { amount: 100000, label: "۱۰۰ هزار" },
    { amount: 200000, label: "۲۰۰ هزار" },
    { amount: 500000, label: "۵۰۰ هزار" },
    { amount: 1000000, label: "۱ میلیون" },
    { amount: 2000000, label: "۲ میلیون" },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start animate-pulse">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-[var(--light-purple)] to-[var(--dark-purple)]/60 h-52 shadow-2xl" />
          <div className={`${cardClass} p-6 space-y-3`}>
            <div className="h-5 w-32 mx-auto rounded bg-[var(--hover-bg-strong)]" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-[var(--hover-bg)]" />
            ))}
          </div>
        </div>
        <div className={`lg:col-span-3 ${cardClass} p-6`}>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-8 w-1 rounded-full bg-[var(--hover-bg-strong)]" />
            <div className="h-5 w-40 rounded bg-[var(--hover-bg-strong)]" />
          </div>
          <div className="h-12 rounded-xl bg-[var(--hover-bg)] mb-6" />
          <div className="h-44 rounded-xl bg-[var(--hover-bg)] mb-6" />
          <div className="h-14 rounded-xl bg-[var(--hover-bg)]" />
        </div>
      </div>
    );
  }

  const chargeEnabled =
    !!chargeAmount && parseInt(chargeAmount) > 0 && !isCharging;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
      {/* Right: Balance + Quick Stats */}
      <div className="lg:col-span-2 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--light-purple)] to-[var(--dark-purple)] p-6 shadow-2xl text-white">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('/assets/img/mazePattern.svg')] bg-cover"></div>
          </div>
          <div className="pointer-events-none absolute -top-20 -left-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Wallet className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold">موجودی فعلی</h2>
            </div>

            <div className="text-center mb-6">
              <div className="text-4xl font-bold mb-2">
                {formatNumber(walletData?.balance ?? 0)}
              </div>
              <div className="text-white/80 text-lg">تومان</div>
            </div>

            <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
              <Shield className="h-4 w-4" />
              <span>امن و قابل اعتماد</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className={`${cardClass} p-6`}>
          <div className={accentBar} />
          <h3 className="font-bold text-[var(--dash-text)] mb-5 text-center text-lg">
            اطلاعات سریع
          </h3>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between rounded-xl bg-[var(--dash-bg)]/60 border border-[var(--dash-muted)]/10 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-green-500/10">
                  <Wallet className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-[var(--dash-muted)] text-sm">
                  آخرین شارژ
                </span>
              </div>
              <span className="text-[var(--dash-text)] font-medium">
                {formatNumber(walletData?.lastCharge ?? 0)} تومان
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[var(--dash-bg)]/60 border border-[var(--dash-muted)]/10 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-green-500/10">
                  <CreditCard className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-[var(--dash-muted)] text-sm">
                  تعداد تراکنش‌ها
                </span>
              </div>
              <span className="text-[var(--dash-text)] font-medium">
                {formatNumber(walletData?.transactionCount ?? 0)} مورد
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[var(--dash-bg)]/60 border border-[var(--dash-muted)]/10 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-green-500/10">
                  <Shield className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-[var(--dash-muted)] text-sm">
                  وضعیت حساب
                </span>
              </div>
              <span className={`font-medium flex items-center gap-1 ${walletData?.isActive ? "text-green-500" : "text-red-500"}`}>
                <CheckCircle2 className="h-4 w-4" />
                {walletData?.isActive ? "فعال" : "غیرفعال"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Left: Charge + Guide */}
      <div className="lg:col-span-3 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className={`${cardClass} p-6`}>
          <div className={accentBar} />
          <div className="pointer-events-none absolute -top-24 -right-10 h-48 w-48 rounded-full bg-[var(--dash-accent)]/15 blur-3xl" />
          <div className="relative flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-green-500/10">
              <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-[var(--dash-text)]">
              افزایش اعتبار
            </h2>
          </div>

          {/* Payment Method Toggle */}
          <div className="flex gap-1.5 p-1.5 bg-[var(--dash-sides)]/60 rounded-2xl border border-[var(--dash-muted)]/15 mb-6">
            {(["card-to-card", "payment-gate"] as const).map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`relative flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-300 ${
                  paymentMethod === method
                    ? "text-black"
                    : "text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                }`}>
                {paymentMethod === method && (
                  <motion.span
                    layoutId="wallet-method-pill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-l from-green-500 to-emerald-500 shadow-lg shadow-green-500/25"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">
                  {method === "card-to-card"
                    ? "کارت به کارت"
                    : "درگاه پرداخت"}
                </span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {paymentMethod === "card-to-card" ? (
              <motion.div
                key="card-to-card"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}>
                {/* Debit Card Design */}
                <div className="w-full max-w-md mx-auto mb-6">
                  <div className="rounded-2xl p-6 shadow-2xl relative overflow-hidden" style={{ background: "linear-gradient(135deg, var(--sidebar-bg), var(--dash-bg))" }}>
                    <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.05]">
                      <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 0L30 15L15 30L0 15Z' fill='white' fill-opacity='0.5'/%3E%3C/svg%3E")`,
                        backgroundSize: "30px 30px",
                        backgroundRepeat: "repeat",
                      }} />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-8">
                        <CreditCard className="h-6 w-6 text-[var(--dash-muted)]" />
                        <Image
                          src="/assets/img/Saman_Bank_logo.png"
                          alt="Saman Bank"
                          width={56}
                          height={20}
                          className="object-contain"
                        />
                      </div>
                      <div className="mb-6">
                        <p className="text-[var(--dash-muted)] text-xs mb-1">شماره کارت</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xl font-mono tracking-widest text-[var(--dash-text)]" dir="ltr">
                            ۶۲۱۹ ۸۶۱۹ ۱۰۲۶ ۱۹۳۱
                          </p>
                          <button onClick={copyCardNumber} className="shrink-0 p-1.5 rounded-lg hover:bg-[var(--hover-bg)] transition-colors">
                            {copiedCard ? (
                              <Check className="h-4 w-4 text-green-400" />
                            ) : (
                              <Copy className="h-4 w-4 text-[var(--dash-muted)]" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[var(--dash-muted)] text-xs mb-1">نام صاحب حساب</p>
                          <p className="text-sm font-bold text-[var(--dash-text)]">رضا کمالی</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[var(--dash-muted)] text-xs mb-1">بانک</p>
                          <p className="text-sm font-bold text-[var(--dash-text)]">سامان</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-[var(--dash-bg)]/60 border border-[var(--dash-muted)]/10 rounded-xl p-5 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-lg bg-green-500/10">
                      <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm font-bold text-[var(--dash-text)]">راهنمای پرداخت</span>
                  </div>
                  <p className="text-sm text-[var(--dash-muted)] leading-relaxed">
                    مبلغ مورد نظر خود را به شماره کارت بالا واریز کرده و تصویر فیش واریزی را به همراه شماره تماس خود برای پشتیبانی ارسال کنید. تیم پشتیبانی درخواست شما را بررسی کرده و ظرف ۱ تا ۲ ساعت کاری موجودی را به حساب شما اضافه خواهد کرد.
                  </p>
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href="https://t.me/lingofam_support"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-l from-green-500 to-emerald-500 text-black text-sm font-bold rounded-xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300"
                  >
                    ارسال فیش
                  </motion.a>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="payment-gate"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}>
                {/* Amount Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3 text-right text-[var(--dash-text)]">
                    مبلغ مورد نظر (تومان)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formattedAmount}
                      onChange={handleAmountChange}
                      placeholder="۰"
                      className="w-full px-4 py-4 pr-24 rounded-2xl text-2xl font-bold text-left bg-[var(--hover-bg)] text-[var(--dash-text)] border border-transparent focus:outline-none focus:shadow-[0_0_0_4px_rgba(34,197,94,0.22)] transition-all duration-200 placeholder:text-[var(--dash-muted)]/60"
                      dir="ltr"
                    />
                    <div className="absolute left-4 -top-5 transform -translate-y-1/2 text-[var(--dash-muted)] text-sm">
                      تومان
                    </div>
                  </div>
                  {chargeAmount && (
                    <p className="text-sm mt-2 text-right text-[var(--dash-muted)]">
                      معادل: {formatNumber(parseInt(chargeAmount))} تومان
                    </p>
                  )}
                </div>

                {/* Suggested Amounts */}
                <div className="mb-8">
                  <p className="text-sm font-medium mb-4 text-right text-[var(--dash-muted)]">
                    مبالغ پیشنهادی:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {suggestedAmounts.map((item) => {
                      const isActive = parseInt(chargeAmount) === item.amount;
                      return (
                        <motion.button
                          key={item.amount}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => {
                            setChargeAmount(item.amount.toString());
                            setFormattedAmount(formatNumber(item.amount));
                          }}
                          className={`py-3 px-4 rounded-xl border-2 transition-all duration-200 font-medium ${
                            isActive
                              ? "bg-gradient-to-l from-green-500 to-emerald-500 border-transparent text-black shadow-lg shadow-green-500/25 scale-105"
                              : "bg-[var(--dash-bg)]/60 border-[var(--dash-muted)]/10 text-[var(--dash-text)] hover:border-green-500/40 hover:scale-105"
                          }`}>
                          <div className="text-sm font-bold">
                            {formatNumber(item.amount)}
                          </div>
                          <div className="text-xs opacity-80 mt-1">
                            {item.label}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Charge Button */}
                <motion.button
                  whileTap={chargeEnabled ? { scale: 0.98 } : {}}
                  onClick={handleCharge}
                  disabled={!chargeAmount || parseInt(chargeAmount) === 0 || isCharging}
                  className={`relative w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 overflow-hidden group flex items-center justify-center gap-2 ${
                    chargeEnabled
                      ? "bg-gradient-to-l from-green-500 to-emerald-500 text-black shadow-lg shadow-green-500/25 hover:shadow-green-500/40"
                      : "bg-[var(--hover-bg)] text-[var(--dash-muted)] cursor-not-allowed"
                  }`}>
                  {isCharging ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>در حال انتقال به درگاه پرداخت...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Zap className="h-5 w-5" />
                      <span>پرداخت و افزایش اعتبار</span>
                    </span>
                  )}
                  {chargeEnabled && (
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent"></div>
                  )}
                </motion.button>

                {/* Security Notice */}
                <div className="mt-6 p-4 rounded-xl text-center border border-green-500/20 bg-green-500/5">
                  <div className="flex items-center justify-center gap-3 text-sm">
                    <Shield className="h-5 w-5 text-green-500" />
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      پرداخت شما به صورت کاملا امن انجام می‌شود
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className={`${cardClass} p-6`}>
          <div className={accentBar} />
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-green-500/10">
              <Info className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-bold text-[var(--dash-text)] text-lg">
              راهنمای کیف پول
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "موجودی کیف پول برای ثبت نام در تمام دوره‌ها قابل استفاده است",
              "پس از افزایش اعتبار، مبلغ بلافاصله به حساب شما اضافه می‌شود",
              "امکان بازگشت وجه به کیف پول وجود ندارد",
              "برای پیگیری تراکنش‌ها به بخش تاریخچه مراجعه کنید",
              "حداقل مبلغ برای افزایش اعتبار ۱۰,۰۰۰ تومان می‌باشد",
              "پشتیبانی ۲۴ ساعته برای مشکلات پرداخت",
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index, duration: 0.3 }}
                className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-green-500/10 shrink-0 mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-[var(--dash-muted)] text-sm leading-relaxed flex-1">
                  {item}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
