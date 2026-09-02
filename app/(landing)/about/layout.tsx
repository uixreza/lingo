import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "درباره ما",
  description:
    "آشنایی با تیم لینگوفام، پلتفرم تعاملی یادگیری زبان‌های خارجی به روشی طبیعی و جذاب",
  alternates: {
    canonical: "https://lingofam.ir/about",
  },
  openGraph: {
    title: "درباره ما — لینگوفام",
    description:
      "آشنایی با تیم لینگوفام، پلتفرم تعاملی یادگیری زبان‌های خارجی به روشی طبیعی و جذاب",
    url: "https://lingofam.ir/about",
    type: "website",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
