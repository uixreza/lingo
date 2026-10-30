import type { Metadata } from "next";

const title = "وضعیت سامانه";
const description =
  "بررسی وضعیت عملکرد وب‌سایت و سرویس‌های لینگوفم.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/status",
  },
  openGraph: {
    title: `${title} — لینگوفم`,
    description,
    url: "/status",
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

export default function StatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
