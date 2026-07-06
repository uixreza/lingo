"use client";
import React, { useState, useEffect } from "react";
import {
  Wallet,
  CreditCard,
  Shield,
  Zap,
  ArrowLeft,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function WalletPage() {
  const [currentBalance, setCurrentBalance] = useState(0);
  const [chargeAmount, setChargeAmount] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [formattedAmount, setFormattedAmount] = useState("");
  const [isCharging, setIsCharging] = useState(false);

  // Mock balance fetch
  useEffect(() => {
    const fetchBalance = () => {
      setIsLoading(true);
      setTimeout(() => {
        setCurrentBalance(1250000);
        setIsLoading(false);
      }, 1000);
    };
    fetchBalance();
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
    let value = e.target.value;
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--light-purple)] mx-auto mb-4"></div>
          <p className="text-[var(--dash-text)] text-lg">
            در حال بارگذاری اطلاعات کیف پول...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-gradient-to-l from-[var(--light-purple)]/10 to-[var(--dark-purple)]/10 border border-[var(--light-purple)]/20 dark:border-white/30 rounded-2xl px-6 py-3 mb-4 shadow-lg">
            <Wallet className="h-8 w-8 text-[var(--dark-purple)] dark:text-white" />
            <h1 className="text-3xl font-bold text-[var(--dash-text)]">
              کیف پول
            </h1>
          </div>
          <p className="text-[var(--dash-muted)] text-lg">
            مدیریت موجودی و افزایش اعتبار حساب
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Current Balance Card */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-[var(--light-purple)] to-[var(--dark-purple)] rounded-2xl p-6 shadow-2xl text-white relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[url('/assets/img/mazePattern.svg')] bg-cover"></div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Wallet className="h-6 w-6" />
                  </div>
                  <h2 className="text-lg font-semibold">موجودی فعلی</h2>
                </div>

                <div className="text-center mb-6">
                  <div className="text-4xl font-bold mb-2">
                    {formatNumber(currentBalance)}
                  </div>
                  <div className="text-white/80 text-lg">تومان</div>
                </div>

                <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
                  <Shield className="h-4 w-4" />
                  <span>امن و قابل اعتماد</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-[var(--dash-sides)] rounded-2xl p-6 mt-6 shadow-lg border border-[var(--dash-muted)]/20 dark:border-white/20">
              <h3 className="font-semibold text-[var(--dash-text)] mb-4 text-center">
                اطلاعات سریع
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-[var(--dash-muted)]/20">
                  <span className="text-[var(--dash-muted)] text-sm">
                    آخرین شارژ
                  </span>
                  <span className="text-[var(--dash-text)] font-medium">
                    ۵۰۰,۰۰۰ تومان
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[var(--dash-muted)]/20">
                  <span className="text-[var(--dash-muted)] text-sm">
                    تعداد تراکنش‌ها
                  </span>
                  <span className="text-[var(--dash-text)] font-medium">
                    ۱۲ مورد
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[var(--dash-muted)] text-sm">
                    وضعیت حساب
                  </span>
                  <span className="text-green-500 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    فعال
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Charge Section */}
          <div className="lg:col-span-3">
            <div className="bg-[var(--dash-sides)] rounded-2xl p-6 shadow-lg border border-[var(--dash-muted)]/20 dark:border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-[var(--light-purple)]/10 to-[var(--dark-purple)]/10 rounded-xl border border-[var(--light-purple)]/20 dark:border-white/30">
                  <CreditCard className="h-6 w-6 text-[var(--dark-purple)] dark:text-white" />
                </div>
                <h2 className="text-xl font-bold text-[var(--dash-text)]">
                  افزایش اعتبار
                </h2>
              </div>

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
                    className="w-full px-4 py-4 pr-24 rounded-2xl border-2 text-2xl font-bold text-left focus:outline-none focus:ring-2 focus:ring-[var(--light-purple)] focus:border-transparent transition-all duration-200"
                    style={{
                      backgroundColor: "var(--dash-bg)",
                      borderColor: "var(--dash-muted)",
                      color: "var(--dash-text)",
                    }}
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
                  {suggestedAmounts.map((item) => (
                    <button
                      key={item.amount}
                      onClick={() => {
                        setChargeAmount(item.amount.toString());
                        setFormattedAmount(formatNumber(item.amount));
                      }}
                      className={`py-3 px-4 rounded-xl border-2 transition-all duration-200 font-medium group ${
                        parseInt(chargeAmount) === item.amount
                          ? "bg-gradient-to-r from-[var(--light-purple)] to-[var(--dark-purple)] border-transparent text-white shadow-lg scale-105"
                          : "bg-[var(--dash-bg)] border-[var(--dash-muted)]/30 text-[var(--dash-text)] hover:border-[var(--light-purple)] hover:scale-105"
                      }`}>
                      <div className="text-sm font-bold">
                        {formatNumber(item.amount)}
                      </div>
                      <div className="text-xs opacity-80 mt-1">
                        {item.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Charge Button */}
              <button
                onClick={handleCharge}
                disabled={
                  !chargeAmount || parseInt(chargeAmount) === 0 || isCharging
                }
                className="w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg relative overflow-hidden group"
                style={{
                  background:
                    chargeAmount && parseInt(chargeAmount) > 0
                      ? "linear-gradient(135deg, var(--light-purple), var(--dark-purple))"
                      : "var(--dash-muted)",
                  color: "white",
                }}>
                {isCharging ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>در حال انتقال به درگاه پرداخت...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="h-5 w-5" />
                    <span>پرداخت و افزایش اعتبار</span>
                  </div>
                )}

                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </button>

              {/* Security Notice */}
              <div className="mt-6 p-4 rounded-xl text-center border border-green-500/20 bg-green-500/5">
                <div className="flex items-center justify-center gap-3 text-sm">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    پرداخت شما به صورت کاملا امن انجام می‌شود
                  </span>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="bg-[var(--dash-sides)] rounded-2xl p-6 mt-6 shadow-lg border border-[var(--dash-muted)]/20 dark:border-white/20">
              <h3 className="font-bold text-[var(--dash-text)] mb-6 text-center text-lg">
                راهنمای کیف پول
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "موجودی کیف پول برای ثبت نام در تمام دوره‌ها قابل استفاده است",
                  "پس از افزایش اعتبار، مبلغ بلافاصله به حساب شما اضافه می‌شود",
                  "امکان بازگشت وجه به کیف پول وجود ندارد",
                  "برای پیگیری تراکنش‌ها به بخش تاریخچه مراجعه کنید",
                  "حداقل مبلغ برای افزایش اعتبار ۱۰,۰۰۰ تومان می‌باشد",
                  "پشتیبانی ۲۴ ساعته برای مشکلات پرداخت",
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-1 bg-gradient-to-r from-[var(--light-purple)]/10 to-[var(--dark-purple)]/10 rounded-lg border border-[var(--light-purple)]/20 dark:border-white/30 mt-0.5">
                      <CheckCircle2 className="h-4 w-4 text-[var(--dark-purple)] dark:text-white" />
                    </div>
                    <span className="text-[var(--dash-muted)] text-sm leading-relaxed flex-1">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
