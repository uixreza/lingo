import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Loading from "./loading";
import SplashScreen from "@/components/SplashScreen";

export const metadata: Metadata = {
  title: "Lingofam — زبان رو طبیعی یاد بگیر",
  description:
    "یک پلتفرم تعاملی برای یادگیری زبان‌های خارجی به روشی طبیعی و جذاب",
  applicationName: "لینگوفم",
  appleWebApp: {
    capable: true,
    title: "لینگوفم",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [{ url: "/mainIcon.png", sizes: "any", type: "image/png" }],
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
      className={`h-full antialiased`}
      suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
        <SplashScreen />
      </body>
    </html>
  );
}