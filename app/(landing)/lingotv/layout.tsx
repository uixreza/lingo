import type { Metadata } from "next";

const title = "لینگو‌تی‌وی";
const description =
  "ویدیوهای آموزشی، پادکست‌ها و محتوای ویدیویی جذاب لینگوفم به‌زودی در لینگو‌تی‌وی منتشر می‌شود.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/lingotv",
  },
  openGraph: {
    title: `${title} — لینگوفم`,
    description,
    url: "/lingotv",
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

export default function LingoTVLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
