import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import Auth from "@/components/Auth";

const title = "آزمون تعیین سطح زبان انگلیسی";
const description =
  "آزمون آنلاین ۵۰ سوالی تعیین سطح زبان انگلیسی لینگوفم برای سنجش سطح شما از A1 تا C1.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/test",
  },
  openGraph: {
    title: `${title} — لینگوفم`,
    description,
    url: "/test",
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

export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {children}
      <Auth />
    </AuthProvider>
  );
}
