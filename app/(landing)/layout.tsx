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
  alternates: {
    canonical: "/",
  },
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
