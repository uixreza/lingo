import type { Metadata } from "next";

const title = "قوانین و مقررات";
const description =
  "قوانین و مقررات استفاده از لینگوفم شامل شارژ حساب و بازگشت وجه، رزرو و لغو کلاس‌ها، حفظ حریم خصوصی و مسئولیت‌های کاربر.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/policy",
  },
  openGraph: {
    title: `${title} — لینگوفم`,
    description,
    url: "/policy",
    type: "website",
    locale: "fa_IR",
    siteName: "لینگوفم",
    images: [{ url: "/mainIcon.webp", width: 1200, height: 630, alt: "لینگوفم" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} — لینگوفم`,
    description,
    images: ["/mainIcon.webp"],
  },
};

export default function PolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
