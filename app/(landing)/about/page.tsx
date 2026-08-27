"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Code,
  BookOpen,
  Award,
  Clock,
  Users,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const skills = [
  { label: "مدرس زبان انگلیسی", icon: GraduationCap },
  { label: "توسعه‌دهنده وب", icon: Code },
];

const stats = [
  { icon: Award, value: "۳+", label: "سال سابقه" },
  { icon: Users, value: "۲۰۰+", label: "دانش‌آموز" },
  { icon: Clock, value: "۳۰۰۰+", label: "ساعت تدریس" },
];

export default function About() {
  return (
    <main className="relative min-h-screen bg-[#050505]">
      {/* Banner */}
      <div className="relative w-full h-64 sm:h-72 overflow-hidden">
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
            درباره من
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-white text-3xl sm:text-5xl font-bold">
            رضا کمالی
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white/60 text-sm sm:text-base mt-2">
            مدرس زبان انگلیسی | توسعه‌دهنده وب
          </motion.p>
        </div>
      </div>

      {/* Content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-24 -mt-16">
        {/* Profile Image */}
        <motion.div className="flex justify-center mb-10">
          <div className="relative">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-[#050505] shadow-xl">
              <Image
                src="/me.png"
                alt="رضا کمالی"
                width={128}
                height={128}
                className="object-cover w-full h-full"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    const fallback = document.createElement("div");
                    fallback.className =
                      "w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500/30 to-emerald-500/30 text-2xl font-bold text-green-400";
                    fallback.textContent = "RK";
                    parent.appendChild(fallback);
                  }
                }}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#050505]">
              <Award className="w-4 h-4 text-black" />
            </div>
          </div>
        </motion.div>

        {/* Bio */}
        <motion.div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 sm:p-8 mb-6">
          <p className="text-[#aaa] text-base sm:text-lg leading-relaxed text-center sm:text-right">
            رضا کمالی، مدرس زبان انگلیسی و توسعه‌دهنده وب، دارای مدرک کارشناسی
            ارشد زبان انگلیسی از دانشگاه بجنورد است. وی بیش از سه سال سابقه
            تدریس در آموزشگاه‌های متعدد را در کارنامه خود دارد و با زبان‌آموزان
            در سطوح مختلف و با اهداف گوناگون همکاری کرده است. رویکرد آموزشی وی
            مبتنی بر روش‌های نوین و تعاملی است؛ به‌گونه‌ای که ضمن پوشش کامل
            مهارت‌های چهارگانه زبانی، زبان‌آموزان را برای استفاده عملی و
            روزمره از زبان انگلیسی آماده می‌سازد. ایشان در کنار فعالیت‌های
            آموزشی، به طراحی و توسعه پلتفرم‌های یادگیری زبان نیز اشتغال دارد.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div className="grid grid-cols-3 gap-4 mb-6">
          {stats.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4 sm:p-5 text-center">
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 mx-auto mb-2" />
              <p className="text-white text-lg sm:text-2xl font-bold">
                {value}
              </p>
              <p className="text-[#666] text-xs sm:text-sm mt-0.5">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Skills */}
        <motion.div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 sm:p-8 mb-6">
          <h2 className="text-white text-sm font-medium mb-4 flex items-center gap-2">
            <BookOpen size={16} className="text-green-400" />
            مهارت‌ها
          </h2>
          <div className="flex flex-wrap gap-3">
            {skills.map(({ label, icon: Icon }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
                <Icon size={16} />
                {label}
              </span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}
