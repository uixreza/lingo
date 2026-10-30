import type { Metadata } from "next";

const title = "دانلود لینگوفم";
const description =
  "دانلود اپلیکیشن لینگوفم برای اندروید از کافه‌بازار یا فایل APK مستقیم و ادامه یادگیری زبان در موبایل.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/download",
  },
  openGraph: {
    title: `${title} — لینگوفم`,
    description,
    url: "/download",
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

export default function DownloadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
