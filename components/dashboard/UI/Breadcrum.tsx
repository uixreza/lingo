"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

// Custom hook for breadcrumb logic
function useBreadcrumbs() {
  const pathname = usePathname();

  const breadcrumbLabels: { [key: string]: string } = {
    dashboard: "Dashboard",
    courses: "Courses",
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

  if (breadcrumbItems.length <= 1) return null; // Don't show if only home

  return (
    <nav aria-label="Breadcrumb" className="mb-6 " dir="ltr">
      <ol className="flex items-center gap-2 text-sm flex-wrap">
        {breadcrumbItems.map((item, index) => (
          <li key={item.href} className="flex items-center gap-2">
            {index === breadcrumbItems.length - 1 ? (
              <span
                className="font-medium cursor-default text-[var(--dark-purple)] dark:text-foreground"
                aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="flex items-center gap-1 transition-colors text-[var(--light-purple)] hover:text-[var(--dark-purple)] dark:text-foreground dark:hover:text-gray-800">
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

            {/* Separator - show for all except last item */}
            {index < breadcrumbItems.length - 1 && (
              <ChevronRight className="size-4 text-[var(--light-purple)] dark:text-foreground" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
