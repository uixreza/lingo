"use client";

import { motion } from "framer-motion";
import { House, LayoutDashboard, LifeBuoy, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

const links = [
  { label: "خانه", icon: House },
  { label: "داشبورد", icon: LayoutDashboard },
  { label: "پشتیبانی", icon: LifeBuoy },
];

const container = {
  hidden: { y: 40, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.5,
      ease: "easeOut" as const,
    },
  },
};

const item = {
  hidden: { y: 12, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

export default function Navbar() {
  const { open } = useAuth();

  return (
    <motion.nav
      variants={container}
      initial="hidden"
      animate="show"
      className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1.5 sm:py-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/5 shadow-lg shadow-black/20 max-w-[95vw] sm:max-w-none">
      {links.map(({ label, icon: Icon }) => (
        <motion.button
          key={label}
          variants={item}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-xl text-[#a0a0a0] hover:text-white hover:bg-white/10 text-xs sm:text-sm font-medium">
          <Icon size={16} />
          <span className="hidden sm:inline">{label}</span>
        </motion.button>
      ))}

      <motion.div
        variants={item}
        className="w-px h-5 sm:h-6 bg-white/10 mx-0.5 sm:mx-1"
      />

      <motion.button
        variants={item}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={open}
        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-xl bg-green-500 text-black font-semibold text-xs sm:text-sm hover:bg-green-400">
        <LogIn size={16} />
        <Link href={"/dashboard"} className="">
          ورود
        </Link>
      </motion.button>
    </motion.nav>
  );
}
