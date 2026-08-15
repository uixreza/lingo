import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Loading from "./loading";
import SplashScreen from "@/components/SplashScreen";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lingofam.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Lingofam — زبان رو طبیعی یاد بگیر",
    template: "%s | Lingofam",
  },
  description:
    "یک پلتفرم تعاملی برای یادگیری زبان‌های خارجی به روشی طبیعی و جذاب؛ با درس‌های تعاملی و تمرین‌های روزمره، انگلیسی رو سریع‌تر و عمیق‌تر یاد بگیر.",
  keywords: [
    "یادگیری زبان",
    "آموزش زبان انگلیسی",
    "یادگیری زبان آنلاین",
    "آموزش تعاملی زبان",
    "Lingofam",
    "تمرین زبان روزانه",
  ],
  icons: {
    icon: "/assets/img/sideIcon.png",
    apple: "/assets/img/sideIcon.png",
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: SITE_URL,
    siteName: "Lingofam",
    title: "Lingofam — زبان رو طبیعی یاد بگیر",
    description:
      "یک پلتفرم تعاملی برای یادگیری زبان‌های خارجی به روشی طبیعی و جذاب؛ با درس‌های تعاملی و تمرین‌های روزمره، انگلیسی رو سریع‌تر و عمیق‌تر یاد بگیر.",
    images: [
      {
        url: "/assets/img/sideIcon.png",
        width: 512,
        height: 512,
        alt: "Lingofam",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Lingofam — زبان رو طبیعی یاد بگیر",
    description:
      "یک پلتفرم تعاملی برای یادگیری زبان‌های خارجی به روشی طبیعی و جذاب.",
    images: ["/assets/img/sideIcon.png"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#04070a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      dir="rtl"
      lang="fa"
      className={`h-full antialiased`}
      suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": `${SITE_URL}/#website`,
                  url: SITE_URL,
                  name: "Lingofam",
                  inLanguage: "fa-IR",
                  description:
                    "پلتفرم تعاملی یادگیری زبان‌های خارجی به روشی طبیعی و جذاب",
                },
                {
                  "@type": "Organization",
                  "@id": `${SITE_URL}/#organization`,
                  name: "Lingofam",
                  url: SITE_URL,
                  logo: {
                    "@type": "ImageObject",
                    url: `${SITE_URL}/assets/img/sideIcon.png`,
                  },
                },
              ],
            }),
          }}
        />
        <Providers>{children}</Providers>
        <SplashScreen />
      </body>
    </html>
  );
}