import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import Breadcrum from "@/components/dashboard/UI/Breadcrum";

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

  const user = {
    id: 1,
    name: "رضا کمالی",
    image: "",
    role: "student",
    balance: 20000,
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
