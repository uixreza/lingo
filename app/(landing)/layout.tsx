import type { Metadata } from "next";
import "../globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Auth from "@/components/Auth";

export const metadata: Metadata = {
  title: "Lingofam — زبان رو طبیعی یاد بگیر",
  description:
    "یک پلتفرم تعاملی برای یادگیری زبان‌های خارجی به روشی طبیعی و جذاب",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      {children}
      <Navbar />
      <Auth />
    </AuthProvider>
  );
}
//
