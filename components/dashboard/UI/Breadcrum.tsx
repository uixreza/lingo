"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home, Bell, ShoppingBasket } from "lucide-react";
import { useState, useEffect } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";

// Custom hook for breadcrumb logic
function useBreadcrumbs() {
  const pathname = usePathname();

  const breadcrumbLabels: { [key: string]: string } = {
    dashboard: "Dashboard",
    courses: "Courses",
    basket: "Basket",
    profile: "Profile",
    settings: "Settings",
    payments: "Payments",
    analytics: "Analytics",
    create: "Create",
    edit: "Edit",
    // Add dynamic patterns for IDs
  };

  const generateBreadcrumbs = () => {
    if (!pathname) return [];

    const paths = pathname.split("/").filter((path) => path !== "");

    const breadcrumbs = paths.map((path, index) => {
      const href = "/" + paths.slice(0, index + 1).join("/");

      // Handle dynamic routes (IDs)
      if (/^\d+$/.test(path)) {
        return {
          label: "Details",
          href,
        };
      }

      // Handle UUIDs or other dynamic patterns
      if (
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          path
        )
      ) {
        return {
          label: "Details",
          href,
        };
      }

      const label =
        breadcrumbLabels[path] ||
        path
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

      return {
        label,
        href,
      };
    });

    return [{ label: "Home", href: "/" }, ...breadcrumbs];
  };

  return generateBreadcrumbs();
}

export default function Breadcrumb() {
  const breadcrumbItems = useBreadcrumbs();
  const [hasUnread, setHasUnread] = useState(false);
  const { t, locale } = useLang();
  const { count: basketCount } = useCart();

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data: { read: boolean }[] = await res.json();
          setHasUnread(Array.isArray(data) && data.some((n) => !n.read));
        }
      } catch {
        // ignore
      }
    };
    fetchUnread();
    const handler = () => fetchUnread();
    window.addEventListener("notifications-read", handler);
    return () => window.removeEventListener("notifications-read", handler);
  }, []);

  if (breadcrumbItems.length <= 1) {
    return (
      <div className="mb-6 flex justify-start" dir="ltr">
        <div className="flex items-center gap-2 ms-auto">
          <Link
            href="/dashboard/basket"
            aria-label={t("header.basket")}
            className={`relative lg:hidden p-2 rounded-xl border border-white/5 transition-all duration-200 group shadow-lg ${
              basketCount > 0
                ? "bg-orange-500/10 hover:bg-orange-500/20 ring-1 ring-orange-500/40 text-[#fb923c] hover:text-[#fdba74]"
                : "bg-[var(--header-bg)] hover:bg-[var(--hover-bg-strong)] text-[var(--icon-muted)]"
            }`}>
            <ShoppingBasket className="h-4 w-4 sm:h-5 sm:w-5" />
            {basketCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full border-2 border-[var(--dash-bg)] bg-[#f97316] px-1 text-[10px] font-bold leading-none text-[#1a0c00]">
                {basketCount.toLocaleString(locale === "fa" ? "fa-IR" : "en-US")}
              </span>
            )}
          </Link>

          <Link
            href="/dashboard/notification"
            className="relative lg:hidden p-2 rounded-xl bg-[var(--header-bg)] hover:bg-[var(--hover-bg-strong)] transition-all duration-200 group shadow-lg border border-white/5">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--icon-muted)]" />
            {hasUnread && (
              <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full border-2 border-[var(--dash-bg)]" />
            )}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 flex items-center justify-start" dir="ltr">
      <nav aria-label="Breadcrumb" className="flex-1 min-w-0">
        <ol className="flex items-center gap-2 text-sm flex-wrap">
          {breadcrumbItems.map((item, index) => (
            <li key={item.href} className="flex items-center gap-2">
              {index === breadcrumbItems.length - 1 ? (
                <span
                  className="font-medium cursor-default text-[var(--dash-text)]"
                  aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="flex items-center gap-1 transition-colors text-[var(--dash-muted)] hover:text-[var(--dash-text)]">
                  {index === 0 ? (
                    <>
                      <Home className="size-4" />
                      <span className="sr-only">Home</span>
                    </>
                  ) : (
                    item.label
                  )}
                </Link>
              )}

              {index < breadcrumbItems.length - 1 && (
                <ChevronRight className="size-4 text-[var(--dash-muted)]" />
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="flex items-center gap-2 shrink-0 ms-3">
        <Link
          href="/dashboard/basket"
          aria-label={t("header.basket")}
          className={`relative lg:hidden p-2 rounded-xl border border-white/5 transition-all duration-200 group shadow-lg ${
            basketCount > 0
              ? "bg-orange-500/10 hover:bg-orange-500/20 ring-1 ring-orange-500/40 text-[#fb923c] hover:text-[#fdba74]"
              : "bg-[var(--header-bg)] hover:bg-[var(--hover-bg-strong)] text-[var(--icon-muted)]"
          }`}>
          <ShoppingBasket className="h-4 w-4 sm:h-5 sm:w-5" />
          {basketCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full border-2 border-[var(--dash-bg)] bg-[#f97316] px-1 text-[10px] font-bold leading-none text-[#1a0c00]">
              {basketCount.toLocaleString(locale === "fa" ? "fa-IR" : "en-US")}
            </span>
          )}
        </Link>

        <Link
          href="/dashboard/notification"
          className="relative lg:hidden p-2 rounded-xl bg-[var(--header-bg)] hover:bg-[var(--hover-bg-strong)] transition-all duration-200 group shadow-lg border border-white/5">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--icon-muted)]" />
          {hasUnread && (
            <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full border-2 border-[var(--dash-bg)]" />
          )}
        </Link>
      </div>
    </div>
  );
}
