import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#0a0d16",
    display: "standalone",
    icons: [
      { purpose: "any", sizes: "any", src: "/icon.svg", type: "image/svg+xml" },
      { sizes: "180x180", src: "/apple-icon", type: "image/png" },
    ],
    name: "next-intl-alternates",
    orientation: "portrait",
    short_name: "alternates",
    start_url: "/",
    theme_color: "#0a0d16",
  };
}
