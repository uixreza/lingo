import type { Metadata, Viewport } from "next";
import "../globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Auth from "@/components/Auth";
import localFont from "next/font/local";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

const latoThin = localFont({
  src: "../../public/assets/fonts/Lato/Lato-Thin.ttf",
  weight: "100",
  display: "swap",
  variable: "--font-lato-thin",
});

const latoBold = localFont({
  src: "../../public/assets/fonts/Lato/Lato-Bold.ttf",
  weight: "700",
  display: "swap",
  variable: "--font-lato-bold",
});

const latoRegular = localFont({
  src: "../../public/assets/fonts/Lato/Lato-Regular.ttf",
  weight: "400",
  display: "swap",
  variable: "--font-lato-regular",
});

const morabbaLight = localFont({
  src: "../../public/assets/fonts/Morabba/Morabba-Light.woff",
  weight: "300",
  display: "swap",
  variable: "--font-morabba-light",
});

const morabbaBold = localFont({
  src: "../../public/assets/fonts/Morabba/Morabba-Bold.woff",
  weight: "700",
  display: "swap",
  variable: "--font-morabba-bold",
});

const morabbaRegular = localFont({
  src: "../../public/assets/fonts/Morabba/Morabba-Regular.woff",
  weight: "400",
  display: "swap",
  variable: "--font-morabba-regular",
});

export const metadata: Metadata = {
  title: "Lingofam \u2014 \u0632\u0628\u0627\u0646 \u0631\u0648 \u0637\u0628\u06CC\u0639\u06CC \u06CC\u0627\u062F \u0628\u06AF\u06CC\u0631",
  description:
    "\u06CC\u06A9 \u067E\u0644\u062A\u0641\u0631\u0645 \u062A\u0639\u0627\u0645\u0644\u06CC \u0628\u0631\u0627\u06CC \u06CC\u0627\u062F\u06AF\u06CC\u0631\u06CC \u0632\u0628\u0627\u0646\u200C\u0647\u0627\u06CC \u062E\u0627\u0631\u062C\u06CC \u0628\u0647 \u0631\u0648\u0634\u06CC \u0637\u0628\u06CC\u0639\u06CC \u0648 \u062C\u0630\u0627\u0628",
};

export const viewport: Viewport = {
  themeColor: "#09100c",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <div
        className={`${plusJakarta.variable} ${latoThin.variable} ${latoBold.variable} ${latoRegular.variable} ${morabbaLight.variable} ${morabbaBold.variable} ${morabbaRegular.variable}`}>
        {children}
        <Navbar />
        <Auth />
      </div>
    </AuthProvider>
  );
}
