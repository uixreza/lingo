"use client";
import React, { useState, useEffect } from "react";
import {
  Wallet,
  Shield,
  Loader2,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";

type Transaction = {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: "income" | "withdrawal";
  status: "completed" | "pending" | "failed";
};

type IncomeStats = {
  today: number;
  week: number;
  month: number;
  totalStudents: number;
};

const mockTransactions: Transaction[] = [
  { id: 1, date: "۱۴۰۵/۰۴/۰۸", description: "ثبت نام دوره پیشرفته React", amount: 2500000, type: "income", status: "completed" },
  { id: 2, date: "۱۴۰۵/۰۴/۰۷", description: "ثبت نام دوره مقدماتی Python", amount: 1800000, type: "income", status: "completed" },
  { id: 3, date: "۱۴۰۵/۰۴/۰۶", description: "برداشت به حساب بانکی", amount: 5000000, type: "withdrawal", status: "completed" },
  { id: 4, date: "۱۴۰۵/۰۴/۰۵", description: "ثبت نام دوره جامع UI/UX", amount: 3200000, type: "income", status: "completed" },
  { id: 5, date: "۱۴۰۵/۰۴/۰۴", description: "ثبت نام دوره Machine Learning", amount: 4500000, type: "income", status: "pending" },
  { id: 6, date: "۱۴۰۵/۰۴/۰۳", description: "برداشت به حساب بانکی", amount: 3000000, type: "withdrawal", status: "failed" },
  { id: 7, date: "۱۴۰۵/۰۴/۰۲", description: "ثبت نام دوره Data Science", amount: 2800000, type: "income", status: "completed" },
  { id: 8, date: "۱۴۰۵/۰۴/۰۱", description: "ثبت نام دوره Angular", amount: 1900000, type: "income", status: "completed" },
];

export default function AdminWalletPage() {
  const [currentBalance, setCurrentBalance] = useState(0);
  const [incomeStats, setIncomeStats] = useState<IncomeStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [formattedAmount, setFormattedAmount] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    const fetchData = () => {
      setIsLoading(true);
      setTimeout(() => {
        setCurrentBalance(82500000);
        setIncomeStats({
          today: 3500000,
          week: 18500000,
          month: 67000000,
          totalStudents: 142,
        });
        setTransactions(mockTransactions);
        setIsLoading(false);
      }, 800);
    };
    fetchData();
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("fa-IR").format(num);
  };

  const toEnglishDigits = (str: string) => {
    return str
      .replace(/[\u06F0-\u06F9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString())
      .replace(/[\u0660-\u0669]/g, (d) => "0123456789".indexOf(d).toString());
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    const onlyDigits = value.replace(/[^\d\u06F0-\u06F9\u0660-\u0669]/g, "");
    const englishDigits = toEnglishDigits(onlyDigits);

    setWithdrawAmount(englishDigits);
    const numberValue = englishDigits ? parseInt(englishDigits, 10) : 0;
    setFormattedAmount(numberValue > 0 ? formatNumber(numberValue) : "");
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseInt(withdrawAmount) === 0) {
      alert("لطفا مبلغ مورد نظر را وارد کنید");
      return;
    }

    if (parseInt(withdrawAmount) > currentBalance) {
      alert("موجودی کافی نیست");
      return;
    }

    setIsWithdrawing(true);
    setTimeout(() => {
      setIsWithdrawing(false);
      console.log("Withdrawing amount:", parseInt(withdrawAmount));
    }, 2000);
  };

  const suggestedAmounts = [
    { amount: 1000000, label: "۱ میلیون" },
    { amount: 2000000, label: "۲ میلیون" },
    { amount: 5000000, label: "۵ میلیون" },
    { amount: 10000000, label: "۱۰ میلیون" },
    { amount: 20000000, label: "۲۰ میلیون" },
    { amount: 50000000, label: "۵۰ میلیون" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--light-purple)] mx-auto mb-4"></div>
          <p className="text-[var(--dash-text)] text-lg">
            بارگذاری اطلاعات کیف پول...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Balance Card + Income Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-[var(--light-purple)] to-[var(--dark-purple)] rounded-2xl p-6 shadow-2xl text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[url('/assets/img/mazePattern.svg')] bg-cover"></div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Wallet className="h-6 w-6" />
                  </div>
                  <h2 className="text-lg font-semibold">درآمد کل</h2>
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

            {/* Income Stats */}
            <div className="bg-[var(--dash-sides)] rounded-2xl p-6 shadow-lg border border-[var(--dash-muted)]/20 dark:border-white/20">
              <h3 className="font-semibold text-[var(--dash-text)] mb-4 text-center">
                آمار درآمد
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-[var(--dash-muted)]/20">
                  <span className="text-[var(--dash-muted)] text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    درآمد امروز
                  </span>
                  <span className="text-[var(--dash-text)] font-medium">
                    {incomeStats ? formatNumber(incomeStats.today) : "۰"} تومان
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[var(--dash-muted)]/20">
                  <span className="text-[var(--dash-muted)] text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    درآمد این هفته
                  </span>
                  <span className="text-[var(--dash-text)] font-medium">
                    {incomeStats ? formatNumber(incomeStats.week) : "۰"} تومان
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[var(--dash-muted)]/20">
                  <span className="text-[var(--dash-muted)] text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    درآمد این ماه
                  </span>
                  <span className="text-[var(--dash-text)] font-medium">
                    {incomeStats ? formatNumber(incomeStats.month) : "۰"} تومان
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[var(--dash-muted)] text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    تعداد دانشجوها
                  </span>
                  <span className="text-[var(--dash-text)] font-medium">
                    {incomeStats ? formatNumber(incomeStats.totalStudents) : "۰"} نفر
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Withdrawal + Transactions */}
          <div className="lg:col-span-3 space-y-6">
            {/* Withdrawal Section */}
            <div className="bg-[var(--dash-sides)] rounded-2xl p-6 shadow-lg border border-[var(--dash-muted)]/20 dark:border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-[var(--light-purple)]/10 to-[var(--dark-purple)]/10 rounded-xl border border-[var(--light-purple)]/20 dark:border-white/30">
                  <ArrowUpRight className="h-6 w-6 text-[var(--dark-purple)] dark:text-white" />
                </div>
                <h2 className="text-xl font-bold text-[var(--dash-text)]">
                  برداشت از کیف پول
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
                {withdrawAmount && (
                  <p className="text-sm mt-2 text-right text-[var(--dash-muted)]">
                    معادل: {formatNumber(parseInt(withdrawAmount))} تومان
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
                        setWithdrawAmount(item.amount.toString());
                        setFormattedAmount(formatNumber(item.amount));
                      }}
                      className={`py-3 px-4 rounded-xl border-2 transition-all duration-200 font-medium group ${
                        parseInt(withdrawAmount) === item.amount
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

              {/* Withdraw Button */}
              <button
                onClick={handleWithdraw}
                disabled={
                  !withdrawAmount || parseInt(withdrawAmount) === 0 || isWithdrawing
                }
                className="w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg relative overflow-hidden group"
                style={{
                  background:
                    withdrawAmount && parseInt(withdrawAmount) > 0
                      ? "linear-gradient(135deg, var(--light-purple), var(--dark-purple))"
                      : "var(--dash-muted)",
                  color: "white",
                }}>
                {isWithdrawing ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>در حال پردازش برداشت...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <ArrowDownLeft className="h-5 w-5" />
                    <span>برداشت به حساب بانکی</span>
                  </div>
                )}

                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </button>

              {/* Security Notice */}
              <div className="mt-6 p-4 rounded-xl text-center border border-green-500/20 bg-green-500/5">
                <div className="flex items-center justify-center gap-3 text-sm">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    تمامی تراکنش‌ها به صورت امن انجام می‌شود
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-[var(--dash-sides)] rounded-2xl p-6 shadow-lg border border-[var(--dash-muted)]/20 dark:border-white/20">
              <h3 className="font-bold text-[var(--dash-text)] mb-6 text-center text-lg">
                تراکنش‌های اخیر
              </h3>
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[var(--dash-bg)] border border-[var(--dash-muted)]/10">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          tx.type === "income"
                            ? "bg-green-100 dark:bg-green-900/30"
                            : "bg-red-100 dark:bg-red-900/30"
                        }`}>
                        {tx.type === "income" ? (
                          <ArrowDownLeft
                            className={`h-4 w-4 ${
                              tx.status === "pending"
                                ? "text-yellow-500"
                                : "text-green-600 dark:text-green-400"
                            }`}
                          />
                        ) : (
                          <ArrowUpRight
                            className={`h-4 w-4 ${
                              tx.status === "failed"
                                ? "text-red-500"
                                : tx.status === "pending"
                                ? "text-yellow-500"
                                : "text-blue-600 dark:text-blue-400"
                            }`}
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[var(--dash-text)] truncate">
                          {tx.description}
                        </p>
                        <p className="text-xs text-[var(--dash-muted)] mt-0.5">
                          {tx.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 mr-3">
                      <p
                        className={`text-sm font-bold ${
                          tx.type === "income"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-500"
                        }`}>
                        {tx.type === "income" ? "+" : "-"}
                        {formatNumber(tx.amount)}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          tx.status === "completed"
                            ? "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30"
                            : tx.status === "pending"
                            ? "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30"
                            : "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30"
                        }`}>
                        {tx.status === "completed"
                          ? "موفق"
                          : tx.status === "pending"
                          ? "در انتظار"
                          : "ناموفق"}
                      </span>
                    </div>
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
