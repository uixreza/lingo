import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions, prisma, ensureLoyaltyBadge } from "@/lib/auth";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import BanGuard from "@/components/dashboard/BanGuard";
import SiteStatusGuard from "@/components/dashboard/SiteStatusGuard";
import UserOnboarding from "@/components/dashboard/UserOnboarding";
import Breadcrum from "@/components/dashboard/UI/Breadcrum";
import { RadioProvider } from "@/components/RadioProvider";
import RadioButton from "@/components/dashboard/RadioButton";
import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = {
  title: "داشبورد",
  description: "صفحه داشبورد لینگوفم",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  const userId = parseInt(session.user.id, 10);
  await ensureLoyaltyBadge(userId);

  // Check site status — redirect non-admin users if shutdown or updating
  if (session.user.role !== "Admin") {
    const siteStatus = await prisma.siteStatus.findUnique({ where: { id: 1 } });
    if (siteStatus?.shutdown || siteStatus?.updating) {
      redirect("/status");
    }
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { isActive: true, badges: true, createdAt: true, avatarSeed: true },
  });

  if (!dbUser || !dbUser.isActive) {
    redirect("/api/auth/exit");
  }

  const user = {
    id: userId,
    name: session.user.fullname || "کاربر",
    image: "",
    role: session.user.role || "Client",
    balance: 0,
  };

  const yearsWithUs = Math.max(
    1,
    Math.floor(
      (Date.now() - new Date(dbUser.createdAt).getTime()) /
        (365.25 * 24 * 60 * 60 * 1000),
    ),
  );
  return (
    <RadioProvider>
      <BanGuard />
      {session.user.role !== "Admin" && <SiteStatusGuard />}
      {!dbUser.avatarSeed && <UserOnboarding />}
      <DashboardShell>
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header user={{ ...user, badges: dbUser?.badges ?? [], years: yearsWithUs }} />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto py-6 px-2 sm:px-6 bg-[url('/assets/img/pattern.png')] bg-[var(--dash-bg)] transition-colors duration-300 bg-blend-exclusion">
            <Breadcrum />
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
        {/* Sidebar */}
        <Sidebar />
      </DashboardShell>
      <RadioButton />
    </RadioProvider>
  );
}
