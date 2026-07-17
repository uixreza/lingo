import type { Metadata } from "next";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import Breadcrum from "@/components/dashboard/UI/Breadcrum";
import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@/lib/auth";

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
  let balance = 0;
  let name = "کاربر";

  if (session?.user?.id) {
    const userId = parseInt(session.user.id, 10);
    name = session.user.fullname;
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: { balance: true },
    });
    if (wallet) {
      balance = Number(wallet.balance);
    }
  }

  const user = {
    id: session?.user?.id ? parseInt(session.user.id, 10) : 0,
    name,
    image: "",
    role: session?.user?.role ?? "client",
    balance,
  };
  return (
    <>
      <div
        className="flex w-full overflow-hidden h-screen bg-[url('/assets/img/pattern.png')] bg-[var(--dash-bg)] transition-colors duration-300"
        dir="rtl">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header user={user} />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto py-6 px-2 sm:px-6 bg-[url('/assets/img/pattern.png')] bg-[var(--dash-bg)] transition-colors duration-300 bg-blend-exclusion">
            <Breadcrum />
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
        {/* Sidebar */}
        <Sidebar />
      </div>
    </>
  );
}
