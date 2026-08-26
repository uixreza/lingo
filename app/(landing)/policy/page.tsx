"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Shield,
  CreditCard,
  Ban,
  FileText,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const sections = [
  {
    icon: BookOpen,
    title: "کلیات",
    items: [
      "استفاده از وب‌سایت لینگوفم به معنای پذیرش کامل قوانین و مقررات زیر است.",
      "لینگوفم یک پلتفرم آموزش زبان انگلیسی به صورت آنلاین می‌باشد.",
      "تمام محتوای وب‌سایت شامل کتاب‌ها، فایل‌های صوتی، تمرین‌ها و جلسات آموزشی متعلق به لینگوفم بوده و هرگونه کپی‌برداری پیگرد قانونی دارد.",
      "لینگوفم حق تغییر قوانین را در هر زمان بدون اطلاع قبلی دارد.",
    ],
  },
  {
    icon: CreditCard,
    title: "شارژ حساب و بازگشت وجه",
    highlight: true,
    items: [
      "پس از شارژ کیف پول، به هیچ وجه امکان بازگشت وجه وجود ندارد.",
      "مبلغ شارژ شده فقط جهت رزرو کلاس‌ها و دریافت خدمات آموزشی قابل استفاده می‌باشد.",
      "کاربر با انجام شارژ، آگاهانه و با رضایت کامل این شرط را می‌پذیرد.",
      "در صورت بروز مشکل فنی در فرایند پرداخت، مبلغ حداکثر ۲۴ ساعت کاری به حساب بانکی بازگردانده می‌شود.",
      "مسئولیت صحت اطلاعات وارد شده در فرایند شارژ بر عهده کاربر می‌باشد.",
    ],
  },
  {
    icon: FileText,
    title: "رزرو کلاس‌ها",
    items: [
      "تمام کلاس‌های لینگوفم به صورت خصوصی (یک به یک) برگزار می‌شوند.",
      "کلاس خصوصی ۱.۵ ساعته بوده و زمان و تاریخ آن توسط کاربر انتخاب می‌شود.",
      "لغو کلاس خصوصی حداقل ۲۴ ساعت قبل از زمان برگزاری امکان‌پذیر است.",
      "در صورت لغو کلاس در کمتر از ۲۴ ساعت، هزینه کلاس کسر خواهد شد.",
      "لینک جلسه آنلاین در تاریخ برگزاری کلاس در داشبورد کاربر قرار می‌گیرد.",
      "جلسات گروهی و عمومی در لینگوفم ارائه نمی‌شود.",
    ],
  },
  {
    icon: Shield,
    title: "حفظ حریم خصوصی",
    items: [
      "اطلاعات شخصی کاربران شامل نام، شماره تماس، ایمیل و تاریخ تولد محرمانه بوده و در اختیار اشخاص ثالث قرار نمی‌گیرد.",
      "لینگوفم متعهد به حفظ امنیت اطلاعات کاربران می‌باشد.",
      "اطلاعات بانکی کاربران در هیچ مرحله‌ای توسط لینگوفم ذخیره نمی‌شود.",
    ],
  },
  {
    icon: Ban,
    title: "ممنوعیت‌ها",
    items: [
      "انتقال حساب کاربری به شخص دیگر ممنوع است.",
      "استفاده از محتوای لینگوفم برای مقاصد تجاری بدون اجازه کتبی ممنوع می‌باشد.",
      "هرگونه رفتار نامناسب در کلاس‌های آنلاین منجر به مسدود شدن حساب کاربری می‌شود.",
      "استفاده از ابزارهای هکری یا تلاش برای دسترسی غیرمجاز ممنوع است.",
      "ضبط، رکورد یا ذخیره جلسات آموزشی به هر شکل ممنوع بوده و کاربر حق فروش یا انتشار محتوای جلسات را به هیچ عنوان ندارد.",
      "اشتراک‌گذاری لینک جلسات با اشخاص ثالث ممنوع است.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "مسئولیت‌ها",
    items: [
      "کاربر مسئول حفظ امنیت رمز عبور خود می‌باشد.",
      "لینگوفم در قبال قطعی اینترنت یا مشکلات فنی خارج از کنترل مسئولیتی ندارد.",
      "محتوای آموزشی صرفاً جهت یادگیری ارائه شده و لینگوفم تضمینی برای نتایج خاص نمی‌دهد.",
      "کاربر مسئول رفتار خود در جلسات آنلاین بوده و لینگوفم حق مسدود کردن حساب در صورت تخلف را دارد.",
    ],
  },
  {
    icon: CheckCircle,
    title: "رضایت کاربر",
    items: [
      "کاربر با ثبت‌نام در لینگوفم، تأیید می‌کند که تمام قوانین و مقررات را مطالعه و پذیرفته است.",
      "کاربر با شارژ کیف پول، رضایت خود را نسبت به عدم بازگشت وجه اعلام می‌کند.",
      "در صورت عدم پذیرش هر یک از بندهای این قوانین، کاربر باید از ادامه استفاده از وب‌سایت خودداری کند.",
    ],
  },
];

export default function Policy() {
  return (
    <main className="relative min-h-screen bg-[#050505]">
      {/* Banner */}
      <div className="relative w-full h-48 sm:h-56 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1f0a] via-[#0d2b0d] to-[#0a1a0a]" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.06' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-[-80px] left-[-30px] w-80 h-80 rounded-full bg-black/10 blur-3xl" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-white/70 text-sm sm:text-base font-medium mb-2">
            لینگوفم
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-white text-3xl sm:text-5xl font-bold">
            قوانین و مقررات
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white/50 text-xs sm:text-sm mt-2">
            آخرین به‌روزرسانی: تیر ۱۴۰۵
          </motion.p>
        </div>
      </div>

      {/* Content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-24 -mt-8">
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-6 sm:p-10 space-y-10">
          {sections.map(({ icon: Icon, title, items, highlight }) => (
            <motion.div key={title} variants={fadeUp}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-2.5 rounded-xl ${
                    highlight
                      ? "bg-red-500/15 text-red-400"
                      : "bg-green-500/10 text-green-400"
                  }`}>
                  <Icon size={20} />
                </div>
                <h2
                  className={`text-lg sm:text-xl font-bold ${
                    highlight ? "text-red-400" : "text-white"
                  }`}>
                  {title}
                </h2>
              </div>
              <ul className="space-y-3 pr-11">
                {items.map((item, i) => (
                  <li
                    key={i}
                    className={`text-sm sm:text-base leading-relaxed ${
                      highlight
                        ? "text-red-300/80"
                        : "text-[#aaa]"
                    }`}>
                    <span className="text-green-500/60 ml-2">&bull;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="fixed left-4 hidden sm:block sm:left-10 bottom-0 z-10 pb-6 text-[10px] sm:text-xs text-[#555]">
        © 2026 Lingofam
      </motion.footer>
    </main>
  );
}
