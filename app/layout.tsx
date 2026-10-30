import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import SplashScreen from "@/components/SplashScreen";

const SITE_URL = "https://lingofam.ir";

const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "لینگوفم",
      alternateName: "LINGOFAM",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/mainIcon.webp`,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "لینگوفم",
      inLanguage: "fa",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "Lingofam — زبان رو به‌صورت عملی یاد بگیر",
    template: "%s — لینگوفم",
  },
  description:
    "یک پلتفرم تعاملی برای یادگیری زبان‌های خارجی به شیوه‌ای عملی و جذاب",
  applicationName: "لینگوفم",
  keywords: ["یادگیری زبان", "آموزش زبان", "لینگوفم", "زبان خارجی", "آموزش آنلاین", "LINGOFAM"],
  authors: [{ name: "LINGOFAM" }],
  creator: "LINGOFAM",
  publisher: "LINGOFAM",
  metadataBase: new URL(SITE_URL),
  ...(googleSiteVerification
    ? { verification: { google: googleSiteVerification } }
    : {}),
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: "https://lingofam.ir",
    siteName: "لینگوفم",
    title: "Lingofam — زبان رو به‌صورت عملی یاد بگیر",
    description:
      "یک پلتفرم تعاملی برای یادگیری زبان‌های خارجی به شیوه‌ای عملی و جذاب",
    images: [{ url: "/mainIcon.webp", width: 1200, height: 630, alt: "لینگوفم" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lingofam — زبان رو به‌صورت عملی یاد بگیر",
    description:
      "یک پلتفرم تعاملی برای یادگیری زبان‌های خارجی به شیوه‌ای عملی و جذاب",
    images: ["/mainIcon.webp"],
  },
  appleWebApp: {
    capable: true,
    title: "لینگوفم",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [{ url: "/mainIcon.webp", sizes: "any", type: "image/webp" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
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
      className={`h-full antialiased bg-black`}
      suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(siteJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <Providers>{children}</Providers>
        <SplashScreen />
      </body>
    </html>
  );
}