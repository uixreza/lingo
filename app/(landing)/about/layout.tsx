import type { Metadata } from "next";

const title = "درباره ما";
const description =
  "آشنایی با رضا کمالی، مدرس زبان انگلیسی و بنیان‌گذار لینگوفم؛ پلتفرم تعاملی یادگیری انگلیسی به شیوه‌ای عملی و جذاب";

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
