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
  FileText,
  Download,
  Eye,
  ChevronDown,
  X,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment-jalaali";
import toast from "react-hot-toast";

type WalletData = {
  balance: number;
  lastCharge: number;
  isActive: boolean;
  transactionCount: number;
};

type InvoiceItem = {
  id: number;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string | null;
  referenceId: string | null;
  status: string;
  createdAt: string;
};

const cardClass =
  "relative overflow-hidden rounded-2xl border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)]/80 backdrop-blur-xl shadow-lg";
const accentBar =
  "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent";

export default function WalletPage() {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [chargeAmount, setChargeAmount] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [formattedAmount, setFormattedAmount] = useState("");
  const [isCharging, setIsCharging] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card-to-card" | "payment-gate" | "digital-wallet">("card-to-card");
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedCard, setCopiedCard] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [visibleInvoices, setVisibleInvoices] = useState(5);

  const copyCardNumber = async () => {
    await navigator.clipboard.writeText("6219861910261931");
    setCopiedCard(true);
    setTimeout(() => setCopiedCard(false), 2000);
  };

  const copyWalletAddress = async () => {
    await navigator.clipboard.writeText("TRCsu6HqMycpiYztLnyqSyrCJcNQsRviUS");
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await fetch("/api/wallet");
        if (!res.ok) throw new Error("Failed to fetch wallet");
        const data: WalletData & { invoices?: InvoiceItem[] } = await res.json();
        setWalletData(data);
        setInvoices(data.invoices ?? []);
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

  const formatDateTime = (iso: string) =>
    moment(iso).format("jYYYY/jMM/jDD - HH:mm");

  const statusInfo = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      completed: {
        label: "پرداخت شده",
        cls: "bg-green-500/10 text-green-600 dark:text-green-400",
      },
      paid: {
        label: "پرداخت شده",
        cls: "bg-green-500/10 text-green-600 dark:text-green-400",
      },
      pending: {
        label: "در انتظار",
        cls: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
      },
      failed: {
        label: "ناموفق",
        cls: "bg-red-500/10 text-red-600 dark:text-red-400",
      },
      refunded: {
        label: "بازگشت داده شده",
        cls: "bg-red-500/10 text-red-600 dark:text-red-400",
      },
    };
    return (
      map[status] ?? {
        label: status,
        cls: "bg-[var(--hover-bg)] text-[var(--dash-muted)]",
      }
    );
  };

  const buildInvoiceNode = (inv: InvoiceItem) => {
    const esc = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const div = document.createElement("div");
    div.id = `invoice-${inv.id}`;
    div.setAttribute("dir", "rtl");
    div.style.cssText =
      "position:fixed;top:0;left:-99999px;width:794px;background:#ffffff;color:#111827;padding:48px;box-sizing:border-box;font-family:Vazirmatn,'Segoe UI',Tahoma,Arial,sans-serif;z-index:-1;";
    const st = statusInfo(inv.status).label;
    const row = (label: string, value: string) =>
      `<tr><td style="padding:12px 14px;background:#f0fdf4;color:#6b7280;font-size:13px;font-weight:600;width:30%;border:1px solid #e5e7eb;">${label}</td><td style="padding:12px 14px;border:1px solid #e5e7eb;font-size:14px;color:#111827;">${value}</td></tr>`;
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #16a34a;padding-bottom:18px;">
        <div>
          <div style="font-size:26px;font-weight:800;color:#16a34a;">لینگو فام</div>
          <div style="font-size:12px;color:#6b7280;margin-top:4px;">فاکتور رسمی کیف پول</div>
        </div>
        <div style="text-align:left;">
          <div style="font-weight:800;font-size:16px;color:#111827;">INV-${inv.id}</div>
          <div style="color:#6b7280;font-size:12px;margin-top:4px;">${esc(formatDateTime(inv.createdAt))}</div>
        </div>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-top:26px;">
        ${row("شرح", esc(inv.description || "تراکنش کیف پول"))}
        ${row("شماره پیگیری", esc(inv.referenceId || "-"))}
        ${row("تاریخ تراکنش", esc(formatDateTime(inv.createdAt)))}
        ${row("وضعیت", st)}
        ${row("موجودی قبل", `${formatNumber(inv.balanceBefore)} تومان`)}
        ${row("موجودی بعد", `${formatNumber(inv.balanceAfter)} تومان`)}
      </table>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:28px;padding:18px 22px;background:#f0fdf4;border:1px solid #86efac;border-radius:12px;">
        <div style="font-size:14px;color:#374151;font-weight:700;">مبلغ فاکتور</div>
        <div style="font-size:22px;font-weight:800;color:#16a34a;">${formatNumber(Math.abs(inv.amount))} تومان</div>
      </div>
      <div style="margin-top:30px;text-align:center;color:#9ca3af;font-size:11px;">
        لینگو فام | پشتیبانی: t.me/lingofam_support
      </div>`;
    document.body.appendChild(div);
    return div;
  };

  const downloadInvoicePdf = async (inv: InvoiceItem) => {
    setDownloadingId(inv.id);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);
      const node = buildInvoiceNode(inv);
      if (document.fonts?.ready) await document.fonts.ready;
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: (doc) => {
          const el = doc.getElementById(node.id) as HTMLElement | null;
          if (el) {
            el.style.position = "static";
            el.style.left = "auto";
            el.style.top = "auto";
          }
        },
      });
      node.remove();

      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = 210;
      const pageH = 297;
      const mmPerPx = 25.4 / 96;
      let imgW = canvas.width * mmPerPx;
      let imgH = canvas.height * mmPerPx;
      if (imgW > pageW - 16) {
        const s = (pageW - 16) / imgW;
        imgW *= s;
        imgH *= s;
      }
      if (imgH > pageH - 16) {
        const s = (pageH - 16) / imgH;
        imgW *= s;
        imgH *= s;
      }
      pdf.addImage(
        canvas.toDataURL("image/jpeg", 0.95),
        "JPEG",
        (pageW - imgW) / 2,
        8,
        imgW,
        imgH,
      );
      pdf.save(`invoice-${inv.id}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleInvoiceView = (inv: InvoiceItem) => {
    setSelectedInvoice(inv);
  };

  const walletGuideContent = (
    <div>
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
    </div>
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start pb-24 lg:pb-0">
        {/* Left column */}
        <div className="contents lg:flex lg:flex-col lg:gap-6 lg:col-start-1 lg:col-span-2">
          {/* Balance card */}
          <div
            className="order-1 relative overflow-hidden rounded-3xl p-6 sm:p-7 shadow-2xl"
            style={{
              background:
                "linear-gradient(140deg, var(--light-purple) 0%, var(--dark-purple) 100%)",
            }}>
            <div className="flex items-start justify-between gap-3 mb-9">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-white/25 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-24 rounded bg-white/30 animate-pulse" />
                  <div className="h-2.5 w-16 rounded bg-white/20 animate-pulse" />
                </div>
              </div>
              <div className="h-6 w-16 rounded-full bg-white/25 animate-pulse" />
            </div>
            <div className="text-center mb-8">
              <div className="h-12 w-2/3 mx-auto rounded-xl bg-white/30 mb-3 animate-pulse" />
              <div className="h-7 w-24 mx-auto rounded-full bg-white/25 animate-pulse" />
            </div>
            <div className="pt-4 border-t border-white/15 flex items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="h-2.5 w-16 rounded bg-white/20 animate-pulse" />
                <div className="h-3.5 w-24 rounded bg-white/30 animate-pulse" />
              </div>
              <div className="w-px h-8 bg-white/15" />
              <div className="space-y-2">
                <div className="h-2.5 w-16 rounded bg-white/20 animate-pulse" />
                <div className="h-3.5 w-20 rounded bg-white/30 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Invoices card */}
          <div className="order-3 relative overflow-hidden rounded-2xl border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)] shadow-lg p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="h-8 w-8 rounded-lg bg-[var(--hover-bg-strong)] animate-pulse" />
              <div className="h-5 w-32 rounded bg-[var(--hover-bg-strong)] animate-pulse" />
            </div>
            <div className="space-y-2.5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-xl bg-[var(--hover-bg)] animate-pulse" />
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="contents lg:flex lg:flex-col lg:gap-6 lg:col-start-3 lg:col-span-3">
          {/* Charge card */}
          <div className="order-2 relative overflow-hidden rounded-2xl border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)] shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-[var(--hover-bg-strong)] animate-pulse" />
              <div className="h-5 w-40 rounded bg-[var(--hover-bg-strong)] animate-pulse" />
            </div>
            <div className="flex gap-1.5 p-1.5 rounded-2xl bg-[var(--dash-bg)]/60 border border-[var(--dash-muted)]/10 mb-6">
              <div className="flex-1 h-9 rounded-xl bg-[var(--hover-bg-strong)] animate-pulse" />
              <div className="flex-1 h-9 rounded-xl bg-[var(--hover-bg)] animate-pulse" />
            </div>
            <div className="w-full max-w-md mx-auto h-44 rounded-2xl bg-[var(--hover-bg)] mb-6 animate-pulse" />
            <div className="h-32 rounded-xl bg-[var(--hover-bg)] mb-6 animate-pulse" />
            <div className="h-14 rounded-xl bg-[var(--hover-bg)] animate-pulse" />
            {/* Wallet guide (mobile only) */}
            <div className="lg:hidden mt-6 rounded-2xl bg-[var(--dash-bg)]/60 border border-[var(--dash-muted)]/10 p-5 space-y-3">
              <div className="h-4 w-28 rounded bg-[var(--hover-bg-strong)] mb-4 animate-pulse" />
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-3 rounded bg-[var(--hover-bg)] animate-pulse" />
              ))}
            </div>
          </div>

          {/* Wallet guide (desktop only) */}
          <div
            className="order-4 hidden lg:block relative overflow-hidden rounded-2xl border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)] shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-[var(--hover-bg-strong)] animate-pulse" />
              <div className="h-5 w-40 rounded bg-[var(--hover-bg-strong)] animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-4 rounded bg-[var(--hover-bg)] animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const chargeEnabled =
    !!chargeAmount && parseInt(chargeAmount) > 0 && !isCharging;

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start pb-24 lg:pb-0">
      {/* Left column wrapper (balance + toggle) */}
      <div className="contents lg:flex lg:flex-col lg:gap-6 lg:col-start-1 lg:col-span-2">
      {/* Balance card */}
      <motion.div
          initial={{ opacity: 0, y: 16, rotateX: 8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -4 }}
          className="order-1 lg:col-start-1 lg:col-span-2 relative overflow-hidden rounded-3xl p-6 sm:p-7 shadow-2xl text-white ring-1 ring-black/10"
          style={{
            background:
              "linear-gradient(140deg, var(--light-purple) 0%, var(--dark-purple) 100%)",
            opacity: 1,
          }}>
          <div className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-white/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-[var(--dash-accent)]/30 blur-3xl" />
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-white/5 blur-2xl" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
            <div className="absolute inset-0 bg-[url('/assets/img/mazePattern.svg')] bg-cover" />
          </div>

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-3 mb-9">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/15">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white/95">موجودی فعلی</h2>
                  <p className="text-[11px] text-white/40 mt-0.5">
                    کیف پول لینگوفام
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[var(--dash-accent)]/25 text-white text-[10px] font-bold ring-1 ring-white/30 flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    walletData?.isActive ? "bg-white" : "bg-red-400"
                  }`}
                />
                {walletData?.isActive ? "فعال" : "غیرفعال"}
              </span>
            </div>

            <div className="text-center mb-8">
              <div className="text-[42px] sm:text-[48px] leading-none font-extrabold tracking-tight mb-3 tabular-nums bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
                {formatNumber(walletData?.balance ?? 0)}
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 ring-1 ring-white/15 text-white/80 text-xs font-medium">
                <Shield className="h-3.5 w-3.5" />
                تومان
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10">
              <div>
                <p className="text-[10px] text-white/40 mb-1">آخرین شارژ</p>
                <p className="text-sm font-bold">
                  {formatNumber(walletData?.lastCharge ?? 0)} تومان
                </p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-left">
                <p className="text-[10px] text-white/40 mb-1">تعداد تراکنش‌ها</p>
                <p className="text-sm font-bold">
                  {formatNumber(walletData?.transactionCount ?? 0)} مورد
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`${cardClass} p-6 order-3 lg:col-start-1 lg:col-span-2`}>
            <div className={accentBar} />
            {/* Title */}
            <div className="flex items-center gap-2.5 mb-5">
              <div className="p-2 rounded-lg bg-green-500/10">
                <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-bold text-[var(--dash-text)] text-lg">
                فاکتورها
              </h3>
            </div>

            {invoices.length === 0 ? (
              <div className="text-center py-8 text-sm text-[var(--dash-muted)]">
                فاکتوری یافت نشد
              </div>
            ) : (
              <>
                <div className="space-y-2.5">
                  {invoices.slice(0, visibleInvoices).map((inv) => {
                    const st = statusInfo(inv.status);
                    return (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between gap-2.5 rounded-xl bg-[var(--dash-bg)]/60 border border-[var(--dash-muted)]/10 px-3.5 py-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 rounded-lg bg-purple-500/10 shrink-0">
                          <FileText className="h-3.5 w-3.5 text-purple-500" />
                        </div>
                        <div className="min-w-0">
                          <div
                            className="text-xs font-bold text-[var(--dash-text)]"
                            dir="ltr">
                            INV-{inv.id}
                          </div>
                          <div className="text-[11px] text-[var(--dash-muted)] truncate max-w-[150px]">
                            {inv.description ?? "تراکنش کیف پول"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-left">
                          <div
                            className={`text-xs font-bold ${
                              inv.amount >= 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-500"
                            }`}>
                            {formatNumber(inv.amount)} تومان
                          </div>
                          <span
                            className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${st.cls}`}>
                            {st.label}
                          </span>
                        </div>
                        <button
                          onClick={() => handleInvoiceView(inv)}
                          title="مشاهده فاکتور"
                          className="p-2 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                </div>
                {invoices.length > visibleInvoices && (
                  <button
                    onClick={() => setVisibleInvoices((prev) => prev + 5)}
                    className="w-full mt-2.5 py-2.5 rounded-xl text-xs font-bold bg-[var(--dash-bg)]/60 border border-[var(--dash-muted)]/10 text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:border-green-500/40 transition-colors flex items-center justify-center gap-1.5">
                    مشاهده بیشتر ({formatNumber(invoices.length - visibleInvoices)})
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}
          </motion.div>
      </div>

      {/* Right column wrapper (charge + guide) */}
      <div className="contents lg:flex lg:flex-col lg:gap-6 lg:col-start-3 lg:col-span-3">
      {/* Charge card */}
      <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className={`${cardClass} p-6 order-2 lg:col-start-3 lg:col-span-3`}>
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
          <div className="flex gap-1.5 p-1.5 flex-1 bg-[var(--dash-sides)]/60 rounded-2xl border border-[var(--dash-muted)]/15 mb-6">
              {(["card-to-card", "digital-wallet", "payment-gate"] as const).map((method) => {
                const locked = method === "payment-gate";
                return (
                  <button
                    key={method}
                    onClick={() => {
                      if (locked) {
                        toast("درگاه پرداخت در دست ساخت است");
                        return;
                      }
                      setPaymentMethod(method);
                    }}
                    className={`relative flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-300 ${
                      paymentMethod === method
                        ? "text-black"
                        : locked
                          ? "text-[var(--dash-muted)]/50 cursor-not-allowed"
                          : "text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                    }`}>
                    {paymentMethod === method && (
                      <motion.span
                        layoutId="wallet-method-pill"
                        className="absolute inset-0 rounded-xl bg-gradient-to-l from-green-500 to-emerald-500 shadow-lg shadow-green-500/25"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10 inline-flex items-center justify-center gap-1.5">
                      {locked && <Lock size={13} />}
                      {method === "card-to-card"
                        ? "کارت به کارت"
                        : method === "digital-wallet"
                          ? "کیف پول دیجیتال"
                          : "درگاه پرداخت"}
                    </span>
                  </button>
                );
              })}
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
                    <div className="absolute inset-0 opacity-20 dark:opacity-[0.12]">
                      <svg
                        className="absolute inset-0 w-full h-full text-[var(--dark-purple)] dark:text-[var(--light-purple)]"
                        aria-hidden="true">
                        <defs>
                          <pattern
                            id="wallet-card-pattern"
                            width="24"
                            height="24"
                            patternUnits="userSpaceOnUse"
                            patternTransform="rotate(45)">
                            <rect
                              width="16"
                              height="24"
                              fill="currentColor"
                              fillOpacity="0.5"
                            />
                          </pattern>
                        </defs>
                        <rect
                          width="100%"
                          height="100%"
                          fill="url(#wallet-card-pattern)"
                        />
                      </svg>
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
                  <div className="flex flex-wrap gap-3 mt-4">
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href="https://t.me/lingofam_support"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-l from-blue-500 to-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
                    >
                      ارسال فیش از طریق تلگرام
                    </motion.a>
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href="https://web.bale.ai/@lingofam"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-l from-green-500 to-emerald-500 text-black text-sm font-bold rounded-xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300"
                    >
                      ارسال فیش از طریق بله
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            ) : paymentMethod === "payment-gate" ? (
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
            ) : (
              <motion.div
                key="digital-wallet"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}>
                {/* Digital Wallet Card */}
                <div className="w-full max-w-md mx-auto mb-6">
                  <div className="rounded-2xl p-6 shadow-2xl relative overflow-hidden" style={{ background: "linear-gradient(145deg, #0f172a 0%, #1e1b4b 50%, #0c4a6e 100%)" }}>
                    {/* Circuit grid pattern */}
                    <div className="absolute inset-0 opacity-[0.07]">
                      <svg className="absolute inset-0 w-full h-full text-cyan-400" aria-hidden="true">
                        <defs>
                          <pattern id="circuit-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                            <circle cx="0" cy="0" r="1.5" fill="currentColor" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#circuit-grid)" />
                      </svg>
                    </div>
                    {/* Glowing orbs */}
                    <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-cyan-500/20 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-16 -left-12 h-40 w-40 rounded-full bg-violet-500/15 blur-3xl" />
                    {/* Top edge glow */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-8">
                        <div className="p-2 rounded-xl bg-cyan-500/15 ring-1 ring-cyan-500/30">
                          <Wallet className="h-5 w-5 text-cyan-400" />
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 ring-1 ring-cyan-500/25 text-cyan-400 text-[10px] font-bold uppercase tracking-wider">TRC20</span>
                      </div>
                      <div className="mb-6">
                        <p className="text-slate-400 text-xs mb-1.5">آدرس کیف پول</p>
                        <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2.5 ring-1 ring-white/10">
                          <p className="text-sm font-mono text-cyan-300 break-all flex-1" dir="ltr">
                            TRCsu6HqMycpiYztLnyqSyrCJcNQsRviUS
                          </p>
                          <button onClick={copyWalletAddress} className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                            {copiedAddress ? (
                              <Check className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <Copy className="h-4 w-4 text-slate-400" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-xs mb-1">شبکه</p>
                          <p className="text-sm font-bold text-white">TRON (TRC20)</p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-400 text-xs mb-1">ارز</p>
                          <p className="text-sm font-bold text-cyan-300">USDT</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-[var(--dash-bg)]/60 border border-[var(--dash-muted)]/10 rounded-xl p-5 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-lg bg-blue-500/10">
                      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-bold text-[var(--dash-text)]">راهنمای پرداخت</span>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-[var(--dash-muted)] leading-relaxed">
                      مبلغ مورد نظر خود را به آدرس کیف پول بالا واریز کرده و تصویر تراکنش را به همراه شماره تماس خود برای پشتیبانی ارسال کنید. تیم پشتیبانی درخواست شما را بررسی کرده و ظرف ۱ تا ۲ ساعت کاری موجودی را به حساب شما اضافه خواهد کرد.
                    </p>
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        توجه: فقط واریز USDT از طریق شبکه TRC20 مورد قبول است. از واریز از طریق شبکه‌های دیگر خودداری کنید.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-4">
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href="https://t.me/lingofam_support"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-l from-blue-500 to-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
                    >
                      ارسال تراکنش از طریق تلگرام
                    </motion.a>
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href="https://web.bale.ai/@lingofam"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-l from-green-500 to-emerald-500 text-black text-sm font-bold rounded-xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300"
                    >
                      ارسال تراکنش از طریق بله
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Wallet Guide (mobile only — inside charge card) */}
          <div className="lg:hidden relative overflow-hidden rounded-2xl border border-[var(--dash-muted)]/15 dark:border-white/20 bg-[var(--dash-sides)]/50 backdrop-blur-xl p-5 mt-6">
            {walletGuideContent}
          </div>
        </motion.div>

        {/* Info Section (desktop only) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className={`${cardClass} p-6 order-4 lg:col-start-3 lg:col-span-3 hidden lg:block`}>
          {walletGuideContent}
        </motion.div>
      </div>
      </div>

    {/* Invoice info modal */}
    <AnimatePresence>
      {selectedInvoice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedInvoice(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md rounded-2xl bg-[var(--dash-sides)] border border-[var(--dash-muted)]/15 shadow-2xl p-6 max-h-[85dvh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-green-500/10">
                  <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--dash-text)]">
                    اطلاعات فاکتور
                  </h3>
                  <p className="text-xs text-[var(--dash-muted)] mt-0.5" dir="ltr">
                    INV-{selectedInvoice.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-2 rounded-xl text-[var(--dash-muted)] hover:bg-[var(--hover-bg)] transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  label: "شرح",
                  value: selectedInvoice.description || "تراکنش کیف پول",
                },
                {
                  label: "تاریخ",
                  value: formatDateTime(selectedInvoice.createdAt),
                },
                {
                  label: "شماره پیگیری",
                  value: selectedInvoice.referenceId || "-",
                },
                {
                  label: "مبلغ",
                  value: `${formatNumber(selectedInvoice.amount)} تومان`,
                },
                {
                  label: "موجودی قبل",
                  value: `${formatNumber(selectedInvoice.balanceBefore)} تومان`,
                },
                {
                  label: "موجودی بعد",
                  value: `${formatNumber(selectedInvoice.balanceAfter)} تومان`,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between rounded-xl bg-[var(--dash-bg)]/60 border border-[var(--dash-muted)]/10 px-4 py-3">
                  <span className="text-sm text-[var(--dash-muted)]">
                    {row.label}
                  </span>
                  <span className="text-sm font-medium text-[var(--dash-text)]">
                    {row.value}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3">
                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                  {statusInfo(selectedInvoice.status).label}
                </span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                  {formatNumber(Math.abs(selectedInvoice.amount))} تومان
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => downloadInvoicePdf(selectedInvoice)}
                disabled={downloadingId !== null}
                className="flex-1 py-3 rounded-xl font-bold text-black transition-all duration-300 bg-gradient-to-l from-green-500 to-emerald-500 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 flex items-center justify-center gap-2">
                {downloadingId === selectedInvoice.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    در حال ساخت PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    دانلود PDF
                  </>
                )}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedInvoice(null)}
                className="px-6 py-3 rounded-xl font-bold bg-[var(--hover-bg)] text-[var(--dash-muted)] hover:text-[var(--dash-text)] transition-colors">
                بستن
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
}
