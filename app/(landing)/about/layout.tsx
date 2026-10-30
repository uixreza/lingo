import type { Metadata } from "next";

const title = "درباره ما";
const description =
  "آشنایی با تیم لینگوفم، پلتفرم تعاملی یادگیری زبان‌های خارجی به شیوه‌ای عملی و جذاب";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: `${title} — لینگوفم`,
    description,
    url: "/about",
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

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
