import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "لینگوفم — زبان رو طبیعی یاد بگیر",
    short_name: "لینگوفم",
    description:
      "یک پلتفرم تعاملی برای یادگیری زبان‌های خارجی به روشی طبیعی و جذاب",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#04070a",
    theme_color: "#04070a",
    dir: "rtl",
    lang: "fa",
    categories: ["education", "productivity"],
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}