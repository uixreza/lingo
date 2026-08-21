import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions, prisma } from "@/lib/auth";
import "../globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Auth from "@/components/Auth";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

export const metadata: Metadata = {
  title: "Lingofam — زبان رو طبیعی یاد بگیر",
  description:
    "یک پلتفرم تعاملی برای یادگیری زبان‌های خارجی به روشی طبیعی و جذاب",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Check site status — redirect non-admin users if shutdown or updating
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "Admin";
  if (!isAdmin) {
    const siteStatus = await prisma.siteStatus.findUnique({ where: { id: 1 } });
    if (siteStatus?.shutdown || siteStatus?.updating) {
      redirect("/status");
    }
  }

  return (
    <AuthProvider>
      {children}
      <Navbar />
      <Auth />
      <PWAInstallPrompt />
    </AuthProvider>
  );
}
//
