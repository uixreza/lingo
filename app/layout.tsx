import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Loading from "./loading";
import SplashScreen from "@/components/SplashScreen";

export const metadata: Metadata = {
  title: {
    default: "Lingofam — زبان رو طبیعی یاد بگیر",
    template: "%s — لینگوفام",
  },
  description:
    "یک پلتفرم تعاملی برای یادگیری زبان‌های خارجی به روشی طبیعی و جذاب",
  applicationName: "لینگوفم",
  keywords: ["یادگیری زبان", "آموزش زبان", "لینگوفام", "زبان خارجی", "آموزش آنلاین", "LINGOFAM"],
  authors: [{ name: "LINGOFAM" }],
  creator: "LINGOFAM",
  publisher: "LINGOFAM",
  metadataBase: new URL("https://lingofam.ir"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: "https://lingofam.ir",
    siteName: "لینگوفام",
    title: "Lingofam — زبان رو طبیعی یاد بگیر",
    description:
      "یک پلتفرم تعاملی برای یادگیری زبان‌های خارجی به روشی طبیعی و جذاب",
    images: [{ url: "/mainIcon.webp", width: 1200, height: 630, alt: "لینگوفام" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lingofam — زبان رو طبیعی یاد بگیر",
    description:
      "یک پلتفرم تعاملی برای یادگیری زبان‌های خارجی به روشی طبیعی و جذاب",
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
        <Providers>{children}</Providers>
        <SplashScreen />
      </body>
    </html>
  );
}