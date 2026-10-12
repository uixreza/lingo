import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "وبلاگ",
  description:
    "مقاله‌ها و آموزش‌های یادگیری زبان خارجی در لینگوفم",
  alternates: {
    canonical: "https://lingofam.ir/blog",
  },
  openGraph: {
    title: "وبلاگ — لینگوفم",
    description:
      "مقاله‌ها و آموزش‌های یادگیری زبان خارجی در لینگوفم",
    url: "https://lingofam.ir/blog",
    type: "website",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
