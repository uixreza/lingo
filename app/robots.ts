import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/api", "/login", "/register", "/profile"],
      },
    ],
    sitemap: "https://lingofam.ir/sitemap.xml",
  };
}
