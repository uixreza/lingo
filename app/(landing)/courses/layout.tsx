import type { Metadata } from "next";

const title = "دوره‌های آموزش زبان";
const description =
  "دوره‌های جامع آموزش زبان انگلیسی لینگوفم با برنامه مشخص، تمرین عملی و پشتیبانی مستقیم مدرس — از سطح A1 تا C2.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/courses",
  },
  openGraph: {
    title: `${title} — لینگوفم`,
    description,
    url: "/courses",
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

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
